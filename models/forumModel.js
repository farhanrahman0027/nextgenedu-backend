const mongoose = require("mongoose");

const ForumSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    role: {
      type: String,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
    },
    vote:{
      type:Number,
      default:0  
    },
    answers: [
      {
        answer: {
          type: String,
        },
        vote:{
          type:Number,
          default:0  
        },
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        teacherId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "teacher",
        },
        role: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("forum", ForumSchema);
