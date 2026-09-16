import React from "react";
import { Medal, UserCheck, Edit3, Trash2, Plus, Phone, Home } from "lucide-react";

const WinnerPositionCard = ({ position, winner, onAssign, onClear }) => {
    const config = {
        1: {
            title: "1st Place",
            subtitle: "Winner",
            medal: "🥇",
            badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
            cardBorder: "border-amber-200/80 dark:border-amber-900/40",
            headerBg: "bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/10",
            accentText: "text-amber-700 dark:text-amber-400",
            actionBtn: "hover:bg-amber-100 text-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30",
        },
        2: {
            title: "2nd Place",
            subtitle: "Runner Up",
            medal: "🥈",
            badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700",
            cardBorder: "border-slate-200 dark:border-slate-800",
            headerBg: "bg-gradient-to-r from-slate-50 to-gray-50/50 dark:from-slate-900/40 dark:to-gray-900/20",
            accentText: "text-slate-700 dark:text-slate-300",
            actionBtn: "hover:bg-slate-200 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
        },
        3: {
            title: "3rd Place",
            subtitle: "2nd Runner Up",
            medal: "🥉",
            badgeClass: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60",
            cardBorder: "border-orange-200/80 dark:border-orange-900/40",
            headerBg: "bg-gradient-to-r from-orange-50 to-amber-50/40 dark:from-orange-950/20 dark:to-amber-950/10",
            accentText: "text-orange-700 dark:text-orange-400",
            actionBtn: "hover:bg-orange-100 text-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30",
        },
    }[position] || {
        title: `${position}th Place`,
        subtitle: "",
        medal: "🏅",
        badgeClass: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800",
        cardBorder: "border-gray-200 dark:border-gray-800",
        headerBg: "bg-gray-50 dark:bg-gray-900",
        accentText: "text-gray-700 dark:text-gray-300",
        actionBtn: "hover:bg-gray-100 text-gray-700",
    };

    return (
        <div className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border ${config.cardBorder} bg-white shadow-sm transition-all duration-150 hover:shadow dark:bg-gray-900`}>
            {/* Header / Position Badge */}
            <div className={`flex items-center justify-between border-b border-gray-100 px-3.5 py-2.5 dark:border-gray-800 ${config.headerBg}`}>
                <div className="flex items-center gap-2">
                    <span className="text-base" role="img" aria-label={config.title}>
                        {config.medal}
                    </span>
                    <div>
                        <span className={`text-xs font-bold tracking-tight ${config.accentText}`}>
                            {config.title}
                        </span>
                        <span className="hidden sm:inline-block ml-1.5 text-[10px] text-gray-400 font-medium">
                            • {config.subtitle}
                        </span>
                    </div>
                </div>

                {winner ? (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onAssign(position, winner)}
                            className={`rounded-lg p-1 transition-colors ${config.actionBtn}`}
                            title="Edit Winner"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onClear(position, winner)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                            title="Clear Position"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : null}
            </div>

            {/* Body */}
            <div className="p-3.5 flex-1 flex flex-col justify-center">
                {winner ? (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <UserCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                            <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-tight break-words">
                                {winner.winnerName}
                            </h4>
                        </div>

                        {/* Household or Resident reference */}
                        {winner.householdInfo && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                                <Home className="h-3 w-3 shrink-0 text-gray-400" />
                                <span className="truncate">{winner.householdInfo}</span>
                            </div>
                        )}

                        {/* Phone if provided */}
                        {winner.participantPhone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                                <Phone className="h-3 w-3 shrink-0 text-gray-400" />
                                <span>{winner.participantPhone}</span>
                            </div>
                        )}

                        {/* Note if provided */}
                        {winner.note && (
                            <p className="text-[11px] italic text-gray-400 dark:text-gray-500 line-clamp-2">
                                "{winner.note}"
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="py-2 text-center">
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 italic">
                            Not Assigned
                        </p>
                        <button
                            type="button"
                            onClick={() => onAssign(position, null)}
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed px-3 py-1.5 text-xs font-semibold transition-colors ${config.cardBorder} ${config.accentText} hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Assign Winner
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WinnerPositionCard;
