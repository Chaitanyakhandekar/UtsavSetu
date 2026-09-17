import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Coins,
    Receipt,
    BookOpen,
    BarChart3,
    Settings,
    X,
    Home as HomeIcon,
    Building2,
    UtensilsCrossed,
    FileSpreadsheet,
    Layers,
    CheckSquare,
    Trophy,
    Sparkles
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();

    // Primary navigation items ordered as requested, preserving all existing routes
    const primaryNavItems = [
        { name: "Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Donations", path: "/donations", icon: Coins },
        { name: "Expenses", path: "/expenses", icon: Receipt },
        { name: "Ledger", path: "/ledger", icon: BookOpen },
        { name: "Households", path: "/households", icon: HomeIcon },
        { name: "Maha Meals", path: "/mahaprasad", icon: UtensilsCrossed },
        { name: "Games & Events", path: "/games-events", icon: Trophy },
        { name: "Tasks & Notes", path: "/tasks-notes", icon: CheckSquare },
        { name: "Reports", path: "/reports", icon: BarChart3 },
        { name: "Settings", path: "/settings", icon: Settings }
    ];

    const secondaryNavItems = [
        { name: "Building Flats", path: "/building-flats", icon: Layers },
        { name: "External Donors", path: "/external-donors", icon: Building2 },
        { name: "Bulk Import", path: "/bulk-import", icon: FileSpreadsheet }
    ];

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                ></div>
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed bottom-0 top-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white text-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 dark:border-gray-800 dark:bg-gray-900 dark:text-slate-100 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Brand / Logo Section */}
                <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-gray-800">
                    <Link to="/" className="flex items-center gap-3 min-w-0" onClick={() => isOpen && toggleSidebar()}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-200 dark:shadow-none">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold tracking-tight text-slate-900 truncate dark:text-white">
                                Mandal Management
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 truncate">
                                MandalKhata Cloud
                            </span>
                        </div>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-100"
                        onClick={toggleSidebar}
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin">
                    {/* Primary Navigation */}
                    <nav className="space-y-1">
                        {primaryNavItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => isOpen && toggleSidebar()}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 group ${
                                        active
                                            ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50 dark:bg-indigo-950/50 dark:text-indigo-300 dark:shadow-none"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-gray-800/50 dark:hover:text-slate-100"
                                    }`}
                                >
                                    <Icon
                                        className={`h-4 w-4 shrink-0 transition-colors ${
                                            active
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                                        }`}
                                    />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Secondary Navigation (Data & Management) */}
                    <div>
                        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Community Tools
                        </div>
                        <nav className="space-y-1">
                            {secondaryNavItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => isOpen && toggleSidebar()}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150 group ${
                                            active
                                                ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-100/50 dark:bg-indigo-950/50 dark:text-indigo-300"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-gray-800/50 dark:hover:text-slate-100"
                                        }`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 shrink-0 transition-colors ${
                                                active
                                                    ? "text-indigo-600 dark:text-indigo-400"
                                                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                                            }`}
                                        />
                                        <span className="truncate">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Footer Credits */}
                <div
                    className="border-t border-slate-100 p-3.5 text-center dark:border-gray-800"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                >
                    <div className="flex items-center justify-between text-xs px-1 text-slate-400 dark:text-slate-500">
                        <span className="font-medium text-[11px]">MandalKhata</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-semibold">v1.0</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
