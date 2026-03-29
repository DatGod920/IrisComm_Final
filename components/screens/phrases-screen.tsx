"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  BookOpen,
  Plus,
  Heart,
  Utensils,
  Stethoscope,
  MessageSquare,
  Volume2,
  Star,
  Trash2,
  Edit3,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/GazeButton";
import { useAppStore } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const categoryIcons = {
  medical: Stethoscope,
  food: Utensils,
  emotions: Heart,
  requests: MessageSquare,
  custom: Plus,
  favorites: Star,
  ai: Sparkles,
};

const categoryColors = {
  medical: "text-destructive",
  food: "text-secondary",
  emotions: "text-accent",
  requests: "text-primary",
  custom: "text-muted-foreground",
};

export function PhrasesScreen() {
  const {
    phrases,
    setCurrentText,
    setCurrentScreen,
    dwellTime,
    customPhrases,
    addCustomPhrase,
    removeCustomPhrase,
    favoritePhrases,
    toggleFavoritePhrase,
    dynamicPhrases,
  } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPhraseText, setNewPhraseText] = useState("");
  const [newPhraseCategory, setNewPhraseCategory] = useState("custom");

  const categories = [
    "all",
    "medical",
    "food",
    "emotions",
    "requests",
    "custom",
    "favorites",
    "ai",
  ];

  const getAllPhrases = () => {
    const all = [...phrases];
    customPhrases.forEach((p) => {
      if (!all.find((x) => x.id === p.id)) all.push(p);
    });
    return all;
  };

  const filteredPhrases = () => {
    const all = getAllPhrases();
    if (activeCategory === "all") return all;
    if (activeCategory === "favorites")
      return all.filter((p) => favoritePhrases.includes(p.text));
    if (activeCategory === "ai") return dynamicPhrases;
    if (activeCategory === "custom") return customPhrases;
    return all.filter((p) => p.category === activeCategory);
  };

  const handlePhraseSelect = (text: string) => {
    setCurrentText(text);
    setCurrentScreen("communication");
  };

  const speakPhrase = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleCreatePhrase = () => {
    if (newPhraseText.trim()) {
      addCustomPhrase(newPhraseText.trim(), newPhraseCategory);
      setNewPhraseText("");
      setShowCreateModal(false);
    }
  };

  return (
    <div className="px-3 py-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Phrase Library</h1>
        <p className="text-muted-foreground">Quick access to common phrases</p>
      </motion.div>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-6"
      >
        <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">
          {categories.map((category) => {
            const Icon =
              category === "all"
                ? BookOpen
                : categoryIcons[category as keyof typeof categoryIcons];
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="glass data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2 rounded-full capitalize"
              >
                <Icon className="w-4 h-4 mr-2" />
                {category}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPhrases().map((phrase, index) => {
              const Icon =
                categoryIcons[phrase.category as keyof typeof categoryIcons] ||
                Plus;
              const colorClass =
                categoryColors[
                  phrase.category as keyof typeof categoryColors
                ] || "text-muted-foreground";

              return (
                <motion.div
                  key={phrase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    variant="default"
                    className="flex items-center gap-4 p-4"
                    hoverEffect={true}
                    role="button"
                    tabIndex={0}
                    data-gaze-interactive="true"
                    data-gaze-dwell={dwellTime}
                    data-gaze-stickiness="18"
                    dwellTime={dwellTime}
                    onClick={() => handlePhraseSelect(phrase.text)}
                    onGazeSelect={() => handlePhraseSelect(phrase.text)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 ${colorClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-lg truncate">
                        {phrase.text}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {phrase.category}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <GazeButton
                        variant={
                          favoritePhrases.includes(phrase.text)
                            ? "primary"
                            : "default"
                        }
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoritePhrase(phrase.text);
                        }}
                        onGazeSelect={() => toggleFavoritePhrase(phrase.text)}
                        dwellTime={dwellTime}
                        className="shrink-0"
                      >
                        <Star
                          className={`w-4 h-4 ${favoritePhrases.includes(phrase.text) ? "fill-yellow-400 text-yellow-400" : ""}`}
                        />
                      </GazeButton>
                      <GazeButton
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakPhrase(phrase.text);
                        }}
                        onGazeSelect={() => speakPhrase(phrase.text)}
                        dwellTime={dwellTime}
                        className="shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </GazeButton>
                      {phrase.category === "custom" && (
                        <GazeButton
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomPhrase(phrase.id);
                          }}
                          onGazeSelect={() => removeCustomPhrase(phrase.id)}
                          dwellTime={dwellTime}
                          className="shrink-0 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </GazeButton>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>

          {filteredPhrases().length === 0 && (
            <GlassCard variant="subtle" className="text-center py-12">
              <p className="text-muted-foreground">
                No phrases in this category
              </p>
            </GlassCard>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Phrase Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-card p-6 rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Create Custom Phrase</h3>
            <input
              type="text"
              value={newPhraseText}
              onChange={(e) => setNewPhraseText(e.target.value)}
              placeholder="Enter your phrase..."
              className="w-full p-3 rounded-xl bg-background border mb-4"
              autoFocus
            />
            <div className="mb-4">
              <p className="text-sm mb-2">Category</p>
              <div className="flex gap-2 flex-wrap">
                {["custom", "medical", "food", "emotions", "requests"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewPhraseCategory(cat)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        newPhraseCategory === cat
                          ? "bg-primary text-white"
                          : "bg-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <GazeButton
                variant="default"
                size="lg"
                onClick={() => setShowCreateModal(false)}
                onGazeSelect={() => setShowCreateModal(false)}
                dwellTime={dwellTime}
                className="flex-1"
              >
                Cancel
              </GazeButton>
              <GazeButton
                variant="primary"
                size="lg"
                onClick={handleCreatePhrase}
                onGazeSelect={handleCreatePhrase}
                dwellTime={dwellTime}
                className="flex-1"
                disabled={!newPhraseText.trim()}
              >
                Create
              </GazeButton>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Custom Phrase Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-24 left-4 right-4 flex justify-center"
      >
        <GazeButton
          variant="primary"
          size="lg"
          onClick={() => setShowCreateModal(true)}
          onGazeSelect={() => setShowCreateModal(true)}
          dwellTime={dwellTime}
          className="w-full max-w-sm"
        >
          <Plus className="w-5 h-5" />
          Create Custom Phrase
        </GazeButton>
      </motion.div>
    </div>
  );
}
