"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { NegotiationSettings } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface NegotiationFormProps {
  initialSettings: NegotiationSettings;
}

export function NegotiationForm({ initialSettings }: NegotiationFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const exampleRate = 2000;
  const floorRate = exampleRate * (1 - settings.target_margin);
  const ceilingRate = exampleRate * (1 + settings.max_bump_above_loadboard);

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

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="space-y-6 p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Target Margin — {(settings.target_margin * 100).toFixed(0)}%
          </label>
          <Slider
            className="mt-3"
            min={0}
            max={50}
            step={1}
            value={[settings.target_margin * 100]}
            onValueChange={([v]) =>
              setSettings((s) => ({ ...s, target_margin: v / 100 }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Minimum Margin — {(settings.min_margin * 100).toFixed(0)}%
          </label>
          <Slider
            className="mt-3"
            min={0}
            max={30}
            step={1}
            value={[settings.min_margin * 100]}
            onValueChange={([v]) =>
              setSettings((s) => ({ ...s, min_margin: v / 100 }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Max Bump Above Loadboard —{" "}
            {(settings.max_bump_above_loadboard * 100).toFixed(0)}%
          </label>
          <Slider
            className="mt-3"
            min={0}
            max={20}
            step={1}
            value={[settings.max_bump_above_loadboard * 100]}
            onValueChange={([v]) =>
              setSettings((s) => ({ ...s, max_bump_above_loadboard: v / 100 }))
            }
          />
        </div>
      </Card>

      <Card className="bg-gray-50 p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700">
          Example Calculation
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          For a load posted at{" "}
          <span className="font-semibold">{formatCurrency(exampleRate)}</span>:
          floor rate ={" "}
          <span className="font-semibold text-amber-600">
            {formatCurrency(floorRate)}
          </span>{" "}
          ({(settings.target_margin * 100).toFixed(0)}% margin), ceiling ={" "}
          <span className="font-semibold text-emerald-600">
            {formatCurrency(ceilingRate)}
          </span>{" "}
          ({(settings.max_bump_above_loadboard * 100).toFixed(0)}% bump)
        </p>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
