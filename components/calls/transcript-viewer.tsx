"use client";

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
        role:
          msg.role === "assistant" || msg.role === "agent"
            ? "agent"
            : msg.role === "user" || msg.role === "carrier"
              ? "carrier"
              : "system",
        content: msg.content ?? "",
      }));
    }
  } catch {
    // Not JSON — fall through to line-based parsing
  }

  // Detect speaker names from "Name: text" pattern
  // Lines with a known carrier keyword are carrier; lines starting with
  // "Carrier" label are carrier; everything else with a "Name:" prefix is agent.
  const lines = raw.split("\n").filter((line) => line.trim());
  const carrierPattern = /^(carrier|user|caller):/i;
  const agentPattern = /^(agent|assistant|ai):/i;
  // Matches any "Name:" prefix (e.g. "Matthew:", "John:")
  const namedSpeakerPattern = /^([A-Z][a-zA-Z]+):\s*/;

  return lines.map((line) => {
    if (agentPattern.test(line)) {
      return {
        role: "agent" as const,
        content: line.replace(agentPattern, ""),
      };
    }
    if (carrierPattern.test(line)) {
      return {
        role: "carrier" as const,
        content: line.replace(carrierPattern, ""),
      };
    }
    // "Carrier" label in the content itself (from HappyRobot transcripts)
    if (line.startsWith("Carrier")) {
      return {
        role: "carrier" as const,
        content: line.replace(/^Carrier\s*/, ""),
      };
    }
    // Any "Name: text" line — treat as agent (the AI has a name)
    const namedMatch = line.match(namedSpeakerPattern);
    if (namedMatch) {
      return {
        role: "agent" as const,
        content: line.replace(namedSpeakerPattern, ""),
      };
    }
    return { role: "system" as const, content: line };
  });
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  if (!transcript) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200">
        <p className="text-sm text-gray-400">No transcript available</p>
      </div>
    );
  }

  const messages = parseTranscript(transcript);

  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Transcript
      </div>
      <div className="max-h-[calc(100vh-340px)] space-y-2 overflow-y-auto pr-1 bg-white px-4 py-3 rounded-md">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "agent" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
                msg.role === "agent"
                  ? "bg-gray-900 text-gray-100"
                  : msg.role === "carrier"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-amber-50 text-amber-700 text-[11px] italic",
              )}
            >
              {msg.role !== "system" && (
                <span
                  className={cn(
                    "mb-0.5 block text-[10px] font-medium",
                    msg.role === "agent" ? "text-gray-500" : "text-gray-400",
                  )}
                >
                  {msg.role === "agent" ? "AI Agent" : "Carrier"}
                </span>
              )}
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
