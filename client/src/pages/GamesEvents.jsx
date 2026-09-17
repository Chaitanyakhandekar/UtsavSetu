import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout.jsx";
import { gameApi } from "../api/game.api.js";
import { useMandalStore } from "../store/useMandalStore.js";
import { userAuthStore } from "../store/userStore.js";
import GamesStatistics from "../components/games/GamesStatistics.jsx";
import GameCard from "../components/games/GameCard.jsx";
import GameFormModal from "../components/games/GameFormModal.jsx";
import GameDetailsModal from "../components/games/GameDetailsModal.jsx";
import DeleteConfirmModal from "../components/games/DeleteConfirmModal.jsx";
import AllWinnersView from "../components/games/AllWinnersView.jsx";
import { exportFinalGamesResultsPdf } from "../utils/gameResultsPdf.js";
import {
    Trophy,
    Plus,
    Search,
    Download,
    FileText,
    Award,
    Filter,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Calendar,
    Printer,
    Eye
} from "lucide-react";
import toast from "react-hot-toast";

const GamesEvents = () => {
    const { selectedYear } = useMandalStore();
    const user = userAuthStore((state) => state.user);

    // Active Tab: "games" | "winners"
    const [activeTab, setActiveTab] = useState("games");

    // Games data states
    const [games, setGames] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    // Search and Status Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // "all", "Upcoming", "Ongoing", "Completed"
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [isSavingGame, setIsSavingGame] = useState(false);

    const [detailsModal, setDetailsModal] = useState({
        isOpen: false,
        gameId: null,
    });

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        game: null,
        isDeleting: false,
    });

    // PDF generation loading state
    const [exportingPdf, setExportingPdf] = useState(false);

    // Helper: get organization name
    const getOrgName = () => {
        return (user && user.name && String(user.name).trim()) || "Unique Residency Mandal";
    };

    // Fetch festival stats
    const fetchStats = useCallback(async () => {
        if (!selectedYear) return;
        setStatsLoading(true);
        try {
            const res = await gameApi.getFestivalStats({ festivalYear: selectedYear });
            if (res.success && res.data) {
                setStats(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    }, [selectedYear]);

    // Fetch games list
    const fetchGames = useCallback(async () => {
        if (!selectedYear) return;
        setLoading(true);
        try {
            const params = {
                festivalYear: selectedYear,
                page,
                limit: 20,
            };
            if (statusFilter !== "all") params.status = statusFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await gameApi.getGames(params);
            if (res.success && res.data) {
                setGames(res.data.games || []);
                setTotalPages(res.data.pages || 1);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load games list");
        } finally {
            setLoading(false);
        }
    }, [selectedYear, statusFilter, page, searchQuery]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    // ==================== PDF EXPORT HANDLER ====================
    const handleExportPdf = async (action = "download") => {
        if (!selectedYear) {
            toast.error("Please select a festival year");
            return;
        }

        setExportingPdf(true);
        const loadingToast = toast.loading("Generating Final Festival Results PDF...");
        try {
            const res = await gameApi.getCompleteFestivalResults({ festivalYear: selectedYear });
            if (res.success && res.data) {
                const orgName = getOrgName();
                exportFinalGamesResultsPdf({
                    festivalYear: selectedYear,
                    games: res.data.games || [],
                    summary: res.data.summary || {},
                    allWinners: res.data.allWinners || [],
                    orgName,
                    action,
                });
                toast.success("Final Results PDF generated successfully!", { id: loadingToast });
            } else {
                toast.error(res.message || "Failed to fetch complete festival data for PDF", { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error("Error generating PDF", { id: loadingToast });
        } finally {
            setExportingPdf(false);
        }
    };

    // ==================== GAME ACTIONS ====================
    const handleOpenCreateGame = () => {
        setEditingGame(null);
        setIsGameModalOpen(true);
    };

    const handleOpenEditGame = (game) => {
        setEditingGame(game);
        setIsGameModalOpen(true);
    };

    const handleSaveGame = async (gameData) => {
        setIsSavingGame(true);
        try {
            let res;
            if (editingGame) {
                res = await gameApi.updateGame(editingGame._id, gameData);
            } else {
                res = await gameApi.createGame({
                    ...gameData,
                    festivalYear: selectedYear,
                });
            }

            if (res.success) {
                toast.success(editingGame ? "Game updated successfully" : "Game created successfully");
                setIsGameModalOpen(false);
                setEditingGame(null);
                fetchGames();
                fetchStats();
            } else {
                toast.error(res.message || "Failed to save game");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error saving game");
        } finally {
            setIsSavingGame(false);
        }
    };

    const handleDeleteGameConfirm = async () => {
        if (!deleteModal.game) return;
        setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
        try {
            const res = await gameApi.deleteGame(deleteModal.game._id);
            if (res.success) {
                toast.success("Game and its groups/results deleted");
                setDeleteModal({ isOpen: false, game: null, isDeleting: false });
                fetchGames();
                fetchStats();
                if (detailsModal.gameId === deleteModal.game._id) {
                    setDetailsModal({ isOpen: false, gameId: null });
                }
            } else {
                toast.error(res.message || "Failed to delete game");
                setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting game");
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    return (
        <Layout>
            <div className="space-y-5 sm:space-y-6">
                {/* Page Title & Top Actions Bar */}
                <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h1 className="pg-title">
                                    Games & Events
                                </h1>
                                <p className="pg-subtitle">
                                    Competitions, categories, winners & festival awards • Festival {selectedYear}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons: Generate PDF & Add Game */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* PDF Actions */}
                        <div className="inline-flex rounded-xl shadow-sm">
                            <button
                                type="button"
                                onClick={() => handleExportPdf("download")}
                                disabled={exportingPdf}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 dark:border-indigo-900/50 dark:bg-gray-900 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition-colors disabled:opacity-50"
                                title="Download complete festival results PDF"
                            >
                                <Download className="h-4 w-4" />
                                <span>{exportingPdf ? "Generating..." : "Generate Final Results PDF"}</span>
                            </button>
                        </div>

                        {/* Create Game Button */}
                        <button
                            type="button"
                            onClick={handleOpenCreateGame}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:bg-indigo-800 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Game / Event</span>
                        </button>
                    </div>
                </div>

                {/* Festival Summary Metrics */}
                <GamesStatistics stats={stats} loading={statsLoading} />

                {/* Tab Switcher: Games List vs All Winners Directory */}
                <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab("games")}
                        className={`inline-flex items-center gap-2 pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${
                            activeTab === "games"
                                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        }`}
                    >
                        <Trophy className="h-4 w-4" />
                        <span>Competitions & Games</span>
                        {stats?.totalGames > 0 && (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                                {stats.totalGames}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("winners")}
                        className={`inline-flex items-center gap-2 pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${
                            activeTab === "winners"
                                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        }`}
                    >
                        <Award className="h-4 w-4" />
                        <span>All Winners Directory</span>
                        {stats?.totalWinners > 0 && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                                {stats.totalWinners}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "games" ? (
                    <div className="space-y-4">
                        {/* Search & Status Filters */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-gray-200/90 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search game by name, location or description..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3.5 py-2 text-xs sm:text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                                />
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="flex items-center gap-1 overflow-x-auto p-0.5 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
                                {[
                                    { id: "all", label: "All Games" },
                                    { id: "Upcoming", label: "Upcoming" },
                                    { id: "Ongoing", label: "Ongoing" },
                                    { id: "Completed", label: "Completed" },
                                ].map((btn) => (
                                    <button
                                        key={btn.id}
                                        type="button"
                                        onClick={() => {
                                            setStatusFilter(btn.id);
                                            setPage(1);
                                        }}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                                            statusFilter === btn.id
                                                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                                                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                        }`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Games Grid List */}
                        {loading ? (
                            <div className="py-16 text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                                <p className="mt-2 text-xs text-gray-400">Loading games and competitions...</p>
                            </div>
                        ) : games.length === 0 ? (
                            <div className="rounded-3xl border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center dark:border-gray-800">
                                <Trophy className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                                <h3 className="mt-4 text-base font-bold text-gray-800 dark:text-gray-200">
                                    No games found
                                </h3>
                                <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
                                    {searchQuery || statusFilter !== "all"
                                        ? "No games match your current filter criteria."
                                        : `No games or competitions recorded for Festival ${selectedYear} yet.`}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleOpenCreateGame}
                                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create New Game
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {games.map((game) => (
                                    <GameCard
                                        key={game._id}
                                        game={game}
                                        onViewDetails={() => setDetailsModal({ isOpen: true, gameId: game._id })}
                                        onEdit={() => handleOpenEditGame(game)}
                                        onDelete={() => setDeleteModal({ isOpen: true, game, isDeleting: false })}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination if multiple pages */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="pg-subtitle">
                                    Page <strong className="text-gray-800 dark:text-gray-200">{page}</strong> of <strong className="text-gray-800 dark:text-gray-200">{totalPages}</strong>
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                        disabled={page === 1}
                                        className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* All Winners Tab */
                    <AllWinnersView
                        selectedYear={selectedYear}
                        onOpenGameDetails={(gameId) => setDetailsModal({ isOpen: true, gameId })}
                    />
                )}
            </div>

            {/* Game Create / Edit Modal */}
            {isGameModalOpen && (
                <GameFormModal
                    isOpen={isGameModalOpen}
                    onClose={() => {
                        setIsGameModalOpen(false);
                        setEditingGame(null);
                    }}
                    onSubmit={handleSaveGame}
                    editingGame={editingGame}
                    isSubmitting={isSavingGame}
                />
            )}

            {/* Game Details Modal */}
            {detailsModal.isOpen && (
                <GameDetailsModal
                    isOpen={detailsModal.isOpen}
                    onClose={() => setDetailsModal({ isOpen: false, gameId: null })}
                    gameId={detailsModal.gameId}
                    onGameUpdated={() => {
                        fetchGames();
                        fetchStats();
                    }}
                    onOpenEditGame={(game) => {
                        setEditingGame(game);
                        setIsGameModalOpen(true);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <DeleteConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, game: null, isDeleting: false })}
                    onConfirm={handleDeleteGameConfirm}
                    title="Delete Competition / Game"
                    itemLabel={deleteModal.game?.name}
                    message="Are you sure you want to delete this game? All associated category groups and recorded winners will also be permanently deleted."
                    isDeleting={deleteModal.isDeleting}
                />
            )}
        </Layout>
    );
};

export default GamesEvents;
