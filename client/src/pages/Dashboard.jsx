import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { useMandalStore } from "../store/useMandalStore.js";
import { userAuthStore } from "../store/userStore.js";
import { reportApi } from "../api/report.api.js";
import { gameApi } from "../api/game.api.js";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Scale,
    Activity,
    Home as HomeIcon,
    Users,
    Building2,
    UtensilsCrossed,
    Plus,
    Minus,
    MoreVertical,
    CalendarDays,
    ArrowUpRight,
    Wallet,
    Smartphone,
    Sparkles,
    MapPin,
    Clock,
    Trophy,
    ChevronDown,
    UserPlus,
    Calendar
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORY_COLORS = {
    Decoration: "#6366f1",
    Food: "#ef4444",
    Sound: "#f59e0b",
    Lighting: "#0ea5e9",
    Miscellaneous: "#10b981",
    Visarjan: "#14b8a6",
    Security: "#64748b",
    Puja: "#ec4899",
    Stage: "#8b5cf6"
};

const PALETTE = ["#6366f1", "#ef4444", "#f59e0b", "#0ea5e9", "#10b981", "#14b8a6", "#64748b", "#ec4899", "#8b5cf6"];

const Dashboard = () => {
    const { selectedYear } = useMandalStore();
    const { user } = userAuthStore();
    const [stats, setStats] = useState({
        totalDonations: 0,
        totalCollectedDonations: 0,
        totalPledgedDonations: 0,
        totalPendingDonations: 0,
        totalExpenses: 0,
        currentBalance: 0,
        totalCashCollected: 0,
        totalUpiCollected: 0,
        totalBankCollected: 0,
        cashBalance: 0,
        upiBalance: 0,
        bankBalance: 0,
        expenseCashOutflow: 0,
        expenseUpiOutflow: 0,
        totalTransactions: 0,
        recentActivity: [],
        expensesByCategory: [],
        donationsByPaymentMethod: [],
        monthlyComparison: [],
        totalResidentDonations: 0,
        totalExternalDonorDonations: 0,
        donationsByDonorType: [],
        residentStats: {
            totalHouseholds: 0,
            totalRegisteredFlats: 0,
            totalExpectedFlats: 0,
            remainingFlats: 0,
            totalResidents: 0,
            buildings: [],
            wings: [],
            unregisteredFlats: []
        },
        mahaprasad: {
            registeredHouseholds: 0,
            totalPeople: 0,
            expectedAttendance: 0,
            recommendedMeals: 0
        }
    });
    const [upcomingActivities, setUpcomingActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState("1Y");

    const fetchDashboardData = useCallback(async () => {
        if (!selectedYear) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [response, gamesRes] = await Promise.all([
                reportApi.getDashboardStats({ festivalYear: selectedYear }),
                gameApi.getGames({ festivalYear: selectedYear, limit: 4 })
            ]);

            if (response.success) {
                const data = response.data || {};
                const rs = data.residentStats || {};
                const mp = data.mahaprasad || {};
                setStats({
                    totalDonations: data.totalDonations ?? 0,
                    totalCollectedDonations: data.totalCollectedDonations ?? (data.totalDonations ?? 0),
                    totalPledgedDonations: data.totalPledgedDonations ?? 0,
                    totalPendingDonations: data.totalPendingDonations ?? 0,
                    totalExpenses: data.totalExpenses ?? 0,
                    currentBalance: data.currentBalance ?? 0,
                    totalCashCollected: data.totalCashCollected ?? 0,
                    totalUpiCollected: data.totalUpiCollected ?? 0,
                    totalBankCollected: data.totalBankCollected ?? 0,
                    cashBalance: data.cashBalance ?? 0,
                    upiBalance: data.upiBalance ?? 0,
                    bankBalance: data.bankBalance ?? 0,
                    expenseCashOutflow: data.expenseCashOutflow ?? 0,
                    expenseUpiOutflow: data.expenseUpiOutflow ?? 0,
                    totalTransactions: data.totalTransactions ?? 0,
                    recentActivity: data.recentActivity ?? [],
                    expensesByCategory: data.expensesByCategory ?? [],
                    donationsByPaymentMethod: data.donationsByPaymentMethod ?? [],
                    monthlyComparison: data.monthlyComparison ?? [],
                    totalResidentDonations: data.totalResidentDonations ?? 0,
                    totalExternalDonorDonations: data.totalExternalDonorDonations ?? 0,
                    donationsByDonorType: data.donationsByDonorType ?? [],
                    residentStats: {
                        totalHouseholds: rs.totalHouseholds ?? 0,
                        totalRegisteredFlats: rs.totalRegisteredFlats ?? 0,
                        totalExpectedFlats: rs.totalExpectedFlats ?? 0,
                        remainingFlats: rs.remainingFlats ?? 0,
                        totalResidents: rs.totalResidents ?? 0,
                        buildings: rs.buildings ?? [],
                        wings: rs.wings ?? [],
                        unregisteredFlats: rs.unregisteredFlats ?? []
                    },
                    mahaprasad: {
                        registeredHouseholds: mp.registeredHouseholds ?? 0,
                        totalPeople: mp.totalPeople ?? 0,
                        expectedAttendance: mp.expectedAttendance ?? 0,
                        recommendedMeals: mp.recommendedMeals ?? 0
                    }
                });
            } else {
                toast.error(response.message || "Failed to load dashboard data");
            }

            if (gamesRes?.success && gamesRes?.data?.games) {
                setUpcomingActivities(gamesRes.data.games);
            }
        } catch (err) {
            toast.error("An error occurred while loading stats");
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        const handleDataRefresh = () => {
            fetchDashboardData();
        };
        window.addEventListener("dashboard-data-refresh", handleDataRefresh);
        return () => window.removeEventListener("dashboard-data-refresh", handleDataRefresh);
    }, [fetchDashboardData]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    // Calculate dynamic balance curve trajectory for Area chart
    const balanceTrendData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let runningBalance = 0;

        const monthlyMap = {};
        (stats.monthlyComparison || []).forEach((m) => {
            monthlyMap[m.month] = (m.donations || 0) - (m.expenses || 0);
        });

        const data = months.map((m) => {
            const diff = monthlyMap[m] !== undefined ? monthlyMap[m] : 0;
            runningBalance += diff;
            return {
                month: m,
                balance: runningBalance
            };
        });

        if (data.length > 0 && stats.currentBalance !== 0 && runningBalance === 0) {
            return [
                { month: "Jan", balance: 0 },
                { month: "Apr", balance: Math.round(stats.currentBalance * 0.2) },
                { month: "Jul", balance: Math.round(stats.currentBalance * 0.6) },
                { month: "Aug", balance: stats.currentBalance },
                { month: "Dec", balance: stats.currentBalance }
            ];
        }

        return data;
    }, [stats.monthlyComparison, stats.currentBalance]);

    // Categories with percentage
    const categoryBreakdown = useMemo(() => {
        const totalExp = stats.expensesByCategory.reduce((sum, item) => sum + (item.amount || 0), 0) || stats.totalExpenses || 1;
        return (stats.expensesByCategory || []).map((entry, index) => ({
            ...entry,
            percentage: Math.max(1, Math.round(((entry.amount || 0) / totalExp) * 100)),
            color: CATEGORY_COLORS[entry.category] || PALETTE[index % PALETTE.length]
        }));
    }, [stats.expensesByCategory, stats.totalExpenses]);

    // Dynamic donation breakdown donut data
    const donationDonutData = useMemo(() => {
        const collected = stats.totalCollectedDonations || 0;
        const pending = stats.totalPendingDonations || 0;
        if (collected === 0 && pending === 0) {
            return [{ name: "No data", value: 1, color: "#e2e8f0" }];
        }
        return [
            { name: "Collected", value: collected, color: "#10b981" },
            { name: "Pending", value: pending, color: "#f59e0b" }
        ];
    }, [stats.totalCollectedDonations, stats.totalPendingDonations]);

    // Greeting logic
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    }, []);

    const userName = user?.name || user?.username || "Admin";

    const flatRegistrationPercent = useMemo(() => {
        if (!stats.residentStats.totalExpectedFlats) return 0;
        return Math.round((stats.residentStats.totalRegisteredFlats / stats.residentStats.totalExpectedFlats) * 100);
    }, [stats.residentStats]);

    if (!selectedYear) {
        return (
            <Layout>
                <div className="flex h-[60vh] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 dark:bg-indigo-950/40 dark:text-indigo-400">
                        <CalendarDays className="h-8 w-8" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        No Festival Year Selected
                    </h2>
                    <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                        Select an active festival year or create a new one from Settings to view your dashboard statistics.
                    </p>
                    <Link
                        to="/settings"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
                    >
                        Go to Settings
                    </Link>
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
                        <p className="text-xs font-medium text-slate-500">Loading Mandal statistics...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-4 sm:space-y-6">
                {/* ==================== 1. FESTIVAL HERO BANNER ==================== */}
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-200/70 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-indigo-50/60 p-4 sm:p-6 shadow-sm dark:border-amber-900/30 dark:from-amber-950/20 dark:via-gray-900 dark:to-indigo-950/20">
                    <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-2 max-w-2xl">
                            {/* Greeting & Festival Title */}
                            <div>
                                <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    {greeting}, {userName}! 👋
                                </span>
                                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
                                    Ganesh Festival {selectedYear}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Together for a cleaner, happier and more organized celebration 🙏
                                </p>
                            </div>

                            {/* Devotional Marathi Quote Strip */}
                            <div className="inline-flex items-center gap-2 rounded-xl bg-white/80 dark:bg-gray-800/70 px-3 py-1.5 border border-amber-200/60 dark:border-amber-900/40 text-[11px] sm:text-xs font-semibold text-amber-800 dark:text-amber-300 shadow-2xs">
                                <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 dark:text-amber-400" />
                                <span>॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥</span>
                            </div>

                            {/* Festival Badges: Faith • Unity • Service • Community */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
                                {["Faith", "Unity", "Service", "Community"].map((badge, idx) => (
                                    <span
                                        key={badge}
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold ${
                                            idx === 0
                                                ? "bg-amber-100/80 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                                                : idx === 1
                                                ? "bg-indigo-100/80 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300"
                                                : idx === 2
                                                ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                : "bg-purple-100/80 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300"
                                        }`}
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Festive Artwork Illustration */}
                        <div className="hidden md:flex shrink-0 items-center justify-center pr-2">
                            <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400/20 to-orange-400/20 p-2 shadow-inner">
                                <img
                                    src="/ganesh-artwork.png"
                                    alt="Shree Ganesh"
                                    className="max-h-24 max-w-24 object-contain drop-shadow"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== 2. QUICK ACTIONS ==================== */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-4">
                    <Link
                        to="/donations"
                        className="group flex items-center gap-2.5 rounded-2xl border border-indigo-100 bg-white p-3 sm:p-3.5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-indigo-950/50 dark:text-indigo-400">
                            <Plus className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate dark:text-white">
                                Add Donation
                            </div>
                            <div className="text-[10px] text-slate-500 truncate dark:text-slate-400">
                                Record contribution
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/expenses"
                        className="group flex items-center gap-2.5 rounded-2xl border border-rose-100 bg-white p-3 sm:p-3.5 shadow-2xs transition-all hover:border-rose-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors dark:bg-rose-950/50 dark:text-rose-400">
                            <Minus className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate dark:text-white">
                                Add Expense
                            </div>
                            <div className="text-[10px] text-slate-500 truncate dark:text-slate-400">
                                Outgoing payment
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/households"
                        className="group flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-white p-3 sm:p-3.5 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-950/50 dark:text-emerald-400">
                            <UserPlus className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate dark:text-white">
                                Add Household
                            </div>
                            <div className="text-[10px] text-slate-500 truncate dark:text-slate-400">
                                Register resident
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/games-events"
                        className="group flex items-center gap-2.5 rounded-2xl border border-amber-100 bg-white p-3 sm:p-3.5 shadow-2xs transition-all hover:border-amber-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors dark:bg-amber-950/50 dark:text-amber-400">
                            <Trophy className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate dark:text-white">
                                Add Game/Event
                            </div>
                            <div className="text-[10px] text-slate-500 truncate dark:text-slate-400">
                                Schedule activity
                            </div>
                        </div>
                    </Link>
                </div>

                {/* ==================== 3. FINANCIAL KPI CARDS ==================== */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                    {/* Total Donations */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
                                Total Donations
                            </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {formatCurrency(stats.totalCollectedDonations || stats.totalDonations)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
                                Pledged ₹{(stats.totalPledgedDonations || 0).toLocaleString("en-IN")} • Pending ₹{(stats.totalPendingDonations || 0).toLocaleString("en-IN")}
                            </div>
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                <TrendingDown className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
                                Total Expenses
                            </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {formatCurrency(stats.totalExpenses)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5 truncate">
                                Outgoing Payments
                            </div>
                        </div>
                    </div>

                    {/* Net Balance */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <Scale className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
                                Net Balance
                            </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className={`text-base sm:text-2xl font-bold tracking-tight ${stats.currentBalance >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-400"}`}>
                                {formatCurrency(stats.currentBalance)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 truncate">
                                Available in Ledger
                            </div>
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                                <Activity className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
                                Transactions
                            </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {stats.totalTransactions}
                            </div>
                            <div className="text-[10px] sm:text-xs text-sky-600 dark:text-sky-400 font-medium mt-0.5 truncate">
                                Logged Operations
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== 4. CASH, UPI & DONATION BREAKDOWN ==================== */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Cash in Hand */}
                    <div className="rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-white to-emerald-50/30 p-4 sm:p-5 shadow-2xs dark:border-emerald-900/30 dark:from-gray-900 dark:to-emerald-950/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                    <Wallet className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Cash in Hand
                                    </span>
                                    <div className="text-[10px] text-slate-400">Physical Cash Balance</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full dark:bg-emerald-900/40 dark:text-emerald-300">
                                Cash
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className={`text-xl sm:text-2xl font-bold tracking-tight ${stats.cashBalance >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600"}`}>
                                {formatCurrency(stats.cashBalance)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1 truncate">
                                Collected ₹{stats.totalCashCollected.toLocaleString("en-IN")} • Spent ₹{stats.expenseCashOutflow.toLocaleString("en-IN")}
                            </div>
                        </div>
                    </div>

                    {/* UPI / Online Account */}
                    <div className="rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-white to-indigo-50/30 p-4 sm:p-5 shadow-2xs dark:border-indigo-900/30 dark:from-gray-900 dark:to-indigo-950/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                    <Smartphone className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                                        UPI / Online Account
                                    </span>
                                    <div className="text-[10px] text-slate-400">Digital Bank Balance</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full dark:bg-indigo-900/40 dark:text-indigo-300">
                                UPI
                            </span>
                        </div>
                        <div className="mt-3">
                            <div className={`text-xl sm:text-2xl font-bold tracking-tight ${stats.upiBalance >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600"}`}>
                                {formatCurrency(stats.upiBalance)}
                            </div>
                            <div className="text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400 font-medium mt-1 truncate">
                                Collected ₹{stats.totalUpiCollected.toLocaleString("en-IN")} • Spent ₹{stats.expenseUpiOutflow.toLocaleString("en-IN")}
                            </div>
                        </div>
                    </div>

                    {/* Donation Breakdown Card with Mini Donut */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                                Donation Breakdown
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/40 dark:text-emerald-400">
                                {stats.totalPledgedDonations > 0
                                    ? `${Math.round(((stats.totalCollectedDonations || 0) / stats.totalPledgedDonations) * 100)}% Collected`
                                    : "Overview"}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center mt-3">
                            <div className="rounded-xl bg-slate-50 p-2 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-800">
                                <div className="text-[10px] text-slate-400 font-medium">Pledged</div>
                                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-0.5 truncate">
                                    ₹{stats.totalPledgedDonations.toLocaleString("en-IN")}
                                </div>
                            </div>
                            <div className="rounded-xl bg-emerald-50/70 p-2 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Collected</div>
                                <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">
                                    ₹{stats.totalCollectedDonations.toLocaleString("en-IN")}
                                </div>
                            </div>
                            <div className="rounded-xl bg-amber-50/70 p-2 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Pending</div>
                                <div className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 mt-0.5 truncate">
                                    ₹{stats.totalPendingDonations.toLocaleString("en-IN")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== 5. COMMUNITY STATISTICS ==================== */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                    {/* Registered Households */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <HomeIcon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
                                Registered Households
                            </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {stats.residentStats.totalHouseholds}
                            </div>
                            <div className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 truncate">
                                Active resident families
                            </div>
                        </div>
                    </div>

                    {/* Resident Population */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                                <Users className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
                                Resident Population
                            </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {stats.residentStats.totalResidents}
                            </div>
                            <div className="text-[10px] sm:text-xs text-sky-600 dark:text-sky-400 font-medium mt-0.5 truncate">
                                Family members in flats
                            </div>
                        </div>
                    </div>

                    {/* Flats Registered */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
                                Flats Registered
                            </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {stats.residentStats.totalRegisteredFlats} / {stats.residentStats.totalExpectedFlats}
                            </div>
                            <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
                                {flatRegistrationPercent}% registered
                            </div>
                        </div>
                    </div>

                    {/* Remaining / Maha Meals */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                <UtensilsCrossed className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
                                Remaining / Maha Meals
                            </span>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {stats.residentStats.remainingFlats}
                            </div>
                            <div className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5 truncate">
                                Unregistered • Mahaprasad: {stats.mahaprasad.recommendedMeals} meals
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== 6. CHARTS & UPCOMING ACTIVITIES ==================== */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Monthly Inflow vs Outflow */}
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                        Monthly Inflow vs Outflow
                                    </h3>
                                    <p className="text-[11px] text-slate-400">Donations vs Expenses by month</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg dark:bg-gray-800 dark:text-slate-300">
                                    <span>{selectedYear}</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
                                    <span className="text-[11px]">Donations</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                                    <span className="text-[11px]">Expenses</span>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="h-48 w-full text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.monthlyComparison} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                                            tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : val)}
                                        />
                                        <Tooltip
                                            formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, ""]}
                                            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                        />
                                        <Bar dataKey="donations" name="Donations" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={14} />
                                        <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={14} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Expenses by Category Donut Chart */}
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                        Expenses by Category
                                    </h3>
                                    <p className="text-[11px] text-slate-400">Budget distribution</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg dark:bg-gray-800 dark:text-slate-300">
                                    <span>This Year</span>
                                </div>
                            </div>

                            {categoryBreakdown.length === 0 ? (
                                <div className="flex h-44 items-center justify-center text-center">
                                    <p className="text-xs text-slate-400">No categorized expenses yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-12 items-center gap-2">
                                    {/* Donut Ring */}
                                    <div className="col-span-6 h-40 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={38}
                                                    outerRadius={58}
                                                    paddingAngle={3}
                                                    dataKey="amount"
                                                    nameKey="category"
                                                >
                                                    {categoryBreakdown.map((entry) => (
                                                        <Cell key={entry.category} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(val) => `₹${val.toLocaleString("en-IN")}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Right Category Legend with % */}
                                    <div className="col-span-6 space-y-1 max-h-40 overflow-y-auto pr-1">
                                        {categoryBreakdown.map((entry) => (
                                            <div key={entry.category} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span
                                                        className="h-2 w-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: entry.color }}
                                                    ></span>
                                                    <span className="text-slate-600 dark:text-slate-300 truncate text-[11px]">
                                                        {entry.category}
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-slate-900 dark:text-white text-[11px] shrink-0 ml-1">
                                                    {entry.percentage}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Total Summary */}
                        <div className="border-t border-slate-100 pt-2.5 dark:border-gray-800 flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400 font-medium">Total Expenses</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {formatCurrency(stats.totalExpenses)}
                            </span>
                        </div>
                    </div>

                    {/* Upcoming Activities & Schedule */}
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                        Upcoming Activities
                                    </h3>
                                    <p className="text-[11px] text-slate-400">Festival schedule & events</p>
                                </div>
                                <Link
                                    to="/games-events"
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    View All
                                </Link>
                            </div>

                            {upcomingActivities.length === 0 ? (
                                <div className="flex h-44 flex-col items-center justify-center text-center px-4">
                                    <Trophy className="h-8 w-8 text-slate-300 mb-1.5" />
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No scheduled activities</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Games, puja, and cultural events will appear here.</p>
                                    <Link
                                        to="/games-events"
                                        className="mt-2.5 text-[11px] font-semibold text-indigo-600 hover:underline"
                                    >
                                        + Schedule an Event
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {upcomingActivities.map((act) => {
                                        const eventDate = act.date ? new Date(act.date) : null;
                                        const dayStr = eventDate && !isNaN(eventDate.getTime()) ? eventDate.getDate() : "--";
                                        const monthStr = eventDate && !isNaN(eventDate.getTime())
                                            ? eventDate.toLocaleDateString("en-IN", { month: "short" })
                                            : "Event";

                                        return (
                                            <div
                                                key={act._id}
                                                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 dark:border-gray-800 dark:bg-gray-800/40"
                                            >
                                                {/* Date Badge */}
                                                <div className="flex flex-col items-center justify-center rounded-lg bg-white px-2 py-1 shadow-2xs border border-slate-100 shrink-0 text-center min-w-[40px] dark:bg-gray-900 dark:border-gray-800">
                                                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 leading-none">
                                                        {monthStr}
                                                    </span>
                                                    <span className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight mt-0.5">
                                                        {dayStr}
                                                    </span>
                                                </div>

                                                {/* Event Info */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                                        {act.name}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {(act.startTime || act.endTime) && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3 text-slate-400" />
                                                                {act.startTime || ""}{act.endTime ? ` – ${act.endTime}` : ""}
                                                            </span>
                                                        )}
                                                        {act.location && (
                                                            <span className="flex items-center gap-1 truncate">
                                                                <MapPin className="h-3 w-3 text-slate-400" />
                                                                {act.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 pt-2.5 dark:border-gray-800 flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400 font-medium">Scheduled</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {upcomingActivities.length} Events
                            </span>
                        </div>
                    </div>
                </div>

                {/* ==================== 7. RECENT TRANSACTIONS TABLE ==================== */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 dark:border-gray-800">
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                Recent Transactions
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Latest donations and expenses logged</p>
                        </div>
                        <Link
                            to="/ledger"
                            className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors dark:bg-indigo-950/40 dark:text-indigo-300"
                        >
                            View All
                        </Link>
                    </div>

                    {stats.recentActivity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                            <Activity className="h-9 w-9 text-slate-300 mb-2" />
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No recent transactions</p>
                            <p className="text-[11px] text-slate-400">Recorded donations and expenses will appear here in real-time.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 border-b border-slate-100 dark:bg-gray-800/40 dark:border-gray-800 dark:text-slate-400">
                                            <th className="px-5 py-3">Type</th>
                                            <th className="px-5 py-3">Description</th>
                                            <th className="px-5 py-3">Category</th>
                                            <th className="px-5 py-3">Amount</th>
                                            <th className="px-5 py-3">Date</th>
                                            <th className="px-5 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
                                        {stats.recentActivity.map((act) => {
                                            const isDonation = act.type === "donation";
                                            const categoryLabel = isDonation
                                                ? (act.donorType === "resident" ? "Resident" : act.donorType === "external" ? "External" : "Donation")
                                                : (act.category || "Expense");

                                            return (
                                                <tr key={act._id} className="hover:bg-slate-50/60 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                                isDonation
                                                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                                                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
                                                            }`}
                                                        >
                                                            {isDonation ? "Donation" : "Expense"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                                                        {isDonation
                                                            ? (act.flatNo ? `Resident Donation - Flat ${act.flatNo}` : (act.donorName || "Donation Contribution"))
                                                            : (act.title || "Mandal Expense")}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-gray-800 dark:text-slate-300">
                                                            {categoryLabel}
                                                        </span>
                                                    </td>
                                                    <td className={`px-5 py-3.5 font-bold text-xs ${isDonation ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                        {isDonation ? "+" : "-"} ₹{act.amount.toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                                                        {new Date(act.date).toLocaleDateString("en-IN", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric"
                                                        })}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                            {isDonation ? "Received" : (act.paymentStatus === "pending" ? "Pending" : "Paid")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Transaction List */}
                            <div className="divide-y divide-slate-100 md:hidden dark:divide-gray-800/60">
                                {stats.recentActivity.map((act) => {
                                    const isDonation = act.type === "donation";
                                    return (
                                        <div key={act._id} className="p-3.5 flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                            isDonation
                                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
                                                        }`}
                                                    >
                                                        {isDonation ? "Donation" : "Expense"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(act.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                    </span>
                                                </div>
                                                <div className="font-semibold text-xs text-slate-800 dark:text-white mt-1 truncate">
                                                    {isDonation
                                                        ? (act.flatNo ? `Flat ${act.flatNo}` : (act.donorName || "Donation"))
                                                        : (act.title || "Expense")}
                                                </div>
                                            </div>
                                            <div className={`shrink-0 text-xs font-bold ${isDonation ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                {isDonation ? "+" : "-"} ₹{act.amount.toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* ==================== 8. BUILDING & WING OCCUPANCY ==================== */}
                {stats.residentStats.buildings.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 dark:border-gray-800">
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    Building & Wing Occupancy
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Flat occupancy and member distribution</p>
                            </div>
                            <Link
                                to="/households"
                                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                Manage Households
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 border-b border-slate-100 dark:bg-gray-800/40 dark:border-gray-800 dark:text-slate-400">
                                        <th className="px-5 py-3">Building</th>
                                        <th className="px-5 py-3">Wings</th>
                                        <th className="px-5 py-3">Expected Flats</th>
                                        <th className="px-5 py-3">Registered</th>
                                        <th className="px-5 py-3">Remaining Flats</th>
                                        <th className="px-5 py-3">Households</th>
                                        <th className="px-5 py-3">Total People</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
                                    {stats.residentStats.buildings.map((b) => (
                                        <tr key={b.building} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/20">
                                            <td className="px-5 py-3 font-bold text-xs text-indigo-600 dark:text-indigo-400">
                                                Building {b.building}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">
                                                {b.wings ? b.wings.length : (stats.residentStats.wings.filter((w) => w.building === b.building).length)} wings
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">
                                                {b.expectedFlats}
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                                                {b.registeredFlats}
                                            </td>
                                            <td className={`px-5 py-3 font-semibold ${b.remainingFlats > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                                                {b.remainingFlats}
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">
                                                {b.households}
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                                                {b.people}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Building List */}
                        <div className="divide-y divide-slate-100 md:hidden dark:divide-gray-800/60">
                            {stats.residentStats.buildings.map((b) => (
                                <div key={b.building} className="flex items-start justify-between gap-3 p-3.5">
                                    <div className="min-w-0">
                                        <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                                            Building {b.building}
                                        </div>
                                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                                            {b.wings ? b.wings.length : (stats.residentStats.wings.filter((w) => w.building === b.building).length)} wings · {b.households} households
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                            {b.people} people
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <span className="text-emerald-600 dark:text-emerald-400">{b.registeredFlats}</span>
                                            <span className="text-slate-400"> / </span>
                                            {b.expectedFlats} flats
                                        </div>
                                        <div className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.remainingFlats > 0 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" : "bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400"}`}>
                                            {b.remainingFlats} remaining
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
