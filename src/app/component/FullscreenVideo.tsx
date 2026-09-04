"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface FullscreenVideoProps {
  src: string;
  isOpen: boolean;
  startTime?: number;
  wasPlaying?: boolean;
  onClose: (currentTime: number, playing: boolean) => void;
}

export default function FullscreenVideo({
  src,
  isOpen,
  startTime = 0,
  wasPlaying = true,
  onClose,
}: FullscreenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(wasPlaying);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseMove = (event: MouseEvent) => {
      const video = videoRef.current;
      if (video) setIsPlaying(!video.paused);
      setCursor({ x: event.clientX, y: event.clientY });
      setCursorVisible(true);
      revealControls();
    };
    const handleMouseLeave = () => setCursorVisible(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isOpen, revealControls]);

  /*
   * -------------------------------------------------------
   * HIDE REAL CURSOR
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!isOpen) return;

    const previousCursor = document.body.style.cursor;
    const previousFullscreenState = document.body.dataset.fullscreen;

    if (window.innerWidth >= 768) {
      document.body.style.cursor = "none";
    }
    document.body.dataset.fullscreen = "true";

    return () => {
      document.body.style.cursor = previousCursor;
      if (previousFullscreenState === undefined) {
        delete document.body.dataset.fullscreen;
      } else {
        document.body.dataset.fullscreen = previousFullscreenState;
      }
    };
  }, [isOpen]);

  /*
   * -------------------------------------------------------
   * VIDEO OPEN
   * -------------------------------------------------------
   */

  const handleLoadedMetadata = () => {
    const video = videoRef.current;

    if (video) {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      setCurrentTime(video.currentTime);
    }
  };

  const handleDurationChange = () => {
    const video = videoRef.current;

    if (video && Number.isFinite(video.duration)) {
      setDuration(video.duration);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (video) setCurrentTime(video.currentTime);
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !isOpen) return;

    setDuration(0);
    setCurrentTime(startTime);

    const start = async () => {
      try {
        video.currentTime = startTime;

        if (wasPlaying) {
          await video.play();
          setIsPlaying(true);
        } else {
          video.pause();

          setIsPlaying(false);
        }
      } catch {
        setIsPlaying(false);
      }
    };

    void start();
    revealControls();
  }, [isOpen, startTime, wasPlaying, revealControls]);

  /*
   * -------------------------------------------------------
   * VIDEO EVENTS
   * -------------------------------------------------------
   */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleMetadata = () => {
      setDuration(video.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  /*
   * -------------------------------------------------------
   * PLAY / PAUSE
   * -------------------------------------------------------
   */

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      void video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    } else {
      video.pause();

      setIsPlaying(false);
    }

    revealControls();
  }, [revealControls]);

  /*
   * -------------------------------------------------------
   * SEEK
   * -------------------------------------------------------
   */

  const seekVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;

    if (!video || !video.duration) return;

    const value = Number(event.target.value) / 1000;

    video.currentTime = value * video.duration;

    setCurrentTime(video.currentTime);

    revealControls();
  };

  /*
   * -------------------------------------------------------
   * VOLUME
   * -------------------------------------------------------
   */

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value) / 100;
    setVolume(value);
    const video = videoRef.current;

    if (video) {
      video.volume = value;
    }

    revealControls();
  };

  /*
   * -------------------------------------------------------
   * MUTE
   * -------------------------------------------------------
   */

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (video.volume > 0) {
      video.volume = 0;
      setVolume(0);
    } else {
      video.volume = 1;
      setVolume(1);
    }

    revealControls();
  }, [revealControls]);

  /*
   * -------------------------------------------------------
   * CLOSE
   * -------------------------------------------------------
   */

  const close = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    onClose(video.currentTime, !video.paused);
  }, [onClose]);

  /*
   * -------------------------------------------------------
   * KEYBOARD
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
      }

      if (event.key === "Escape") {
        close();
      }

      if (event.key === "m") {
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, togglePlayback, close, toggleMute]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        h-[100dvh]
        w-[100dvw]
        overflow-hidden
        bg-black
        md:cursor-none
      "
      onMouseMove={revealControls}
    >
      {/* =================================================
          VIDEO
      ================================================= */}

      <video
        ref={videoRef}
        src={src}
        playsInline
        loop
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="
          absolute
          inset-0
          h-[100dvh]
          w-[100dvw]
          cursor-pointer
          md:cursor-none
        "
        onClick={togglePlayback}
      />

      {/* =================================================
          STRONG VIGNETTE
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
        "
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              transparent 10%,
              rgba(0,0,0,0.12) 35%,
              rgba(0,0,0,0.42) 68%,
              rgba(0,0,0,0.78) 100%
            )
          `,
        }}
      />

      {/* =================================================
          CUSTOM PLAY / PAUSE CURSOR
      ================================================= */}

      <div
        className={`
          pointer-events-none
          fixed
          z-[10000]
          flex
          flex-col
          items-center
          gap-2
          text-white
          mix-blend-difference
          transition-opacity
          duration-200
          ${cursorVisible ? "opacity-100" : "opacity-0"}
        `}
        style={{
          left: cursor.x,
          top: cursor.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border
            border-white/80
            bg-black/10
            backdrop-blur-sm
          "
        >
          {isPlaying ? (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M8 5v14" />
              <path d="M16 5v14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>

        {/* TEXT BELOW ICON */}

        <span
          className="
            whitespace-nowrap
            font-mono
            text-[8px]
            tracking-[0.28em]
            uppercase
            text-white/90
          "
        >
          {isPlaying ? "Pause" : "Play"}
        </span>
      </div>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <div
        className={`
          absolute
          bottom-0
          left-0
          right-0
          z-[10001]
          px-4
          sm:px-7
          pb-6
          sm:pb-6
          pt-16
          transition-opacity
          duration-300
          ${showControls ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
        onClick={(event) => event.stopPropagation()}
        onMouseMove={revealControls}
      >
        {/* =================================================
            PROGRESS
        ================================================= */}

        <input
          type="range"
          min="0"
          max="1000"
          step="1"
          value={duration ? Math.round((currentTime / duration) * 1000) : 0}
          style={
            {
              "--progress": `${duration ? (currentTime / duration) * 100 : 0}%`,
            } as React.CSSProperties
          }
          onChange={seekVideo}
          className="fullscreen-progress"
          aria-label="Video progress"
        />

        {/* =================================================
            CONTROL ROW
        ================================================= */}

        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3">
          {/* LEFT */}

          <div className="flex items-center gap-3 sm:gap-5">
            {/* PLAY */}

            <button
              type="button"
              onClick={togglePlayback}
              className="fullscreen-control"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M8 5v14" />
                  <path d="M16 5v14" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* VOLUME */}

            <button
              type="button"
              onClick={toggleMute}
              className="fullscreen-control"
              aria-label="Toggle sound"
            >
              {volume === 0 ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  <path d="M17 9l4 6" />
                  <path d="M21 9l-4 6" />
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

            {/* VOLUME SLIDER */}

            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={changeVolume}
              className="fullscreen-volume hidden sm:block"
              aria-label="Volume"
            />

            {/* TIME */}

            <span
              className="
                font-mono
                text-[8px]
                sm:text-[9px]
                tracking-[0.12em]
                sm:tracking-[0.15em]
                text-white/70
              "
            >
              {formatTime(currentTime)}
              {" / "}
              {formatTime(duration)}
            </span>
          </div>

          {/* =================================================
              CLOSE
          ================================================= */}

          <button
            type="button"
            onClick={close}
            className="
              font-mono
              text-[9px]
              tracking-[0.25em]
              uppercase
              text-white/70
              transition-colors
              hover:text-white
              px-2
              py-1
            "
          >
            Close
          </button>
        </div>
      </div>

      {/* =================================================
          STYLES
      ================================================= */}

      <style>{`
        .fullscreen-progress {
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

        .fullscreen-progress::-webkit-slider-runnable-track {
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

        .fullscreen-progress::-moz-range-track {
          height: 3px;
          background: #555;
          border-radius: 999px;
        }

        .fullscreen-progress::-moz-range-progress {
          height: 3px;
          background: #fff;
          border-radius: 999px;
        }

        .fullscreen-progress::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 8px;
          height: 8px;
          margin-top: -2.5px;
          border-radius: 50%;
          background: #fff;
          border: none;
          cursor: pointer;
        }

        .fullscreen-progress::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
          border: none;
          cursor: pointer;
        }

        .fullscreen-volume {
          width: 60px;
          height: 2px;
          appearance: none;
          -webkit-appearance: none;
          background: #555;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }

        .fullscreen-volume::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fff;
          border: none;
        }

        .fullscreen-volume::-moz-range-thumb {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fff;
          border: none;
        }

        .fullscreen-control {
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
          opacity: 0.8;
          transition:
            opacity 150ms ease,
            transform 150ms ease;
        }

        @media (min-width: 768px) {
          .fullscreen-progress,
          .fullscreen-progress::-webkit-slider-thumb,
          .fullscreen-progress::-moz-range-thumb,
          .fullscreen-volume,
          .fullscreen-control {
            cursor: none;
          }
        }

        .fullscreen-control:hover {
          opacity: 1;
          transform: scale(1.08);
        }

        .fullscreen-control svg {
          width: 18px;
          height: 18px;
          display: block;
        }
      `}</style>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);

  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${secs}`;
}
