import { create } from "zustand";
import { aiService } from "./ai-service";

export type Screen =
  | "landing"
  | "calibration"
  | "communication"
  | "emergency"
  | "phrases"
  | "settings"
  | "speech"
  | "smartHome"
  | "ar"
  | "caregiver"
  | "games"
  | "rehab";

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: "user" | "ai" | "system";
}

export interface EmotionState {
  emotion: "calm" | "stressed" | "pain" | "happy" | "sad" | "neutral";
  confidence: number;
  color: string;
}

export interface SmartHomeDevice {
  id: string;
  name: string;
  type: "light" | "fan" | "tv" | "ac" | "door";
  isOn: boolean;
  value?: number;
}

interface AppState {
  // Navigation
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;

  // Calibration
  isCalibrated: boolean;
  setIsCalibrated: (calibrated: boolean) => void;
  calibrationProgress: number;
  setCalibrationProgress: (progress: number) => void;

  // Communication
  currentText: string;
  setCurrentText: (text: string) => void;
  appendToText: (char: string) => void;
  clearText: () => void;
  backspace: () => void;
  undo: () => void;
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  savedMessages: string[];
  saveMessage: (message: string) => void;
  removeSavedMessage: (message: string) => void;
  recentMessages: string[];
  addRecentMessage: (message: string) => void;

  // AI Predictions
  predictions: string[];
  setPredictions: (predictions: string[]) => void;
  updatePredictions: () => Promise<void>;

  // Speech
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  speakCurrentSentence: () => void;
  voiceSpeed: number;
  setVoiceSpeed: (speed: number) => void;
  voiceType: string;
  setVoiceType: (type: string) => void;

  // Phrases
  phrases: Array<{ id: string; text: string; category: string }>;
  dynamicPhrases: Array<{ id: string; text: string; category: string }>;
  customPhrases: Array<{ id: string; text: string; category: string }>;
  favoritePhrases: string[];
  updateDynamicPhrases: () => void;
  addCustomPhrase: (text: string, category: string) => void;
  removeCustomPhrase: (id: string) => void;
  toggleFavoritePhrase: (text: string) => void;

  // Emotion
  emotion: EmotionState;
  setEmotion: (emotion: Partial<EmotionState>) => void;

  // Dwell Time
  dwellTime: number;
  setDwellTime: (time: number) => void;

  // Smart Home
  devices: SmartHomeDevice[];
  toggleDevice: (id: string) => void;
  setDeviceValue: (id: string, value: number) => void;

  // AR & Object Detection
  isARMode: boolean;
  setIsARMode: (isAR: boolean) => void;
  detectedObjects: string[];
  setDetectedObjects: (objects: string[]) => void;
  arSuggestions: string[];
  setARSuggestions: (suggestions: string[]) => void;

  // Multi-Modal & IoT
  isVoiceActive: boolean;
  setIsVoiceActive: (active: boolean) => void;
  handGestures: string[];
  setHandGestures: (gestures: string[]) => void;
  iotDevices: Array<{ id: string; name: string; status: "on" | "off"; type: string }>;
  toggleIotDevice: (id: string) => void;
  isEmergencyActive: boolean;
  setIsEmergencyActive: (active: boolean) => void;
  triggerEmergency: (details?: { type?: string; status?: string; message?: string }) => void;
  emergencyLogs: Array<{
    id: string;
    timestamp: Date;
    type: string;
    status: string;
    message?: string;
    delivery?: {
      delivered: boolean;
      recipients: string[];
      skipped: boolean;
      reason?: string;
      sidList: string[];
    };
  }>;

  // Caregiver & Analytics
  caregiverMessages: Array<{ id: string; text: string; timestamp: Date; from: string }>;
  addCaregiverMessage: (text: string, from: string) => void;
  syncRemoteState: (snapshot: {
    caregiverMessages?: Array<{ id: string; text: string; timestamp: string; from: string }>;
    emergencyLogs?: Array<{
      id: string;
      timestamp: string;
      type: string;
      status: string;
      message?: string;
      delivery?: {
        delivered: boolean;
        recipients: string[];
        skipped: boolean;
        reason?: string;
        sidList: string[];
      };
    }>;
    iotDevices?: Array<{ id: string; name: string; status: "on" | "off"; type: string }>;
    lastKnownText?: string;
    settings?: {
      eyeSensitivity?: number;
      dwellTime?: number;
      voiceSpeed?: number;
      voiceType?: string;
      language?: string;
      theme?: string;
      caregiverContact?: string;
      emergencyContacts?: string[];
      patientName?: string;
      diagnosis?: string;
      priorityNeeds?: string[];
      careNotes?: string;
    };
    analyticsData?: {
      typingSpeed?: number[];
      accuracy?: number[];
      mostUsedPhrases?: Array<{ phrase: string; count: number }>;
      totalSessionTime?: number;
    };
  }) => void;
  analyticsData: {
    typingSpeed: number[]; // WPM over time
    accuracy: number[]; // % accuracy over time
    mostUsedPhrases: Array<{ phrase: string; count: number }>;
    totalSessionTime: number; // in seconds
  };
  updateAnalytics: (wpm: number, accuracy: number) => void;

  // Gamification & Rehabilitation
  score: number;
  addScore: (points: number) => void;
  badges: Array<{ id: string; name: string; icon: string; description: string; unlocked: boolean }>;
  unlockBadge: (id: string) => void;
  dailyMissions: Array<{ id: string; text: string; progress: number; goal: number; completed: boolean }>;
  updateMissionProgress: (id: string, amount: number) => void;
  heatmapData: Array<{ x: number; y: number; intensity: number }>;
  gazePosition: { x: number; y: number };
  setGazePosition: (x: number, y: number) => void;
  addGazeSample: (x: number, y: number) => void;
  isTracking: boolean;
  setIsTracking: (tracking: boolean) => void;

  // Demo Mode
  isDemoMode: boolean;
  startDemoMode: () => void;

  // Settings
  eyeSensitivity: number;
  setEyeSensitivity: (sensitivity: number) => void;
  language: string;
  setLanguage: (language: string) => void;
  emergencyContacts: string[];
  addEmergencyContact: (contact: string) => void;
  removeEmergencyContact: (contact: string) => void;
  caregiverContact: string;
  setCaregiverContact: (contact: string) => void;
  patientName: string;
  setPatientName: (name: string) => void;
  diagnosis: string;
  setDiagnosis: (diagnosis: string) => void;
  priorityNeeds: string[];
  setPriorityNeeds: (needs: string[]) => void;
  careNotes: string;
  setCareNotes: (notes: string) => void;
  theme: "dark" | "light" | "cosmic";
  setTheme: (theme: "dark" | "light" | "cosmic") => void;
  
  // Accessibility & Audio Feedback
  audioFeedback: boolean;
  setAudioFeedback: (enabled: boolean) => void;
  dwellPresets: "fast" | "normal" | "precise";
  setDwellPresets: (preset: "fast" | "normal" | "precise") => void;
  visualFeedback: "highlight" | "cursor" | "both";
  setVisualFeedback: (feedback: "highlight" | "cursor" | "both") => void;
  
  // Medical Info for Emergencies
  bloodType: string;
  setBloodType: (type: string) => void;
  medicalConditions: string[];
  setMedicalConditions: (conditions: string[]) => void;
  medications: string[];
  setMedications: (meds: string[]) => void;
  emergencyMedicalInfo: string;
  setEmergencyMedicalInfo: (info: string) => void;
  
  // Auto-alert & Inactivity Detection
  inactivityTimeout: number;
  setInactivityTimeout: (minutes: number) => void;
  autoAlertEnabled: boolean;
  setAutoAlertEnabled: (enabled: boolean) => void;
  lastActivityTime: number;
  updateLastActivity: () => void;
}

const defaultPhrases = [
  { id: "1", text: "I need water", category: "food" },
  { id: "2", text: "I am in pain", category: "medical" },
  { id: "3", text: "I feel tired", category: "emotions" },
  { id: "4", text: "Please help me", category: "requests" },
  { id: "5", text: "I need medication", category: "medical" },
  { id: "6", text: "I am hungry", category: "food" },
  { id: "7", text: "I feel happy", category: "emotions" },
  { id: "8", text: "Call my caregiver", category: "requests" },
];

async function postJson(url: string, body: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as unknown;
  } catch (error) {
    console.warn(`Request failed for ${url}:`, error);
    return null;
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: "landing",
  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  isCalibrated: false,
  setIsCalibrated: (calibrated) => set({ isCalibrated: calibrated }),
  calibrationProgress: 0,
  setCalibrationProgress: (progress) => set({ calibrationProgress: progress }),

  currentText: "",
  setCurrentText: (text) => {
    set({ currentText: text });
    void postJson("/api/state", { lastKnownText: text });
    void get().updatePredictions();
  },
  appendToText: (char) => {
    set((state) => {
      const nextText = state.currentText + char;
      void postJson("/api/state", { lastKnownText: nextText });
      return { currentText: nextText };
    });
    void get().updatePredictions();
  },
  clearText: () => {
    set({ currentText: "" });
    void postJson("/api/state", { lastKnownText: "" });
    void get().updatePredictions();
  },
  backspace: () => {
    set((state) => {
      const nextText = state.currentText.slice(0, -1);
      void postJson("/api/state", { lastKnownText: nextText });
      return { currentText: nextText };
    });
    void get().updatePredictions();
  },
  undo: () => {
    // Basic undo logic - just clears the last word for now as a simple implementation
    set((state) => {
      const words = state.currentText.trim().split(" ");
      words.pop();
      const nextText = words.join(" ") + (words.length > 0 ? " " : "");
      void postJson("/api/state", { lastKnownText: nextText });
      return { currentText: nextText };
    });
    void get().updatePredictions();
  },
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        },
      ],
    })),
  savedMessages: [],
  saveMessage: (message) =>
    set((state) => {
      if (!message.trim() || state.savedMessages.includes(message)) {
        return state;
      }
      const newSaved = [message, ...state.savedMessages].slice(0, 20);
      void postJson("/api/state", { savedMessages: newSaved });
      return { savedMessages: newSaved };
    }),
  removeSavedMessage: (message) =>
    set((state) => {
      const newSaved = state.savedMessages.filter((m) => m !== message);
      void postJson("/api/state", { savedMessages: newSaved });
      return { savedMessages: newSaved };
    }),
  recentMessages: [],
  addRecentMessage: (message) =>
    set((state) => {
      if (!message.trim() || message.length < 3) return state;
      const filtered = state.recentMessages.filter((m) => m !== message);
      const newRecent = [message, ...filtered].slice(0, 10);
      return { recentMessages: newRecent };
    }),

  predictions: [
    "I need help",
    "I am feeling well",
    "Thank you very much",
    "Please wait",
    "I want to rest",
  ],
  setPredictions: (predictions) => set({ predictions }),
  updatePredictions: async () => {
    const text = get().currentText;
    const localPredictions = aiService.getNextWordPredictions(text);
    if (localPredictions.length > 0) {
      set({ predictions: localPredictions });
    }

    const remoteCompletions = await aiService.getSentenceCompletion(text);
    if (remoteCompletions.length > 0) {
      const mergedPredictions = Array.from(
        new Set([...remoteCompletions, ...localPredictions]),
      ).slice(0, 5);

      set({ predictions: mergedPredictions });
    }
  },

  isSpeaking: false,
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  speakCurrentSentence: () => {
    const state = get();
    if (!state.currentText || typeof window === "undefined") {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(state.currentText);

    let pitch = 1;
    let rate = state.voiceSpeed;

    switch (state.emotion.emotion) {
        case "happy":
          pitch = 1.3;
          rate *= 1.1;
          break;
        case "sad":
          pitch = 0.8;
          rate *= 0.8;
          break;
        case "stressed":
        case "pain":
          pitch = 1.2;
          rate *= 1.3;
          break;
        case "neutral":
        case "calm":
        default:
          pitch = 1;
          break;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => set({ isSpeaking: true });
    utterance.onend = () => set({ isSpeaking: false });
    aiService.recordUsage(state.currentText);
    window.speechSynthesis.speak(utterance);
  },
  voiceSpeed: 1,
  setVoiceSpeed: (speed) => {
    set({ voiceSpeed: speed });
    void postJson("/api/state", { settings: { voiceSpeed: speed } });
  },
  voiceType: "default",
  setVoiceType: (type) => {
    set({ voiceType: type });
    void postJson("/api/state", { settings: { voiceType: type } });
  },

  phrases: defaultPhrases,
  dynamicPhrases: [],
  customPhrases: [],
  favoritePhrases: [],
  updateDynamicPhrases: () => {
    const dynamicPhrases = aiService.getDynamicPhrases();
    set({ dynamicPhrases });
  },
  addCustomPhrase: (text, category) =>
    set((state) => {
      const newPhrase = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        category,
      };
      const newCustom = [...state.customPhrases, newPhrase];
      void postJson("/api/state", { customPhrases: newCustom });
      return { customPhrases: newCustom };
    }),
  removeCustomPhrase: (id) =>
    set((state) => {
      const newCustom = state.customPhrases.filter((p) => p.id !== id);
      void postJson("/api/state", { customPhrases: newCustom });
      return { customPhrases: newCustom };
    }),
  toggleFavoritePhrase: (text) =>
    set((state) => {
      const isFav = state.favoritePhrases.includes(text);
      const newFavs = isFav
        ? state.favoritePhrases.filter((t) => t !== text)
        : [...state.favoritePhrases, text];
      void postJson("/api/state", { favoritePhrases: newFavs });
      return { favoritePhrases: newFavs };
    }),

  emotion: {
    emotion: "neutral",
    confidence: 1,
    color: "#4F46E5",
  },
  setEmotion: (data) =>
    set((state) => ({
      emotion: { ...state.emotion, ...data },
    })),

  dwellTime: 800,
  setDwellTime: (time) => {
    set({ dwellTime: time });
    void postJson("/api/state", { settings: { dwellTime: time } });
  },

  devices: [
    { id: "1", name: "Main Light", type: "light", isOn: false },
    { id: "2", name: "Bedroom Fan", type: "fan", isOn: false },
    { id: "3", name: "TV", type: "tv", isOn: false },
    { id: "4", name: "AC", type: "ac", isOn: false, value: 24 },
    { id: "5", name: "Front Door", type: "door", isOn: false },
  ],
  toggleDevice: (id) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id ? { ...device, isOn: !device.isOn } : device,
      ),
    })),
  setDeviceValue: (id, value) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id ? { ...device, value } : device,
      ),
    })),

  isARMode: false,
  setIsARMode: (isAR) => set({ isARMode: isAR }),
  detectedObjects: [],
  setDetectedObjects: (objects) => set({ detectedObjects: objects }),
  arSuggestions: [],
  setARSuggestions: (suggestions) => set({ arSuggestions: suggestions }),

  // Multi-Modal & IoT
  isVoiceActive: false,
  setIsVoiceActive: (active) => set({ isVoiceActive: active }),
  handGestures: [],
  setHandGestures: (gestures) => set({ handGestures: gestures }),
  iotDevices: [
    { id: "light-1", name: "Smart Lights", status: "off", type: "light" },
    { id: "fan-1", name: "Ceiling Fan", status: "off", type: "fan" },
    { id: "bell-1", name: "Emergency Bell", status: "off", type: "bell" },
  ],
  toggleIotDevice: (id) =>
    set((state) => {
      void postJson("/api/iot/toggle", { id }).then((snapshot) => {
        if (snapshot && typeof snapshot === "object") {
          get().syncRemoteState(snapshot as Parameters<AppState["syncRemoteState"]>[0]);
        }
      });
      return {
        iotDevices: state.iotDevices.map((device) =>
          device.id === id
            ? { ...device, status: device.status === "on" ? "off" : "on" }
            : device,
        ),
      };
    }),
  isEmergencyActive: false,
  setIsEmergencyActive: (active) => set({ isEmergencyActive: active }),
  triggerEmergency: (details) => {
    const type = details?.type || "Gaze Trigger";
    const status = details?.status || "Alert Sent";
    const message = details?.message;

    set({ isEmergencyActive: true });
    void postJson("/api/emergency", { type, status, message }).then((snapshot) => {
      if (snapshot && typeof snapshot === "object") {
        get().syncRemoteState(snapshot as Parameters<AppState["syncRemoteState"]>[0]);
      }
    });
    // In a fuller deployment, this can be extended to external alert delivery.
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.play();
    console.log("EMERGENCY TRIGGERED: Caregiver notified via SMS");
  },
  emergencyLogs: [],

  caregiverMessages: [],
  addCaregiverMessage: (text, from) =>
    void postJson("/api/caregiver", { text, from }).then((snapshot) => {
      if (snapshot && typeof snapshot === "object") {
        get().syncRemoteState(snapshot as Parameters<AppState["syncRemoteState"]>[0]);
      }
    }),
  syncRemoteState: (snapshot) =>
    set((state) => ({
      caregiverMessages: snapshot.caregiverMessages
        ? snapshot.caregiverMessages.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          }))
        : state.caregiverMessages,
      emergencyLogs: snapshot.emergencyLogs
        ? snapshot.emergencyLogs.map((log) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }))
        : state.emergencyLogs,
      iotDevices: snapshot.iotDevices || state.iotDevices,
      currentText: snapshot.lastKnownText ?? state.currentText,
      eyeSensitivity: snapshot.settings?.eyeSensitivity ?? state.eyeSensitivity,
      dwellTime: snapshot.settings?.dwellTime ?? state.dwellTime,
      voiceSpeed: snapshot.settings?.voiceSpeed ?? state.voiceSpeed,
      voiceType: snapshot.settings?.voiceType ?? state.voiceType,
      language: snapshot.settings?.language ?? state.language,
      caregiverContact: snapshot.settings?.caregiverContact ?? state.caregiverContact,
      emergencyContacts: snapshot.settings?.emergencyContacts ?? state.emergencyContacts,
      patientName: snapshot.settings?.patientName ?? state.patientName,
      diagnosis: snapshot.settings?.diagnosis ?? state.diagnosis,
      priorityNeeds: snapshot.settings?.priorityNeeds ?? state.priorityNeeds,
      careNotes: snapshot.settings?.careNotes ?? state.careNotes,
      theme:
        (snapshot.settings?.theme as "dark" | "light" | "cosmic" | undefined) ??
        state.theme,
      analyticsData: snapshot.analyticsData
        ? {
            typingSpeed:
              snapshot.analyticsData.typingSpeed ?? state.analyticsData.typingSpeed,
            accuracy: snapshot.analyticsData.accuracy ?? state.analyticsData.accuracy,
            mostUsedPhrases:
              snapshot.analyticsData.mostUsedPhrases ??
              state.analyticsData.mostUsedPhrases,
            totalSessionTime:
              snapshot.analyticsData.totalSessionTime ??
              state.analyticsData.totalSessionTime,
          }
        : state.analyticsData,
    })),
  analyticsData: {
    typingSpeed: [12, 15, 18, 16, 22, 25, 28], // Mock initial data
    accuracy: [85, 88, 92, 90, 95, 96, 98], // Mock initial data
    mostUsedPhrases: [
      { phrase: "I need water", count: 12 },
      { phrase: "I am hungry", count: 8 },
      { phrase: "Thank you", count: 15 },
    ],
    totalSessionTime: 3600,
  },
  updateAnalytics: (wpm, accuracy) =>
    set((state) => {
      const analyticsData = {
        ...state.analyticsData,
        typingSpeed: [...state.analyticsData.typingSpeed, wpm],
        accuracy: [...state.analyticsData.accuracy, accuracy],
      };
      void postJson("/api/state", { analyticsData });
      return { analyticsData };
    }),

  score: 0,
  addScore: (points) => set((state) => ({ score: state.score + points })),
  badges: [
    { id: "b1", name: "Star Voyager", icon: "🚀", description: "Destroy 50 asteroids", unlocked: false },
    { id: "b2", name: "First Words", icon: "💬", description: "Send your first message", unlocked: true },
    { id: "b3", name: "Steady Gaze", icon: "👁️", description: "Complete calibration with 95%+ accuracy", unlocked: false },
  ],
  unlockBadge: (id) => set((state) => ({
    badges: state.badges.map(b => b.id === id ? { ...b, unlocked: true } : b)
  })),
  dailyMissions: [
    { id: "m1", text: "Send 5 messages", progress: 2, goal: 5, completed: false },
    { id: "m2", text: "Destroy 20 asteroids", progress: 0, goal: 20, completed: false },
    { id: "m3", text: "Practice for 10 minutes", progress: 3, goal: 10, completed: false },
  ],
  updateMissionProgress: (id, amount) => set((state) => ({
    dailyMissions: state.dailyMissions.map(m => {
      if (m.id === id) {
        const newProgress = Math.min(m.progress + amount, m.goal);
        return { ...m, progress: newProgress, completed: newProgress >= m.goal };
      }
      return m;
    })
  })),
  heatmapData: [],
  gazePosition: { x: 0.5, y: 0.5 },
  setGazePosition: (x, y) => set({ gazePosition: { x, y } }),
  addGazeSample: (x, y) => set((state) => {
    // Keep only last 1000 samples for performance
    const newData = [...state.heatmapData, { x, y, intensity: 1 }];
    if (newData.length > 1000) newData.shift();
    return { heatmapData: newData };
  }),
  isTracking: false,
  setIsTracking: (tracking) => set({ isTracking: tracking }),

  isDemoMode: false,
  startDemoMode: () => set((state) => {
    const analyticsData = {
      typingSpeed: [10, 15, 22, 28, 35, 42],
      accuracy: [80, 85, 92, 95, 98, 99],
      mostUsedPhrases: [
        { phrase: "I need help", count: 5 },
        { phrase: "Thank you", count: 20 },
        { phrase: "I am hungry", count: 8 },
      ],
      totalSessionTime: 7200,
    };
    const currentText = "I want to share my voice with the universe.";

    void postJson("/api/state", {
      lastKnownText: currentText,
      analyticsData,
    });

    return {
      isDemoMode: true,
      isCalibrated: true,
      currentScreen: "communication",
      currentText,
      analyticsData,
      emergencyLogs: [
        { id: "e1", timestamp: new Date(Date.now() - 3600000), type: "Gaze Trigger", status: "Resolved" },
        { id: "e2", timestamp: new Date(Date.now() - 7200000), type: "Manual Trigger", status: "Acknowledged" },
      ],
      score: 1250,
      badges: state.badges.map(b => ({ ...b, unlocked: true })),
    };
  }),

  eyeSensitivity: 50,
  setEyeSensitivity: (sensitivity) => {
    set({ eyeSensitivity: sensitivity });
    void postJson("/api/state", { settings: { eyeSensitivity: sensitivity } });
  },
  language: "en",
  setLanguage: (language) => {
    set({ language });
    void postJson("/api/state", { settings: { language } });
  },
  emergencyContacts: [],
  addEmergencyContact: (contact) =>
    set((state) => {
      const emergencyContacts = [...state.emergencyContacts, contact];
      void postJson("/api/state", {
        settings: { emergencyContacts },
      });
      return { emergencyContacts };
    }),
  removeEmergencyContact: (contact) =>
    set((state) => {
      const emergencyContacts = state.emergencyContacts.filter((c) => c !== contact);
      void postJson("/api/state", {
        settings: { emergencyContacts },
      });
      return { emergencyContacts };
    }),
  caregiverContact: "",
  setCaregiverContact: (contact) => {
    set({ caregiverContact: contact });
    void postJson("/api/state", { settings: { caregiverContact: contact } });
  },
  patientName: "",
  setPatientName: (name) => {
    set({ patientName: name });
    void postJson("/api/state", { settings: { patientName: name } });
  },
  diagnosis: "",
  setDiagnosis: (diagnosis) => {
    set({ diagnosis });
    void postJson("/api/state", { settings: { diagnosis } });
  },
  priorityNeeds: [],
  setPriorityNeeds: (needs) => {
    set({ priorityNeeds: needs });
    void postJson("/api/state", { settings: { priorityNeeds: needs } });
  },
  careNotes: "",
  setCareNotes: (notes) => {
    set({ careNotes: notes });
    void postJson("/api/state", { settings: { careNotes: notes } });
  },
  theme: "dark",
  setTheme: (theme) => {
    set({ theme });
    void postJson("/api/state", { settings: { theme } });
  },
  
  // Accessibility & Audio Feedback
  audioFeedback: true,
  setAudioFeedback: (enabled) => {
    set({ audioFeedback: enabled });
    void postJson("/api/state", { settings: { audioFeedback: enabled } });
  },
  dwellPresets: "normal",
  setDwellPresets: (preset) => {
    const dwellTimes = { fast: 500, normal: 800, precise: 1500 };
    set({ dwellPresets: preset, dwellTime: dwellTimes[preset] });
    void postJson("/api/state", { settings: { dwellPresets: preset, dwellTime: dwellTimes[preset] } });
  },
  visualFeedback: "both",
  setVisualFeedback: (feedback) => {
    set({ visualFeedback: feedback });
    void postJson("/api/state", { settings: { visualFeedback: feedback } });
  },
  
  // Medical Info for Emergencies
  bloodType: "",
  setBloodType: (type) => {
    set({ bloodType: type });
    void postJson("/api/state", { settings: { bloodType: type } });
  },
  medicalConditions: [],
  setMedicalConditions: (conditions) => {
    set({ medicalConditions: conditions });
    void postJson("/api/state", { settings: { medicalConditions: conditions } });
  },
  medications: [],
  setMedications: (meds) => {
    set({ medications: meds });
    void postJson("/api/state", { settings: { medications: meds } });
  },
  emergencyMedicalInfo: "",
  setEmergencyMedicalInfo: (info) => {
    set({ emergencyMedicalInfo: info });
    void postJson("/api/state", { settings: { emergencyMedicalInfo: info } });
  },
  
  // Auto-alert & Inactivity Detection
  inactivityTimeout: 0,
  setInactivityTimeout: (minutes) => {
    set({ inactivityTimeout: minutes });
    void postJson("/api/state", { settings: { inactivityTimeout: minutes } });
  },
  autoAlertEnabled: false,
  setAutoAlertEnabled: (enabled) => {
    set({ autoAlertEnabled: enabled });
    void postJson("/api/state", { settings: { autoAlertEnabled: enabled } });
  },
  lastActivityTime: Date.now(),
  updateLastActivity: () => set({ lastActivityTime: Date.now() }),
}));
