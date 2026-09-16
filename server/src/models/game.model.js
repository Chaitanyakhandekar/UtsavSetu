import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Game / Event name is required"],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, "Game date is required"],
            default: Date.now,
        },
        startTime: {
            type: String,
            trim: true,
            default: "",
        },
        endTime: {
            type: String,
            trim: true,
            default: "",
        },
        location: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["Upcoming", "Ongoing", "Completed"],
            default: "Upcoming",
            required: true,
        },
        participantCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        festivalYear: {
            type: String,
            required: [true, "Festival year is required"],
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

gameSchema.index({ createdBy: 1, festivalYear: 1, status: 1 });
gameSchema.index({ createdBy: 1, festivalYear: 1, date: 1 });

export const Game = mongoose.model("Game", gameSchema);
