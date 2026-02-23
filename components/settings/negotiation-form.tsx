"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { NegotiationSettings } from "@/lib/types";
import { toast } from "sonner";

interface NegotiationFormProps {
  initialSettings: NegotiationSettings;
}

export function NegotiationForm({ initialSettings }: NegotiationFormProps) {
  const [settings, setSettings] = useState({
    target_margin: initialSettings.target_margin,
    min_margin: initialSettings.min_margin,
    max_bump_above_loadboard: initialSettings.max_bump_above_loadboard,
    max_negotiation_rounds: initialSettings.max_negotiation_rounds ?? 3,
    max_offers_per_call: initialSettings.max_offers_per_call ?? 3,
    auto_transfer_threshold: initialSettings.auto_transfer_threshold ?? 500,
    deadhead_warning_miles: initialSettings.deadhead_warning_miles ?? 150,
    floor_rate_protection: initialSettings.floor_rate_protection ?? true,
    sentiment_escalation: initialSettings.sentiment_escalation ?? true,
    prioritize_perishables: initialSettings.prioritize_perishables ?? true,
    agent_greeting:
      initialSettings.agent_greeting ??
      "Thanks for calling, this is your AI carrier sales agent. How can I help you today?",
    agent_tone: initialSettings.agent_tone ?? "professional",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      target_margin: initialSettings.target_margin,
      min_margin: initialSettings.min_margin,
      max_bump_above_loadboard: initialSettings.max_bump_above_loadboard,
      ...(initialSettings.max_negotiation_rounds != null && {
        max_negotiation_rounds: initialSettings.max_negotiation_rounds,
      }),
      ...(initialSettings.max_offers_per_call != null && {
        max_offers_per_call: initialSettings.max_offers_per_call,
      }),
      ...(initialSettings.auto_transfer_threshold != null && {
        auto_transfer_threshold: initialSettings.auto_transfer_threshold,
      }),
      ...(initialSettings.deadhead_warning_miles != null && {
        deadhead_warning_miles: initialSettings.deadhead_warning_miles,
      }),
      ...(initialSettings.floor_rate_protection != null && {
        floor_rate_protection: initialSettings.floor_rate_protection,
      }),
      ...(initialSettings.sentiment_escalation != null && {
        sentiment_escalation: initialSettings.sentiment_escalation,
      }),
      ...(initialSettings.prioritize_perishables != null && {
        prioritize_perishables: initialSettings.prioritize_perishables,
      }),
      ...(initialSettings.agent_greeting != null && {
        agent_greeting: initialSettings.agent_greeting,
      }),
      ...(initialSettings.agent_tone != null && {
        agent_tone: initialSettings.agent_tone,
      }),
    }));
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof typeof settings>(
    key: K,
    val: (typeof settings)[K],
  ) => setSettings((s) => ({ ...s, [key]: val }));

  // Multiplier: existing fields are stored as decimals (0.15), display as whole numbers
  const tM = Math.round(settings.target_margin * 100);
  const mM = Math.round(settings.min_margin * 100);
  const bL = Math.round(settings.max_bump_above_loadboard * 100);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {/* Pricing & Margins */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Pricing & Margins
          </h3>
          <p className="mb-3 text-xs text-gray-400">
            Controls how the AI agent negotiates rates with carriers
          </p>
          {[
            {
              label: "Target Margin",
              desc: "Ideal margin the agent aims for on every deal",
              value: tM,
              unit: "%",
              min: 5,
              max: 30,
              onChange: (v: number) => update("target_margin", v / 100),
            },
            {
              label: "Minimum Margin",
              desc: "Absolute floor — agent will never go below this",
              value: mM,
              unit: "%",
              min: 1,
              max: 20,
              onChange: (v: number) => update("min_margin", v / 100),
            },
            {
              label: "Max Bump Above Loadboard",
              desc: "How much above loadboard rate the agent can offer",
              value: bL,
              unit: "%",
              min: 0,
              max: 15,
              onChange: (v: number) =>
                update("max_bump_above_loadboard", v / 100),
            },
          ].map((s) => (
            <SliderField key={s.label} {...s} />
          ))}
        </Card>

        {/* Negotiation Behavior */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Negotiation Behavior
          </h3>
          <p className="mb-3 text-xs text-gray-400">
            Rules governing how the AI conducts negotiations
          </p>
          {[
            {
              label: "Max Negotiation Rounds",
              desc: "Rounds before the agent stops negotiating",
              value: settings.max_negotiation_rounds,
              min: 1,
              max: 5,
              onChange: (v: number) => update("max_negotiation_rounds", v),
            },
            {
              label: "Max Offers Per Call",
              desc: "Different loads to pitch in a single call",
              value: settings.max_offers_per_call,
              min: 1,
              max: 5,
              onChange: (v: number) => update("max_offers_per_call", v),
            },
          ].map((s) => (
            <SliderField key={s.label} {...s} />
          ))}
          {/* Coming soon sliders */}
          <div className="relative mt-2 overflow-hidden rounded-md border border-gray-200">
            <div className="pointer-events-none select-none space-y-3 p-3 opacity-50 blur-[1px]">
              <SliderField
                label="Auto-Transfer Threshold"
                desc="Rate gap ($) that triggers transfer to human rep"
                value={500}
                unit="$"
                min={100}
                max={1000}
                step={50}
                onChange={() => {}}
              />
              <SliderField
                label="Deadhead Warning"
                desc="Miles before agent acknowledges carrier concern"
                value={150}
                unit="mi"
                min={50}
                max={300}
                step={10}
                onChange={() => {}}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-600 shadow-sm">
                Coming Soon
              </span>
            </div>
          </div>
        </Card>

        {/* Smart Features */}
        <div className="relative overflow-hidden rounded-md border border-gray-200">
          <Card className="pointer-events-none select-none border-0 p-4 opacity-50 blur-[1px]">
            <h3 className="text-sm font-semibold text-gray-900">
              Smart Features
            </h3>
            <p className="mb-3 text-xs text-gray-400">
              Toggle intelligent behaviors for the AI agent
            </p>
            {[
              {
                key: "floor_rate_protection" as const,
                label: "Floor Rate Protection",
                desc: "Prevent agent from accepting rates below minimum margin",
              },
              {
                key: "sentiment_escalation" as const,
                label: "Sentiment Escalation",
                desc: "Auto-transfer to human when carrier sentiment turns very negative",
              },
              {
                key: "prioritize_perishables" as const,
                label: "Prioritize Perishables",
                desc: "Pitch temperature-controlled loads first when urgency is high",
              },
            ].map((s, i) => (
              <div
                key={s.key}
                className={`flex items-center justify-between py-2.5 ${i < 2 ? "border-b border-gray-100" : ""}`}
              >
                <div>
                  <div className="text-[13px] font-medium text-gray-900">
                    {s.label}
                  </div>
                  <div className="text-[11px] text-gray-400">{s.desc}</div>
                </div>
                <div className="relative h-6 w-11 rounded-full bg-gray-200">
                  <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow" />
                </div>
              </div>
            ))}
          </Card>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-600 shadow-sm">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Agent Voice & Greeting */}
        <div className="relative overflow-hidden rounded-md border border-gray-200">
          <Card className="pointer-events-none select-none border-0 p-4 opacity-50 blur-[1px]">
            <h3 className="text-sm font-semibold text-gray-900">
              Agent Voice & Greeting
            </h3>
            <p className="mb-3 text-xs text-gray-400">
              Customize how the AI agent sounds and introduces itself
            </p>
            <div className="mb-3">
              <div className="mb-1.5 text-[13px] font-medium text-gray-900">
                Tone
              </div>
              <div className="flex gap-1.5">
                {(["professional", "friendly", "direct"] as const).map((t) => (
                  <div
                    key={t}
                    className="rounded-lg border-[1.5px] border-gray-200 bg-white px-4 py-2 text-xs font-medium capitalize text-gray-400"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[13px] font-medium text-gray-900">
                Opening Greeting
              </div>
              <div className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] leading-relaxed text-gray-400">
                Thanks for calling, this is your AI carrier sales agent...
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                This is the first thing carriers hear when they call in.
              </p>
            </div>
          </Card>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-600 shadow-sm">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Save/Reset */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() =>
            setSettings({
              target_margin: initialSettings.target_margin,
              min_margin: initialSettings.min_margin,
              max_bump_above_loadboard:
                initialSettings.max_bump_above_loadboard,
              max_negotiation_rounds:
                initialSettings.max_negotiation_rounds ?? 3,
              max_offers_per_call: initialSettings.max_offers_per_call ?? 3,
              auto_transfer_threshold:
                initialSettings.auto_transfer_threshold ?? 500,
              deadhead_warning_miles:
                initialSettings.deadhead_warning_miles ?? 150,
              floor_rate_protection:
                initialSettings.floor_rate_protection ?? true,
              sentiment_escalation:
                initialSettings.sentiment_escalation ?? true,
              prioritize_perishables:
                initialSettings.prioritize_perishables ?? true,
              agent_greeting:
                initialSettings.agent_greeting ??
                "Thanks for calling, this is your AI carrier sales agent. How can I help you today?",
              agent_tone: initialSettings.agent_tone ?? "professional",
            })
          }
        >
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

function SliderField({
  label,
  desc,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  desc: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium text-gray-900">{label}</div>
          <div className="text-[11px] text-gray-400">{desc}</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1">
          <span className="font-mono text-base font-bold text-gray-900">
            {value}
          </span>
          {unit && <span className="text-xs text-gray-400">{unit}</span>}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step ?? 1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}
