import { Bot, Code, Image, Search, Sparkles, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Bot, label: "محادثة ذكية", desc: "رد سريع وذكي", color: "from-blue-500 to-cyan-500" },
  { icon: Code, label: "كتابة كود", desc: "بكل اللغات", color: "from-green-500 to-emerald-500" },
  { icon: Image, label: "🎨 مولد صور", desc: "اكتب وصف → صورة", color: "from-purple-500 to-pink-500" },
  { icon: Search, label: "بحث متقدم", desc: "عبر الإنترنت", color: "from-orange-500 to-red-500" },
  { icon: Brain, label: "تحليل شخصيات", desc: "يفهمك ويساعدك", color: "from-indigo-500 to-violet-500" },
  { icon: Sparkles, label: "ذاكرة ذكية", desc: "يتذكر اهتماماتك", color: "from-yellow-500 to-amber-500" },
];

const WelcomeScreen = () => {
  const { displayName } = useAuth();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg shadow-primary/20"
        >
          <Bot className="w-10 h-10 text-white" />
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold">
            أهلاً {displayName}! 👋
          </h2>
          <p className="text-lg mt-1">
            <span className="text-primary font-bold">UXIN</span>{" "}
            <span className="text-accent">AI</span>
          </p>
          <p className="text-muted-foreground text-sm mt-2">مساعدك الذكي — اسأل أي شيء!</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {features.map(({ icon: Icon, label, desc, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-2"
        >
          <p className="text-xs text-muted-foreground">
            💡 جرب: "ارسم لي صورة فضاء" أو "اكتب كود Python" أو "حلل شخصيتي"
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
