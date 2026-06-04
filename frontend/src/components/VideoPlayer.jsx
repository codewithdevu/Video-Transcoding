import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  const [levels, setLevels] = useState([]);
  const [hlsInstance, setHlsInstance] = useState(null);

  useEffect(() => {
    if (!src) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels);
        setHlsInstance(hls);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <div className="w-full">

      <div className="mb-3">
        <select
          className="border p-2 rounded"
          onChange={(e) => {
            if (!hlsInstance) return;

            const level = Number(e.target.value);

            hlsInstance.currentLevel = level;
          }}
        >
          <option value="-1">Auto</option>

          {levels.map((level, index) => (
            <option
              key={index}
              value={index}
            >
              {level.height}p
            </option>
          ))}
        </select>
      </div>

      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg shadow-lg"
      />
    </div>
  );
}

export default VideoPlayer;