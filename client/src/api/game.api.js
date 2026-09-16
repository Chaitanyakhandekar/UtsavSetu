import api from "../services/api.js";

export const gameApi = {
    // Festival-wide statistics
    getFestivalStats: async (params) => {
        try {
            const response = await api.get("/api/games/stats", { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch festival games statistics",
            };
        }
    },

    // Games list with counts
    getGames: async (params) => {
        try {
            const response = await api.get("/api/games", { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch games",
            };
        }
    },

    // Single game details with groups and winners
    getGameDetails: async (id) => {
        try {
            const response = await api.get(`/api/games/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch game details",
            };
        }
    },

    // Create game
    createGame: async (data) => {
        try {
            const response = await api.post("/api/games", data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to create game",
            };
        }
    },

    // Update game
    updateGame: async (id, data) => {
        try {
            const response = await api.put(`/api/games/${id}`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to update game",
            };
        }
    },

    // Delete game
    deleteGame: async (id) => {
        try {
            const response = await api.delete(`/api/games/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to delete game",
            };
        }
    },

    // Create group
    createGroup: async (gameId, data) => {
        try {
            const response = await api.post(`/api/games/${gameId}/groups`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to create group",
            };
        }
    },

    // Update group
    updateGroup: async (id, data) => {
        try {
            const response = await api.put(`/api/games/groups/${id}`, data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to update group",
            };
        }
    },

    // Delete group
    deleteGroup: async (id) => {
        try {
            const response = await api.delete(`/api/games/groups/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to delete group",
            };
        }
    },

    // Assign or update winner
    setWinner: async (data) => {
        try {
            const response = await api.post("/api/games/winners", data);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to assign winner",
            };
        }
    },

    // Remove winner
    removeWinner: async (id, params) => {
        try {
            const url = id ? `/api/games/winners/${id}` : "/api/games/winners";
            const response = await api.delete(url, { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to remove winner",
            };
        }
    },

    // All winners summary across games
    getAllWinners: async (params) => {
        try {
            const response = await api.get("/api/games/all-winners", { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch all winners",
            };
        }
    },

    // Full results data for PDF generation
    getCompleteFestivalResults: async (params) => {
        try {
            const response = await api.get("/api/games/complete-results", { params });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to fetch complete festival results",
            };
        }
    },
};
