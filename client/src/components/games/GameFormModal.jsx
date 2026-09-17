import React, { useState, useEffect } from "react";
import { X, Trophy, Calendar, Clock, MapPin, Users, FileText, Check } from "lucide-react";
import toast from "react-hot-toast";
import { VoiceInput, VoiceTextarea } from "../VoiceInput.jsx";

const GameFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingGame,
    isSubmitting,
}) => {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Upcoming");
    const [participantCount, setParticipantCount] = useState("");

    useEffect(() => {
        if (editingGame) {
            setName(editingGame.name || "");
            if (editingGame.date) {
                const d = new Date(editingGame.date);
                setDate(d.toISOString().split("T")[0]);
            } else {
                setDate("");
            }
            setStartTime(editingGame.startTime || "");
            setEndTime(editingGame.endTime || "");
            setLocation(editingGame.location || "");
            setDescription(editingGame.description || "");
            setStatus(editingGame.status || "Upcoming");
            setParticipantCount(editingGame.participantCount != null ? String(editingGame.participantCount) : "");
        } else {
            setName("");
            // Default to today's date
            setDate(new Date().toISOString().split("T")[0]);
            setStartTime("");
            setEndTime("");
            setLocation("");
            setDescription("");
            setStatus("Upcoming");
            setParticipantCount("");
        }
    }, [editingGame, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Game/Event name is required");
            return;
        }
        if (!date) {
            toast.error("Game date is required");
            return;
        }

        onSubmit({
            name: name.trim(),
            date: new Date(date).toISOString(),
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            location: location.trim(),
            description: description.trim(),
            status,
            participantCount: participantCount !== "" ? Number(participantCount) : 0,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-lg my-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {editingGame ? "Edit Game / Event" : "Create New Game / Event"}
                            </h3>
                            <p className="text-xs text-gray-400">
                                {editingGame ? "Update competition details & schedule" : "Set up games, races or cultural contests"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
                        {/* Game Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Game / Competition Name <span className="text-rose-500">*</span>
                            </label>
                            <VoiceInput
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Drawing Competition, Musical Chair, Running Race"
                                maxLength={100}
                                required
                                autoFocus
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                            />
                        </div>

                        {/* Date & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Date <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                                >
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Timings */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Start Time (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    placeholder="e.g. 10:00 AM"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    End Time (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    placeholder="e.g. 01:00 PM"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Location / Venue (Optional)
                            </label>
                            <VoiceInput
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Mandal Pandal, Society Garden, Clubhouse"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Description / Rules (Optional)
                            </label>
                            <VoiceTextarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="e.g. Drawing sheets will be provided; participants must bring their own colors."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 resize-none"
                            />
                        </div>

                        {/* Participant Count (Optional) */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Estimated / Actual Participants (Optional)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={participantCount}
                                onChange={(e) => setParticipantCount(e.target.value)}
                                placeholder="e.g. 45"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 transition-colors disabled:opacity-50"
                        >
                            <Check className="h-4 w-4" />
                            {isSubmitting ? "Saving..." : editingGame ? "Update Game" : "Create Game"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GameFormModal;
