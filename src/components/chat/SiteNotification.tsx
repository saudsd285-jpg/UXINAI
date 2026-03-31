import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getSiteSettings } from "@/lib/api";

const SiteNotification = () => {
  const [notification, setNotification] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getSiteSettings().then((settings) => {
      const notif = settings.notification;
      if (notif?.enabled && notif?.message) {
        setNotification(notif);
      }
    });
  }, []);

  if (!notification || dismissed) return null;

  return (
    <div
      className="relative px-4 py-3 text-center text-sm font-medium z-50"
      style={{
        color: notification.textColor || "#ffffff",
        backgroundColor: `${notification.bgColor || "#3B82F6"}A6`, // ~65% opacity
      }}
    >
      {notification.title && <span className="font-bold ml-2">{notification.title}</span>}
      {notification.message}
      <button
        onClick={() => setDismissed(true)}
        className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SiteNotification;
