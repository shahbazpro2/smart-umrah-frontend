import { useRef, useState } from "react";

export interface UseAudioPlaybackResult {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  play: (text: string, language?: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
}

export const useAudioPlayback = (): UseAudioPlaybackResult => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTextRef = useRef<string>("");

  const play = async (text: string, language: string = "en") => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear any existing timeout
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }

      currentTextRef.current = text;

      // Simulate TTS processing with a delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log(`[Audio] Playing text in ${language}:`, text);

      // Simulate audio playback duration based on text length
      // Average speaking rate: ~150 words per minute = ~2.5 words per second
      const wordCount = text.split(" ").length;
      const estimatedDuration = Math.max(1500, (wordCount / 2.5) * 1000);

      setIsPlaying(true);

      // Auto-stop after estimated duration
      playbackTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
        playbackTimeoutRef.current = null;
      }, estimatedDuration);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to play audio");
      setIsLoading(false);
    }
  };

  const stop = async () => {
    try {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
      setIsPlaying(false);
      currentTextRef.current = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop audio");
    }
  };

  const pause = async () => {
    try {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
      setIsPlaying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pause audio");
    }
  };

  const resume = async () => {
    try {
      if (currentTextRef.current && !isPlaying) {
        await play(currentTextRef.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume audio");
    }
  };

  return {
    isPlaying,
    isLoading,
    error,
    play,
    stop,
    pause,
    resume,
  };
};
