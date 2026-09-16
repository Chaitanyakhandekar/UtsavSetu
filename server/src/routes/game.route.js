import express from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import {
    getFestivalGameStats,
    getGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    createGroup,
    updateGroup,
    deleteGroup,
    setWinner,
    removeWinner,
    getAllWinners,
    getCompleteFestivalResults,
} from "../controllers/game.controller.js";

const router = express.Router();

router.use(userAuth);

// Festival-wide aggregates & PDF export data
router.get("/stats", getFestivalGameStats);
router.get("/all-winners", getAllWinners);
router.get("/complete-results", getCompleteFestivalResults);

// Games CRUD
router.route("/")
    .get(getGames)
    .post(createGame);

router.route("/:id")
    .get(getGameById)
    .put(updateGame)
    .delete(deleteGame);

// Groups
router.post("/:gameId/groups", createGroup);
router.route("/groups/:id")
    .put(updateGroup)
    .delete(deleteGroup);

// Winners / Results
router.post("/winners", setWinner);
router.delete("/winners/:id", removeWinner);
router.delete("/winners", removeWinner);

export default router;
