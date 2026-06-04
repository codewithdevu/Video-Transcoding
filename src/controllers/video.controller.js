import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnS3 } from "../utils/s3.js";
import { videoQueue } from "../queues/video.queue.js";


console.log("1. Request Received");
const uploadVideo = async (req, res) => {
    try {

        const localFilePath = req.file?.path;

        if (!localFilePath) {
            throw new ApiError(400, "Video file missing");
        }

        const uploadedVideo =
            await uploadOnS3(
                localFilePath,
                req.file.mimetype
            );

        if (!uploadedVideo) {
            throw new ApiError(500, "S3 upload failed");
        }

        console.log("2. S3 Uploaded");
        const savedVideo = await Video.create({
            videoUrl: uploadedVideo.videoUrl,
            s3Key: uploadedVideo.key,
            status: "uploaded",
        });

        console.log("3. Mongo Saved");

        await videoQueue.add(
            "transcode-video",
            {
                videoId: savedVideo._id.toString(),
                s3Key: uploadedVideo.key,
            }
        );
        console.log("4. Queue Added");

        console.log("5. Sending Response");

        return res.status(200).json({
            success: true,
            message: "Video uploaded in S3  successfully",
            videoUrl: uploadedVideo.videoUrl,
            data: savedVideo,
        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });

    }
};

const getVideoById = async (req, res) => {
    try {

        const { id } = req.params;

        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: video,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

export {
    uploadVideo,
    getVideoById,
};