import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  badge: {
    text: string;
    variant: "beta" | "available";
  };
  title: string;
  description: string;
}

export function FeatureCard({
  icon,
  badge,
  title,
  description,
}: FeatureCardProps) {
  const badgeStyles = {
    beta: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
    available: "bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:text-zinc-300",
  };

  return (
    <div className="group border border-zinc-200 bg-zinc-50 p-6 transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-950/50 dark:hover:border-white/20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center bg-zinc-200 dark:bg-white/5">
          {icon}
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium ${badgeStyles[badge.variant]}`}
        >
          {badge.text}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
