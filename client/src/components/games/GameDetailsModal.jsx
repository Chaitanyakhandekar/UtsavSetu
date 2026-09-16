import React, { useState, useEffect, useCallback } from "react";
import {
    X,
    Trophy,
    Calendar,
    Clock,
    MapPin,
    Users,
    Award,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    Layers,
    ChevronRight,
    Share2,
    FileSpreadsheet,
    FileText
} from "lucide-react";
import { gameApi } from "../../api/game.api.js";
import WinnerPositionCard from "./WinnerPositionCard.jsx";
import WinnerAssignModal from "./WinnerAssignModal.jsx";
import GroupFormModal from "./GroupFormModal.jsx";
import DeleteConfirmModal from "./DeleteConfirmModal.jsx";
import toast from "react-hot-toast";

const GameDetailsModal = ({
    isOpen,
    onClose,
    gameId,
    onGameUpdated,
    onOpenEditGame,
}) => {
    const [game, setGame] = useState(null);
    const [groups, setGroups] = useState([]);
    const [stats, setStats] = useState({
        totalGroups: 0,
        totalWinners: 0,
        firstPlaceCount: 0,
        secondPlaceCount: 0,
        thirdPlaceCount: 0,
    });
    const [loading, setLoading] = useState(true);

    // Winner Assign Modal state
    const [assignModal, setAssignModal] = useState({
        isOpen: false,
        group: null,
        position: 1,
        existingWinner: null,
        isSubmitting: false,
    });

    // Group Form Modal state
    const [groupModal, setGroupModal] = useState({
        isOpen: false,
        editingGroup: null,
        isSubmitting: false,
    });

    // Delete confirmation state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: null, // "group"
        item: null,
        isDeleting: false,
    });

    // Fetch complete game details with groups and winners
    const fetchDetails = useCallback(async () => {
        if (!gameId) return;
        setLoading(true);
        try {
            const res = await gameApi.getGameDetails(gameId);
            if (res.success && res.data) {
                setGame(res.data.game);
                setGroups(res.data.groups || []);
                setStats(res.data.stats || {});
            } else {
                toast.error(res.message || "Failed to load game details");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error loading game details");
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        if (isOpen && gameId) {
            fetchDetails();
        }
    }, [isOpen, gameId, fetchDetails]);

    if (!isOpen) return null;

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

    // ==================== WINNER ACTIONS ====================
    const handleOpenAssignWinner = (group, position, existingWinner) => {
        setAssignModal({
            isOpen: true,
            group,
            position,
            existingWinner,
            isSubmitting: false,
        });
    };

    const handleSaveWinner = async (winnerPayload) => {
        setAssignModal((prev) => ({ ...prev, isSubmitting: true }));
        try {
            const res = await gameApi.setWinner(winnerPayload);
            if (res.success) {
                toast.success("Winner recorded successfully");
                setAssignModal({ isOpen: false, group: null, position: 1, existingWinner: null, isSubmitting: false });
                fetchDetails();
                if (onGameUpdated) onGameUpdated();
            } else {
                toast.error(res.message || "Failed to save winner");
                setAssignModal((prev) => ({ ...prev, isSubmitting: false }));
            }
        } catch (err) {
            console.error(err);
            toast.error("Error saving winner");
            setAssignModal((prev) => ({ ...prev, isSubmitting: false }));
        }
    };

    const handleClearWinner = async (position, existingWinner, group) => {
        try {
            const res = await gameApi.removeWinner(existingWinner?._id, {
                groupId: group._id,
                position,
            });
            if (res.success) {
                toast.success("Winner position cleared");
                fetchDetails();
                if (onGameUpdated) onGameUpdated();
            } else {
                toast.error(res.message || "Failed to clear winner");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error clearing winner");
        }
    };

    // ==================== GROUP ACTIONS ====================
    const handleOpenAddGroup = () => {
        setGroupModal({
            isOpen: true,
            editingGroup: null,
            isSubmitting: false,
        });
    };

    const handleOpenEditGroup = (group) => {
        setGroupModal({
            isOpen: true,
            editingGroup: group,
            isSubmitting: false,
        });
    };

    const handleSaveGroup = async (groupData) => {
        setGroupModal((prev) => ({ ...prev, isSubmitting: true }));
        try {
            let res;
            if (groupModal.editingGroup) {
                res = await gameApi.updateGroup(groupModal.editingGroup._id, groupData);
            } else {
                res = await gameApi.createGroup(gameId, groupData);
            }

            if (res.success) {
                toast.success(groupModal.editingGroup ? "Group updated" : "Group added");
                setGroupModal({ isOpen: false, editingGroup: null, isSubmitting: false });
                fetchDetails();
                if (onGameUpdated) onGameUpdated();
            } else {
                toast.error(res.message || "Failed to save group");
                setGroupModal((prev) => ({ ...prev, isSubmitting: false }));
            }
        } catch (err) {
            console.error(err);
            toast.error("Error saving group");
            setGroupModal((prev) => ({ ...prev, isSubmitting: false }));
        }
    };

    const handleDeleteGroupConfirm = async () => {
        if (!deleteModal.item) return;
        setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
        try {
            const res = await gameApi.deleteGroup(deleteModal.item._id);
            if (res.success) {
                toast.success("Group and results deleted");
                setDeleteModal({ isOpen: false, type: null, item: null, isDeleting: false });
                fetchDetails();
                if (onGameUpdated) onGameUpdated();
            } else {
                toast.error(res.message || "Failed to delete group");
                setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting group");
            setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    // Quick status toggle to completed
    const handleMarkCompleted = async () => {
        if (!game) return;
        try {
            const nextStatus = game.status === "Completed" ? "Upcoming" : "Completed";
            const res = await gameApi.updateGame(game._id, { status: nextStatus });
            if (res.success) {
                toast.success(`Game marked as ${nextStatus}`);
                fetchDetails();
                if (onGameUpdated) onGameUpdated();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-4xl my-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
                {/* Modal Header */}
                <div className="border-b border-gray-100 p-4 sm:p-6 dark:border-gray-800 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white truncate">
                                        {game?.name || "Game Details"}
                                    </h2>
                                    {game?.status && (
                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                                            game.status === "Completed"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                                                : game.status === "Ongoing"
                                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300"
                                                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300"
                                        }`}>
                                            {game.status}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1 font-medium">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        {formatDate(game?.date)}
                                    </span>
                                    {(game?.startTime || game?.endTime) && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            {game.startTime || ""} {game.endTime ? `– ${game.endTime}` : ""}
                                        </span>
                                    )}
                                    {game?.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span>{game.location}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => {
                                    onOpenEditGame(game);
                                }}
                                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
                                title="Edit Game Settings"
                            >
                                <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Game Description */}
                    {game?.description && (
                        <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/60 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                            {game.description}
                        </p>
                    )}

                    {/* Game-Wise Summary Counters */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="rounded-xl bg-gray-50/80 p-2.5 dark:bg-gray-800/40 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Groups</span>
                            <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">{stats.totalGroups || 0}</span>
                        </div>
                        <div className="rounded-xl bg-gray-50/80 p-2.5 dark:bg-gray-800/40 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Winners</span>
                            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.totalWinners || 0}</span>
                        </div>
                        <div className="rounded-xl bg-amber-50/70 p-2.5 dark:bg-amber-950/20 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">🥇 1st Place</span>
                            <span className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-300">{stats.firstPlaceCount || 0}</span>
                        </div>
                        <div className="rounded-xl bg-slate-100/70 p-2.5 dark:bg-slate-800/30 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">🥈 2nd Place</span>
                            <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-200">{stats.secondPlaceCount || 0}</span>
                        </div>
                        <div className="rounded-xl bg-orange-50/70 p-2.5 dark:bg-orange-950/20 text-center col-span-2 sm:col-span-1">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">🥉 3rd Place</span>
                            <span className="text-base sm:text-lg font-black text-orange-800 dark:text-orange-300">{stats.thirdPlaceCount || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Modal Scrollable Content: Groups & Winners */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Layers className="h-4 w-4 text-indigo-600" />
                                Category Groups & Results
                            </h3>
                            <p className="text-xs text-gray-400">
                                Each category group has 1st, 2nd, and 3rd place winning positions
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleOpenAddGroup}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add Group
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                            <p className="mt-2 text-xs text-gray-400">Loading competition groups & results...</p>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
                            <Users className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                            <h4 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">
                                No groups added to this game yet
                            </h4>
                            <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
                                Divide participants into groups such as Small Group, Big Group, Kids, Adults, Age 1–10, etc.
                            </p>
                            <button
                                type="button"
                                onClick={handleOpenAddGroup}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300"
                            >
                                <Plus className="h-4 w-4" />
                                Add First Category Group
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groups.map((group) => {
                                const results = group.results || {};
                                return (
                                    <div
                                        key={group._id}
                                        className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                                    >
                                        {/* Group Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                                                        {group.name}
                                                    </h4>
                                                    {group.category && (
                                                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                                                            {group.category}
                                                        </span>
                                                    )}
                                                    {(group.ageMin != null || group.ageMax != null) && (
                                                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                            {group.ageMin != null && group.ageMax != null
                                                                ? `Age ${group.ageMin}–${group.ageMax}`
                                                                : group.ageMin != null
                                                                ? `Age ${group.ageMin}+`
                                                                : `Up to Age ${group.ageMax}`}
                                                        </span>
                                                    )}
                                                </div>
                                                {group.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditGroup(group)}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
                                                    title="Edit Group"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDeleteModal({
                                                            isOpen: true,
                                                            type: "group",
                                                            item: group,
                                                            isDeleting: false,
                                                        });
                                                    }}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                                                    title="Delete Group"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* 3 Winning Positions (1st, 2nd, 3rd) */}
                                        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <WinnerPositionCard
                                                position={1}
                                                winner={results[1]}
                                                onAssign={(pos, currentWinner) => handleOpenAssignWinner(group, pos, currentWinner)}
                                                onClear={(pos, currentWinner) => handleClearWinner(pos, currentWinner, group)}
                                            />
                                            <WinnerPositionCard
                                                position={2}
                                                winner={results[2]}
                                                onAssign={(pos, currentWinner) => handleOpenAssignWinner(group, pos, currentWinner)}
                                                onClear={(pos, currentWinner) => handleClearWinner(pos, currentWinner, group)}
                                            />
                                            <WinnerPositionCard
                                                position={3}
                                                winner={results[3]}
                                                onAssign={(pos, currentWinner) => handleOpenAssignWinner(group, pos, currentWinner)}
                                                onClear={(pos, currentWinner) => handleClearWinner(pos, currentWinner, group)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
                    <button
                        type="button"
                        onClick={handleMarkCompleted}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        <CheckCircle2 className={`h-4 w-4 ${game?.status === "Completed" ? "text-emerald-500" : "text-gray-400"}`} />
                        {game?.status === "Completed" ? "Mark as Upcoming" : "Mark as Completed"}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-gray-900 px-5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
                    >
                        Close Details
                    </button>
                </div>
            </div>

            {/* Sub-modals inside Details */}
            {assignModal.isOpen && (
                <WinnerAssignModal
                    isOpen={assignModal.isOpen}
                    onClose={() => setAssignModal({ isOpen: false, group: null, position: 1, existingWinner: null, isSubmitting: false })}
                    onSave={handleSaveWinner}
                    group={assignModal.group}
                    position={assignModal.position}
                    existingWinner={assignModal.existingWinner}
                    isSubmitting={assignModal.isSubmitting}
                />
            )}

            {groupModal.isOpen && (
                <GroupFormModal
                    isOpen={groupModal.isOpen}
                    onClose={() => setGroupModal({ isOpen: false, editingGroup: null, isSubmitting: false })}
                    onSubmit={handleSaveGroup}
                    editingGroup={groupModal.editingGroup}
                    gameName={game?.name}
                    isSubmitting={groupModal.isSubmitting}
                />
            )}

            {deleteModal.isOpen && (
                <DeleteConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, type: null, item: null, isDeleting: false })}
                    onConfirm={handleDeleteGroupConfirm}
                    title="Delete Category Group"
                    itemLabel={deleteModal.item?.name}
                    message="Are you sure you want to delete this group? All recorded winner positions for this group will be deleted."
                    isDeleting={deleteModal.isDeleting}
                />
            )}
        </div>
    );
};

export default GameDetailsModal;
