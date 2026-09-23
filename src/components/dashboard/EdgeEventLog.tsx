"use client";

import { Terminal, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EdgeLogEntry } from "@/hooks/useDashboard";

interface EdgeEventLogProps {
  logs: EdgeLogEntry[];
}

const SEVERITY: Record<
  EdgeLogEntry["severity"],
  { icon: React.ElementType; variant: "secondary" | "success" | "warning" | "destructive"; label: string }
> = {
  info: { icon: Info, variant: "secondary", label: "Info" },
  success: { icon: CheckCircle, variant: "success", label: "OK" },
  warning: { icon: AlertTriangle, variant: "warning", label: "Warning" },
  critical: { icon: XCircle, variant: "destructive", label: "Critical" },
};

const SOURCE_COLOR: Record<EdgeLogEntry["source"], string> = {
  "Edge Node": "text-zinc-400",
  "Adaptive Logic": "text-violet-400",
  "Connectivity": "text-sky-400",
  "Ammonia Guard": "text-amber-400",
  "Thermal Control": "text-red-400",
};

export default function EdgeEventLog({ logs }: EdgeEventLogProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-zinc-500" />
            <CardTitle className="text-sm font-semibold text-zinc-100">System Event Log</CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>
        <CardDescription className="mt-0.5">
          {logs.length} events this session
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pt-0 px-3 sm:px-5">
        {/* Column headers — hidden on mobile for space */}
        <div className="hidden sm:grid grid-cols-[70px_1fr_72px] gap-3 px-2 pb-2 border-b border-zinc-800 text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
          <span>Time</span>
          <span>Event</span>
          <span className="text-right">Level</span>
        </div>

        {/* Log rows */}
        <div
          className="mt-1 flex flex-col overflow-y-auto max-h-[320px] sm:max-h-[280px]"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#3f3f46 transparent" }}
        >
          {logs.map((entry, idx) => {
            const cfg = SEVERITY[entry.severity] ?? SEVERITY.info;
            const Icon = cfg.icon;
            const isLatest = idx === 0;

            return (
              <div
                key={entry.id}
                className={`px-2 py-3 rounded-lg border transition-colors ${
                  isLatest
                    ? "bg-zinc-800/40 border-zinc-700/50"
                    : "border-transparent hover:bg-zinc-800/20"
                }`}
              >
                {/* Mobile: stacked layout */}
                <div className="flex items-start justify-between gap-2 sm:hidden">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[11px] font-semibold ${SOURCE_COLOR[entry.source]}`}>
                        {entry.source}
                      </span>
                      <span className="text-[10px] text-zinc-600 tabular-nums">{entry.timestamp}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{entry.event}</p>
                  </div>
                  <Badge variant={cfg.variant} className="text-[10px] px-1.5 gap-1 flex-shrink-0 mt-0.5">
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>

                {/* Desktop: grid layout */}
                <div className="hidden sm:grid grid-cols-[70px_1fr_72px] gap-3 items-start">
                  <span className="text-[11px] text-zinc-500 tabular-nums pt-0.5">{entry.timestamp}</span>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-medium mb-0.5 ${SOURCE_COLOR[entry.source]}`}>
                      {entry.source}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed break-words">{entry.event}</p>
                  </div>
                  <div className="flex justify-end items-start pt-0.5">
                    <Badge variant={cfg.variant} className="gap-1 text-[10px] px-1.5">
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
