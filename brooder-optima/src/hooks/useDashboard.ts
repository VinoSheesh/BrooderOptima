"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export type EdgeLogEntry = {
  id: string;
  timestamp: string;
  source: "Edge Node" | "Adaptive Logic" | "Connectivity" | "Ammonia Guard" | "Thermal Control";
  event: string;
  severity: "info" | "warning" | "critical" | "success";
};

export type ChartPoint = {
  time: string;
  actualTemp: number;
  adaptiveTarget: number;
  ammonia: number;
  humidity: number;
};

export type TelemetrySnapshot = {
  temperature: number;
  humidity: number;
  ammoniaPPM: number;
  adaptiveTarget: number;
  heaterActive: boolean;
  fanPWM: number;
  edgeLatencyMs: number;
  flashUsedMB: number;
  syncQueueCount: number;
};

// DOC Age → adaptive target temp mapping
export const DOC_TEMP_MAP: Record<number, number> = {
  1: 33.0, 2: 33.0, 3: 32.5,
  4: 31.5, 5: 31.0, 6: 30.5, 7: 30.0,
  8: 29.5, 9: 29.0, 10: 28.5,
  11: 28.0, 12: 27.5, 13: 27.0, 14: 26.5,
};

function generate24hData(docDay: number): ChartPoint[] {
  const target = DOC_TEMP_MAP[docDay] ?? 30.0;
  const now = new Date();
  const points: ChartPoint[] = [];
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const label = t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const noise = () => (Math.random() - 0.5) * 0.6;
    const ammoniaBase = 18 + Math.sin(i * 0.4) * 6 + Math.random() * 3;
    points.push({
      time: label,
      actualTemp: parseFloat((target + noise() + (Math.random() > 0.85 ? -1.2 : 0)).toFixed(1)),
      adaptiveTarget: target,
      ammonia: parseFloat(Math.max(8, ammoniaBase).toFixed(1)),
      humidity: parseFloat((63 + (Math.random() - 0.5) * 10).toFixed(1)),
    });
  }
  return points;
}

function generateLifecycleData(): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (let day = 1; day <= 14; day++) {
    const target = DOC_TEMP_MAP[day] ?? 26.5;
    const noise = (Math.random() - 0.5) * 0.4;
    points.push({
      time: `Day ${day}`,
      actualTemp: parseFloat((target + noise).toFixed(1)),
      adaptiveTarget: target,
      ammonia: parseFloat((14 + Math.random() * 12).toFixed(1)),
      humidity: parseFloat((62 + (Math.random() - 0.5) * 8).toFixed(1)),
    });
  }
  return points;
}

const INITIAL_LOGS: EdgeLogEntry[] = [
  { id: "l1", timestamp: "10:14:02", source: "Ammonia Guard", event: "NH₃ exceeded 20 PPM → Increased Exhaust Fan to 60% PWM", severity: "warning" },
  { id: "l2", timestamp: "09:30:00", source: "Adaptive Logic", event: "DOC Age progressed to Day 3 → Reduced adaptive target to 32.5°C", severity: "success" },
  { id: "l3", timestamp: "08:12:44", source: "Connectivity", event: "Cloud disconnected → Switched to Offline-First Local Flash Buffer", severity: "warning" },
  { id: "l4", timestamp: "07:45:19", source: "Thermal Control", event: "Temp dropped to 31.1°C (below target 32.5°C) → Heater Relay ACTIVATED", severity: "info" },
  { id: "l5", timestamp: "07:02:33", source: "Edge Node", event: "Flash buffer flushed → 87 records synced to Cloud via MQTT", severity: "success" },
  { id: "l6", timestamp: "06:15:00", source: "Adaptive Logic", event: "Batch #124 started → DOC Day 1 profile loaded (Target: 33.0°C)", severity: "info" },
];

const NEW_LOG_POOL: Omit<EdgeLogEntry, "id" | "timestamp">[] = [
  { source: "Edge Node", event: "Heartbeat OK → All sensors nominal", severity: "info" },
  { source: "Ammonia Guard", event: "NH₃ at 19 PPM → Fan speed maintained at 60% PWM", severity: "warning" },
  { source: "Thermal Control", event: "Temp stabilized at 32.4°C → Heater duty cycle reduced", severity: "success" },
  { source: "Connectivity", event: "MQTT reconnect attempt 1/3 → Buffering locally", severity: "warning" },
  { source: "Edge Node", event: "Local flash buffer: 0.21 MB used (0.7% capacity)", severity: "info" },
  { source: "Adaptive Logic", event: "Microclimate variance within ±0.3°C tolerance band", severity: "success" },
  { source: "Ammonia Guard", event: "NH₃ spiked to 26 PPM → Emergency fan boost to 80% PWM", severity: "critical" },
  { source: "Thermal Control", event: "Heater relay cycle: ON 45s / OFF 120s (PID stable)", severity: "info" },
];

function nowTimestamp() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function useDashboard() {
  const DOC_DAY = 3;
  const BATCH_ID = "124";
  const adaptiveTarget = DOC_TEMP_MAP[DOC_DAY];

  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [heaterActive, setHeaterActive] = useState(true);
  const [fanPWM, setFanPWM] = useState(60);
  const [mistingActive, setMistingActive] = useState(false);
  const [chartTab, setChartTab] = useState<"24h" | "lifecycle" | "realtime">("24h");

  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>({
    temperature: 32.1,
    humidity: 68,
    ammoniaPPM: 24,
    adaptiveTarget,
    heaterActive: true,
    fanPWM: 60,
    edgeLatencyMs: 12,
    flashUsedMB: 0.21,
    syncQueueCount: 0,
  });

  const [chartData24h] = useState<ChartPoint[]>(() => generate24hData(DOC_DAY));
  const [chartDataLifecycle] = useState<ChartPoint[]>(() => generateLifecycleData());
  const [realtimeBuffer, setRealtimeBuffer] = useState<ChartPoint[]>(() => generate24hData(DOC_DAY).slice(-12));

  const [eventLogs, setEventLogs] = useState<EdgeLogEntry[]>(INITIAL_LOGS);
  const logPoolIdx = useRef(0);
  const syncBuffer = useRef(0);
  const isOfflineModeRef = useRef(isOfflineMode);
  const isManualOverrideRef = useRef(isManualOverride);
  const fanPWMRef = useRef(fanPWM);
  const heaterActiveRef = useRef(heaterActive);

  useEffect(() => { isOfflineModeRef.current = isOfflineMode; }, [isOfflineMode]);
  useEffect(() => { isManualOverrideRef.current = isManualOverride; }, [isManualOverride]);
  useEffect(() => { fanPWMRef.current = fanPWM; }, [fanPWM]);
  useEffect(() => { heaterActiveRef.current = heaterActive; }, [heaterActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      const offline = isOfflineModeRef.current;
      const manual = isManualOverrideRef.current;
      if (offline) syncBuffer.current += 1;
      setTelemetry((prev) => {
        const noise = (range: number) => (Math.random() - 0.5) * range;
        const newNH3 = parseFloat(Math.max(8, Math.min(40, prev.ammoniaPPM + noise(3))).toFixed(1));
        const autoFan = newNH3 > 25 ? 80 : newNH3 > 20 ? 60 : 35;
        const newTemp = parseFloat(Math.max(28, Math.min(36, prev.temperature + noise(0.5))).toFixed(1));
        const autoHeater = newTemp < adaptiveTarget;
        return {
          ...prev,
          temperature: newTemp,
          humidity: parseFloat(Math.max(50, Math.min(85, prev.humidity + noise(2))).toFixed(1)),
          ammoniaPPM: newNH3,
          fanPWM: manual ? fanPWMRef.current : autoFan,
          heaterActive: manual ? heaterActiveRef.current : autoHeater,
          edgeLatencyMs: offline ? 3 : Math.round(8 + Math.random() * 20),
          flashUsedMB: parseFloat((0.18 + syncBuffer.current * 0.0012).toFixed(2)),
          syncQueueCount: offline ? syncBuffer.current : 0,
        };
      });
      setRealtimeBuffer((prev) => {
        const now = nowTimestamp();
        const newPoint: ChartPoint = {
          time: now,
          actualTemp: parseFloat((adaptiveTarget + (Math.random() - 0.5) * 1.2).toFixed(1)),
          adaptiveTarget,
          ammonia: parseFloat((18 + Math.random() * 10).toFixed(1)),
          humidity: parseFloat((63 + (Math.random() - 0.5) * 8).toFixed(1)),
        };
        return [...prev.slice(-29), newPoint];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [adaptiveTarget]);

  useEffect(() => {
    const interval = setInterval(() => {
      const template = NEW_LOG_POOL[logPoolIdx.current % NEW_LOG_POOL.length];
      logPoolIdx.current++;
      const newEntry: EdgeLogEntry = { id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, timestamp: nowTimestamp(), ...template };
      setEventLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleOfflineMode = useCallback(() => {
    setIsOfflineMode((prev) => {
      const next = !prev;
      const entry: EdgeLogEntry = {
        id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: nowTimestamp(),
        source: "Connectivity",
        event: next
          ? "Internet link interrupted → Edge node executing local autonomous control loop"
          : "Internet link restored → MQTT connection re-established, flushing offline buffer",
        severity: next ? "warning" : "success",
      };
      setEventLogs((logs) => [entry, ...logs.slice(0, 49)]);
      if (!next) syncBuffer.current = 0;
      return next;
    });
  }, []);

  const chartData = chartTab === "24h" ? chartData24h : chartTab === "lifecycle" ? chartDataLifecycle : realtimeBuffer;

  return {
    DOC_DAY, BATCH_ID, adaptiveTarget,
    isOfflineMode, toggleOfflineMode,
    isManualOverride, setIsManualOverride,
    heaterActive, setHeaterActive,
    fanPWM, setFanPWM,
    mistingActive, setMistingActive,
    telemetry, chartData, chartTab, setChartTab,
    eventLogs,
  };
}
