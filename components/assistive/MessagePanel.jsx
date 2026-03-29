"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Pixel-locked height — textarea does not grow or shrink with content or `value`. */
const TEXTAREA_BOX =
  "h-[12.5rem] min-h-[12.5rem] max-h-[12.5rem] w-full resize-none";

/**
 * Large message field; dimensions are independent of text length.
 *
 * @param {{
 *   value: string;
 *   setValue: (value: string) => void;
 *   placeholder?: string;
 * }} props
 */
export function MessagePanel({
  value,
  setValue,
  placeholder = "Your message…",
}) {
  return (
    <Card className="flex h-full min-h-0 w-full flex-col gap-0 overflow-hidden rounded-xl border p-6 shadow-none">
      <CardHeader className="shrink-0 gap-1 px-0 pb-4 pt-0">
        <CardTitle className="text-base font-semibold">Message</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden px-0 pb-0 pt-0">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          spellCheck
          aria-label="Message text"
          style={{ fieldSizing: "fixed" }}
          className={cn(
            TEXTAREA_BOX,
            "overflow-y-auto rounded-xl border-2 px-4 py-4",
            "text-xl leading-relaxed md:text-2xl",
            "placeholder:text-muted-foreground",
          )}
        />
      </CardContent>
    </Card>
  );
}
