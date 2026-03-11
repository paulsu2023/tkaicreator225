
import React from 'react';

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        console.error('ErrorBoundary caught:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Uncaught React error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-dark-950 flex items-center justify-center p-8 font-sans">
                    <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">页面加载出现问题</h2>
                        <p className="text-slate-400 text-sm mb-2">
                            这通常是由于浏览器内存不足（生成了大量图片）或临时网络错误导致的。
                        </p>
                        <p className="text-red-400 text-xs font-mono bg-slate-950 p-2 rounded mb-6 text-left break-all">
                            {this.state.error?.message || '未知错误'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => this.setState({ hasError: false, error: undefined })}
                                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold transition-colors"
                            >
                                🔄 尝试恢复
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
                            >
                                🔁 刷新页面
                            </button>
                        </div>
                        <p className="text-slate-600 text-xs mt-4">
                            提示：如果频繁崩溃，请尝试分批生成图片，或减少每次上传的图片数量。
                        </p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
