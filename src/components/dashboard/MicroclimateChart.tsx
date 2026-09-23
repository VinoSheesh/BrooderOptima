"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChartPoint } from "@/hooks/useDashboard";

interface MicroclimateChartProps {
  data: ChartPoint[];
  chartTab: "24h" | "lifecycle" | "realtime";
  setChartTab: (tab: "24h" | "lifecycle" | "realtime") => void;
  adaptiveTarget: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-sm text-xs min-w-[150px]">
      <p className="text-zinc-400 font-medium mb-2 pb-2 border-b border-zinc-800">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-zinc-400">{entry.name}</span>
          </div>
          <span className="text-zinc-100 font-semibold tabular-nums">
            {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}{entry.unit ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MicroclimateChart({
  data,
  chartTab,
  setChartTab,
  adaptiveTarget,
}: MicroclimateChartProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        {/* Title row — stacks on mobile, side-by-side on sm+ */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-zinc-100">Microclimate Trends</CardTitle>
            <CardDescription className="mt-0.5 text-[13px]">
              Temperature and ammonia readings over time
            </CardDescription>
          </div>

          {/* Tabs — full width on mobile */}
          <Tabs
            value={chartTab}
            onValueChange={(v) => setChartTab(v as "24h" | "lifecycle" | "realtime")}
            className="self-start sm:self-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="24h" className="px-3 text-xs h-7">24H</TabsTrigger>
              <TabsTrigger value="lifecycle" className="px-3 text-xs h-7">Cycle</TabsTrigger>
              <TabsTrigger value="realtime" className="px-3 text-xs h-7 flex items-center gap-1.5">
                Live
                {chartTab === "realtime" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="h-px w-4 bg-indigo-400" />
            <span className="text-[11px] text-zinc-500">Actual Temp</span>
          </div>
          {/* Hide target line legend on mobile to reduce clutter */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="h-px w-4 border-t border-dashed border-zinc-500" />
            <span className="text-[11px] text-zinc-500">Target Temp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-px w-4 bg-amber-400" />
            <span className="text-[11px] text-zinc-500">Ammonia</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-5 px-3 sm:px-5">
        {/* Mobile: 220px, Desktop: 256px */}
        <div className="h-[220px] sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#71717a" }}
                tickLine={false}
                axisLine={{ stroke: "#3f3f46" }}
                interval={chartTab === "24h" ? 4 : chartTab === "realtime" ? 5 : 1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#71717a" }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                width={32}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#52525b", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <ReferenceLine
                y={adaptiveTarget}
                stroke="#818cf8"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{ value: `${adaptiveTarget}°C`, fill: "#818cf8", fontSize: 9, position: "insideTopRight" }}
              />
              <ReferenceLine
                y={20}
                stroke="#f59e0b"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{ value: "20 PPM", fill: "#d97706", fontSize: 9, position: "insideBottomRight" }}
              />

              {/* Actual Temp — always visible */}
              <Line
                type="monotone"
                dataKey="actualTemp"
                name="Actual Temp"
                stroke="#818cf8"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }}
                unit="°C"
              />

              {/* Adaptive Target — hidden on mobile via strokeOpacity trick isn't possible in recharts,
                  but we reduce visual noise by thinning it: desktop = 1.25 strokeWidth */}
              <Line
                type="monotone"
                dataKey="adaptiveTarget"
                name="Target Temp"
                stroke="#52525b"
                strokeWidth={1}
                strokeDasharray="5 3"
                dot={false}
                unit="°C"
              />

              {/* Ammonia — always visible */}
              <Line
                type="monotone"
                dataKey="ammonia"
                name="Ammonia"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                unit=" PPM"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
