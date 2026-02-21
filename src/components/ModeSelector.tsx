import { Hand, Mic } from "lucide-react";

type Mode = "deaf" | "hearing" | null;

interface ModeSelectorProps {
  mode: Mode;
  onSelectMode: (mode: Mode) => void;
}

const ModeSelector = ({ mode, onSelectMode }: ModeSelectorProps) => {
  if (mode) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center slide-up">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Sign<span className="text-primary">Bridge</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-md">
          Breaking communication barriers with AI-powered sign language translation
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg slide-up" style={{ animationDelay: "0.1s" }}>
        <button
          onClick={() => onSelectMode("deaf")}
          className="group flex-1 flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-card p-8 transition-all hover:border-deaf-accent hover:shadow-xl hover:-translate-y-1"
          aria-label="I use sign language"
        >
          <div className="rounded-2xl bg-deaf-surface p-5 transition-colors group-hover:bg-deaf-accent/20">
            <Hand className="h-10 w-10 text-deaf-accent" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-lg font-semibold">I Sign</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use camera to translate signs to text & speech
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelectMode("hearing")}
          className="group flex-1 flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-card p-8 transition-all hover:border-hearing-accent hover:shadow-xl hover:-translate-y-1"
          aria-label="I speak"
        >
          <div className="rounded-2xl bg-hearing-surface p-5 transition-colors group-hover:bg-hearing-accent/20">
            <Mic className="h-10 w-10 text-hearing-accent" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-lg font-semibold">I Speak</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use microphone to convert speech to text for signing
            </p>
          </div>
        </button>
      </div>

      <p className="text-xs text-muted-foreground/60 slide-up" style={{ animationDelay: "0.2s" }}>
        No account needed · Works in your browser · WCAG accessible
      </p>
    </div>
  );
};

export default ModeSelector;
