"use client";

import { forwardRef, useEffect, type VideoHTMLAttributes } from "react";
import Hls from "hls.js";

const src = "https://media.nhujandongol.com.np/showreel/master.m3u8";

interface ShowreelPlayerProps extends Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "className" | "controls"
> {
  controls?: boolean;
  className?: string;
}

const ShowreelPlayer = forwardRef<HTMLVideoElement, ShowreelPlayerProps>(
  function ShowreelPlayer(
    { controls = true, className = "w-full", ...videoProps },
    ref,
  ) {
    useEffect(() => {
      const video = ref && typeof ref === "object" ? ref.current : null;
      if (!video) return;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        return () => hls.destroy();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    }, [ref]);

    return (
      <div className="w-full">
        <video
          ref={ref}
          controls={controls}
          controlsList="nodownload"
          disablePictureInPicture
          preload="metadata"
          poster="/showreel-poster.jpg"
          className={className}
          {...videoProps}
        />
      </div>
    );
  },
);

ShowreelPlayer.displayName = "ShowreelPlayer";

export default ShowreelPlayer;
