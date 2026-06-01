import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({

    title: {
        type: String,
    },

    videoUrl: {
        type: String,
        required: true,
    },

    s3Key: {
        type: String,
        required: true,
    },

    resolutions: {
        p1080: String,
        p720: String,
        p480: String,
        p360: String,
    },

    hlsMasterUrl: {
        type: String,
    },

    status: {
        type: String,
        enum: [
            "uploaded",
            "processing",
            "processed",
            "failed"
        ],
        default: "uploaded",
    },

}, {
    timestamps: true,
});

export const Video =
    mongoose.model("Video", videoSchema);