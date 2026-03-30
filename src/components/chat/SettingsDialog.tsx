import { useTheme } from "@/contexts/ThemeContext";
import { X, Sun, Moon } from "lucide-react";
import { AI_MODELS, getAiModel, setAiModel } from "@/lib/api";
import { useState } from "react";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const dialects = [
  { id: "default", label: "سعودي عام" },
  { id: "qassimi", label: "قصيمي" },
  { id: "makkawi", label: "مكاوي" },
  { id: "jeddawi", label: "جداوي" },
  { id: "jizani", label: "جيزاني" },
];

const providerLabels: Record<string, string> = {
  lovable: "🤖 Lovable AI",
  openai: "🔑 OpenAI",
  google: "🌐 Google AI",
};

export function getDialect(): string {
  return localStorage.getItem("uxin-dialect") || "default";
}
export function setDialectStorage(d: string) {
  localStorage.setItem("uxin-dialect", d);
}
export function getEmotion(): string {
  return localStorage.getItem("uxin-emotion") || "friendly";
}
export function setEmotionStorage(e: string) {
  localStorage.setItem("uxin-emotion", e);
}

const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
  const { theme, toggleTheme } = useTheme();
  const [selectedModel, setSelectedModel] = useState(getAiModel());
  const [dialect, setDialect] = useState(getDialect());

  if (!open) return null;

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setAiModel(modelId);
  };

  const grouped = AI_MODELS.reduce((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {} as Record<string, typeof AI_MODELS>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md mx-4 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold">الإعدادات</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Theme toggle - Sun/Moon */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">🎨 المظهر</h3>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-border hover:border-primary/30 bg-secondary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-sm font-medium">
                  {theme === "dark" ? "الوضع الليلي 🌙" : "الوضع النهاري ☀️"}
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${theme === "dark" ? "bg-primary" : "bg-amber-400"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === "dark" ? "right-0.5" : "left-0.5"}`} />
              </div>
            </button>
          </div>

          {/* Dialect */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">🗣️ اللهجة</h3>
            <div className="grid grid-cols-2 gap-2">
              {dialects.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setDialect(d.id); setDialectStorage(d.id); }}
                  className={`px-3 py-2.5 rounded-xl border transition-all text-sm ${
                    dialect === d.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">🧠 نموذج الذكاء الاصطناعي</h3>
            <div className="space-y-3">
              {Object.entries(grouped).map(([provider, models]) => (
                <div key={provider}>
                  <p className="text-xs text-muted-foreground mb-1.5">{providerLabels[provider]}</p>
                  <div className="space-y-1">
                    {models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleModelChange(m.id)}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm text-right ${
                          selectedModel === m.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedModel === m.id ? "bg-primary" : "bg-muted"}`} />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Robot info */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🤖</span>
              <span className="font-medium text-sm">UXIN AI</span>
            </div>
            <p className="text-xs text-muted-foreground">
              مساعدك الذكي المطور بواسطة سعود سعد الهذلي. يتكلم باللهجة السعودية ويساعدك في كل شيء!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
