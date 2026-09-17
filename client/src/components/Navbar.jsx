import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAuthStore } from "../store/userStore.js";
import { useMandalStore } from "../store/useMandalStore.js";
import { userApi } from "../api/user.api.js";
import { Menu, LogOut, Calendar, Search, Bell } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = userAuthStore();
    const { years, selectedYear, setSelectedYear, fetchYears } = useMandalStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchYears();
    }, [fetchYears]);

    const handleLogout = async () => {
        const response = await userApi.logout();
        if (response.success) {
            logout();
            toast.success("Logged out successfully");
            navigate("/login");
        } else {
            toast.error(response.message || "Failed to log out");
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/donations?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-3.5 backdrop-blur-md sm:px-6 dark:border-gray-800 dark:bg-gray-900/90">
            {/* Left side: Mobile Menu Toggle & Modern Search Bar */}
            <div className="flex flex-1 items-center gap-2 sm:gap-4 max-w-lg">
                <button
                    onClick={toggleSidebar}
                    className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-200"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Modern Rounded Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search donations, donors, flats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all dark:border-gray-800 dark:bg-gray-800/60 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:bg-gray-800"
                    />
                </form>
            </div>

            {/* Right side: Year Selector, Notifications, User Profile & Logout */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {/* Year Selector Control: "Year: 2026 (Active)" */}
                {years.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/60 px-3 py-1.5 shadow-none sm:gap-2 dark:border-gray-800 dark:bg-gray-800/60">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer dark:text-slate-200"
                        >
                            {years.map((y) => (
                                <option key={y._id} value={y.year}>
                                    Year: {y.year} {y.isActive ? "(Active)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Notifications Button */}
                <button
                    type="button"
                    title="Notifications"
                    aria-label="Notifications"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors dark:border-gray-800 dark:text-slate-400 dark:hover:bg-gray-800"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-gray-900"></span>
                </button>

                {/* Profile Widget */}
                {user && (
                    <div className="flex items-center gap-2.5 pl-1 sm:pl-2">
                        <div className="hidden flex-col items-end sm:flex text-right">
                            <span className="text-xs font-bold text-slate-800 leading-tight dark:text-slate-200">
                                {user.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 leading-tight">
                                @{user.username}
                            </span>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-bold text-white shadow-sm shadow-indigo-200 dark:shadow-none">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    title="Log Out"
                    aria-label="Log Out"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors dark:border-gray-800 dark:hover:border-rose-900/40 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
