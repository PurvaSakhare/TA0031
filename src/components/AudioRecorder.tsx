import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onTranscription?: (text: string) => void;
  isActive: boolean;
}

const MOCK_TRANSCRIPTIONS = [
  "Hello, how are you today?",
  "Nice to meet you!",
  "Can you help me with something?",
  "Thank you so much!",
  "Let's meet tomorrow.",
  "That sounds great!",
];

const AudioRecorder = ({ onTranscription, isActive }: AudioRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);

      // Visualize audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Mock transcription every few seconds
      const interval = setInterval(() => {
        const text = MOCK_TRANSCRIPTIONS[Math.floor(Math.random() * MOCK_TRANSCRIPTIONS.length)];
        onTranscription?.(text);
      }, 4000);

      mediaRecorder.onstop = () => {
        clearInterval(interval);
        stream.getTracks().forEach((t) => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(0);
        audioContext.close();
      };
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, [onTranscription]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Audio level visualizer */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {recording && (
          <>
            <div
              className="absolute inset-0 rounded-full bg-accent/20 pulse-ring"
              style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
            />
            <div
              className="absolute inset-2 rounded-full bg-accent/30"
              style={{ transform: `scale(${1 + audioLevel * 0.3})` }}
            />
          </>
        )}
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 ${
            recording
              ? "bg-destructive text-destructive-foreground shadow-lg"
              : "bg-accent text-accent-foreground hover:shadow-lg hover:scale-105"
          }`}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        {recording ? (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-destructive recording-pulse" />
            Listening...
          </span>
        ) : (
          "Tap to start listening"
        )}
      </p>

      {/* Audio level bars */}
      {recording && (
        <div className="flex items-end gap-1 h-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-accent/70 transition-all duration-75"
              style={{
                height: `${Math.max(4, Math.random() * audioLevel * 32)}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
