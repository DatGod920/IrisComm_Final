"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BTN = cn(
  "h-16 min-h-16 max-h-16 w-full min-w-0 rounded-xl text-base font-semibold",
  "px-2 shadow-none whitespace-normal text-center leading-tight",
);

/**
 * Speak / Send / Clear / STT — fixed grid; listening only toggles style, not size.
 *
 * @param {{
 *   onSpeak: () => void;
 *   onSend: () => void;
 *   onClear: () => void;
 *   onStartListening: () => void;
 *   canSpeak: boolean;
 *   canSend: boolean;
 *   isListening: boolean;
 * }} props
 */
export function ControlsPanel({
  onSpeak,
  onSend,
  onClear,
  onStartListening,
  canSpeak = true,
  canSend = true,
  isListening = false,
}) {
  return (
    <Card className="flex w-full shrink-0 flex-col gap-0 overflow-hidden rounded-xl border p-6 py-6 shadow-none">
      <CardHeader className="shrink-0 gap-1 px-0 pb-4 pt-0">
        <CardTitle className="text-base font-semibold">Controls</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden px-0 pb-0 pt-0">
        <div className="grid w-full grid-cols-4 gap-3">
          <Button
            type="button"
            variant="default"
            className={BTN}
            disabled={!canSpeak}
            onClick={onSpeak}
            aria-label="Speak message aloud"
          >
            Speak
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={BTN}
            disabled={!canSend}
            onClick={onSend}
            aria-label="Send message"
          >
            Send
          </Button>
          <Button
            type="button"
            variant="outline"
            className={BTN}
            onClick={onClear}
            aria-label="Clear message"
          >
            Clear
          </Button>
          <Button
            type="button"
            variant={isListening ? "secondary" : "outline"}
            className={cn(
              BTN,
              isListening && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            )}
            onClick={onStartListening}
            aria-pressed={isListening}
            aria-label={
              isListening ? "Stop listening" : "Start speech recognition"
            }
          >
            {isListening ? "Listening…" : "Start listening"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
