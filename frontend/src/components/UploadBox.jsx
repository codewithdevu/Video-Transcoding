import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function UploadBox() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a video");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("videoFile", file);

            const response = await api.post(
                "/uploads",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
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

    return (<div className="bg-white p-6 rounded-lg shadow-md">
        <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 w-full"
        />

        <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
            {loading ? "Uploading..." : "Upload Video"}
        </button>

    </div>
    );
}

export default UploadBox;
