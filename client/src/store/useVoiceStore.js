import { create } from "zustand";

const VOICE_SETTINGS_KEY = "mandalkhata-voice-settings";

export const SUPPORTED_LANGUAGES = [
    { code: "en-IN", label: "English (India)", native: "English" },
    { code: "mr-IN", label: "Marathi (India)", native: "मराठी" },
    { code: "hi-IN", label: "Hindi (India)", native: "हिन्दी" }
];

const getInitialVoiceSettings = () => {
    try {
        const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
                language: parsed.language || "en-IN"
            };
        }
    } catch {
        // ignore parse error
    }
    return {
        enabled: true,
        language: "en-IN"
    };
};

export const useVoiceStore = create((set) => ({
    ...getInitialVoiceSettings(),

    setEnabled: (enabled) => {
        set((state) => {
            const next = { ...state, enabled };
            try {
                localStorage.setItem(
                    VOICE_SETTINGS_KEY,
                    JSON.stringify({ enabled: next.enabled, language: next.language })
                );
            } catch {
                // ignore
            }
            return next;
        });
    },

    setLanguage: (language) => {
        set((state) => {
            const next = { ...state, language };
            try {
                localStorage.setItem(
                    VOICE_SETTINGS_KEY,
                    JSON.stringify({ enabled: next.enabled, language: next.language })
                );
            } catch {
                // ignore
            }
            return next;
        });
    }
}));
