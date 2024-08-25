const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    expertise: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    pincode: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    aboutInfo: {
      type: String,
      required: false,
    },
    personalWebsite: {
      type: String,
      required: false,
    },
    githubProfile: {
      type: String,
      required: false,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
      },
    ],
    wishlist:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:'course'
      }
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "review",
      },
    ],
    role: {
      type: String,
      required: true,
    },
    forumQuestion:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:'forum'
      }
    ],
    forumAnswer:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:'forum'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
