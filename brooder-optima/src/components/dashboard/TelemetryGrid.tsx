"use client";

import {
  Thermometer, Wind, Droplets, Cpu,
  TrendingUp, TrendingDown, Minus, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TelemetrySnapshot } from "@/hooks/useDashboard";

interface TelemetryGridProps {
  telemetry: TelemetrySnapshot;
  isOfflineMode: boolean;
  docDay: number;
}

type Status = "ok" | "warning" | "critical";

function StatusDot({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "h-2 w-2 rounded-full flex-shrink-0",
        status === "ok" && "bg-emerald-400",
        status === "warning" && "bg-amber-400 animate-pulse",
        status === "critical" && "bg-red-400 animate-pulse"
      )}
    />
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "ok") return <Badge variant="success"><StatusDot status="ok" />Normal</Badge>;
  if (status === "warning") return <Badge variant="warning"><StatusDot status="warning" />Warning</Badge>;
  return <Badge variant="destructive"><StatusDot status="critical" />Alert</Badge>;
}

function Delta({ value, target }: { value: number; target: number }) {
  const diff = value - target;
  const abs = Math.abs(diff).toFixed(1);
  if (Math.abs(diff) < 0.3)
    return <span className="flex items-center gap-0.5 text-zinc-500 text-xs"><Minus className="h-3 w-3" />On target</span>;
  if (diff > 0)
    return <span className="flex items-center gap-0.5 text-red-400 text-xs"><TrendingUp className="h-3 w-3" />+{abs}</span>;
  return <span className="flex items-center gap-0.5 text-sky-400 text-xs"><TrendingDown className="h-3 w-3" />-{abs}</span>;
}

// ─── MOBILE compact card ──────────────────────────────────────────────────────
function MobileMetricCard({
  title,
  icon: Icon,
  value,
  unit,
  subtext,
  status,
  accent,
}: {
  title: string;
  icon: React.ElementType;
  value: string;
  unit: string;
  subtext: string;
  status: Status;
  accent?: boolean;
}) {
  return (
    <Card className={cn("relative overflow-hidden", accent && status !== "ok" && "border-amber-800/50")}>
      <CardContent className="p-3.5 flex flex-col gap-2">
        {/* Top row: icon + title + dot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">{title}</span>
          </div>
          <StatusDot status={status} />
        </div>

        {/* Big number */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-zinc-50 tabular-nums leading-none">
            {value}
          </span>
          <span className="text-sm text-zinc-400 font-normal">{unit}</span>
        </div>

        {/* Subtext */}
        <p className="text-[11px] text-zinc-500 leading-tight truncate">{subtext}</p>
      </CardContent>
    </Card>
  );
}

export default function TelemetryGrid({ telemetry, isOfflineMode, docDay }: TelemetryGridProps) {
  const tempDiff = Math.abs(telemetry.temperature - telemetry.adaptiveTarget);
  const tempStatus: Status = tempDiff > 1.5 ? "critical" : tempDiff > 0.8 ? "warning" : "ok";
  const nh3Status: Status = telemetry.ammoniaPPM > 25 ? "critical" : telemetry.ammoniaPPM > 20 ? "warning" : "ok";
  const humStatus: Status =
    telemetry.humidity >= 60 && telemetry.humidity <= 70 ? "ok"
    : telemetry.humidity < 55 || telemetry.humidity > 75 ? "critical"
    : "warning";
  const edgeStatus: Status = isOfflineMode ? "warning" : "ok";

  // ─── MOBILE LAYOUT: 2×2 compact grid ─────────────────────────────────────
  const mobileCards = (
    <div className="grid grid-cols-2 gap-3 md:hidden">
      <MobileMetricCard
        title="Temp"
        icon={Thermometer}
        value={telemetry.temperature.toFixed(1)}
        unit="°C"
        subtext={`Target ${telemetry.adaptiveTarget.toFixed(1)}° · Heater ${telemetry.heaterActive ? "on" : "off"}`}
        status={tempStatus}
      />
      <MobileMetricCard
        title="Ammonia"
        icon={Wind}
        value={telemetry.ammoniaPPM.toFixed(0)}
        unit="PPM"
        subtext={`Limit 20 · Fan ${telemetry.fanPWM}%`}
        status={nh3Status}
      />
      <MobileMetricCard
        title="Humidity"
        icon={Droplets}
        value={telemetry.humidity.toFixed(0)}
        unit="%"
        subtext="Ideal range 60–70%"
        status={humStatus}
      />
      <MobileMetricCard
        title="Edge"
        icon={Cpu}
        value={isOfflineMode ? "Local" : `${telemetry.edgeLatencyMs}`}
        unit={isOfflineMode ? "" : "ms"}
        subtext={isOfflineMode ? `${telemetry.syncQueueCount} records queued` : `Buffer ${telemetry.flashUsedMB.toFixed(2)} MB`}
        status={edgeStatus}
        accent
      />
    </div>
  );

  // ─── DESKTOP LAYOUT: 4-column with full details ───────────────────────────
  const desktopCards = (
    <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Temperature */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-zinc-500" />
            Temperature
          </CardTitle>
          <StatusBadge status={tempStatus} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-zinc-50 tabular-nums">
            {telemetry.temperature.toFixed(1)}
            <span className="text-lg font-normal text-zinc-400 ml-1">°C</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Target: <span className="text-zinc-300">{telemetry.adaptiveTarget.toFixed(1)}°C</span>
              {" · "}
              <span className={`inline-flex items-center gap-1 ${telemetry.heaterActive ? "text-amber-400" : "text-zinc-500"}`}>
                <Zap className="h-3 w-3" />
                Heater {telemetry.heaterActive ? "Active" : "Off"}
              </span>
            </p>
            <Delta value={telemetry.temperature} target={telemetry.adaptiveTarget} />
          </div>
          <p className="text-[11px] text-zinc-600 mt-1">Day {docDay} adaptive profile</p>
        </CardContent>
      </Card>

      {/* Ammonia */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-zinc-500" />
            Ammonia Level
          </CardTitle>
          <StatusBadge status={nh3Status} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-zinc-50 tabular-nums">
            {telemetry.ammoniaPPM.toFixed(0)}
            <span className="text-lg font-normal text-zinc-400 ml-1">PPM</span>
          </div>
          <div className="mt-2">
            <p className="text-xs text-zinc-500">
              Threshold: <span className="text-zinc-300">&lt; 20 PPM</span>
              {" · "}
              <span className={telemetry.fanPWM > 50 ? "text-amber-400" : "text-zinc-400"}>
                Vent {telemetry.fanPWM}%
              </span>
            </p>
          </div>
          <p className="text-[11px] text-zinc-600 mt-1">Auto-ventilation on threshold breach</p>
        </CardContent>
      </Card>

      {/* Humidity */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-zinc-500" />
            Humidity
          </CardTitle>
          <StatusBadge status={humStatus} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-zinc-50 tabular-nums">
            {telemetry.humidity.toFixed(0)}
            <span className="text-lg font-normal text-zinc-400 ml-1">% RH</span>
          </div>
          <div className="mt-2">
            <p className="text-xs text-zinc-500">
              Ideal range: <span className="text-zinc-300">60 – 70%</span>
            </p>
          </div>
          <p className="text-[11px] text-zinc-600 mt-1">Capacitive relative humidity sensor</p>
        </CardContent>
      </Card>

      {/* Edge Node */}
      <Card className={isOfflineMode ? "border-amber-800/50" : ""}>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-zinc-500" />
            Edge Node
          </CardTitle>
          <StatusBadge status={edgeStatus} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-zinc-50 tabular-nums">
            {isOfflineMode ? (
              <span className="text-2xl">Local</span>
            ) : (
              <>{telemetry.edgeLatencyMs}<span className="text-lg font-normal text-zinc-400 ml-1">ms</span></>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs text-zinc-500">
              Latency: <span className="text-zinc-300">{telemetry.edgeLatencyMs}ms</span>
              {" · "}
              Buffer: <span className="text-zinc-300">{telemetry.flashUsedMB.toFixed(2)} MB</span>
            </p>
          </div>
          <p className="text-[11px] text-zinc-600 mt-1">
            {isOfflineMode ? `${telemetry.syncQueueCount} records queued for sync` : "MQTT stream active"}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      {mobileCards}
      {desktopCards}
    </>
  );
}
