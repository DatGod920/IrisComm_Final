"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BAR =
  "flex h-24 min-h-24 max-h-24 w-full shrink-0 flex-row items-stretch gap-0 overflow-hidden rounded-none border-x-0 border-b-0 border-t border-border bg-card p-0 shadow-none ring-0";

/**
 * Full-width bottom bar; height and structure do not change with app state.
 *
 * @param {{ onAlert?: () => void; onEmergency?: () => void }} props
 *   `onEmergency` is supported as an alias for `onAlert`.
 */
export function AlertPanel({ onAlert, onEmergency }) {
  const handleClick = onAlert ?? onEmergency ?? (() => {});

  return (
    <Card className={BAR}>
      <CardContent className="flex w-full max-w-full flex-row items-center gap-4 overflow-hidden p-4">
        <div className="min-h-14 min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium text-foreground">
            Emergency
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Use only when you need immediate help.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleClick}
          aria-label="Trigger emergency alert"
          className="h-16 min-w-[12rem] shrink-0 rounded-xl border-2 border-red-950 bg-red-600 px-8 text-lg font-bold tracking-wide text-white transition-none hover:bg-red-700 focus-visible:ring-red-500 dark:border-red-900 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
        >
          EMERGENCY
        </Button>
      </CardContent>
    </Card>
  );
}
