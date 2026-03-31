import { Rocket } from "lucide-react";

interface SiteShutdownProps {
  message: string;
  title: string;
}

const SiteShutdown = ({ message, title }: SiteShutdownProps) => {
  return (
    <div className="h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <Rocket className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">{title || "الموقع مغلق مؤقتاً"}</h1>
        <p className="text-muted-foreground">{message || "الموقع تحت الصيانة، يرجى المحاولة لاحقاً"}</p>
        <p className="text-xs text-muted-foreground/60">UXIN AI</p>
      </div>
    </div>
  );
};

export default SiteShutdown;
