import { useState } from "react";
import { Star, X } from "lucide-react";
import { motion } from "framer-motion";
import { submitRating } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
}

const RatingDialog = ({ open, onClose }: RatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, displayName } = useAuth();
  const { toast } = useToast();

  if (!open) return null;

  const handleSubmit = async () => {
    if (!rating || !user) return;
    setLoading(true);
    try {
      await submitRating(user.id, displayName, rating, comment);
      toast({ title: "شكراً لتقييمك! ⭐" });
      onClose();
    } catch {
      toast({ title: "خطأ", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl border border-border w-full max-w-sm mx-4 shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">⭐ قيّم تجربتك</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-sm text-muted-foreground">كيف كانت تجربتك مع UXIN AI؟</p>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  s <= (hover || rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تعليقك (اختياري)..."
          rows={3}
          className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-sm outline-none focus:border-primary resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={!rating || loading}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "جاري الإرسال..." : "إرسال التقييم"}
        </button>
      </motion.div>
    </div>
  );
};

export default RatingDialog;
