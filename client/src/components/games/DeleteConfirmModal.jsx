import React from "react";
import { AlertTriangle, X } from "lucide-react";

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemLabel,
    isDeleting,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-md my-auto rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {title || "Confirm Deletion"}
                    </h3>
                    {itemLabel && (
                        <div className="mt-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {itemLabel}
                        </div>
                    )}
                    <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {message || "Are you sure you want to delete this item? This action cannot be undone."}
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md shadow-rose-600/20 transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
