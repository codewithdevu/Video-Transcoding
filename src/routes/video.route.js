import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/").get((req, res) => {
    res.json({
        message: "hello from divyansh",
    });
});

router.route("/uploads").post(
    upload.single("videoFile"),
    uploadVideo
);

export default router;