const mongoose = require("mongoose");
const CourseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: false,
    },
    courseCategory: {
      type: String,
      required: false,
    },
    videoLink: {
      type: String,
      required: false,
    },
    aboutCourse: {
      type: String,
      required: false,
    },
    learnItems: {
      type: [],
      required: false,
    },
    materialIncludesItems: {
      type: [],
      required: false,
    },
    requirementItems: {
      type: [],
      required: false,
    },
    tagItems: {
      type: [],
      required: false,
    },
    audienceItems: {
      type: [],
      required: false,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "review",
        required: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("course", CourseSchema);
