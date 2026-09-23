"use client";

import { Zap, Wind, AlertTriangle, Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ControlCenterProps {
  isManualOverride: boolean;
  setIsManualOverride: (v: boolean) => void;
  heaterActive: boolean;
  setHeaterActive: (v: boolean) => void;
  fanPWM: number;
  setFanPWM: (v: number) => void;
  mistingActive: boolean;
  setMistingActive: (v: boolean) => void;
  adaptiveTarget: number;
  docDay: number;
}

function ControlRow({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-zinc-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-200">{label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        </div>
      </div>
      {/* Larger touch area for switch on mobile */}
      <div className="flex items-center pl-4">
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="data-[state=checked]:bg-zinc-100"
        />
      </div>
    </div>
  );
}

export default function ControlCenter({
  isManualOverride,
  setIsManualOverride,
  heaterActive,
  setHeaterActive,
  fanPWM,
  setFanPWM,
  mistingActive,
  setMistingActive,
  adaptiveTarget,
  docDay,
}: ControlCenterProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-zinc-500" />
            <CardTitle className="text-sm font-semibold text-zinc-100">Control Center</CardTitle>
          </div>
          <Badge variant={isManualOverride ? "warning" : "secondary"}>
            {isManualOverride ? "Manual Override" : "Auto-Adaptive"}
          </Badge>
        </div>
        <CardDescription className="mt-1">
          {isManualOverride
            ? "You are directly controlling all actuators."
            : `Automated — Day ${docDay} profile, target ${adaptiveTarget}°C.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-0">
        {/* Mode Toggle — min h-11 for touch targets */}
        <div className="flex items-center gap-1.5 mb-4 p-1 rounded-lg bg-zinc-800/50 border border-zinc-800">
          <Button
            variant={!isManualOverride ? "secondary" : "ghost"}
            className="flex-1 h-10 text-sm"
            onClick={() => setIsManualOverride(false)}
          >
            Auto-Adaptive
          </Button>
          <Button
            variant={isManualOverride ? "secondary" : "ghost"}
            className="flex-1 h-10 text-sm"
            onClick={() => setIsManualOverride(true)}
          >
            Manual Override
          </Button>
        </div>

        {/* Warning */}
        {isManualOverride && (
          <div className="flex items-start gap-2.5 mb-3 p-3 rounded-lg border border-amber-800/50 bg-amber-900/10 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p>Automated edge control is paused. Changes take effect immediately.</p>
          </div>
        )}

        {/* Actuator Controls */}
        <ControlRow
          icon={<Zap className={`h-4 w-4 ${heaterActive ? "text-amber-400" : "text-zinc-500"}`} />}
          label="Heating Element"
          description="Brooder heating relay"
          checked={heaterActive}
          onCheckedChange={setHeaterActive}
          disabled={!isManualOverride}
        />
        <ControlRow
          icon={<Wind className={`h-4 w-4 ${mistingActive ? "text-sky-400" : "text-zinc-500"}`} />}
          label="Misting / Humidifier"
          description="Humidity control valve"
          checked={mistingActive}
          onCheckedChange={setMistingActive}
          disabled={!isManualOverride}
        />

        {/* Fan Speed Slider */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-200">Exhaust Fan Speed</span>
            </div>
            <span className={`text-sm font-bold tabular-nums ${fanPWM > 60 ? "text-amber-400" : "text-zinc-100"}`}>
              {fanPWM}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={fanPWM}
            onChange={(e) => setFanPWM(Number(e.target.value))}
            disabled={!isManualOverride}
            className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: `linear-gradient(to right, ${
                fanPWM > 70 ? "#f43f5e" : fanPWM > 50 ? "#f59e0b" : "#10b981"
              } ${fanPWM}%, #3f3f46 ${fanPWM}%)`,
            }}
          />
          <div className="flex justify-between text-[11px] text-zinc-600 mt-2">
            <span>Off</span><span>50%</span><span>Full</span>
          </div>
        </div>

        {/* Status summary */}
        <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-2">
          {[
            { label: "Heater", value: heaterActive ? "Active" : "Off", active: heaterActive },
            { label: "Fan", value: `${fanPWM}%`, active: fanPWM > 0 },
            { label: "Misting", value: mistingActive ? "Active" : "Off", active: mistingActive },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 py-3"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${item.active ? "bg-emerald-400" : "bg-zinc-600"}`} />
              <span className="text-[11px] font-medium text-zinc-400">{item.label}</span>
              <span className={`text-xs font-semibold ${item.active ? "text-zinc-100" : "text-zinc-500"}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
