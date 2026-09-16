import React from "react";
import { Trophy, Calendar, Clock, MapPin, Award, Users, ChevronRight, Edit3, Trash2, CheckCircle2 } from "lucide-react";

const GameCard = ({ game, onViewDetails, onEdit, onDelete, onStatusToggle }) => {
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

    const statusConfig = {
        Upcoming: {
            label: "Upcoming",
            badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50",
            dotClass: "bg-blue-500",
        },
        Ongoing: {
            label: "Ongoing",
            badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50",
            dotClass: "bg-amber-500 animate-pulse",
        },
        Completed: {
            label: "Completed",
            badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50",
            dotClass: "bg-emerald-500",
        },
    }[game.status] || {
        label: game.status,
        badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
        dotClass: "bg-gray-400",
    };

    return (
        <div className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-gray-800/90 dark:bg-gray-900 dark:hover:border-indigo-800">
            {/* Top Bar: Title & Status */}
            <div>
                <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                                {game.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                    {formatDate(game.date)}
                                </span>
                                {(game.startTime || game.endTime) && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                        {game.startTime || ""} {game.endTime ? `– ${game.endTime}` : ""}
                                    </span>
                                )}
                                {game.location && (
                                    <span className="flex items-center gap-1 truncate max-w-[140px] sm:max-w-xs">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                        <span className="truncate">{game.location}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusConfig.badgeClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                        {statusConfig.label}
                    </span>
                </div>

                {/* Description if present */}
                {game.description && (
                    <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {game.description}
                    </p>
                )}

                {/* Metrics Pill Row */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-50/80 p-2.5 dark:bg-gray-800/40">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                            <span className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                                Groups
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                                {game.groupCount || 0} {game.groupCount === 1 ? "Category" : "Categories"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                            <span className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                                Winners Declared
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                                {game.winnerCount || 0} Recorded
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onEdit(game)}
                        className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
                        title="Edit Game Details"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(game)}
                        className="rounded-xl p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                        title="Delete Game"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => onViewDetails(game)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white active:bg-indigo-700 transition-all dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white"
                >
                    View Details & Results
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default GameCard;
