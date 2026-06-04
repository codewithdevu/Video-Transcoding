import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/axios";
import Loader from "../components/Loader";
import VideoPlayer from "../components/VideoPlayer";
import Navbar from "../components/Navbar";

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

                // Processing complete hone par polling stop
                if (videoData.status === "processed") {
                    clearInterval(interval);
                }

            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };

        // Initial fetch
        fetchVideo();

        // Har 3 second me status check
        interval = setInterval(fetchVideo, 3000);

        return () => {
            clearInterval(interval);
        };

    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-5xl mx-auto p-6">

                <h1 className="text-3xl font-bold mb-6">
                    Video Details
                </h1>

                <p className="mb-6">
                    <span className="font-semibold">
                        Status:
                    </span>{" "}
                    {video?.status}
                </p>

                {
                    video?.status !== "processed" ? (
                        <Loader />
                    ) : (
                        <VideoPlayer
                            src={video?.hlsMasterUrl}
                        />
                    )
                }

            </div>
        </div>
    );
}

export default VideoDetails;