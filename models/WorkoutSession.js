const mongoose = require("mongoose");

const setSchema = new mongoose.Schema(
  {
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    reps: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const workoutExerciseSchema = new mongoose.Schema(
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
    sets: {
      type: [setSchema],
      default: [],
    },
  },
  { _id: false }
);

const workoutSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    templateName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    date: {
      type: Date,
      default: null,
      index: true,
    },
    exercises: {
      type: [workoutExerciseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

workoutSessionSchema.index({ user: 1, date: -1 });
workoutSessionSchema.index({ user: 1, status: 1, date: -1 });

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
