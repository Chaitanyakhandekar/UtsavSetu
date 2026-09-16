import React, { useState, useEffect } from "react";
import { Award, Medal, Search, Calendar, Trophy, Users, Home, Phone, Filter } from "lucide-react";
import { gameApi } from "../../api/game.api.js";
import toast from "react-hot-toast";

const AllWinnersView = ({ selectedYear, onOpenGameDetails }) => {
    const [winners, setWinners] = useState([]);
    const [counts, setCounts] = useState({ 1: 0, 2: 0, 3: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [positionFilter, setPositionFilter] = useState("all"); // "all", "1", "2", "3"
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAllWinners = async () => {
        if (!selectedYear) return;
        setLoading(true);
        try {
            const params = { festivalYear: selectedYear };
            if (positionFilter !== "all") params.position = positionFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await gameApi.getAllWinners(params);
            if (res.success && res.data) {
                setWinners(res.data.winners || []);
                setCounts(res.data.counts || { 1: 0, 2: 0, 3: 0, total: 0 });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load winners directory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllWinners();
    }, [selectedYear, positionFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAllWinners();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const formatDate = (d) => {
        if (!d) return "-";
        const date = new Date(d);
        if (isNaN(date.getTime())) return String(d);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const positionBadges = {
        1: {
            label: "1st Place",
            medal: "🥇",
            badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
        },
        2: {
            label: "2nd Place",
            medal: "🥈",
            badge: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700",
        },
        3: {
            label: "3rd Place",
            medal: "🥉",
            badge: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60",
        },
    };

    return (
        <div className="space-y-4">
            {/* Top Aggregates Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-3.5 sm:p-4 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:to-gray-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">🥇 1st Position</span>
                        <Medal className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="mt-1.5 block text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {counts[1] || 0}
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3.5 sm:p-4 shadow-sm dark:border-slate-800 dark:from-slate-900/40 dark:to-gray-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">🥈 2nd Position</span>
                        <Medal className="h-4 w-4 text-slate-400" />
                    </div>
                    <span className="mt-1.5 block text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {counts[2] || 0}
                    </span>
                </div>

                <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50 to-white p-3.5 sm:p-4 shadow-sm dark:border-orange-900/40 dark:from-orange-950/20 dark:to-gray-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-400">🥉 3rd Position</span>
                        <Medal className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="mt-1.5 block text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {counts[3] || 0}
                    </span>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-3.5 sm:p-4 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-gray-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Total Awardees</span>
                        <Award className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="mt-1.5 block text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {counts.total || 0}
                    </span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-gray-200/90 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search winner by name, flat or notes..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3.5 py-2 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                    />
                </div>

                {/* Position Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto p-0.5 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
                    {[
                        { id: "all", label: "All" },
                        { id: "1", label: "🥇 1st" },
                        { id: "2", label: "🥈 2nd" },
                        { id: "3", label: "🥉 3rd" },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={() => setPositionFilter(btn.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                                positionFilter === btn.id
                                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Winners List */}
            {loading ? (
                <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="mt-2 text-xs text-gray-400">Loading festival winners...</p>
                </div>
            ) : winners.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
                    <Award className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <h4 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">
                        No winners found
                    </h4>
                    <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
                        Record results inside games and category groups to see winners listed here.
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {winners.map((w) => {
                        const badgeInfo = positionBadges[w.position] || {
                            label: `${w.position}th Place`,
                            medal: "🏅",
                            badge: "bg-gray-100 text-gray-800",
                        };

                        return (
                            <div
                                key={w._id}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200/90 bg-white p-3.5 sm:p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <span className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-black shrink-0 ${badgeInfo.badge}`}>
                                        <span>{badgeInfo.medal}</span>
                                        <span>{badgeInfo.label}</span>
                                    </span>

                                    <div className="min-w-0">
                                        <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate">
                                            {w.winnerName}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                            {w.householdInfo && (
                                                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                                                    <Home className="h-3 w-3 shrink-0" />
                                                    <span className="truncate">{w.householdInfo}</span>
                                                </span>
                                            )}
                                            {w.participantPhone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                                                    <span>{w.participantPhone}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap sm:flex-col sm:items-end gap-x-3 gap-y-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                        <Trophy className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                        {w.gameId?.name || "Game"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                        {w.groupId?.name || "Group"}
                                        {w.groupId?.category && ` (${w.groupId.category})`}
                                    </span>
                                    {w.gameId?.date && (
                                        <span className="text-[11px] text-gray-400">
                                            {formatDate(w.gameId.date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AllWinnersView;
