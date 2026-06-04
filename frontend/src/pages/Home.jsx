import UploadBox from "../components/UploadBox";

function Home() {
    return (<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">

        <h1 className="text-4xl font-bold mb-4">
            Video Transcoding Platform
        </h1>

        <p className="text-gray-600 mb-8 text-center max-w-2xl">
            Upload your video and automatically generate multiple
            resolutions with HLS streaming support.
        </p>

        <div className="w-full max-w-2xl">
            <UploadBox />
        </div>

    </div>
    );
}

export default Home;
