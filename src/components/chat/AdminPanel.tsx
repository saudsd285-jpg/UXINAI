import { useState, useEffect } from "react";
import { X, Lock, MessageSquare, Brain, Users, RefreshCw, BarChart3, Power, Bell, Send } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

const ADMIN_PASSWORD = "135579";

const AdminPanel = ({ open, onClose }: AdminPanelProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [convMessages, setConvMessages] = useState<any[]>([]);
  const [customRules, setCustomRules] = useState<{ trigger: string; response: string }[]>(() => {
    const saved = localStorage.getItem("uxin-custom-rules");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTrigger, setNewTrigger] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [tab, setTab] = useState<"chats" | "rules" | "stats" | "controls">("chats");
  const [loading, setLoading] = useState(false);

  // Site controls
  const [siteShutdown, setSiteShutdown] = useState(false);
  const [shutdownTitle, setShutdownTitle] = useState("");
  const [shutdownMessage, setShutdownMessage] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifTextColor, setNotifTextColor] = useState("#ffffff");
  const [notifBgColor, setNotifBgColor] = useState("#3B82F6");

  if (!open) return null;

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
      loadAllConversations();
      loadSiteSettings();
    } else {
      setError("كلمة السر غير صحيحة");
    }
  };

  const loadSiteSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      data.forEach((s: any) => {
        if (s.setting_key === "site_shutdown") {
          setSiteShutdown(s.setting_value?.enabled || false);
          setShutdownTitle(s.setting_value?.title || "");
          setShutdownMessage(s.setting_value?.message || "");
        }
        if (s.setting_key === "notification") {
          setNotifEnabled(s.setting_value?.enabled || false);
          setNotifTitle(s.setting_value?.title || "");
          setNotifMessage(s.setting_value?.message || "");
          setNotifTextColor(s.setting_value?.textColor || "#ffffff");
          setNotifBgColor(s.setting_value?.bgColor || "#3B82F6");
        }
      });
    }
  };

  const updateSiteSetting = async (key: string, value: any) => {
    // Use edge function for admin updates
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ password: ADMIN_PASSWORD, action: "update_setting", key, value }),
    });
  };

  const handleToggleShutdown = async () => {
    const newVal = !siteShutdown;
    setSiteShutdown(newVal);
    await updateSiteSetting("site_shutdown", { enabled: newVal, title: shutdownTitle, message: shutdownMessage });
  };

  const handleSaveShutdown = async () => {
    await updateSiteSetting("site_shutdown", { enabled: siteShutdown, title: shutdownTitle, message: shutdownMessage });
  };

  const handleSaveNotification = async () => {
    await updateSiteSetting("notification", {
      enabled: notifEnabled,
      title: notifTitle,
      message: notifMessage,
      textColor: notifTextColor,
      bgColor: notifBgColor,
    });
  };

  const loadAllConversations = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-conversations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ password: ADMIN_PASSWORD, action: "list" }),
        }
      );
      const data = await resp.json();
      if (data.conversations) {
        setAllConversations(data.conversations);
        setUserMap(data.users || {});
      }
    } catch (e) {
      console.error("Failed to load admin conversations:", e);
    }
    setLoading(false);
  };

  const viewConversation = async (convId: string) => {
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-conversations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ password: ADMIN_PASSWORD, action: "messages", conversationId: convId }),
        }
      );
      const data = await resp.json();
      if (data.messages) { setConvMessages(data.messages); setSelectedConv(convId); }
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  };

  const addRule = () => {
    if (!newTrigger.trim() || !newResponse.trim()) return;
    const rules = [...customRules, { trigger: newTrigger.trim(), response: newResponse.trim() }];
    setCustomRules(rules);
    localStorage.setItem("uxin-custom-rules", JSON.stringify(rules));
    setNewTrigger(""); setNewResponse("");
  };

  const removeRule = (idx: number) => {
    const rules = customRules.filter((_, i) => i !== idx);
    setCustomRules(rules);
    localStorage.setItem("uxin-custom-rules", JSON.stringify(rules));
  };

  // Stats
  const todayConvs = allConversations.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length;
  const totalConvs = allConversations.length;
  const uniqueUsers = new Set(allConversations.map(c => c.user_id)).size;

  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" dir="rtl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-card rounded-2xl border border-border w-full max-w-sm mx-4 shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-semibold">لوحة المدير</h2></div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
          </div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="كلمة السر"
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground outline-none focus:border-primary mb-3" />
          {error && <p className="text-destructive text-xs mb-3">{error}</p>}
          <button onClick={handleLogin}
            className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors">دخول</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" dir="rtl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl border border-border w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
          <h2 className="text-lg font-semibold">🛡️ لوحة المدير</h2>
          <div className="flex items-center gap-2">
            <button onClick={loadAllConversations} className="p-1.5 rounded-lg hover:bg-secondary"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
            <button onClick={() => { onClose(); setAuthenticated(false); setPassword(""); }} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-3 sm:px-5 overflow-x-auto scrollbar-thin">
          {[
            { id: "stats" as const, icon: BarChart3, label: "إحصائيات" },
            { id: "chats" as const, icon: MessageSquare, label: "المحادثات" },
            { id: "controls" as const, icon: Power, label: "التحكم" },
            { id: "rules" as const, icon: Brain, label: "تعليم" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-5">
          {/* Stats Tab */}
          {tab === "stats" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <p className="text-2xl font-bold text-primary">{todayConvs}</p>
                  <p className="text-xs text-muted-foreground">محادثات اليوم</p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                  <p className="text-2xl font-bold text-accent">{totalConvs}</p>
                  <p className="text-xs text-muted-foreground">إجمالي المحادثات</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-2xl font-bold text-amber-500">{uniqueUsers}</p>
                  <p className="text-xs text-muted-foreground">مستخدمين</p>
                </div>
              </div>
              {/* Simple bar chart */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <h4 className="text-sm font-medium mb-3">آخر 7 أيام</h4>
                <div className="flex items-end gap-2 h-32">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const count = allConversations.filter(c => new Date(c.created_at).toDateString() === date.toDateString()).length;
                    const max = Math.max(...Array.from({ length: 7 }).map((_, j) => {
                      const d = new Date(); d.setDate(d.getDate() - (6 - j));
                      return allConversations.filter(c => new Date(c.created_at).toDateString() === d.toDateString()).length;
                    }), 1);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{count}</span>
                        <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height: `${(count / max) * 100}%`, minHeight: 4 }}>
                          <div className="absolute inset-0 bg-primary rounded-t-lg" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{date.toLocaleDateString("ar", { weekday: "short" })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Chats Tab */}
          {tab === "chats" && (
            <div>
              {selectedConv ? (
                <div>
                  <button onClick={() => setSelectedConv(null)} className="text-sm text-primary mb-4 hover:underline">← العودة</button>
                  <div className="space-y-3">
                    {convMessages.map((m) => (
                      <div key={m.id} className={`p-3 rounded-xl text-sm ${m.role === "user" ? "bg-primary/10 border border-primary/20" : "bg-secondary"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">{m.role === "user" ? "👤" : "🤖"}</span>
                          <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("ar")}</span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{m.content.slice(0, 500)}{m.content.length > 500 ? "..." : ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-2"><Users className="w-3 h-3 inline ml-1" />{totalConvs} محادثة</p>
                  {loading ? <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
                  : allConversations.length === 0 ? <p className="text-center text-muted-foreground py-8">لا توجد محادثات</p>
                  : allConversations.map((conv) => (
                    <div key={conv.id} onClick={() => viewConversation(conv.id)}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">👤 {userMap[conv.user_id] || conv.user_id.slice(0, 8)} • {new Date(conv.updated_at).toLocaleDateString("ar")}</p>
                      </div>
                      <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Controls Tab */}
          {tab === "controls" && (
            <div className="space-y-6">
              {/* Site Shutdown */}
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2"><Power className="w-4 h-4" /> إغلاق الموقع</h4>
                  <button onClick={handleToggleShutdown}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${siteShutdown ? "bg-green-600 text-white" : "bg-destructive text-white"}`}>
                    {siteShutdown ? "فتح الموقع" : "إغلاق الموقع"}
                  </button>
                </div>
                <input value={shutdownTitle} onChange={(e) => setShutdownTitle(e.target.value)} placeholder="عنوان الإغلاق"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none mb-2" />
                <input value={shutdownMessage} onChange={(e) => setShutdownMessage(e.target.value)} placeholder="رسالة الإغلاق"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none mb-2" />
                <button onClick={handleSaveShutdown} className="text-xs text-primary hover:underline">حفظ</button>
              </div>

              {/* Notifications */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                <h4 className="font-medium flex items-center gap-2 mb-3"><Bell className="w-4 h-4" /> إشعار عام</h4>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setNotifEnabled(!notifEnabled)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${notifEnabled ? "bg-green-600 text-white" : "bg-secondary text-muted-foreground"}`}>
                    {notifEnabled ? "مفعّل ✅" : "مُعطّل"}
                  </button>
                </div>
                <input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="عنوان الإشعار"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none mb-2" />
                <input value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} placeholder="رسالة الإشعار"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none mb-2" />
                <div className="flex gap-2 mb-2">
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    لون النص <input type="color" value={notifTextColor} onChange={(e) => setNotifTextColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    لون الخلفية <input type="color" value={notifBgColor} onChange={(e) => setNotifBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                  </label>
                </div>
                {/* Preview */}
                <div className="rounded-lg px-3 py-2 text-sm mb-2" style={{ color: notifTextColor, backgroundColor: `${notifBgColor}A6` }}>
                  {notifTitle && <span className="font-bold ml-1">{notifTitle}</span>}
                  {notifMessage || "معاينة الإشعار"}
                </div>
                <button onClick={handleSaveNotification}
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Send className="w-3 h-3" /> حفظ وإرسال
                </button>
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {tab === "rules" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">علّم الذكاء الاصطناعي ردود مخصصة</p>
              <div className="flex flex-col gap-2">
                <input value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} placeholder="لو قال المستخدم..."
                  className="px-3 py-2 rounded-xl bg-secondary border border-border text-sm outline-none focus:border-primary" />
                <input value={newResponse} onChange={(e) => setNewResponse(e.target.value)} placeholder="قول له..."
                  className="px-3 py-2 rounded-xl bg-secondary border border-border text-sm outline-none focus:border-primary" />
                <button onClick={addRule} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">إضافة قاعدة</button>
              </div>
              {customRules.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium">القواعد الحالية:</h4>
                  {customRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-secondary/50 text-sm">
                      <div className="flex-1">
                        <p><span className="text-primary font-medium">إذا:</span> {rule.trigger}</p>
                        <p><span className="text-primary font-medium">الرد:</span> {rule.response}</p>
                      </div>
                      <button onClick={() => removeRule(idx)} className="text-destructive hover:opacity-80 p-1"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
