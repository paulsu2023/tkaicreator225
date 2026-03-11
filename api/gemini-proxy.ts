/**
 * Vercel Serverless Function: Gemini API Proxy
 * 
 * 安全地使用 Google Cloud 服务账号凭证通过 Vertex AI 调用 Gemini API。
 * 服务账号的私钥等敏感信息存储在 Vercel 环境变量中，绝不暴露给前端。
 * 
 * 支持两种模式:
 * 1. Vertex AI 模式 (使用服务账号 JSON) - 推荐，更安全
 * 2. API Key 模式 (使用 GEMINI_API_KEY) - 兼容现有配置
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Google Auth 相关
const SCOPES = ['https://www.googleapis.com/auth/cloud-platform'];
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

// 缓存 access token（避免每次请求都重新获取）
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * 使用服务账号 JSON 生成 JWT 并获取 access token
 */
async function getAccessToken(): Promise<string> {
  // 检查缓存的 token 是否仍然有效（提前 5 分钟过期）
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const clientEmail = process.env.GCP_CLIENT_EMAIL;
  const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Missing GCP service account credentials in environment variables');
  }

  // 创建 JWT Header
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: SCOPES.join(' '),
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  // Base64url 编码
  const base64url = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const headerB64 = base64url(header);
  const payloadB64 = base64url(payload);
  const signatureInput = `${headerB64}.${payloadB64}`;

  // 使用 Node.js crypto 签名
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign
    .sign(privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signature}`;

  // 用 JWT 换取 access token
  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${tokenResponse.status} ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  cachedToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

/**
 * 通过 Vertex AI REST API 调用 Gemini
 */
async function callVertexAI(model: string, requestBody: any): Promise<any> {
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION || 'us-central1';
  const accessToken = await getAccessToken();

  // 判断是否是 generateContent 或 streamGenerateContent
  const apiMethod = 'generateContent';
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:${apiMethod}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Vertex AI error: ${response.status} ${errText}`);
  }

  return response.json();
}

/**
 * 通过 Google AI Studio API Key 调用 Gemini（兼容模式）
 */
async function callGeminiWithApiKey(model: string, requestBody: any): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  return response.json();
}

/**
 * Vercel Serverless Function Handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, contents, config, systemInstruction } = req.body;

    if (!model || !contents) {
      return res.status(400).json({ error: 'Missing required fields: model, contents' });
    }

    // 构建请求体 (Vertex AI 格式)
    const requestBody: any = {
      contents: Array.isArray(contents) ? contents : [contents],
    };

    // 系统指令
    if (systemInstruction) {
      requestBody.systemInstruction = typeof systemInstruction === 'string'
        ? { parts: [{ text: systemInstruction }] }
        : systemInstruction;
    }

    // 生成配置
    if (config) {
      requestBody.generationConfig = {};
      if (config.responseMimeType) requestBody.generationConfig.responseMimeType = config.responseMimeType;
      if (config.responseSchema) requestBody.generationConfig.responseSchema = config.responseSchema;
      if (config.responseModalities) requestBody.generationConfig.responseModalities = config.responseModalities;
      if (config.speechConfig) requestBody.generationConfig.speechConfig = config.speechConfig;
      if (config.imageConfig) {
        // 对于图像生成，image config 在 generationConfig 里
        requestBody.generationConfig.responseModalities = ['IMAGE', 'TEXT'];
        if (config.imageConfig.aspectRatio) {
          requestBody.generationConfig.aspectRatio = config.imageConfig.aspectRatio;
        }
      }
    }

    let result: any;

    // 优先使用 Vertex AI（服务账号模式）
    const hasVertexCredentials = process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY && process.env.GCP_PROJECT_ID;

    if (hasVertexCredentials) {
      try {
        result = await callVertexAI(model, requestBody);
      } catch (vertexError: any) {
        console.error('Vertex AI failed, trying API Key fallback:', vertexError.message);
        // 回退到 API Key 模式
        if (process.env.GEMINI_API_KEY) {
          result = await callGeminiWithApiKey(model, requestBody);
        } else {
          throw vertexError;
        }
      }
    } else if (process.env.GEMINI_API_KEY) {
      result = await callGeminiWithApiKey(model, requestBody);
    } else {
      return res.status(500).json({ error: 'No API credentials configured. Set either GCP service account or GEMINI_API_KEY.' });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('API Proxy Error:', error.message);
    return res.status(error.status || 500).json({
      error: error.message || 'Internal server error',
    });
  }
}
