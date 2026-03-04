
import { AspectRatio, VideoMode, ImageResolution } from './types';

// Primary analysis model: gemini-2.5-flash is highly stable and very capable for structured JSON tasks
export const GEMINI_MODEL_ANALYSIS = 'gemini-2.5-flash';

// Fallback to Pro if flash fails - higher quality but lower availability under surge
export const GEMINI_MODEL_ANALYSIS_FALLBACK = 'gemini-2.5-flash'; // Keep same to avoid 500 on fallback

// Using Gemini 3.0 Pro Image (Banana Pro equivalent) for high quality assets
export const GEMINI_MODEL_IMAGE = 'gemini-3-pro-image-preview';

// Fallback Image Model - Gemini 3.1 Flash Image (2026-02-26 上线)
export const GEMINI_MODEL_IMAGE_FALLBACK = 'gemini-3.1-flash-image-preview';

// TTS Model
export const GEMINI_MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const TARGET_MARKETS = [
  { value: 'US', label: '🇺🇸 United States (美国)', language: 'English', culture: 'Western, diverse American style, energetic and direct', disabled: false },
  { value: 'MX', label: '🔒 Mexico (墨西哥) - 未解锁', language: 'Spanish', culture: 'Mexican/Latin American ethnicity, vibrant, warm, family-oriented and social style', disabled: true },
  { value: 'BR', label: '🔒 Brazil (巴西) - 未解锁', language: 'Portuguese', culture: 'Brazilian ethnicity, vibrant, diverse, and energetic South American style', disabled: true },
  { value: 'UK', label: '🔒 United Kingdom (英国) - 未解锁', language: 'English', culture: 'Western, British style, sophisticated and witty', disabled: true },
  { value: 'DE', label: '🔒 Germany (德国) - 未解锁', language: 'German', culture: 'German/European ethnicity, minimalist and professional', disabled: true },
  { value: 'FR', label: '🔒 France (法国) - 未解锁', language: 'French', culture: 'French/European ethnicity, elegant and artistic', disabled: true },
  { value: 'ES', label: '🔒 Spain (西班牙) - 未解锁', language: 'Spanish', culture: 'Mediterranean style, warm and social', disabled: true },
  { value: 'IT', label: '🔒 Italy (意大利) - 未解锁', language: 'Italian', culture: 'Italian ethnicity, stylish and passionate', disabled: true },
  { value: 'TH', label: '🔒 Thailand (泰国) - 未解锁', language: 'Thai', culture: 'Thai ethnicity, Southeast Asian style', disabled: true },
  { value: 'MY', label: '🔒 Malaysia (马来西亚) - 未解锁', language: 'Malay', culture: 'Malay/Chinese/Indian mix, Southeast Asian style', disabled: true },
  { value: 'VN', label: '🔒 Vietnam (越南) - 未解锁', language: 'Vietnamese', culture: 'Vietnamese ethnicity, Southeast Asian style', disabled: true },
  { value: 'ID', label: '🔒 Indonesia (印尼) - 未解锁', language: 'Indonesian', culture: 'Indonesian ethnicity, Southeast Asian style', disabled: true },
  { value: 'PH', label: '🔒 Philippines (菲律宾) - 未解锁', language: 'Tagalog/English', culture: 'Filipino ethnicity, Southeast Asian style', disabled: true },
  { value: 'JP', label: '🔒 Japan (日本) - 未解锁', language: 'Japanese', culture: 'Japanese ethnicity, modern Japanese style', disabled: true },
  { value: 'KR', label: '🔒 South Korea (韩国) - 未解锁', language: 'Korean', culture: 'Korean ethnicity, modern Korean style', disabled: true },
];

export const WORLD_LANGUAGES = [
  { value: 'English', label: 'English (英语)' },
  { value: 'Spanish', label: 'Spanish (西班牙语)' },
  { value: 'German', label: 'German (德语)' },
  { value: 'French', label: 'French (法语)' },
  { value: 'Chinese', label: 'Chinese (中文/普通话)' },
  { value: 'Portuguese', label: 'Portuguese (葡萄牙语)' },
  { value: 'Japanese', label: 'Japanese (日语)' },
  { value: 'Korean', label: 'Korean (韩语)' },
  { value: 'Russian', label: 'Russian (俄语)' },
  { value: 'Arabic', label: 'Arabic (阿拉伯语)' },
  { value: 'Hindi', label: 'Hindi (印地语)' },
  { value: 'Italian', label: 'Italian (意大利语)' },
  { value: 'Thai', label: 'Thai (泰语)' },
  { value: 'Vietnamese', label: 'Vietnamese (越南语)' },
  { value: 'Indonesian', label: 'Indonesian (印尼语)' },
];

export const ASPECT_RATIOS = [
  { value: AspectRatio.Ratio_9_16, label: '9:16 (竖屏通用)' },
  { value: AspectRatio.Ratio_16_9, label: '16:9 (横屏通用)' },
  { value: AspectRatio.Ratio_1_1, label: '1:1 (正方形)' },
  { value: AspectRatio.Ratio_3_4, label: '3:4 (肖像)' },
  { value: AspectRatio.Ratio_4_3, label: '4:3 (传统)' },
];

export const IMAGE_RESOLUTIONS = [
  { value: ImageResolution.Res_1K, label: '1K (标准)' },
  { value: ImageResolution.Res_2K, label: '2K (高清 - 推荐)' },
  { value: ImageResolution.Res_4K, label: '4K (超清)' },
];

export const VIDEO_MODES = [
  { value: VideoMode.Standard, label: '首帧图 (仅生成首图)' },
  { value: VideoMode.StartEnd, label: '连贯模式 (首图+尾图)' },
  { value: VideoMode.Intermediate, label: '运镜控制模式 (首图+草稿+尾图)' },
];

// Image model options for the UI selector
export const IMAGE_MODELS = [
  { value: 'gemini-3-pro-image-preview', label: '🍌 Banana Pro (专业高清 - 推荐)' },
  { value: 'gemini-3.1-flash-image-preview', label: '⚡ Banana 2 (Flash 3.1 - 稳定快速)' },
];

export const VOICE_OPTIONS = ['Kore', 'Fenrir', 'Puck', 'Charon', 'Zephyr'];

export const CAMERA_DEVICES = [
  { value: 'iphone_16_pro_max', label: 'iPhone 16 Pro Max', prompt: 'shot on iPhone 16 Pro Max, 48MP raw, sharp focus, computational photography, natural hdr, highly detailed' },
  { value: 'iphone_15_pro_max', label: 'iPhone 15 Pro Max', prompt: 'shot on iPhone 15 Pro Max, 48MP, realistic texture, apple color science, ultra wide angle' },
  { value: 'sony_a7r_v', label: 'Sony A7R V (专业摄影)', prompt: 'shot on Sony A7R V, 61MP, FE 24-70mm GM lens, shallow depth of field, sharp details, bokeh, professional photography' },
  { value: 'arri_alexa', label: 'ARRI Alexa (电影级)', prompt: 'shot on ARRI Alexa Mini, cinematic lighting, color graded, movie production quality, anamorphic lens, film look' },
  { value: 'film_camera', label: 'Film Camera (胶片感)', prompt: 'shot on Kodak Portra 400, 35mm film grain, vintage texture, warm tones, analog photography' },
  { value: 'gopro_hero_12', label: 'GoPro Hero 12 (运动)', prompt: 'shot on GoPro Hero 12, wide angle, fisheye effect, high contrast, sharp, action camera style' },
];

export const SHOOTING_STYLES = [
  { value: 'fixed', label: '固定机位 (Fixed)', prompt: 'static camera, tripod shot, stable composition, centered subject' },
  { value: 'pov', label: '第一人称 (POV)', prompt: 'POV shot, first-person view, immersive perspective, looking through eyes, hands visible in frame' },
  { value: 'handheld', label: '手持跟拍 (Handheld)', prompt: 'handheld camera, slight shake, documentary style, realistic movement, dynamic angle' },
  { value: 'gimbal', label: '稳定器运镜 (Gimbal)', prompt: 'smooth gimbal shot, cinematic movement, floating camera, steady flow' },
  { value: 'mixed', label: '混合运镜 (Mixed)', prompt: 'cinematic movement, dynamic angles, smooth transition, creative camera work' },
];
