import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Hls from "hls.js";

import api from "../api/axios";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";

// ==========================================
// 1. CUSTOM HLS VIDEO PLAYER WITH CONTROLS
// ==========================================
function CustomVideoPlayer({ src }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [levels, setLevels] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(-1); // -1 is Auto
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isControlsVisible, setIsControlsVisible] = useState(true);

    // Auto-hide controls when mouse is inactive
    const controlsTimeoutRef = useRef(null);
    const handleMouseMove = () => {
        setIsControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setIsControlsVisible(false);
        }, 3000);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Initialize Hls.js
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsRef.current = hls;

            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Fetch the available levels (resolutions) from the manifest
                setLevels(hls.levels);
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
                // Track current active level (useful if it's set to automatic auto-bitrate)
                if (hls.autoLevelEnabled) {
                    setCurrentLevel(-1);
                } else {
                    setCurrentLevel(data.level);
                }
            });

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari native HLS fallback
            video.src = src;
        }
    }, [src]);

    // Handle play / pause toggles
    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    // Update progress state on time update
    const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(videoRef.current.duration);
    };

    // Scrubber navigation
    const handleSeek = (e) => {
        const seekTime = parseFloat(e.target.value);
        videoRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    // Volume modifications
    const handleVolumeChange = (e) => {
        const value = parseFloat(e.target.value);
        setVolume(value);
        videoRef.current.volume = value;
        setIsMuted(value === 0);
    };

    const toggleMute = () => {
        const mutedState = !isMuted;
        setIsMuted(mutedState);
        videoRef.current.muted = mutedState;
    };

    // Quality/Resolution switcher handler
    const selectQuality = (levelIndex) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex;
            setCurrentLevel(levelIndex);
        }
        setShowQualityMenu(false);
    };

    // Screen sizing switcher handler
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch((err) => {
                console.error("Fullscreen error: ", err);
            });
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Track native fullscreen exits via Esc key
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "0:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
            className="group/player relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
        >
            {/* Native Video Node */}
            <video
                ref={videoRef}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="w-full h-full cursor-pointer object-contain"
                playsInline
            />

            {/* Premium Control Overlay Bar */}
            <div className={`absolute inset-0 bg-linear-to-trom-slate-950/90 via-transparent to-slate-950/20 flex flex-col justify-end p-4 transition-opacity duration-300 pointer-events-auto
                ${isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
                {/* 1. Timeline Progress Scrubber */}
                <div className="w-full mb-4 flex items-center gap-3">
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all outline-none"
                    />
                </div>

                {/* 2. Control Actions Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause Button */}
                        <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors p-1 cursor-pointer">
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </button>

                        {/* Mute & Volume Scrubber */}
                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={toggleMute} className="text-white hover:text-indigo-400 transition-colors p-1 cursor-pointer">
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm11 3l4.5 4.5m0-9L16 12"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 9v6h4l5 5V4L9 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                    </svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>

                        {/* Timing readout */}
                        <div className="text-xs font-mono text-slate-300">
                            {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        {/* Auto-Resolution Selector Button (Beside fullscreen) */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowQualityMenu(!showQualityMenu)}
                                className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {currentLevel === -1 
                                    ? "Auto" 
                                    : `${levels[currentLevel]?.height}p`}
                            </button>

                            {/* Dropdown Options (Pops Upwards) */}
                            {showQualityMenu && (
                                <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-0.5">
                                    <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">Quality</div>
                                    <button 
                                        onClick={() => selectQuality(-1)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-slate-800 transition-colors
                                            ${currentLevel === -1 ? "text-indigo-400 bg-indigo-500/10" : "text-slate-300"}`}
                                    >
                                        Auto
                                        {currentLevel === -1 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                                    </button>
                                    
                                    {/* Populate resolutions from manifest */}
                                    {levels.map((level, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => selectQuality(idx)}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-slate-800 transition-colors
                                                ${currentLevel === idx ? "text-indigo-400 bg-indigo-500/10" : "text-slate-300"}`}
                                        >
                                            {level.height}p
                                            {currentLevel === idx && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen Button */}
                        <button onClick={toggleFullscreen} className="text-white hover:text-indigo-400 transition-colors p-1 cursor-pointer">
                            {isFullscreen ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 2. MAIN VIDEO DETAILS VIEW
// ==========================================
function VideoDetails() {
    const { id } = useParams();

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let interval;

        const fetchVideo = async () => {
            try {
                const response = await api.get(`/${id}`);
                const videoData = response.data.data;

                setVideo(videoData);
                setLoading(false);

                // Stop polling if processing completes
                if (videoData.status === "processed" || videoData.status === "failed") {
                    clearInterval(interval);
                }
            } catch (error) {
                console.error("Fetch Error: ", error);
                setLoading(false);
            }
        };

        fetchVideo();

        // Check video status every 3 seconds
        interval = setInterval(fetchVideo, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden selection:bg-indigo-500 selection:text-white">
            
            {/* Embedded styles for page animations */}
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
                .animate-fade-in-up {
                    opacity: 0;
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
            `}} />

            {/* Grid Backdrop Panel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <Navbar />

            <div className="relative z-10 max-w-4xl mx-auto w-full p-6 py-12 md:py-20">
                
                {/* Header Information */}
                <div className="animate-fade-in-up mb-8">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-linear-to-b from-white to-slate-400">
                        Video Pipeline Stream
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-slate-500">Video ID: <span className="font-mono text-slate-300">{id}</span></span>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Status:</span>
                            {video?.status === "processed" ? (
                                <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-400">
                                    Ready to Stream
                                </span>
                            ) : video?.status === "failed" ? (
                                <span className="px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400">
                                    Transcoding Failed
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-400 animate-pulse">
                                    Transcoding Output Slices...
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Player Frame or Interactive Processing Flow Panel */}
                <div className="animate-fade-in-up delay-100">
                    {video?.status !== "processed" ? (
                        /* Premium Interactive Status Board while video is encoding */
                        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center">
                            {/* Accent Glow Circle inside panel */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-indigo-500/5 filter blur-3xl pointer-events-none" />

                            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                                {/* Simulated cloud network transcoding visualizer */}
                                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400">
                                    <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H15M9 5a9 9 0 010 18" />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-bold text-slate-100 mb-2">Transcoding Pipeline in Progress</h3>
                                <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                                    We are generating adaptive HLS output profiles (1080p, 720p, 480p) to deliver an optimized streaming experience.
                                </p>

                                {/* Transcoder Micro-Steps Progress Flow */}
                                <div className="w-full text-left space-y-4 bg-slate-950/50 border border-slate-800/80 p-5 rounded-xl">
                                    {/* Step 1: Upload */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-300">File uploaded securely</span>
                                    </div>

                                    {/* Step 2: Extraction */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-300">Analyzing video parameters</span>
                                    </div>

                                    {/* Step 3: Multi-resolution slicing */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200">Generating multi-resolution slices</span>
                                    </div>

                                    {/* Step 4: Wrapping Master Playlists */}
                                    <div className="flex items-center gap-3 opacity-40">
                                        <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center" />
                                        <span className="text-sm font-semibold text-slate-400">Publishing HLS Master Manifest</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Embed upgraded player when transcoding completes */
                        <div className="relative group">
                            {/* Soft behind-glow for active playing window */}
                            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-md pointer-events-none" />
                            <CustomVideoPlayer src={video?.hlsMasterUrl} />
                        </div>
                    )}
                </div>

                {/* Return Home back Button */}
                <div className="animate-fade-in-up delay-200 mt-10 flex justify-start">
                    <a 
                        href="/" 
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Transcoder
                    </a>
                </div>

            </div>
        </div>
    );
}

export default VideoDetails;