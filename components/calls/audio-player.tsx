"use client";

import { Card } from "@/components/ui/card";
import { Volume2 } from "lucide-react";

interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Volume2 className="h-5 w-5 text-indigo-600" />
        <span className="text-sm font-medium text-gray-700">
          Call Recording
        </span>
      </div>
      <audio controls className="mt-3 w-full" src={url}>
        Your browser does not support audio playback.
      </audio>
    </Card>
  );
}
