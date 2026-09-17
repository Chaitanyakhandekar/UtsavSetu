import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceStore } from "../store/useVoiceStore.js";
import toast from "react-hot-toast";

// Module-level tracker to stop previous active session if a new one starts
let activeSessionStop = null;

export const isSpeechRecognitionSupported = () => {
    return typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const VoiceInput = forwardRef(function VoiceInput(
    {
        voiceEnabled = true,
        multiline = false,
        langOverride,
        value = "",
        onChange,
        className = "",
        placeholder,
        name,
        id,
        disabled = false,
        required = false,
        rows = 3,
        maxLength,
        autoFocus = false,
        type = "text",
        onVoiceSuccess,
        ...rest
    },
    ref
) {
    const inputRef = useRef(null);
    useImperativeHandle(ref, () => inputRef.current);

    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const cursorPositionRef = useRef({ start: null, end: null });

    const { enabled: globalVoiceEnabled, language: globalLanguage } = useVoiceStore();
    const activeLanguage = langOverride || globalLanguage || "en-IN";
    const speechSupported = isSpeechRecognitionSupported();

    // Determine if voice button should be visible
    const showVoiceButton = voiceEnabled && globalVoiceEnabled;

    // Cleanup active listener on unmount
    useEffect(() => {
        return () => {
            if (activeSessionStop) {
                try {
                    activeSessionStop();
                } catch {
                    // ignore
                }
            }
        };
    }, []);

    const captureCursorPosition = () => {
        if (inputRef.current) {
            cursorPositionRef.current = {
                start: inputRef.current.selectionStart,
                end: inputRef.current.selectionEnd
            };
        }
    };

    const handleVoiceToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        if (!speechSupported) {
            toast.error("Voice typing is not supported in this browser. Please use Chrome, Edge, or Safari.", {
                id: "voice-unsupported-toast"
            });
            return;
        }

        if (isListening) {
            if (activeSessionStop) {
                activeSessionStop();
            }
            return;
        }

        // Stop any currently running recognition in other inputs
        if (activeSessionStop) {
            try {
                activeSessionStop();
            } catch {
                // ignore
            }
            activeSessionStop = null;
        }

        // Capture cursor position before starting
        captureCursorPosition();

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = activeLanguage;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        const stopRecognition = () => {
            try {
                recognition.stop();
            } catch {
                // ignore
            }
            setIsListening(false);
            setIsProcessing(false);
            if (activeSessionStop === stopRecognition) {
                activeSessionStop = null;
            }
        };

        activeSessionStop = stopRecognition;

        recognition.onstart = () => {
            setIsListening(true);
            setIsProcessing(false);
        };

        recognition.onaudiostart = () => {
            setIsListening(true);
        };

        recognition.onspeechend = () => {
            setIsProcessing(true);
        };

        recognition.onresult = (event) => {
            setIsProcessing(false);
            setIsListening(false);

            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join(" ")
                .trim();

            if (transcript) {
                const currentVal = value != null ? String(value) : "";
                const { start, end } = cursorPositionRef.current;

                let updatedVal = "";
                if (typeof start === "number" && typeof end === "number" && start >= 0) {
                    const before = currentVal.slice(0, start);
                    const after = currentVal.slice(end);
                    const spaceBefore = before.length > 0 && !before.endsWith(" ") ? " " : "";
                    const spaceAfter = after.length > 0 && !after.startsWith(" ") ? " " : "";
                    updatedVal = `${before}${spaceBefore}${transcript}${spaceAfter}${after}`;
                } else {
                    const space = currentVal.length > 0 && !currentVal.endsWith(" ") ? " " : "";
                    updatedVal = `${currentVal}${space}${transcript}`;
                }

                if (onChange) {
                    const syntheticEvent = {
                        target: {
                            name: name || "",
                            value: updatedVal,
                            type: multiline ? "textarea" : "text"
                        },
                        currentTarget: {
                            name: name || "",
                            value: updatedVal
                        }
                    };
                    onChange(syntheticEvent);
                }

                if (onVoiceSuccess) {
                    onVoiceSuccess(transcript, updatedVal);
                }

                toast.success("Voice input added", {
                    id: "voice-input-toast",
                    duration: 1600
                });

                // Refocus input and restore updated cursor position
                setTimeout(() => {
                    if (inputRef.current) {
                        inputRef.current.focus();
                        const nextCursorPos = (typeof start === "number" ? start : currentVal.length) + transcript.length + 1;
                        if (typeof inputRef.current.setSelectionRange === "function") {
                            inputRef.current.setSelectionRange(nextCursorPos, nextCursorPos);
                        }
                    }
                }, 50);
            }
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            setIsProcessing(false);
            if (activeSessionStop === stopRecognition) {
                activeSessionStop = null;
            }

            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                toast.error("Microphone permission denied. Please allow microphone access in your browser settings.", {
                    id: "voice-perm-toast"
                });
            } else if (event.error === "no-speech") {
                toast("No speech detected. Tap the mic to try again.", {
                    id: "voice-nospeech-toast",
                    icon: "🎙️"
                });
            } else if (event.error === "network") {
                toast.error("Network connection error during voice recognition.", {
                    id: "voice-net-toast"
                });
            } else if (event.error === "language-not-supported") {
                toast.error(`Language '${activeLanguage}' is not supported by this browser.`, {
                    id: "voice-lang-toast"
                });
            } else if (event.error !== "aborted") {
                toast.error(`Voice recognition error: ${event.error}`, {
                    id: "voice-general-error"
                });
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setIsProcessing(false);
            if (activeSessionStop === stopRecognition) {
                activeSessionStop = null;
            }
        };

        try {
            recognition.start();
        } catch (err) {
            setIsListening(false);
            setIsProcessing(false);
            activeSessionStop = null;
            toast.error("Could not start voice recognition. Please try again.");
        }
    };

    // Calculate padding class so typed text never overlaps mic icon
    const paddingClass = showVoiceButton ? "pr-11 sm:pr-12" : "";

    return (
        <div className="relative w-full">
            {multiline ? (
                <textarea
                    ref={inputRef}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onSelect={captureCursorPosition}
                    onKeyUp={captureCursorPosition}
                    onClick={captureCursorPosition}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    rows={rows}
                    maxLength={maxLength}
                    autoFocus={autoFocus}
                    className={`${className} ${paddingClass}`}
                    {...rest}
                />
            ) : (
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onSelect={captureCursorPosition}
                    onKeyUp={captureCursorPosition}
                    onClick={captureCursorPosition}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    maxLength={maxLength}
                    autoFocus={autoFocus}
                    className={`${className} ${paddingClass}`}
                    {...rest}
                />
            )}

            {showVoiceButton && (
                <div
                    className={`absolute z-10 flex items-center gap-1 ${
                        multiline ? "top-2.5 right-2 sm:right-2.5" : "top-1/2 -translate-y-1/2 right-2 sm:right-2.5"
                    }`}
                >
                    {isListening && (
                        <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse pointer-events-none">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                            Listening...
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={handleVoiceToggle}
                        disabled={disabled}
                        title={
                            !speechSupported
                                ? "Voice recognition unsupported in this browser"
                                : isListening
                                ? "Listening... Tap to stop"
                                : `Voice typing (${activeLanguage})`
                        }
                        aria-label={
                            isListening
                                ? "Stop voice typing"
                                : `Start voice typing in ${activeLanguage}`
                        }
                        aria-pressed={isListening}
                        className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            isListening
                                ? "bg-rose-100 text-rose-600 ring-2 ring-rose-500/40 shadow-sm dark:bg-rose-950 dark:text-rose-300 animate-pulse"
                                : isProcessing
                                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                                : speechSupported
                                ? "text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                                : "text-gray-300 dark:text-gray-600 opacity-60 cursor-not-allowed"
                        }`}
                    >
                        {isProcessing ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                        ) : isListening ? (
                            <Mic className="h-4 w-4 text-rose-600 dark:text-rose-400 fill-rose-600" />
                        ) : !speechSupported ? (
                            <MicOff className="h-4 w-4" />
                        ) : (
                            <Mic className="h-4 w-4" />
                        )}
                    </button>
                </div>
            )}
        </div>
    );
});

export const VoiceTextarea = forwardRef(function VoiceTextarea(props, ref) {
    return <VoiceInput ref={ref} multiline={true} {...props} />;
});

export default VoiceInput;
