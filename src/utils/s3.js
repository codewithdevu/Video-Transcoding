import dotenv from "dotenv";
dotenv.config();

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const uploadOnS3 = async (localFilePath, mimetype) => {
    try {
        if (!localFilePath) return null;

        console.log("Reading File");

        const fileStream =
            fs.createReadStream(localFilePath);

        const filename = `${Date.now()}-${path.basename(localFilePath)}`;

        const key = `videos/${filename}`;

        console.log("Creating Command");

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: mimetype,
        });

        console.log("Sending To S3");

        await s3Client.send(command);

        console.log("S3 Upload Success");

        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

        return {
            videoUrl,
            key,
        }
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        console.log("S3 Upload Error:", error);
        return null;
    }
}

const downloadFromS3 = async (s3Key) => {

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
    });

    const response = await s3Client.send(command);

    const filePath = path.join(
        process.cwd(),
        "uploads/temp",
        "input.mp4"
    );

    const writeStream = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
        response.Body.pipe(writeStream);

        response.Body.on("error", reject);

        writeStream.on("finish", resolve);
    });

    return filePath;
};

const uploadFinalTransocodeFileToS3 = async (filePath) => {
    console.log("Reading processed file...");
    const fileContent = fs.readFileSync(filePath);

    const fileName = path.basename(filePath);

    const key = `processed/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: "video/mp4",
    });
    console.log("Sending file to S3...");
    await s3Client.send(command);
    console.log("S3 upload success");

    const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
        videoUrl,
        key,
    };
};

const uploadHLSFolderToS3 = async (
    localFolderPath,
     videoId) => {

        const uploadedFiles = [];
        
        const uploadRecursion = async (
            currentPath,
        ) => {
            const files = 
            fs.readdirSync(currentPath);

            for (const file of files) {
                const fullPath  = path.join(
                    currentPath,
                    file
                );

            const stats = 
                fs.statSync(fullPath);

            if (stats.isDirectory()) {
                await uploadRecursion(fullPath);
            } else {
                const relativePath = path.relative(
                    localFolderPath,
                    fullPath
                );  

            const s3Key = `hls/${videoId}/${relativePath.replace(/\\/g, "/")}`;

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key, 
                Body: fs.createReadStream(fullPath),
            });

            await s3Client.send(command);

            uploadedFiles.push({
                key: s3Key,
            });

            console.log(`Uploaded ${s3Key} to S3`);
            }
        }
     };

     await uploadRecursion(localFolderPath);

     return uploadedFiles;
};

export {
    s3Client,
    uploadOnS3,
    downloadFromS3,
    uploadFinalTransocodeFileToS3,
    uploadHLSFolderToS3,
};