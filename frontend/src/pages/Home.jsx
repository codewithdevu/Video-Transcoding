import UploadBox from "../components/UploadBox";

function Home() {
    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 overflow-hidden selection:bg-indigo-500 selection:text-white">
            
            {/* Embedded custom CSS animation rules */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-fade-in-up {
                    opacity: 0;
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
            `}} />

            {/* Background Radial Glows & Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            
            <div className="absolute top-[-10%] left-[-10%] h-125 w-125 rounded-full bg-[radial-gradient(circle_farthest-side,rgba(99,102,241,0.15),transparent)] filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] h-125 w-125 rounded-full bg-[radial-gradient(circle_farthest-side,rgba(168,85,247,0.15),transparent)] filter blur-3xl pointer-events-none" />

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center py-16 md:py-24">
                
                {/* Status Badge */}
                <div className="animate-fade-in-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    Production-Ready HLS Pipeline
                </div>

                {/* Main Title */}
                <h1 className="animate-fade-in-up delay-100 text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-white via-slate-100 to-slate-400 max-w-3xl leading-tight">
                    Video Transcoding <br className="hidden md:inline" />
                    <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
                        & HLS Streaming
                    </span>
                </h1>

                {/* Subtitle / Description */}
                <p className="animate-fade-in-up delay-200 text-base md:text-lg text-slate-400 mb-10 max-w-2xl leading-relaxed">
                    Upload your raw source video and generate responsive resolutions with adaptively streamed HLS outputs tailored for seamless multi-device delivery.
                </p>

                {/* Upload Box Container with Outer Glow and Hover Transition */}
                <div className="animate-fade-in-up delay-300 relative w-full max-w-2xl group">
                    {/* Glowing Accent Border Effect */}
                    <div className="absolute -inset-1.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-md opacity-20 group-hover:opacity-45 transition duration-1000 group-hover:duration-200"></div>

                    {/* Main Upload Frame */}
                    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-300 hover:border-slate-700/80">
                        <UploadBox />
                    </div>
                </div>

                {/* High-Value Features Grid */}
                <div className="animate-fade-in-up delay-300 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mt-16 text-left">
                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700/50 transition-colors duration-300">
                        <div className="text-indigo-400 mb-2 font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Distributed Power
                        </div>
                        <p className="text-sm text-slate-400">Concurrent workers process jobs in parallel to minimize overall conversion wait times.</p>
                    </div>

                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700/50 transition-colors duration-300">
                        <div className="text-purple-400 mb-2 font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Standard Profiles
                        </div>
                        <p className="text-sm text-slate-400">Automatically creates multiple web-friendly versions including 1080p, 720p, and 480p.</p>
                    </div>

                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700/50 transition-colors duration-300">
                        <div className="text-pink-400 mb-2 font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Adaptive Bitrate
                        </div>
                        <p className="text-sm text-slate-400">Generates HLS Master playlists to support real-time network adaptive player switches.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Home;
