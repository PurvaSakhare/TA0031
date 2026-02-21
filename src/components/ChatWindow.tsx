import { useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "deaf" | "hearing";
  timestamp: Date;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  onSpeak?: (text: string) => void;
}

const ChatWindow = ({ messages, onSpeak }: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="rounded-full bg-muted p-4">
          <Volume2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
        <p className="text-xs text-muted-foreground/70">
          Start signing or speaking to begin the conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto h-full">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`fade-in flex ${msg.sender === "deaf" ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`group relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.sender === "deaf"
                ? "bg-deaf-surface text-foreground rounded-bl-sm"
                : "bg-hearing-surface text-foreground rounded-br-sm"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                msg.sender === "deaf" ? "text-deaf-accent" : "text-hearing-accent"
              }`}>
                {msg.sender === "deaf" ? "Sign → Text" : "Speech → Text"}
              </span>
            </div>
            <p className="leading-relaxed">{msg.text}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {msg.sender === "deaf" && onSpeak && (
                <button
                  onClick={() => onSpeak(msg.text)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-accent"
                  aria-label="Read aloud"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
