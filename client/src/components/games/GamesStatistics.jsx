import React from "react";
import { Trophy, Award, Medal, Users, Calendar, CheckCircle2, Clock, PlayCircle } from "lucide-react";

const GamesStatistics = ({ stats, loading }) => {
    const s = stats || {};

    const statCards = [
        {
            title: "Total Games",
            value: s.totalGames || 0,
            icon: Trophy,
            color: "text-indigo-600 dark:text-indigo-400",
            bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
            border: "border-indigo-100 dark:border-indigo-900/30",
        },
        {
            title: "Total Groups",
            value: s.totalGroups || 0,
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-950/40",
            border: "border-blue-100 dark:border-blue-900/30",
        },
        {
            title: "Total Winners",
            value: s.totalWinners || 0,
            icon: Award,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
            border: "border-emerald-100 dark:border-emerald-900/30",
        },
        {
            title: "1st Place",
            value: s.firstPlaceCount || 0,
            icon: Medal,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-950/40",
            border: "border-amber-100 dark:border-amber-900/30",
            badge: "🥇 Gold",
        },
        {
            title: "2nd Place",
            value: s.secondPlaceCount || 0,
            icon: Medal,
            color: "text-slate-600 dark:text-slate-400",
            bgColor: "bg-slate-100 dark:bg-slate-800/60",
            border: "border-slate-200 dark:border-slate-800",
            badge: "🥈 Silver",
        },
        {
            title: "3rd Place",
            value: s.thirdPlaceCount || 0,
            icon: Medal,
            color: "text-amber-700 dark:text-amber-600",
            bgColor: "bg-orange-50 dark:bg-orange-950/40",
            border: "border-orange-100 dark:border-orange-900/30",
            badge: "🥉 Bronze",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3.5">
            {statCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className={`relative overflow-hidden rounded-2xl border ${card.border} bg-white p-3 sm:p-4 shadow-sm transition-all duration-200 hover:shadow dark:bg-gray-900`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                                {card.title}
                            </span>
                            <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl ${card.bgColor} ${card.color}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="mt-2 sm:mt-2.5 flex items-baseline justify-between">
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                                {loading ? (
                                    <span className="inline-block h-6 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                                ) : (
                                    card.value
                                )}
                            </span>
                            {card.badge && (
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                    {card.badge}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GamesStatistics;
