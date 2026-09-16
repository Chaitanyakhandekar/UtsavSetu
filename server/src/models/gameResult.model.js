import mongoose from "mongoose";

const gameResultSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
            required: true,
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GameGroup",
            required: true,
            index: true,
        },
        festivalYear: {
            type: String,
            required: [true, "Festival year is required"],
            trim: true,
        },
        position: {
            type: Number,
            required: [true, "Position is required"],
            enum: [1, 2, 3],
        },
        winnerName: {
            type: String,
            required: [true, "Winner name is required"],
            trim: true,
        },
        participantPhone: {
            type: String,
            trim: true,
            default: "",
        },
        householdId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Household",
            default: null,
        },
        householdInfo: {
            type: String,
            trim: true,
            default: "",
        },
        note: {
            type: String,
            trim: true,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate positions within the same group
gameResultSchema.index({ groupId: 1, position: 1 }, { unique: true });
gameResultSchema.index({ createdBy: 1, festivalYear: 1, position: 1 });
gameResultSchema.index({ gameId: 1 });

export const GameResult = mongoose.model("GameResult", gameResultSchema);
