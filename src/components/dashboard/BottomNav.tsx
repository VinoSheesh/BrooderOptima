"use client";

import { Activity, LineChart, SlidersHorizontal, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "telemetry", label: "Telemetry", icon: Activity, href: "#telemetry" },
  { id: "analytics", label: "Analytics", icon: LineChart, href: "#analytics" },
  { id: "controls", label: "Controls", icon: SlidersHorizontal, href: "#controls" },
  { id: "logs", label: "Logs", icon: Terminal, href: "#logs" },
] as const;

interface BottomNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function BottomNav({ activeSection, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 block md:hidden border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-md"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 h-16">
        {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
          const isActive = activeSection === id;
          return (
            <a
              key={id}
              href={href}
              onClick={() => onNavigate(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]",
                isActive
                  ? "text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 active:text-zinc-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-zinc-100" : "text-zinc-500"
                )}
              />
              <span className={cn("text-[11px] font-medium tracking-tight", isActive ? "text-zinc-100" : "text-zinc-500")}>
                {label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
