"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Nine phrases per category — fixed 3×3 grid (no scroll, no overflow-auto). */
const PHRASES_BY_CATEGORY = {
  basic: [
    "Hello",
    "Yes",
    "No",
    "Thank you",
    "Please wait",
    "Goodbye",
    "Please",
    "I understand",
    "Maybe not",
  ],
  needs: [
    "I need water",
    "I need food",
    "I need the bathroom",
    "I am cold",
    "I am hot",
    "I am tired",
    "I need rest",
    "It's too loud",
    "I need a blanket",
  ],
  emergency: [
    "I need help now",
    "I am in pain",
    "Call my caregiver",
    "I feel very unwell",
    "Something is wrong",
    "Please get a nurse",
    "I can't breathe well",
    "Medical emergency",
    "I fell down",
  ],
};

const SLOT_COUNT = 9;

const PHRASE_BTN =
  "h-full min-h-[5rem] max-h-[5rem] w-full min-w-0 rounded-xl px-2 py-2 shadow-none " +
  "text-center text-base font-semibold leading-snug line-clamp-3 overflow-hidden";

/**
 * @param {{ onPhraseSelect?: (text: string) => void }} props
 */
export function QuickPhrasesPanel({ onPhraseSelect }) {
  const [activeTab, setActiveTab] = useState("basic");
  const handleSelect = onPhraseSelect ?? (() => {});

  const phrases =
    PHRASES_BY_CATEGORY[activeTab] ?? PHRASES_BY_CATEGORY.basic;

  return (
    <Card className="flex h-full min-h-0 w-full flex-col gap-0 overflow-hidden rounded-xl border p-6 shadow-none">
      <CardHeader className="shrink-0 gap-1 px-0 pb-4 pt-0">
        <CardTitle className="text-base font-semibold">Quick phrases</CardTitle>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pb-0 pt-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
        >
          <TabsList
            variant="default"
            className="grid h-12 w-full shrink-0 grid-cols-3 gap-1 p-1"
          >
            <TabsTrigger
              value="basic"
              className="h-10 rounded-md px-2 text-sm font-semibold"
            >
              Basic
            </TabsTrigger>
            <TabsTrigger
              value="needs"
              className="h-10 rounded-md px-2 text-sm font-semibold"
            >
              Needs
            </TabsTrigger>
            <TabsTrigger
              value="emergency"
              className="h-10 rounded-md px-2 text-sm font-semibold"
            >
              Emergency
            </TabsTrigger>
          </TabsList>

          {/* Fixed 3×3 — nine cells always; only labels change with tab. */}
          <div
            className="grid min-h-0 flex-1 grid-cols-3 grid-rows-3 gap-3 overflow-hidden"
            role="group"
            aria-label={`Phrases: ${activeTab}`}
          >
            {Array.from({ length: SLOT_COUNT }).map((_, index) => {
              const text = phrases[index];
              return (
                <Button
                  key={index}
                  type="button"
                  variant="secondary"
                  className={cn(PHRASE_BTN)}
                  onClick={() => handleSelect(text)}
                >
                  <span className="line-clamp-3">{text}</span>
                </Button>
              );
            })}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
