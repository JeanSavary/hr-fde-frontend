"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TranscriptViewerProps {
  transcript: string | null;
}

interface ParsedMessage {
  role: "agent" | "carrier" | "system";
  content: string;
}

function parseTranscript(raw: string): ParsedMessage[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((msg: { role?: string; content?: string }) => ({
        role: msg.role === "assistant" || msg.role === "agent" ? "agent"
          : msg.role === "user" || msg.role === "carrier" ? "carrier"
          : "system",
        content: msg.content ?? "",
      }));
    }
  } catch {
    // Not JSON — fall through to line-based parsing
  }

  return raw
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      if (line.match(/^(agent|assistant|ai):/i)) {
        return { role: "agent" as const, content: line.replace(/^(agent|assistant|ai):\s*/i, "") };
      }
      if (line.match(/^(carrier|user|caller):/i)) {
        return { role: "carrier" as const, content: line.replace(/^(carrier|user|caller):\s*/i, "") };
      }
      return { role: "system" as const, content: line };
    });
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  if (!transcript) {
    return (
      <Card className="flex h-full items-center justify-center p-10 shadow-sm">
        <p className="text-sm text-gray-400">No transcript available.</p>
      </Card>
    );
  }

  const messages = parseTranscript(transcript);

  return (
    <Card className="shadow-sm">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-medium text-gray-700">Transcript</h3>
      </div>
      <div className="max-h-[600px] space-y-3 overflow-y-auto px-5 pb-5">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "agent" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
              msg.role === "agent" ? "bg-indigo-50 text-indigo-900"
                : msg.role === "carrier" ? "bg-gray-100 text-gray-900"
                : "bg-amber-50 text-amber-800 text-xs italic"
            )}>
              <span className="mb-1 block text-xs font-medium opacity-60">
                {msg.role === "agent" ? "AI Agent" : msg.role === "carrier" ? "Carrier" : "System"}
              </span>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
