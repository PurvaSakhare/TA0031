import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebcamCaptureProps {
  onGestureDetected?: (text: string) => void;
  isActive: boolean;
}

const MOCK_GESTURES = [
  "Hello", "Thank you", "Yes", "No", "Please",
  "Help", "Good morning", "How are you?", "Nice to meet you", "Goodbye"
];

const WebcamCapture = ({ onGestureDetected, isActive }: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setCameraOn(true);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOn(false);
    setDetecting(false);
  }, [stream]);

  const toggleDetection = () => {
    if (!detecting) {
      setDetecting(true);
      // Mock gesture detection interval
      const interval = setInterval(() => {
        const gesture = MOCK_GESTURES[Math.floor(Math.random() * MOCK_GESTURES.length)];
        onGestureDetected?.(gesture);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setDetecting(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (detecting && cameraOn) {
      interval = setInterval(() => {
        const gesture = MOCK_GESTURES[Math.floor(Math.random() * MOCK_GESTURES.length)];
        onGestureDetected?.(gesture);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [detecting, cameraOn, onGestureDetected]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-foreground/5 border border-border">
        {cameraOn ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            {detecting && (
              <div className="absolute inset-0 border-2 border-primary/60 rounded-lg">
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary-foreground recording-pulse" />
                  Detecting Signs
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Camera className="h-12 w-12 opacity-40" />
            <p className="text-sm font-medium">Camera is off</p>
            <p className="text-xs opacity-70">Enable camera to start sign detection</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={cameraOn ? stopCamera : startCamera}
          variant={cameraOn ? "destructive" : "default"}
          className="flex-1"
          size="sm"
        >
          {cameraOn ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
          {cameraOn ? "Stop Camera" : "Start Camera"}
        </Button>
        {cameraOn && (
          <Button
            onClick={toggleDetection}
            variant={detecting ? "secondary" : "outline"}
            size="sm"
            className="flex-1"
          >
            <Hand className="mr-2 h-4 w-4" />
            {detecting ? "Stop Detection" : "Detect Signs"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
