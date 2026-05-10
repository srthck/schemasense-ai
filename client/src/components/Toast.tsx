import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastProps = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-indigo-600",
    warning: "bg-amber-600",
  }[type];

  return (
    <div
      className={`fixed bottom-6 right-6 ${bgColor} text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-4 transition-all duration-300 ease-out z-50 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} 
        className="opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
