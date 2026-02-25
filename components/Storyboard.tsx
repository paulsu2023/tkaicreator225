
import React, { useState, useRef } from 'react';
import { Play, Image as ImageIcon, Wand2, Copy, ChevronDown, ChevronUp, RefreshCw, ArrowRight, Maximize2, Mic, Pause, Download, Edit3, X, Check, FileJson, Lock, Zap, Sparkles, Video, Camera, Activity, FileText, Square } from 'lucide-react';
import { StoryboardScene, VideoMode, AspectRatio, GeneratedAsset, ImageResolution } from '../types';
import { generateImage, generateSpeech, optimizePrompt } from '../services/geminiService';
import { AnalysisLoader } from './AnalysisLoader';
import { CAMERA_DEVICES, SHOOTING_STYLES } from '../constants';

const AudioPlayer: React.FC<{ url: string }> = ({ url }) => {
    return (
        <audio controls className="w-full h-8 mt-2 opacity-80 hover:opacity-100 transition-opacity" src={url} />
    );
};

interface AssetCardProps {
    label: string;
    asset?: GeneratedAsset;
    loading?: boolean;
    onGen: () => void;
    onStop?: () => void;
    onPreview: (url: string, type: 'image' | 'audio') => void;
    onViewPrompt: () => void;
    icon: React.ReactNode;
    highlight?: boolean;
    disabled?: boolean;
    title?: string;
    sceneIndex?: number;
    type?: string;
    aspectRatio?: AspectRatio;
}

const AssetCard: React.FC<AssetCardProps> = ({
    label, asset, loading, onGen, onStop, onPreview, onViewPrompt, icon, highlight, disabled, title, sceneIndex, type, aspectRatio = AspectRatio.Ratio_9_16
}) => {

    // Calculate Dynamic Dimensions based on Aspect Ratio
    const getCardDimensions = (ratio: AspectRatio) => {
        switch (ratio) {
            case AspectRatio.Ratio_9_16:
                return "w-56 h-96"; // Portrait
            case AspectRatio.Ratio_16_9:
                return "w-80 h-52"; // Landscape
            case AspectRatio.Ratio_3_4:
                return "w-56 h-72"; // Portrait
            case AspectRatio.Ratio_4_3:
                return "w-72 h-60"; // Landscape
            case AspectRatio.Ratio_1_1:
            default:
                return "w-64 h-72"; // Square + Header room
        }
    };

    const dimensions = getCardDimensions(aspectRatio);

    return (
        <div className={`relative flex-shrink-0 ${dimensions} rounded-xl border flex flex-col overflow-hidden transition-all group ${highlight ? 'border-brand-500/50 shadow-brand-500/20 shadow-lg' : 'border-slate-800 bg-slate-900/50'}`}>
            {/* Header - Removed absolute positioning to prevent overlap */}
            <div className="bg-slate-900/90 p-2 flex items-center justify-between border-b border-slate-800 z-10 backdrop-blur-sm">
                <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${highlight ? 'text-brand-400' : 'text-slate-400'}`}>
                    {icon} {label}
                </span>
                {asset && (
                    <button onClick={onViewPrompt} className="text-slate-500 hover:text-white transition-colors" title="查看提示词">
                        <Sparkles size={10} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 relative flex items-center justify-center bg-black w-full overflow-hidden">
                {loading ? (
                    <div className="w-full h-full relative">
                        <AnalysisLoader mode="generation" variant="contained" />
                        {onStop && (
                            <button
                                onClick={onStop}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-red-500/80 hover:bg-red-500 text-white text-[10px] rounded-full backdrop-blur-md transition-colors flex items-center gap-1"
                            >
                                <Square size={8} fill="currentColor" /> 停止
                            </button>
                        )}
                    </div>
                ) : asset ? (
                    <>
                        <img
                            src={asset.url}
                            alt={label}
                            className="w-full h-full object-contain"
                        />
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                            <button
                                onClick={() => onPreview(asset.url, 'image')}
                                className="p-2 bg-brand-600 hover:bg-brand-500 rounded-full text-white shadow-lg transform hover:scale-110 transition-all"
                                title="预览大图"
                            >
                                <Maximize2 size={16} />
                            </button>
                            <div className="flex gap-2">
                                <a
                                    href={asset.url}
                                    download={`${title || 'Scene'}_Scene${sceneIndex}_${type}.jpg`}
                                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white shadow-lg transition-all"
                                    title="下载"
                                >
                                    <Download size={14} />
                                </a>
                                <button
                                    onClick={onGen}
                                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white shadow-lg transition-all"
                                    title="重新生成"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        </div>
                        {/* Model Indicator Badge */}
                        {asset.actualModelUsed && (
                            <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1 items-start">
                                <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[9px] text-white flex items-center gap-1 border border-white/10 shadow-lg">
                                    <Activity size={10} className={asset.actualModelUsed.includes('flash') ? "text-yellow-400" : "text-sky-400"} />
                                    {asset.actualModelUsed.includes('flash') ? 'Banana (降级)' : 'Banana Pro'}
                                </div>
                                {asset.actualModelUsed.includes('flash') && (
                                    <button
                                        onClick={onGen}
                                        className="bg-brand-600 hover:bg-brand-500 text-white px-2 py-1 rounded text-[9px] flex items-center gap-1 shadow-lg transition-colors border border-brand-400/50"
                                        title="尝试使用 Banana Pro 重新生成"
                                    >
                                        <Zap size={10} /> 强制重试 Pro
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <button
                            onClick={onGen}
                            disabled={disabled}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${disabled
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : highlight
                                    ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/30'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                                }`}
                        >
                            <Wand2 size={16} />
                        </button>
                        {disabled ? (
                            <span className="text-[10px] text-slate-600">需先生成前序分镜</span>
                        ) : (
                            <span className="text-[10px] text-slate-500">点击生成</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface Props {
    scenes: StoryboardScene[];
    videoMode: VideoMode;
    aspectRatio: AspectRatio;
    resolution: ImageResolution;
    imageModel: string;
    cameraDevice: string; // New Prop
    shootingStyle: string; // New Prop
    productImages: string[];
    modelImages: string[];
    backgroundImages: string[];
    assignedVoice: string;
    onUpdateScene: (id: string, updates: Partial<StoryboardScene>) => void;
    onPreview: (url: string, type: 'image' | 'audio') => void;
    productTitle: string;
}

export const Storyboard: React.FC<Props> = ({
    scenes, videoMode, aspectRatio, resolution, imageModel, cameraDevice, shootingStyle, productImages, modelImages, backgroundImages, assignedVoice,
    onUpdateScene, onPreview, productTitle
}) => {
    const [expandedScene, setExpandedScene] = useState<string | null>(scenes[0]?.id || null);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [promptModal, setPromptModal] = useState<{ isOpen: boolean; content: string } | null>(null);

    // State for collapsible prompt sections (ID -> Boolean)
    const [visiblePrompts, setVisiblePrompts] = useState<Record<string, boolean>>({});

    const togglePromptVisibility = (id: string) => {
        setVisiblePrompts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Track abort controllers for each scene and generation type
    const abortControllers = useRef<Map<string, AbortController>>(new Map());

    const toggleExpand = (id: string) => {
        setExpandedScene(expandedScene === id ? null : id);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // NEW: Generate All Subsequent Scenes based on Scene 1
    const handleGenerateRemaining = async () => {
        const scene1 = scenes[0];
        if (!scene1.startImage?.data) {
            alert("必须先生成【分镜 1】的画面，作为后续分镜的一致性基准。");
            setExpandedScene(scene1.id);
            return;
        }

        setIsGeneratingAll(true);
        const anchorImage = scene1.startImage.data;

        // Iterate sequentially to prevent rate limits and ensure order
        for (let i = 1; i < scenes.length; i++) {
            const scene = scenes[i];
            setExpandedScene(scene.id);

            // Generate Start Image
            // We capture the result to pass it to subsequent steps within this loop iteration
            // because the 'scene' variable is stale from the closure.
            const newStartBase64 = await handleGenerateImage(scene, 'start', undefined, anchorImage);

            if (newStartBase64) {
                // Create a temporary updated scene object to pass context to middle/end generation
                const updatedSceneContext = {
                    ...scene,
                    startImage: { ...scene.startImage, data: newStartBase64 }
                } as StoryboardScene;

                if (videoMode === VideoMode.Intermediate) {
                    await handleGenerateImage(updatedSceneContext, 'middle', undefined, anchorImage);
                }
                if (videoMode === VideoMode.StartEnd || videoMode === VideoMode.Intermediate) {
                    await handleGenerateImage(updatedSceneContext, 'end', undefined, anchorImage);
                }
            }
        }

        setIsGeneratingAll(false);
    };

    const handleStopGeneration = (sceneId: string, type: 'start' | 'end' | 'middle') => {
        const abortKey = `${sceneId}_${type}`;
        if (abortControllers.current.has(abortKey)) {
            abortControllers.current.get(abortKey)?.abort();
            abortControllers.current.delete(abortKey);
        }
    };

    const handleGenerateImage = async (
        scene: StoryboardScene,
        type: 'start' | 'end' | 'middle',
        customPrompt?: string,
        forcedReferenceImage?: string // From Scene 1
    ): Promise<string | undefined> => {

        // Safety Check: Consistency enforcement
        const sceneIndex = scenes.findIndex(s => s.id === scene.id);

        // Use forcedReferenceImage if provided, otherwise fallback to scene[0] if we are scene 2+
        // If sceneIndex is -1 (called from handleGenerateRemaining with stale object), we rely on forcedReferenceImage.
        const isSubsequentScene = sceneIndex > 0 || (sceneIndex === -1 && forcedReferenceImage);

        if (isSubsequentScene && !forcedReferenceImage && !scenes[0].startImage?.data) {
            alert("请先生成【分镜 1】。后续分镜需要基于分镜1保持角色一致性。");
            return;
        }

        // Cancel existing if any
        const abortKey = `${scene.id}_${type}`;
        if (abortControllers.current.has(abortKey)) {
            abortControllers.current.get(abortKey)?.abort();
        }
        const controller = new AbortController();
        abortControllers.current.set(abortKey, controller);

        const loadingUpdate = {
            isGeneratingStart: type === 'start' ? true : scene.isGeneratingStart,
            isGeneratingMiddle: type === 'middle' ? true : scene.isGeneratingMiddle,
            isGeneratingEnd: type === 'end' ? true : scene.isGeneratingEnd,
            error: undefined
        };
        onUpdateScene(scene.id, loadingUpdate);

        try {
            // Use the specific Text-to-Image prompt if available, otherwise fall back to the main imagePrompt (which might be JSON)
            let prompt = customPrompt || scene.prompt.textPrompt || scene.prompt.imagePrompt;
            let referenceImages: string[] = [];

            // STRICT CONSISTENCY LOGIC:
            // If we are generating Scene 2+ and we have Scene 1 (anchor), we use Scene 1 AS THE PRIMARY SOURCE OF TRUTH.
            // We purposefully EXCLUDE the raw 'modelImages' uploads to prevent conflict between the generated look and raw photos.

            const scene1Ref = forcedReferenceImage || (scenes[0] && scenes[0].startImage?.data);

            if (isSubsequentScene && scene1Ref) {
                // 1. Add Scene 1 Anchor
                referenceImages.push(scene1Ref);

                // 2. Add Backgrounds (Optional, but good for environment consistency)
                if (backgroundImages && backgroundImages.length > 0) {
                    referenceImages.push(...backgroundImages.slice(0, 1));
                }

                // DO NOT ADD modelImages or productImages here. Scene 1 is the master.

            } else {
                // SCENE 1 GENERATION (or no anchor available)
                // Use all available raw references to establish the look.

                // CRITICAL: We prioritize productImages FIRST for absolute product consistency.
                if (productImages && productImages.length > 0) referenceImages.push(...productImages);

                if (modelImages && modelImages.length > 0) {
                    const remaining = 3 - referenceImages.length;
                    if (remaining > 0) referenceImages.push(...modelImages.slice(0, remaining));
                }

                if (backgroundImages && backgroundImages.length > 0) {
                    const remaining = 3 - referenceImages.length;
                    if (remaining > 0) referenceImages.push(...backgroundImages.slice(0, remaining));
                }
            }

            // LOGIC: Intermediate frame handling (Self-Consistency within the scene)
            if (type === 'middle' || type === 'end') {
                const startImg = scene.startImage?.data;
                // If we have our own start frame, add it to the FRONT of references for this specific shot
                // effectively making it [StartFrame, Scene1Ref, ...]
                if (startImg) {
                    referenceImages.unshift(startImg);
                }
            }

            let targetResolution = resolution;
            // Mid frames can be lower res for speed if intermediate mode
            if (videoMode === VideoMode.Intermediate && type === 'middle') {
                targetResolution = ImageResolution.Res_1K;
            }

            // Resolve Camera/Style Prompts
            const cameraPrompt = CAMERA_DEVICES.find(c => c.value === cameraDevice)?.prompt || '';
            const stylePrompt = SHOOTING_STYLES.find(s => s.value === shootingStyle)?.prompt || '';

            // Pass the selected imageModel from props
            const result = await generateImage(
                prompt,
                aspectRatio,
                targetResolution,
                referenceImages,
                controller.signal,
                imageModel,
                cameraPrompt,
                stylePrompt
            );

            if (!result) throw new Error("No image generated.");

            const asset: GeneratedAsset = {
                type: 'image',
                url: `data:image/jpeg;base64,${result.base64}`,
                mimeType: 'image/jpeg',
                data: result.base64,
                actualModelUsed: result.actualModelUsed
            };

            if (type === 'start') onUpdateScene(scene.id, { startImage: asset });
            else if (type === 'end') onUpdateScene(scene.id, { endImage: asset });
            else if (type === 'middle') onUpdateScene(scene.id, { middleImage: asset });

            return result.base64;
        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.log(`Generation for scene ${scene.id} ${type} stopped by user.`);
                // No error message needed for user stop
            } else {
                onUpdateScene(scene.id, { error: `生成失败: ${e.message}` });
            }
            return undefined;
        } finally {
            abortControllers.current.delete(abortKey);
            const finalUpdate: any = {};
            if (type === 'start') finalUpdate.isGeneratingStart = false;
            if (type === 'middle') finalUpdate.isGeneratingMiddle = false;
            if (type === 'end') finalUpdate.isGeneratingEnd = false;
            onUpdateScene(scene.id, finalUpdate);
        }
    };

    const handleGenerateAudio = async (scene: StoryboardScene) => {
        if (!scene.dialogue) return;
        onUpdateScene(scene.id, { isGeneratingAudio: true, error: undefined });
        try {
            const base64 = await generateSpeech(scene.dialogue, assignedVoice);
            const asset: GeneratedAsset = {
                type: 'audio',
                url: `data:audio/wav;base64,${base64}`,
                mimeType: 'audio/wav',
                data: base64
            };
            onUpdateScene(scene.id, { audio: asset });
        } catch (e) {
            onUpdateScene(scene.id, { error: `语音失败: ${(e as Error).message}` });
        } finally {
            onUpdateScene(scene.id, { isGeneratingAudio: false });
        }
    };

    const handleOptimizePrompt = async (scene: StoryboardScene) => {
        onUpdateScene(scene.id, { isUpdatingPrompt: true });
        try {
            // CONSISTENCY LOGIC:
            // If this is Scene 2+, we MUST pass Scene 1's prompt as the "Master"
            const sceneIndex = scenes.findIndex(s => s.id === scene.id);
            const masterPrompt = sceneIndex > 0 ? (scenes[0].prompt.textPrompt || scenes[0].prompt.imagePrompt) : undefined;

            // Optimize the TEXT prompt (not the Veo JSON)
            const promptToOptimize = scene.prompt.textPrompt || scene.visual_en;
            const newPrompt = await optimizePrompt(promptToOptimize, scene.visual_en || scene.visual, masterPrompt);

            onUpdateScene(scene.id, { prompt: { ...scene.prompt, textPrompt: newPrompt } });
        } catch (e) {
            console.error("Prompt optimization failed", e);
        } finally {
            onUpdateScene(scene.id, { isUpdatingPrompt: false });
        }
    }

    const updatePrompt = (id: string, value: string) => {
        const scene = scenes.find(s => s.id === id);
        if (scene) {
            // Update the Veo JSON Prompt
            onUpdateScene(id, { prompt: { ...scene.prompt, imagePrompt: value } });
        }
    }

    return (
        <div className="space-y-6 relative">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 sticky top-24 z-30 bg-dark-950/80 p-2 rounded-lg backdrop-blur border border-slate-800 shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerateRemaining}
                        disabled={isGeneratingAll || !scenes[0]?.startImage}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${isGeneratingAll || !scenes[0]?.startImage ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-900/50'}`}
                    >
                        <Zap size={14} className={isGeneratingAll ? 'animate-pulse' : ''} />
                        {isGeneratingAll ? '正在依序生成...' : '基于分镜1生成剩余全部'}
                    </button>
                    {!scenes[0]?.startImage && (
                        <span className="text-[10px] text-orange-400 flex items-center gap-1">
                            <Lock size={10} /> 需先生成分镜1
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Voice Badge */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Voice</span>
                        <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                            <Mic size={10} /> {assignedVoice} (Locked)
                        </span>
                    </div>

                    {/* Model Badge (New) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2 hidden lg:flex">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Model</span>
                        <span className="text-[10px] text-sky-400 font-mono">
                            {imageModel.includes('flash') ? 'Banana' : 'Banana Pro'}
                        </span>
                    </div>

                    {/* Resolution Badge */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Res</span>
                        <span className="text-[10px] text-brand-400 font-mono">
                            {imageModel.includes('flash') ? 'Default' : resolution}
                        </span>
                    </div>
                </div>
            </div>

            {scenes.map((scene, index) => {
                const isScene1 = index === 0;
                const isLocked = !isScene1 && !scenes[0].startImage;

                return (
                    <div key={scene.id} className={`rounded-xl border transition-all shadow-lg ${isLocked ? 'bg-slate-900/30 border-slate-800 opacity-70' : 'bg-slate-900 border-slate-700 hover:border-slate-600'}`}>
                        {/* Header */}
                        <div className="p-4 flex items-center justify-between border-b border-slate-800 cursor-pointer" onClick={() => toggleExpand(scene.id)}>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded shadow ${isScene1 ? 'bg-brand-600 text-white shadow-brand-500/20' : 'bg-slate-700 text-slate-300'}`}>
                                    分镜 {index + 1} {isScene1 && <span className="ml-1 text-[10px] bg-white/20 px-1 rounded">MASTER</span>}
                                </span>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-slate-200 truncate max-w-md">{scene.visual || '未命名分镜'}</h3>
                                    <span className="text-xs text-slate-500 truncate max-w-md">{scene.action}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isLocked && <Lock size={16} className="text-slate-600" />}
                                <button className="text-slate-400 hover:text-white transition-transform duration-200" style={{ transform: expandedScene === scene.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    <ChevronDown />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        <div className={`border-t border-slate-700/50 bg-slate-950/30 ${expandedScene === scene.id ? 'block' : 'hidden'}`}>
                            <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">

                                {/* Left: Script & Prompts (5 cols - Increased width for prompt) */}
                                <div className="xl:col-span-5 space-y-5">

                                    {/* Visual / Action / Camera Inputs */}
                                    <div className="space-y-3">
                                        {/* Visual */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-brand-400 font-bold tracking-wider flex items-center gap-1">
                                                <ImageIcon size={10} /> 画面内容 (Visual)
                                            </label>
                                            <textarea
                                                value={scene.visual}
                                                onChange={(e) => onUpdateScene(scene.id, { visual: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Action */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-brand-400 font-bold tracking-wider flex items-center gap-1">
                                                <Activity size={10} /> 动作 (Action)
                                            </label>
                                            <input
                                                value={scene.action}
                                                onChange={(e) => onUpdateScene(scene.id, { action: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                                            />
                                        </div>

                                        {/* Camera */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-brand-400 font-bold tracking-wider flex items-center gap-1">
                                                <Camera size={10} /> 运镜 (Camera)
                                            </label>
                                            <input
                                                value={scene.camera}
                                                onChange={(e) => onUpdateScene(scene.id, { camera: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                                            />
                                        </div>

                                        {/* Text-to-Image Prompt Display (Collapsible) */}
                                        <div className="space-y-1 pt-4 border-t border-slate-800/50 mt-2">
                                            <div className="flex items-center justify-between mb-1 cursor-pointer" onClick={() => togglePromptVisibility(scene.id)}>
                                                <label className="text-[10px] uppercase text-sky-400 font-bold tracking-wider flex items-center gap-1">
                                                    <Sparkles size={10} /> 文生图提示词 (Image Prompt)
                                                    {visiblePrompts[scene.id] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                                </label>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(scene.prompt.textPrompt || scene.visual_en); }}
                                                    className="text-[10px] bg-sky-600/20 hover:bg-sky-500 text-sky-400 hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1 border border-sky-500/20"
                                                >
                                                    <Copy size={10} /> 一键复制
                                                </button>
                                            </div>

                                            {/* Collapsible Content */}
                                            {visiblePrompts[scene.id] && (
                                                <div className="relative group animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <textarea
                                                        readOnly
                                                        value={scene.prompt.textPrompt || scene.visual_en || ''}
                                                        className="w-full bg-slate-950 border border-sky-900/30 rounded p-2 text-xs text-sky-100/70 focus:outline-none custom-scrollbar font-mono leading-relaxed"
                                                        rows={4}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Veo Prompt Editor (Updated with Copy Button) - Keeps its visibility for now but we can collapse it too if needed */}
                                        <div className="space-y-1 pt-2 opacity-60 hover:opacity-100 transition-opacity">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-[10px] uppercase text-purple-400 font-bold tracking-wider flex items-center gap-1">
                                                    <Video size={10} /> 视频生成 Manifest (Veo JSON)
                                                </label>
                                                <button
                                                    onClick={() => copyToClipboard(scene.prompt.imagePrompt)}
                                                    className="text-[10px] bg-purple-600/20 hover:bg-purple-500 text-purple-400 hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1 border border-purple-500/20"
                                                >
                                                    <Copy size={10} /> 一键复制
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <textarea
                                                    value={scene.prompt.imagePrompt}
                                                    onChange={(e) => updatePrompt(scene.id, e.target.value)}
                                                    className="w-full bg-black/30 border border-purple-900/30 rounded p-2 text-[10px] text-purple-300 font-mono focus:border-purple-500 focus:outline-none leading-tight shadow-inner"
                                                    rows={4}
                                                    placeholder="等待生成 Veo Manifest..."
                                                />
                                            </div>
                                        </div>

                                        {/* Dialogue */}
                                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-800/50">
                                            {/* Chinese Dialogue */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">中文大意 (Chinese)</label>
                                                <input
                                                    value={scene.dialogue_cn || ''}
                                                    onChange={(e) => onUpdateScene(scene.id, { dialogue_cn: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-400 focus:border-slate-500 focus:outline-none"
                                                    placeholder="等待生成..."
                                                />
                                            </div>

                                            {/* Target Language Dialogue */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-brand-400 font-bold tracking-wider">配音台词 ({assignedVoice})</label>
                                                <input
                                                    value={scene.dialogue}
                                                    onChange={(e) => onUpdateScene(scene.id, { dialogue: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Asset Generation (7 cols) */}
                                <div className="xl:col-span-7">
                                    <div className="flex flex-col gap-6 h-full">

                                        {/* Visual Asset Flow */}
                                        <div className="flex gap-4 overflow-x-auto pb-4 items-start custom-scrollbar">
                                            {/* Start Frame */}
                                            <AssetCard
                                                label="首帧图"
                                                asset={scene.startImage}
                                                loading={scene.isGeneratingStart}
                                                onGen={() => handleGenerateImage(scene, 'start')}
                                                onStop={() => handleStopGeneration(scene.id, 'start')}
                                                onPreview={onPreview}
                                                onViewPrompt={() => setPromptModal({ isOpen: true, content: scene.prompt.textPrompt || scene.visual_en })}
                                                icon={<ImageIcon size={14} />}
                                                disabled={isLocked}
                                                title={productTitle}
                                                sceneIndex={index + 1}
                                                type="start"
                                                aspectRatio={aspectRatio}
                                            />

                                            {(videoMode === VideoMode.StartEnd || videoMode === VideoMode.Intermediate) && (
                                                <div className="mt-20 text-slate-700 hidden md:block"><ArrowRight size={16} /></div>
                                            )}

                                            {/* Middle Frame */}
                                            {videoMode === VideoMode.Intermediate && (
                                                <>
                                                    <AssetCard
                                                        label="分镜草稿"
                                                        asset={scene.middleImage}
                                                        loading={scene.isGeneratingMiddle}
                                                        onGen={() => handleGenerateImage(scene, 'middle')}
                                                        onStop={() => handleStopGeneration(scene.id, 'middle')}
                                                        onPreview={onPreview}
                                                        onViewPrompt={() => setPromptModal({ isOpen: true, content: scene.prompt.textPrompt || scene.visual_en })}
                                                        icon={<Wand2 size={14} />}
                                                        highlight
                                                        disabled={isLocked}
                                                        title={productTitle}
                                                        sceneIndex={index + 1}
                                                        type="draft"
                                                        aspectRatio={aspectRatio}
                                                    />
                                                    <div className="mt-20 text-slate-700 hidden md:block"><ArrowRight size={16} /></div>
                                                </>
                                            )}

                                            {/* End Frame */}
                                            {(videoMode === VideoMode.StartEnd || videoMode === VideoMode.Intermediate) && (
                                                <>
                                                    <AssetCard
                                                        label="尾帧图"
                                                        asset={scene.endImage}
                                                        loading={scene.isGeneratingEnd}
                                                        onGen={() => handleGenerateImage(scene, 'end')}
                                                        onStop={() => handleStopGeneration(scene.id, 'end')}
                                                        onPreview={onPreview}
                                                        onViewPrompt={() => setPromptModal({ isOpen: true, content: scene.prompt.textPrompt || scene.visual_en })}
                                                        icon={<ImageIcon size={14} />}
                                                        disabled={isLocked}
                                                        title={productTitle}
                                                        sceneIndex={index + 1}
                                                        type="end"
                                                        aspectRatio={aspectRatio}
                                                    />
                                                </>
                                            )}
                                        </div>

                                        {/* Audio Section */}
                                        <div className="mt-auto bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                <Mic size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">配音 ({assignedVoice})</span>
                                                    {scene.audio && <a href={scene.audio.url} download={`${productTitle || 'Scene'}_Scene${index + 1}_Audio.wav`}><Download size={12} className="text-slate-500 hover:text-white" /></a>}
                                                </div>
                                                {scene.audio ? (
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <AudioPlayer url={scene.audio.url} />
                                                        <button onClick={() => handleGenerateAudio(scene)} className="text-[10px] text-slate-400 underline hover:text-white">重生成</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <button
                                                            disabled={!scene.dialogue || scene.isGeneratingAudio}
                                                            onClick={() => handleGenerateAudio(scene)}
                                                            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors disabled:opacity-50 border border-slate-700"
                                                        >
                                                            {scene.isGeneratingAudio ? '生成中...' : '生成语音'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                    {scene.error && (
                                        <div className="mt-3 text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                            {scene.error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Prompt Modal - Kept for Asset Card View Button if needed, but text is now inline */}
            {promptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPromptModal(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPromptModal(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="text-brand-500" size={18} /> 文生图提示词 (Text-to-Image)
                        </h3>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-4 max-h-[60vh] overflow-y-auto">
                            <p className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                                {promptModal.content}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                copyToClipboard(promptModal.content);
                                setPromptModal(null);
                            }}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                        >
                            <Copy size={18} /> 一键复制提示词
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
