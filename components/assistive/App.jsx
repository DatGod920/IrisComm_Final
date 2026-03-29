import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Placeholder — always mounted; fills left column. */
function QuickPhrasesPanel() {
  return (
    <Card className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border p-4 shadow-none">
      <CardHeader className="shrink-0 gap-0 px-0 pb-3 pt-0">
        <CardTitle className="text-base font-semibold">
          QuickPhrasesPanel
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden px-0 pb-0 pt-0">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Placeholder
        </div>
      </CardContent>
    </Card>
  );
}

/** Placeholder — fixed text area block (no grow/shrink with content). */
function MessagePanel() {
  return (
    <Card className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border p-4 shadow-none">
      <CardHeader className="shrink-0 gap-0 px-0 pb-3 pt-0">
        <CardTitle className="text-base font-semibold">MessagePanel</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden px-0 pb-0 pt-0">
        <div className="flex h-52 min-h-52 max-h-52 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Placeholder
        </div>
      </CardContent>
    </Card>
  );
}

/** Placeholder — fixed control strip height. */
function ControlsPanel() {
  return (
    <Card className="flex h-32 min-h-32 max-h-32 w-full shrink-0 flex-col overflow-hidden rounded-xl border p-4 shadow-none">
      <CardHeader className="shrink-0 gap-0 px-0 pb-2 pt-0">
        <CardTitle className="text-sm font-semibold">ControlsPanel</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden px-0 pb-0 pt-0">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Placeholder
        </div>
      </CardContent>
    </Card>
  );
}

/** Placeholder — bottom bar. */
function AlertPanel() {
  return (
    <Card className="flex h-24 min-h-24 max-h-24 w-full shrink-0 flex-row items-center overflow-hidden rounded-none border-x-0 border-b-0 border-t bg-card p-0 shadow-none">
      <CardContent className="flex w-full flex-row items-center overflow-hidden p-4 py-4">
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          AlertPanel
        </span>
        <div className="h-14 min-w-[10rem] shrink-0 rounded-xl border-2 border-red-950 bg-red-600 text-center text-sm font-bold leading-[3.5rem] text-white">
          EMERGENCY
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main assistive shell — strict grid, no scroll, stable structure, placeholders only.
 */
export default function App() {
  return (
    <div className="grid h-screen w-screen grid-cols-3 grid-rows-[1fr_auto] overflow-hidden bg-background text-foreground">
      <section
        aria-label="Quick phrases"
        className="col-span-1 min-h-0 min-w-0 overflow-hidden p-4 pb-2"
      >
        <QuickPhrasesPanel />
      </section>

      <section
        aria-label="Message and controls"
        className="col-span-2 flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden p-4 pb-2 pl-2"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <MessagePanel />
          </div>
          <ControlsPanel />
        </div>
      </section>

      <section
        aria-label="Alerts"
        className="col-span-3 shrink-0 overflow-hidden"
      >
        <AlertPanel />
      </section>
    </div>
  );
}
