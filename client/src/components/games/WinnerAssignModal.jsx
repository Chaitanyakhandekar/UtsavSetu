import React, { useState, useEffect } from "react";
import { X, Award, Search, UserCheck, Home, Phone, FileText, Check } from "lucide-react";
import { householdApi } from "../../api/household.api.js";
import toast from "react-hot-toast";

const WinnerAssignModal = ({
    isOpen,
    onClose,
    onSave,
    group,
    position,
    existingWinner,
    isSubmitting,
}) => {
    const [winnerName, setWinnerName] = useState("");
    const [participantPhone, setParticipantPhone] = useState("");
    const [householdId, setHouseholdId] = useState(null);
    const [householdInfo, setHouseholdInfo] = useState("");
    const [note, setNote] = useState("");

    // Resident Search Drawer / Selector State
    const [showResidentSelector, setShowResidentSelector] = useState(false);
    const [residentSearch, setResidentSearch] = useState("");
    const [householdsList, setHouseholdsList] = useState([]);
    const [searchingHouseholds, setSearchingHouseholds] = useState(false);

    useEffect(() => {
        if (existingWinner) {
            setWinnerName(existingWinner.winnerName || "");
            setParticipantPhone(existingWinner.participantPhone || "");
            setHouseholdId(existingWinner.householdId?._id || existingWinner.householdId || null);
            setHouseholdInfo(existingWinner.householdInfo || "");
            setNote(existingWinner.note || "");
        } else {
            setWinnerName("");
            setParticipantPhone("");
            setHouseholdId(null);
            setHouseholdInfo("");
            setNote("");
        }
        setShowResidentSelector(false);
    }, [existingWinner, position, isOpen]);

    // Fetch households when resident search drawer is opened
    useEffect(() => {
        if (!showResidentSelector) return;

        const timer = setTimeout(async () => {
            setSearchingHouseholds(true);
            try {
                const res = await householdApi.getHouseholds({
                    search: residentSearch,
                    limit: 15,
                });
                if (res.success && res.data) {
                    setHouseholdsList(res.data.households || res.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setSearchingHouseholds(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [residentSearch, showResidentSelector]);

    if (!isOpen) return null;

    const positionDetails = {
        1: { label: "1st Place Winner", medal: "🥇", color: "text-amber-600" },
        2: { label: "2nd Place Runner-Up", medal: "🥈", color: "text-slate-600" },
        3: { label: "3rd Place Runner-Up", medal: "🥉", color: "text-orange-600" },
    }[position] || { label: "Winner", medal: "🏅", color: "text-indigo-600" };

    const handleSelectHousehold = (h) => {
        setWinnerName(h.headOfFamily || "");
        setParticipantPhone(h.phone || "");
        setHouseholdId(h._id);
        const info = `Bldg ${h.building} • ${h.wing}-${h.flatNumber} (${h.headOfFamily})`;
        setHouseholdInfo(info);
        setShowResidentSelector(false);
        toast.success(`Selected resident: ${h.headOfFamily}`);
    };

    const handleClearHousehold = () => {
        setHouseholdId(null);
        setHouseholdInfo("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!winnerName.trim()) {
            toast.error("Winner name is required");
            return;
        }

        onSave({
            groupId: group._id,
            position,
            winnerName: winnerName.trim(),
            participantPhone: participantPhone.trim(),
            householdId,
            householdInfo: householdInfo.trim(),
            note: note.trim(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-lg my-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 text-lg sm:text-xl">
                            {positionDetails.medal}
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                Assign {positionDetails.label}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[240px] sm:max-w-xs">
                                Category Group: <span className="font-semibold text-gray-800 dark:text-gray-200">{group?.name}</span>
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

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
                        {/* Winner Name Input */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Winner Full Name <span className="text-rose-500">*</span>
                                </label>
                                {!showResidentSelector && (
                                    <button
                                        type="button"
                                        onClick={() => setShowResidentSelector(true)}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
                                    >
                                        <Search className="h-3 w-3" />
                                        Select from Residents
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={winnerName}
                                onChange={(e) => setWinnerName(e.target.value)}
                                placeholder="e.g. Rahul Patil"
                                required
                                autoFocus
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                            />
                        </div>

                        {/* Optional Resident Selector Box */}
                        {showResidentSelector && (
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                        <Home className="h-3.5 w-3.5 text-indigo-500" />
                                        Resident Database Search
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowResidentSelector(false)}
                                        className="text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        Close
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={residentSearch}
                                    onChange={(e) => setResidentSearch(e.target.value)}
                                    placeholder="Search by name, wing or flat number..."
                                    className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 dark:border-indigo-800 dark:bg-gray-900 dark:text-gray-100"
                                />

                                <div className="mt-2 max-h-36 overflow-y-auto space-y-1">
                                    {searchingHouseholds ? (
                                        <p className="py-2 text-center text-xs text-gray-400">Searching...</p>
                                    ) : householdsList.length === 0 ? (
                                        <p className="py-2 text-center text-xs text-gray-400">No matching residents found</p>
                                    ) : (
                                        householdsList.map((h) => (
                                            <button
                                                key={h._id}
                                                type="button"
                                                onClick={() => handleSelectHousehold(h)}
                                                className="w-full text-left flex items-center justify-between rounded-lg p-2 text-xs hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 transition-colors"
                                            >
                                                <div>
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">{h.headOfFamily}</span>
                                                    <span className="ml-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                                                        (Bldg {h.building}, {h.wing}-{h.flatNumber})
                                                    </span>
                                                </div>
                                                {h.phone && <span className="text-[10px] text-gray-400">{h.phone}</span>}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Linked Household Info Pill */}
                        {householdInfo && (
                            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                                <div className="flex items-center gap-1.5">
                                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Linked: <strong className="font-semibold">{householdInfo}</strong></span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClearHousehold}
                                    className="text-[11px] font-bold text-emerald-700 hover:text-rose-600 underline"
                                >
                                    Unlink
                                </button>
                            </div>
                        )}

                        {/* Phone Number (Optional) */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Contact / Phone Number (Optional)
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="tel"
                                    value={participantPhone}
                                    onChange={(e) => setParticipantPhone(e.target.value)}
                                    placeholder="e.g. 9876543210"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Note / Remarks */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Remark / Note (Optional)
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g. Outstanding performance, Certificate awarded"
                                maxLength={200}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
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
                            {isSubmitting ? "Saving..." : "Save Winner"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WinnerAssignModal;
