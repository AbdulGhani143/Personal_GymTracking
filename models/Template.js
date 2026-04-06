const mongoose = require("mongoose");

const templateExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    exercises: {
      type: [templateExerciseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

templateSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Template", templateSchema);
