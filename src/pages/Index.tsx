import { useState } from "react";
import ModeSelector from "@/components/ModeSelector";
import CommunicationHub from "@/components/CommunicationHub";

type Mode = "deaf" | "hearing" | null;

const Index = () => {
  const [mode, setMode] = useState<Mode>(null);

  if (mode) {
    return <CommunicationHub mode={mode} onBack={() => setMode(null)} />;
  }

  return <ModeSelector mode={mode} onSelectMode={setMode} />;
};

export default Index;
