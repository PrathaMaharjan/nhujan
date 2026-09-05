"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import ShowreelPlayer from "./ShowreelPlayer";

interface FullscreenVideoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FullscreenVideo({
  isOpen,
  onClose,
}: FullscreenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const nextVolume = video.volume > 0 ? 0 : 1;
    video.volume = nextVolume;
    setVolume(nextVolume);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isOpen) return;

    video.currentTime = 0;
    void video.play().catch(() => setIsPlaying(false));
  }, [isOpen]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.dataset.fullscreen = "true";

    return () => {
      delete document.body.dataset.fullscreen;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "m") toggleMute();
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, toggleMute, togglePlayback]);

  if (!isOpen) return null;

  const seekVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    video.currentTime = Number(event.target.value);
    setCurrentTime(video.currentTime);
  };

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (videoRef.current) videoRef.current.volume = nextVolume;
  };

  return (
    <div className="fixed inset-0 z-[9999] h-[100dvh] w-[100dvw] overflow-hidden bg-black">
      <ShowreelPlayer
        ref={videoRef}
        controls={false}
        autoPlay
        loop
        muted={volume === 0}
        playsInline
        onClick={togglePlayback}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="absolute inset-0 h-full w-full cursor-pointer object-contain"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(0,0,0,0.12)_40%,rgba(0,0,0,0.65)_100%)]" />

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-16 sm:px-7">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={seekVideo}
          className="fullscreen-progress"
          aria-label="Video progress"
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={togglePlayback}
              className="fullscreen-control"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="fullscreen-control"
              aria-label={volume === 0 ? "Unmute video" : "Mute video"}
              title={volume === 0 ? "Unmute video" : "Mute video"}
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={changeVolume}
              className="fullscreen-volume hidden sm:block"
              aria-label="Volume"
            />

            <span className="font-mono text-[9px] tracking-[0.12em] text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-mono px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
            aria-label="Minimize video"
            title="Minimize video"
          >
            <Minimize2 size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .fullscreen-progress,
        .fullscreen-volume {
          appearance: none;
          -webkit-appearance: none;
          outline: none;
          cursor: pointer;
        }

        .fullscreen-progress {
          display: block;
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.35);
        }

        .fullscreen-volume {
          width: 60px;
          height: 2px;
          background: rgba(255, 255, 255, 0.4);
        }

        .fullscreen-progress::-webkit-slider-thumb,
        .fullscreen-volume::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 8px;
          height: 8px;
          border: 0;
          border-radius: 50%;
          background: white;
        }

        .fullscreen-progress::-moz-range-thumb,
        .fullscreen-volume::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border: 0;
          border-radius: 50%;
          background: white;
        }

        .fullscreen-control {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font: 9px monospace;
          letter-spacing: 0.15em;
          cursor: pointer;
        }

        .fullscreen-control:hover {
          color: white;
        }
      `}</style>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}
