"use client";

import { useState } from "react";
import { Activity, Menu, Wifi, WifiOff, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

interface HeaderProps {
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  docDay: number;
  batchId: string;
  syncQueueCount: number;
}

export default function Header({
  isOfflineMode,
  toggleOfflineMode,
  docDay,
  batchId,
  syncQueueCount,
}: HeaderProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const broodingPhase = docDay <= 7 ? "Brooding Phase" : docDay <= 14 ? "Grow-Out Phase" : "Pre-Harvest";

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">

        {/* ── Brand ── */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-zinc-100 tracking-tight">BrooderOptima</span>
          {/* Live dot — mobile only */}
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse md:hidden" />
        </div>

        {/* ── DESKTOP right side ── */}
        <div className="hidden md:flex items-center gap-3">
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-sm text-zinc-500">Batch #{batchId}</span>
          <Badge variant="outline">Day {docDay} · {broodingPhase}</Badge>
          <div className="h-4 w-px bg-zinc-800" />

          {isOfflineMode ? (
            <Badge variant="warning">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Offline — {syncQueueCount} buffered
            </Badge>
          ) : (
            <Badge variant="secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Connected
            </Badge>
          )}

          <Button variant="outline" size="sm" onClick={toggleOfflineMode}>
            {isOfflineMode ? (
              <><Wifi className="h-3.5 w-3.5" /> Restore Connection</>
            ) : (
              <><WifiOff className="h-3.5 w-3.5" /> Simulate Offline</>
            )}
          </Button>
        </div>

        {/* ── MOBILE right side: compact status + hamburger ── */}
        <div className="flex md:hidden items-center gap-2">
          {/* Compact status chip */}
          {isOfflineMode ? (
            <Badge variant="warning" className="text-[11px] px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Offline
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
              Day {docDay}
            </Badge>
          )}

          {/* Hamburger / Sheet trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <button
              onClick={() => setSheetOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>

            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <SheetHeader>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <SheetTitle>BrooderOptima</SheetTitle>
                </div>
                <SheetDescription>
                  Batch #{batchId} · Day {docDay} · {broodingPhase}
                </SheetDescription>
              </SheetHeader>

              {/* Sheet body */}
              <div className="px-6 pb-6 flex flex-col gap-4">
                {/* Connection status */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Connection</p>
                  {isOfflineMode ? (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-sm font-medium text-amber-300">Offline Mode</span>
                      {syncQueueCount > 0 && (
                        <Badge variant="warning" className="ml-auto text-[10px]">
                          {syncQueueCount} queued
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-medium text-emerald-300">Connected</span>
                    </div>
                  )}
                  <SheetClose asChild>
                    <Button
                      variant={isOfflineMode ? "outline" : "outline"}
                      className="w-full h-11"
                      onClick={toggleOfflineMode}
                    >
                      {isOfflineMode ? (
                        <><Wifi className="h-4 w-4" /> Restore Connection</>
                      ) : (
                        <><WifiOff className="h-4 w-4" /> Simulate Offline</>
                      )}
                    </Button>
                  </SheetClose>
                </div>

                {/* Batch info */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">Batch Info</p>
                  <div className="flex flex-col gap-2.5">
                    <InfoRow label="Batch ID" value={`#${batchId}`} />
                    <InfoRow label="DOC Day" value={`Day ${docDay}`} />
                    <InfoRow label="Phase" value={broodingPhase} />
                  </div>
                </div>

                {/* Quick nav links */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  <p className="text-xs font-medium text-zinc-400 px-4 pt-4 pb-2 uppercase tracking-wider">Navigate</p>
                  {[
                    { label: "Live Telemetry", href: "#telemetry" },
                    { label: "Analytics", href: "#analytics" },
                    { label: "Controls", href: "#controls" },
                    { label: "Event Log", href: "#logs" },
                  ].map((item) => (
                    <SheetClose key={item.label} asChild>
                      <a
                        href={item.href}
                        className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/60 first:border-t-0 hover:bg-zinc-800/60 transition-colors text-sm text-zinc-300 hover:text-zinc-100"
                      >
                        {item.label}
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                      </a>
                    </SheetClose>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-200">{value}</span>
    </div>
  );
}
