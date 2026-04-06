const express = require("express");

const {
  startWorkout,
  saveWorkout,
  getWorkoutHistory,
  deleteWorkoutSession,
} = require("../controllers/workoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/start", startWorkout);
router.post("/save", saveWorkout);
router.get("/history", getWorkoutHistory);
router.delete("/:id", deleteWorkoutSession);

module.exports = router;
