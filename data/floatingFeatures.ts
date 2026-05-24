import { Globe, ShieldCheck, Clock3 } from "lucide-react";
export const floatingFeatures = [
  {
    className: "absolute -top-5 -right-5 z-20 animate-float-slow",
    icon: Globe,
    title: "Anonymous",
    description: "Share without any identity.",
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    iconTone: "bg-emerald-500/10 text-emerald-500",
  },
  {
    className: "absolute -right-5 -bottom-10 z-20 animate-float-medium",
    icon: ShieldCheck,
    title: "No signup",
    description: "Zero friction, instant sharing.",
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    iconTone: "bg-emerald-500/10 text-emerald-500",
  },
  {
    className: "absolute -bottom-10 -left-5 z-20 animate-float-fast",
    icon: Clock3,
    title: "Auto-delete",
    description: "Expires automatically after 24h.",
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    iconTone: "bg-emerald-500/10 text-emerald-500",
  },
] as const;