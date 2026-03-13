"use client";

import { useRef, useState, useEffect } from "react";

interface PlayerProps {
  audioUrl: string;
  onEnded?: () => void;
  autoplay?: boolean;
  volume?: number;
  playbackRate?: number;
  onVolumeChange?: (volume: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
}

export function Player({
  audioUrl,
  onEnded,
  autoplay = false,
  volume: externalVolume,
  playbackRate: externalPlaybackRate,
  onVolumeChange,
  onPlaybackRateChange,
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Use controlled props if provided, otherwise use internal state
  const [internalVolume, setInternalVolume] = useState(1);
  const [internalPlaybackRate, setInternalPlaybackRate] = useState(1);

  const volume = externalVolume !== undefined ? externalVolume : internalVolume;
  const playbackRate = externalPlaybackRate !== undefined ? externalPlaybackRate : internalPlaybackRate;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  // Apply volume and playbackRate to audio element when they change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.playbackRate = playbackRate;
  }, [volume, playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (autoplay) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error("Autoplay failed:", error);
      });
    }
  }, [audioUrl, autoplay]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    } else {
      setInternalVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (onPlaybackRateChange) {
      onPlaybackRateChange(speed);
    } else {
      setInternalPlaybackRate(speed);
      if (audioRef.current) {
        audioRef.current.playbackRate = speed;
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="border border-zinc-200 bg-white p-3 sm:p-4 dark:border-white/10 dark:bg-zinc-900">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Progress Bar */}
      <div className="mb-3 sm:mb-4">
        <div className="relative py-2">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="absolute left-0 top-0 h-full bg-zinc-900 dark:bg-white"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="absolute left-0 top-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:dark:border-zinc-900 [&::-webkit-slider-thumb]:dark:bg-white [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-zinc-900 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:dark:border-zinc-900 [&::-moz-range-thumb]:dark:bg-white"
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-zinc-900 text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {isPlaying ? (
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex flex-1 items-center gap-2 sm:flex-initial">
            <svg
              className="h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="h-1 w-full cursor-pointer appearance-none bg-zinc-200 sm:w-24 dark:bg-zinc-700"
            />
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
            Speed:
          </span>
          <div className="flex flex-wrap gap-1">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  playbackRate === speed
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
