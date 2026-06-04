import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
    uploadVideo,
    getVideoById
} from "../controllers/video.controller.js";

const router = Router();

router.route("/uploads").post(
    upload.single("videoFile"),
    uploadVideo
);

router.route("/:id").get(
    getVideoById
);

export default router;