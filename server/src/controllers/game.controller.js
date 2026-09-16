import mongoose from "mongoose";
import { Game } from "../models/game.model.js";
import { GameGroup } from "../models/gameGroup.model.js";
import { GameResult } from "../models/gameResult.model.js";
import { FestivalYear } from "../models/festivalYear.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/apiUtils.js";

// Helper to resolve festival year from query/body or fallback to active year
const resolveFestivalYear = async (providedYear, userId) => {
    if (providedYear && typeof providedYear === "string" && providedYear.trim() !== "") {
        return providedYear.trim();
    }
    const activeYearDoc = await FestivalYear.findOne({ isActive: true, createdBy: userId });
    return activeYearDoc ? activeYearDoc.year : null;
};

// ==================== FESTIVAL-WIDE SUMMARY STATS ====================
export const getFestivalGameStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const festivalYear = await resolveFestivalYear(req.query.festivalYear, userId);

    if (!festivalYear) {
        return res.status(200).json(
            new ApiResponse(200, {
                festivalYear: null,
                totalGames: 0,
                upcomingGames: 0,
                ongoingGames: 0,
                completedGames: 0,
                totalGroups: 0,
                totalWinners: 0,
                firstPlaceCount: 0,
                secondPlaceCount: 0,
                thirdPlaceCount: 0,
            }, "No active festival year found")
        );
    }

    const [
        totalGames,
        upcomingGames,
        ongoingGames,
        completedGames,
        totalGroups,
        winnerCountsAggregate
    ] = await Promise.all([
        Game.countDocuments({ createdBy: userId, festivalYear }),
        Game.countDocuments({ createdBy: userId, festivalYear, status: "Upcoming" }),
        Game.countDocuments({ createdBy: userId, festivalYear, status: "Ongoing" }),
        Game.countDocuments({ createdBy: userId, festivalYear, status: "Completed" }),
        GameGroup.countDocuments({ createdBy: userId, festivalYear }),
        GameResult.aggregate([
            { $match: { createdBy: userId, festivalYear } },
            {
                $group: {
                    _id: "$position",
                    count: { $sum: 1 }
                }
            }
        ])
    ]);

    let firstPlaceCount = 0;
    let secondPlaceCount = 0;
    let thirdPlaceCount = 0;

    winnerCountsAggregate.forEach((item) => {
        if (item._id === 1) firstPlaceCount = item.count;
        if (item._id === 2) secondPlaceCount = item.count;
        if (item._id === 3) thirdPlaceCount = item.count;
    });

    const totalWinners = firstPlaceCount + secondPlaceCount + thirdPlaceCount;

    return res.status(200).json(
        new ApiResponse(200, {
            festivalYear,
            totalGames,
            upcomingGames,
            ongoingGames,
            completedGames,
            totalGroups,
            totalWinners,
            firstPlaceCount,
            secondPlaceCount,
            thirdPlaceCount,
        }, "Festival games statistics fetched successfully")
    );
});

// ==================== LIST GAMES ====================
export const getGames = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, search, page = 1, limit = 50 } = req.query;
    const festivalYear = await resolveFestivalYear(req.query.festivalYear, userId);

    if (!festivalYear) {
        return res.status(200).json(
            new ApiResponse(200, {
                games: [],
                total: 0,
                page: 1,
                pages: 0,
                festivalYear: null,
            }, "No active festival year")
        );
    }

    const filter = { createdBy: userId, festivalYear };

    if (status && ["Upcoming", "Ongoing", "Completed"].includes(status)) {
        filter.status = status;
    }

    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
            { name: regex },
            { location: regex },
            { description: regex },
        ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const skipIndex = (pageNum - 1) * limitNum;

    const [games, total] = await Promise.all([
        Game.find(filter)
            .sort({ date: 1, createdAt: 1 })
            .skip(skipIndex)
            .limit(limitNum)
            .lean(),
        Game.countDocuments(filter)
    ]);

    // Aggregate group and winner counts for these games
    const gameIds = games.map((g) => g._id);

    const [groupCounts, resultCounts] = await Promise.all([
        GameGroup.aggregate([
            { $match: { gameId: { $in: gameIds }, createdBy: userId } },
            { $group: { _id: "$gameId", count: { $sum: 1 } } }
        ]),
        GameResult.aggregate([
            { $match: { gameId: { $in: gameIds }, createdBy: userId } },
            {
                $group: {
                    _id: { gameId: "$gameId", position: "$position" },
                    count: { $sum: 1 }
                }
            }
        ])
    ]);

    const groupCountMap = {};
    groupCounts.forEach((item) => {
        groupCountMap[item._id.toString()] = item.count;
    });

    const resultMap = {};
    resultCounts.forEach((item) => {
        const gId = item._id.gameId.toString();
        if (!resultMap[gId]) {
            resultMap[gId] = { totalWinners: 0, p1: 0, p2: 0, p3: 0 };
        }
        resultMap[gId].totalWinners += item.count;
        if (item._id.position === 1) resultMap[gId].p1 += item.count;
        if (item._id.position === 2) resultMap[gId].p2 += item.count;
        if (item._id.position === 3) resultMap[gId].p3 += item.count;
    });

    const enrichedGames = games.map((game) => {
        const gId = game._id.toString();
        const r = resultMap[gId] || { totalWinners: 0, p1: 0, p2: 0, p3: 0 };
        return {
            ...game,
            groupCount: groupCountMap[gId] || 0,
            winnerCount: r.totalWinners,
            firstPlaceCount: r.p1,
            secondPlaceCount: r.p2,
            thirdPlaceCount: r.p3,
        };
    });

    return res.status(200).json(
        new ApiResponse(200, {
            games: enrichedGames,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum) || 1,
            festivalYear,
        }, "Games fetched successfully")
    );
});

// ==================== GET SINGLE GAME DETAILS ====================
export const getGameById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid game ID");
    }

    const game = await Game.findOne({ _id: id, createdBy: userId }).lean();
    if (!game) {
        throw new ApiError(404, "Game not found");
    }

    const [groups, results] = await Promise.all([
        GameGroup.find({ gameId: id, createdBy: userId }).sort({ createdAt: 1 }).lean(),
        GameResult.find({ gameId: id, createdBy: userId })
            .populate("householdId", "building wing flatNumber headOfFamily phone")
            .lean()
    ]);

    // Map results by groupId and position
    const groupResultsMap = {};
    let firstPlaceCount = 0;
    let secondPlaceCount = 0;
    let thirdPlaceCount = 0;

    results.forEach((resItem) => {
        const grpId = resItem.groupId.toString();
        if (!groupResultsMap[grpId]) {
            groupResultsMap[grpId] = {};
        }
        groupResultsMap[grpId][resItem.position] = resItem;

        if (resItem.position === 1) firstPlaceCount++;
        if (resItem.position === 2) secondPlaceCount++;
        if (resItem.position === 3) thirdPlaceCount++;
    });

    const enrichedGroups = groups.map((group) => {
        const grpId = group._id.toString();
        const grpResults = groupResultsMap[grpId] || {};
        return {
            ...group,
            results: {
                1: grpResults[1] || null,
                2: grpResults[2] || null,
                3: grpResults[3] || null,
            },
            winnerCount: Object.keys(grpResults).length,
        };
    });

    const stats = {
        totalGroups: groups.length,
        totalWinners: results.length,
        firstPlaceCount,
        secondPlaceCount,
        thirdPlaceCount,
    };

    return res.status(200).json(
        new ApiResponse(200, {
            game,
            groups: enrichedGroups,
            stats,
        }, "Game details fetched successfully")
    );
});

// ==================== CREATE GAME ====================
export const createGame = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name, date, startTime, endTime, location, description, status, participantCount } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, "Game name is required");
    }

    if (!date) {
        throw new ApiError(400, "Game date is required");
    }

    const festivalYear = await resolveFestivalYear(req.body.festivalYear, userId);
    if (!festivalYear) {
        throw new ApiError(400, "No active festival year available");
    }

    const game = await Game.create({
        name: name.trim(),
        date: new Date(date),
        startTime: startTime ? startTime.trim() : "",
        endTime: endTime ? endTime.trim() : "",
        location: location ? location.trim() : "",
        description: description ? description.trim() : "",
        status: status && ["Upcoming", "Ongoing", "Completed"].includes(status) ? status : "Upcoming",
        participantCount: Number(participantCount) >= 0 ? Number(participantCount) : 0,
        festivalYear,
        createdBy: userId,
    });

    return res.status(201).json(new ApiResponse(201, game, "Game created successfully"));
});

// ==================== UPDATE GAME ====================
export const updateGame = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, date, startTime, endTime, location, description, status, participantCount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid game ID");
    }

    const updateFields = {};
    if (name !== undefined) {
        if (!name.trim()) throw new ApiError(400, "Game name cannot be empty");
        updateFields.name = name.trim();
    }
    if (date !== undefined) {
        updateFields.date = new Date(date);
    }
    if (startTime !== undefined) updateFields.startTime = startTime.trim();
    if (endTime !== undefined) updateFields.endTime = endTime.trim();
    if (location !== undefined) updateFields.location = location.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (status !== undefined) {
        if (!["Upcoming", "Ongoing", "Completed"].includes(status)) {
            throw new ApiError(400, "Invalid game status");
        }
        updateFields.status = status;
    }
    if (participantCount !== undefined) {
        updateFields.participantCount = Math.max(Number(participantCount) || 0, 0);
    }

    const game = await Game.findOneAndUpdate(
        { _id: id, createdBy: userId },
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!game) {
        throw new ApiError(404, "Game not found");
    }

    return res.status(200).json(new ApiResponse(200, game, "Game updated successfully"));
});

// ==================== DELETE GAME (CASCADING) ====================
export const deleteGame = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid game ID");
    }

    const game = await Game.findOne({ _id: id, createdBy: userId });
    if (!game) {
        throw new ApiError(404, "Game not found");
    }

    // Cascading deletion: remove all results and groups associated with this game
    await Promise.all([
        GameResult.deleteMany({ gameId: id, createdBy: userId }),
        GameGroup.deleteMany({ gameId: id, createdBy: userId }),
        Game.deleteOne({ _id: id, createdBy: userId }),
    ]);

    return res.status(200).json(new ApiResponse(200, { deletedId: id }, "Game and associated groups/results deleted successfully"));
});

// ==================== GROUP MANAGEMENT ====================
export const createGroup = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { gameId } = req.params;
    const { name, ageMin, ageMax, category, description, participantCount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        throw new ApiError(400, "Invalid game ID");
    }

    if (!name || !name.trim()) {
        throw new ApiError(400, "Group name is required");
    }

    const game = await Game.findOne({ _id: gameId, createdBy: userId });
    if (!game) {
        throw new ApiError(404, "Parent game not found");
    }

    const parsedAgeMin = ageMin !== undefined && ageMin !== "" && ageMin !== null ? Number(ageMin) : null;
    const parsedAgeMax = ageMax !== undefined && ageMax !== "" && ageMax !== null ? Number(ageMax) : null;

    if (parsedAgeMin !== null && parsedAgeMax !== null && parsedAgeMin > parsedAgeMax) {
        throw new ApiError(400, "Maximum age cannot be less than minimum age");
    }

    const group = await GameGroup.create({
        gameId,
        festivalYear: game.festivalYear,
        name: name.trim(),
        ageMin: parsedAgeMin,
        ageMax: parsedAgeMax,
        category: category ? category.trim() : "",
        description: description ? description.trim() : "",
        participantCount: Number(participantCount) >= 0 ? Number(participantCount) : 0,
        createdBy: userId,
    });

    return res.status(201).json(new ApiResponse(201, group, "Group created successfully"));
});

export const updateGroup = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, ageMin, ageMax, category, description, participantCount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid group ID");
    }

    const updateFields = {};
    if (name !== undefined) {
        if (!name.trim()) throw new ApiError(400, "Group name cannot be empty");
        updateFields.name = name.trim();
    }
    if (category !== undefined) updateFields.category = category.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (participantCount !== undefined) {
        updateFields.participantCount = Math.max(Number(participantCount) || 0, 0);
    }

    const parsedAgeMin = ageMin !== undefined && ageMin !== "" && ageMin !== null ? Number(ageMin) : null;
    const parsedAgeMax = ageMax !== undefined && ageMax !== "" && ageMax !== null ? Number(ageMax) : null;

    if (parsedAgeMin !== null && parsedAgeMax !== null && parsedAgeMin > parsedAgeMax) {
        throw new ApiError(400, "Maximum age cannot be less than minimum age");
    }

    if (ageMin !== undefined) updateFields.ageMin = parsedAgeMin;
    if (ageMax !== undefined) updateFields.ageMax = parsedAgeMax;

    const group = await GameGroup.findOneAndUpdate(
        { _id: id, createdBy: userId },
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    return res.status(200).json(new ApiResponse(200, group, "Group updated successfully"));
});

export const deleteGroup = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid group ID");
    }

    const group = await GameGroup.findOne({ _id: id, createdBy: userId });
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    // Cascade delete results for this group
    await Promise.all([
        GameResult.deleteMany({ groupId: id, createdBy: userId }),
        GameGroup.deleteOne({ _id: id, createdBy: userId }),
    ]);

    return res.status(200).json(new ApiResponse(200, { deletedId: id }, "Group and associated winners deleted successfully"));
});

// ==================== WINNER / RESULT MANAGEMENT ====================
export const setWinner = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { groupId, position, winnerName, participantPhone, householdId, householdInfo, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        throw new ApiError(400, "Invalid group ID");
    }

    const parsedPosition = Number(position);
    if (![1, 2, 3].includes(parsedPosition)) {
        throw new ApiError(400, "Position must be 1 (1st), 2 (2nd), or 3 (3rd)");
    }

    if (!winnerName || !winnerName.trim()) {
        throw new ApiError(400, "Winner name is required");
    }

    const group = await GameGroup.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    // Atomic upsert based on (groupId, position)
    const result = await GameResult.findOneAndUpdate(
        { groupId, position: parsedPosition, createdBy: userId },
        {
            $set: {
                gameId: group.gameId,
                groupId,
                festivalYear: group.festivalYear,
                position: parsedPosition,
                winnerName: winnerName.trim(),
                participantPhone: participantPhone ? participantPhone.trim() : "",
                householdId: householdId && mongoose.Types.ObjectId.isValid(householdId) ? householdId : null,
                householdInfo: householdInfo ? householdInfo.trim() : "",
                note: note ? note.trim() : "",
                createdBy: userId,
            }
        },
        { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json(new ApiResponse(200, result, "Winner assigned successfully"));
});

export const removeWinner = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params; // Can be resultId or groupId-position via query

    if (mongoose.Types.ObjectId.isValid(id)) {
        const deleted = await GameResult.findOneAndDelete({ _id: id, createdBy: userId });
        if (!deleted) {
            throw new ApiError(404, "Winner record not found");
        }
        return res.status(200).json(new ApiResponse(200, { deletedId: id }, "Winner removed successfully"));
    }

    // Alternatively allow by groupId + position query
    const { groupId, position } = req.query;
    if (groupId && position) {
        await GameResult.findOneAndDelete({
            groupId,
            position: Number(position),
            createdBy: userId
        });
        return res.status(200).json(new ApiResponse(200, null, "Winner cleared successfully"));
    }

    throw new ApiError(400, "Invalid request to remove winner");
});

// ==================== ALL WINNERS AGGREGATE ====================
export const getAllWinners = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { position, search } = req.query;
    const festivalYear = await resolveFestivalYear(req.query.festivalYear, userId);

    if (!festivalYear) {
        return res.status(200).json(
            new ApiResponse(200, {
                winners: [],
                counts: { 1: 0, 2: 0, 3: 0, total: 0 },
                festivalYear: null
            }, "No active festival year")
        );
    }

    const filter = { createdBy: userId, festivalYear };

    if (position && [1, 2, 3].includes(Number(position))) {
        filter.position = Number(position);
    }

    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
            { winnerName: regex },
            { note: regex },
            { householdInfo: regex }
        ];
    }

    const results = await GameResult.find(filter)
        .populate("gameId", "name date location status")
        .populate("groupId", "name category ageMin ageMax")
        .populate("householdId", "building wing flatNumber headOfFamily phone")
        .sort({ position: 1, createdAt: 1 })
        .lean();

    // Counts across festival year
    const countAgg = await GameResult.aggregate([
        { $match: { createdBy: userId, festivalYear } },
        { $group: { _id: "$position", count: { $sum: 1 } } }
    ]);

    const counts = { 1: 0, 2: 0, 3: 0, total: 0 };
    countAgg.forEach((item) => {
        if (counts[item._id] !== undefined) {
            counts[item._id] = item.count;
            counts.total += item.count;
        }
    });

    return res.status(200).json(
        new ApiResponse(200, {
            winners: results,
            counts,
            festivalYear
        }, "All winners fetched successfully")
    );
});

// ==================== COMPLETE FESTIVAL RESULTS FOR PDF ====================
export const getCompleteFestivalResults = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const festivalYear = await resolveFestivalYear(req.query.festivalYear, userId);

    if (!festivalYear) {
        return res.status(200).json(
            new ApiResponse(200, {
                festivalYear: null,
                games: [],
                summary: { totalGames: 0, totalGroups: 0, totalWinners: 0, p1: 0, p2: 0, p3: 0 },
                allWinners: []
            }, "No festival year found")
        );
    }

    // 1. Fetch all games for this year
    const games = await Game.find({ createdBy: userId, festivalYear })
        .sort({ date: 1, createdAt: 1 })
        .lean();

    const gameIds = games.map((g) => g._id);

    // 2. Fetch all groups and results for these games
    const [groups, results] = await Promise.all([
        GameGroup.find({ gameId: { $in: gameIds }, createdBy: userId })
            .sort({ createdAt: 1 })
            .lean(),
        GameResult.find({ gameId: { $in: gameIds }, createdBy: userId })
            .populate("householdId", "building wing flatNumber headOfFamily phone")
            .sort({ position: 1, createdAt: 1 })
            .lean()
    ]);

    // Group results by (groupId -> position -> winner)
    const groupResultMap = {};
    let p1Count = 0;
    let p2Count = 0;
    let p3Count = 0;

    results.forEach((r) => {
        const grpId = r.groupId.toString();
        if (!groupResultMap[grpId]) groupResultMap[grpId] = {};
        groupResultMap[grpId][r.position] = r;

        if (r.position === 1) p1Count++;
        if (r.position === 2) p2Count++;
        if (r.position === 3) p3Count++;
    });

    // Group the groups by gameId
    const gameGroupsMap = {};
    groups.forEach((grp) => {
        const gmId = grp.gameId.toString();
        if (!gameGroupsMap[gmId]) gameGroupsMap[gmId] = [];

        const grpId = grp._id.toString();
        const resObj = groupResultMap[grpId] || {};

        gameGroupsMap[gmId].push({
            ...grp,
            results: {
                1: resObj[1] || null,
                2: resObj[2] || null,
                3: resObj[3] || null,
            }
        });
    });

    // Assemble structured games
    const structuredGames = games.map((game) => {
        const gmId = game._id.toString();
        const gmGroups = gameGroupsMap[gmId] || [];

        let gmP1 = 0;
        let gmP2 = 0;
        let gmP3 = 0;

        gmGroups.forEach((g) => {
            if (g.results[1]) gmP1++;
            if (g.results[2]) gmP2++;
            if (g.results[3]) gmP3++;
        });

        return {
            ...game,
            groups: gmGroups,
            stats: {
                totalGroups: gmGroups.length,
                totalWinners: gmP1 + gmP2 + gmP3,
                p1: gmP1,
                p2: gmP2,
                p3: gmP3,
            }
        };
    });

    // Enriched all winners list for PDF appendix
    const gameMap = {};
    games.forEach((g) => { gameMap[g._id.toString()] = g; });
    const groupMap = {};
    groups.forEach((grp) => { groupMap[grp._id.toString()] = grp; });

    const allWinners = results.map((r) => ({
        ...r,
        gameName: gameMap[r.gameId.toString()]?.name || "-",
        gameDate: gameMap[r.gameId.toString()]?.date || null,
        groupName: groupMap[r.groupId.toString()]?.name || "-",
        category: groupMap[r.groupId.toString()]?.category || "",
        ageMin: groupMap[r.groupId.toString()]?.ageMin,
        ageMax: groupMap[r.groupId.toString()]?.ageMax,
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            festivalYear,
            games: structuredGames,
            summary: {
                totalGames: games.length,
                totalGroups: groups.length,
                totalWinners: results.length,
                firstPlaceCount: p1Count,
                secondPlaceCount: p2Count,
                thirdPlaceCount: p3Count,
            },
            allWinners,
        }, "Complete festival results fetched successfully")
    );
});
