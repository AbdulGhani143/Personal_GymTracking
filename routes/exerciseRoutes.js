const express = require("express");

const {
  searchExerciseCatalog,
  getExerciseById,
  getExerciseImageProxy,
} = require("../controllers/exerciseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/image/:id", getExerciseImageProxy);

router.use(protect);

router.get("/search", searchExerciseCatalog);
router.get("/:id", getExerciseById);

module.exports = router;
