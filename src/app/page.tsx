"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import Header from "@/components/dashboard/Header";
import TelemetryGrid from "@/components/dashboard/TelemetryGrid";
import MicroclimateChart from "@/components/dashboard/MicroclimateChart";
import ControlCenter from "@/components/dashboard/ControlCenter";
import EdgeEventLog from "@/components/dashboard/EdgeEventLog";
import BottomNav from "@/components/dashboard/BottomNav";
import { AlertTriangle } from "lucide-react";

// ─── Scroll-spy hook ─────────────────────────────────────────────────────────
const SECTIONS = ["telemetry", "analytics", "controls", "logs"] as const;
type Section = (typeof SECTIONS)[number];

function useScrollSpy(): [Section, (id: string) => void] {
  const [active, setActive] = useState<Section>("telemetry");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as Section;
            if ((SECTIONS as readonly string[]).includes(id)) {
              setActive(id);
            }
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return [active, (id: string) => setActive(id as Section)];
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const dash = useDashboard();
  const [activeSection, onNavigate] = useScrollSpy();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        isOfflineMode={dash.isOfflineMode}
        toggleOfflineMode={dash.toggleOfflineMode}
        docDay={dash.DOC_DAY}
        batchId={dash.BATCH_ID}
        syncQueueCount={dash.telemetry.syncQueueCount}
      />

      {/* pb-20 on mobile so content clears the fixed bottom nav */}
      <main className="px-3 sm:px-4 md:px-6 py-4 md:py-6 max-w-[1600px] mx-auto flex flex-col gap-4 md:gap-6 pb-20 md:pb-6">

        {/* Offline Banner */}
        {dash.isOfflineMode && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-800/50 bg-amber-900/10 px-3 py-3 text-sm animate-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-medium text-amber-300">Offline Mode Active</span>
              <span className="text-amber-400/70 ml-2 text-xs">
                · {dash.telemetry.syncQueueCount} records buffered
              </span>
            </div>
          </div>
        )}

        {/* ── 1: Live Telemetry ──────────────────────────────────────── */}
        <section id="telemetry">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-zinc-100">Live Telemetry</h2>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-500">Updates every 3s</span>
          </div>
          <TelemetryGrid
            telemetry={dash.telemetry}
            isOfflineMode={dash.isOfflineMode}
            docDay={dash.DOC_DAY}
          />
        </section>

        {/* ── 2: Analytics ───────────────────────────────────────────── */}
        <section id="analytics">
          <MicroclimateChart
            data={dash.chartData}
            chartTab={dash.chartTab}
            setChartTab={dash.setChartTab}
            adaptiveTarget={dash.adaptiveTarget}
          />
        </section>

        {/* ── 3: Controls + 4: Logs ──────────────────────────────────── */}
        <section id="controls" className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 md:gap-6">
          <ControlCenter
            isManualOverride={dash.isManualOverride}
            setIsManualOverride={dash.setIsManualOverride}
            heaterActive={dash.telemetry.heaterActive}
            setHeaterActive={dash.setHeaterActive}
            fanPWM={dash.telemetry.fanPWM}
            setFanPWM={dash.setFanPWM}
            mistingActive={dash.mistingActive}
            setMistingActive={dash.setMistingActive}
            adaptiveTarget={dash.adaptiveTarget}
            docDay={dash.DOC_DAY}
          />
          <div id="logs">
            <EdgeEventLog logs={dash.eventLogs} />
          </div>
        </section>

        <footer className="hidden md:block text-center text-xs text-zinc-600 py-4 border-t border-zinc-800/50">
          BrooderOptima · IoT Poultry Brooder Monitoring · Edge Node v2.0 · © 2026
        </footer>
      </main>

      {/* Mobile-only bottom nav */}
      <BottomNav activeSection={activeSection} onNavigate={onNavigate} />
    </div>
  );
}
