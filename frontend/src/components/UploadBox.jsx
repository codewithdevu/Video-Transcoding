import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function UploadBox() {
    const [file, setFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    // Handle drag states
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    // Handle file drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith("video/")) {
                setFile(droppedFile);
            } else {
                alert("Invalid format: Please drop a video file.");
            }
        }
    };

    // Handle manual click-to-select file
    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type.startsWith("video/")) {
                setFile(selectedFile);
            } else {
                alert("Invalid format: Please select a video file.");
            }
        }
    };

    const triggerFileInput = () => {
        if (!loading) {
            fileInputRef.current?.click();
        }
    };

    // Real API Upload Handler
    const handleUpload = async () => {
        if (!file) {
            alert("Please select a video");
            return;
        }

        try {
            setLoading(true);
            setUploadProgress(0);

            const formData = new FormData();
            formData.append("videoFile", file);

            const response = await api.post(
                "/uploads",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    // Tracks real-time upload progress from Axios
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(percentCompleted);
                        }
                    },
                }
            );

            console.log(response.data);
            const videoId = response.data.data._id;
            navigate(`/video/${videoId}`);

        } catch (error) {
            console.error(error);
            alert("Upload Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = 2;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    return (
        <div className="w-full max-w-xl mx-auto text-left">
            {/* Hidden Input Layer */}
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleChange}
                disabled={loading}
            />

            {/* Interactive Upload Box Frame (Dashed Line Select Area) */}
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={!file && !loading ? triggerFileInput : undefined}
                className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 px-6 py-10 flex flex-col items-center justify-center text-center cursor-pointer 
                    ${isDragActive
                        ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
                        : file
                            ? "border-slate-700 bg-slate-900/20"
                            : "border-slate-700 hover:border-indigo-500/50 bg-slate-950/40 hover:bg-slate-900/40"
                    }`}
            >
                {/* Background Grid Accent inside Box */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

                {!file ? (
                    // Default State (Ready to select/drop)
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Animated Upload Icon Circle */}
                        <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-300">
                            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-200 mb-1">
                            <span className="text-indigo-400 hover:underline">Click to browse</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">MP4, MOV, or MKV (up to 2GB)</p>
                    </div>
                ) : (
                    // Selected State
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>

                        {/* File Details Card */}
                        <div className="max-w-md w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3 mb-2">
                            <div className="flex flex-col text-left overflow-hidden">
                                <span className="text-xs font-semibold text-slate-300 truncate">{file.name}</span>
                                <span className="text-[10px] text-slate-500">{formatBytes(file.size)}</span>
                            </div>

                            {!loading && (
                                <button
                                    onClick={handleRemoveFile}
                                    type="button"
                                    className="p-1.5 rounded bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* File Upload Progress Indicator (Using Real API Progress) */}
                        {loading && (
                            <div className="w-full max-w-md mt-4">
                                <div className="flex justify-between text-[11px] text-indigo-300 mb-1">
                                    <span>Uploading to cloud servers...</span>
                                    <span className="font-mono">{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-100 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Action Button */}
            {file && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className={`w-full relative py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 overflow-hidden
                            ${loading
                                ? "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 hover:shadow-indigo-500/20 active:scale-95 group/btn cursor-pointer"
                            }`}
                    >
                        {/* Shimmer overlay animation */}
                        {!loading && (
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                        )}

                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Uploading ({uploadProgress}%)</span>
                            </>
                        ) : (
                            <>
                                <span>Upload Video</span>
                                <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}} />
        </div>
    );
}

export default UploadBox;