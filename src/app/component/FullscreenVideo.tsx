"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface FullscreenVideoProps {
  src: string;
  isOpen: boolean;
  startTime: number;
  wasPlaying: boolean;
  volume?: number;

  onClose: (currentTime: number, wasPlaying: boolean) => void;
}

export default function FullscreenVideo({
  src,
  isOpen,
  startTime,
  wasPlaying,
  volume = 1,
  onClose,
}: FullscreenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(wasPlaying);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [videoVolume, setVideoVolume] = useState(volume);

  // =====================================================
  // CONTROLS VISIBILITY
  // =====================================================

  const revealControls = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  // =====================================================
  // OPEN / INITIALIZE
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    const video = videoRef.current;

    if (!video) return;

    video.currentTime = startTime;
    video.volume = videoVolume;

    setCurrentTime(startTime);
    setIsPlaying(wasPlaying);

    if (wasPlaying) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }

    revealControls();

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, startTime, wasPlaying, revealControls]);

  // =====================================================
  // VIDEO EVENTS
  // =====================================================

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);

      if (isOpen) {
        video.currentTime = startTime;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      if (video.duration) {
        setProgress(video.currentTime / video.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isOpen, startTime]);

  // =====================================================
  // PLAY / PAUSE
  // =====================================================

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }

    revealControls();
  }, [revealControls]);

  // =====================================================
  // SEEK
  // =====================================================

  const seekVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;

    if (!video || !video.duration) return;

    const value = Number(event.target.value) / 1000;

    video.currentTime = value * video.duration;

    setProgress(value);
    setCurrentTime(video.currentTime);

    revealControls();
  };

  // =====================================================
  // VOLUME
  // =====================================================

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value) / 100;

    setVideoVolume(value);

    const video = videoRef.current;

    if (video) {
      video.volume = value;
    }

    revealControls();
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    if (videoVolume === 0) {
      setVideoVolume(1);
      video.volume = 1;
    } else {
      setVideoVolume(0);
      video.volume = 0;
    }

    revealControls();
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const closeFullscreen = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      onClose(startTime, wasPlaying);
      return;
    }

    onClose(video.currentTime, !video.paused);
  }, [onClose, startTime, wasPlaying]);

  // =====================================================
  // KEYBOARD
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
      }

      if (event.key === "Escape") {
        closeFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, togglePlayback, closeFullscreen]);

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${secs}`;
  };

  if (!isOpen) return null;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black"
      style={{
        width: "100dvw",
        height: "100dvh",
      }}
      onPointerMove={revealControls}
      onPointerLeave={() => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }

        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 2000);
      }}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-video-control]")) {
          return;
        }

        togglePlayback();
      }}
    >
      {/* =================================================
          VIDEO
      ================================================= */}

      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 block w-[100dvw] h-[100dvh] object-fit"
        playsInline
        loop
        preload="auto"
      />

      {/* =================================================
          CONTROLS
      ================================================= */}

      <div
        className={`
          absolute
          left-0
          right-0
          bottom-0
          z-20
          px-6
          pb-6
          pt-12
          transition-opacity
          duration-300
          ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        data-video-control
        onClick={(event) => event.stopPropagation()}
      >
        {/* PROGRESS BAR */}

        <input
          data-video-control
          type="range"
          min="0"
          max="1000"
          step="1"
          value={Math.round(progress * 1000)}
          onChange={seekVideo}
          className="video-progress"
          aria-label="Video progress"
        />

        {/* CONTROL ROW */}

        <div className="mt-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-5">
            {/* PLAY / PAUSE */}

            <button
              data-video-control
              type="button"
              className="video-control"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M8 5v14M16 5v14" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* VOLUME */}

            <button
              data-video-control
              type="button"
              className="video-control"
              onClick={toggleMute}
              aria-label="Toggle volume"
            >
              {videoVolume === 0 ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  <path d="M17 9l4 6M21 9l-4 6" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  <path d="M17 9c1.5 1.5 1.5 4.5 0 6" />
                  <path d="M19.5 6.5c3 3 3 8 0 11" />
                </svg>
              )}
            </button>

            <input
              data-video-control
              type="range"
              min="0"
              max="100"
              value={videoVolume * 100}
              onChange={changeVolume}
              className="volume-slider"
              aria-label="Volume"
            />

            {/* TIME */}

            <span className="text-[11px] tracking-[0.08em] opacity-70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* MINIMIZE */}

          <button
            data-video-control
            type="button"
            className="video-control"
            onClick={closeFullscreen}
            aria-label="Return to barrel video"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 3v5H3" />
              <path d="M3 8l6-6" />
              <path d="M16 21v-5h5" />
              <path d="M21 16l-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .video-progress {
          width: 100%;
          height: 3px;
          appearance: none;
          -webkit-appearance: none;
          background: #555;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          display: block;
        }

        .video-progress::-webkit-slider-runnable-track {
          height: 3px;
          background: linear-gradient(
            to right,
            #fff 0%,
            #fff var(--progress, 0%),
            #555 var(--progress, 0%),
            #555 100%
          );
          border-radius: 999px;
        }

        .video-progress::-moz-range-track {
          height: 3px;
          background: #555;
          border-radius: 999px;
        }

        .video-progress::-moz-range-progress {
          height: 3px;
          background: #fff;
          border-radius: 999px;
        }

        .video-progress::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 8px;
          height: 8px;
          margin-top: -2.5px;
          border-radius: 50%;
          background: #fff;
          border: none;
        }

        .video-progress::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
          border: none;
        }

        .volume-slider {
          width: 65px;
          height: 2px;
          appearance: none;
          -webkit-appearance: none;
          background: #555;
          border-radius: 999px;
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fff;
          border: none;
        }

        .volume-slider::-moz-range-thumb {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fff;
          border: none;
        }

        .video-control {
          width: 24px;
          height: 24px;
          padding: 0;
          border: 0;
          background: transparent;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.85;
          transition:
            opacity 150ms ease,
            transform 150ms ease;
        }

        .video-control:hover {
          opacity: 1;
          transform: scale(1.08);
        }

        .video-control svg {
          width: 18px;
          height: 18px;
          display: block;
        }
      `}</style>
    </div>
  );
}
