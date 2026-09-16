import mongoose from "mongoose";

const gameGroupSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
            required: true,
        },
        festivalYear: {
            type: String,
            required: [true, "Festival year is required"],
            trim: true,
        },
        name: {
            type: String,
            required: [true, "Group name is required"],
            trim: true,
        },
        ageMin: {
            type: Number,
            default: null,
            min: 0,
        },
        ageMax: {
            type: Number,
            default: null,
            min: 0,
        },
        category: {
            type: String,
            trim: true,
            default: "", // e.g. "Boys", "Girls", "Mixed", "Open"
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        participantCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

gameGroupSchema.index({ gameId: 1, createdBy: 1 });
gameGroupSchema.index({ createdBy: 1, festivalYear: 1 });

export const GameGroup = mongoose.model("GameGroup", gameGroupSchema);
