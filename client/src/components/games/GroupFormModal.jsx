import React, { useState, useEffect } from "react";
import { X, Users, Tag, AlertCircle, Check } from "lucide-react";
import toast from "react-hot-toast";
import { VoiceInput, VoiceTextarea } from "../VoiceInput.jsx";

const GroupFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingGroup,
    gameName,
    isSubmitting,
}) => {
    const [name, setName] = useState("");
    const [ageMin, setAgeMin] = useState("");
    const [ageMax, setAgeMax] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [participantCount, setParticipantCount] = useState("");

    useEffect(() => {
        if (editingGroup) {
            setName(editingGroup.name || "");
            setAgeMin(editingGroup.ageMin != null ? String(editingGroup.ageMin) : "");
            setAgeMax(editingGroup.ageMax != null ? String(editingGroup.ageMax) : "");
            setCategory(editingGroup.category || "");
            setDescription(editingGroup.description || "");
            setParticipantCount(editingGroup.participantCount != null ? String(editingGroup.participantCount) : "");
        } else {
            setName("");
            setAgeMin("");
            setAgeMax("");
            setCategory("");
            setDescription("");
            setParticipantCount("");
        }
    }, [editingGroup, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Group name is required");
            return;
        }

        const min = ageMin !== "" ? Number(ageMin) : null;
        const max = ageMax !== "" ? Number(ageMax) : null;

        if (min !== null && max !== null && min > max) {
            toast.error("Maximum age cannot be less than minimum age");
            return;
        }

        onSubmit({
            name: name.trim(),
            ageMin: min,
            ageMax: max,
            category: category.trim(),
            description: description.trim(),
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
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {editingGroup ? "Edit Category Group" : "Add Category Group"}
                            </h3>
                            <p className="text-xs text-gray-400 truncate max-w-[240px] sm:max-w-xs">
                                For: <span className="font-semibold text-gray-800 dark:text-gray-200">{gameName}</span>
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
                        {/* Group Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Group Name / Title <span className="text-rose-500">*</span>
                            </label>
                            <VoiceInput
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Small Group, Big Group, Age 1–10, Kids, Boys"
                                maxLength={80}
                                required
                                autoFocus
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                            />
                        </div>

                        {/* Age Criteria */}
                        <div className="grid grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Min Age (Years)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={120}
                                    value={ageMin}
                                    onChange={(e) => setAgeMin(e.target.value)}
                                    placeholder="e.g. 1"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Max Age (Years)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={120}
                                    value={ageMax}
                                    onChange={(e) => setAgeMax(e.target.value)}
                                    placeholder="e.g. 10"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Category / Gender */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Category / Gender (Optional)
                            </label>
                            <VoiceInput
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g. Boys, Girls, Mixed, Adults, Senior Citizens"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Group Notes (Optional)
                            </label>
                            <VoiceTextarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                placeholder="e.g. Standard 100m sprint line, 8 participants per heat"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 resize-none"
                            />
                        </div>

                        {/* Participant Count */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Registered Participants in this Group (Optional)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={participantCount}
                                onChange={(e) => setParticipantCount(e.target.value)}
                                placeholder="e.g. 18"
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
                            {isSubmitting ? "Saving..." : editingGroup ? "Update Group" : "Add Group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GroupFormModal;
