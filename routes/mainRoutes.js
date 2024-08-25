const express = require("express");
const Router = express.Router();
const { register, login } = require("../controller/adminController");
const {
  registerUser,
  loginUser,
  ViewUsers,
  ViewStudentDetails,
  UpdateStudentDetails,
} = require("../controller/userController");
const { verifyToken, verifyTokenNew } = require("../middleware/authMiddleware");
const {
  ViewTeacherDetails,
  UpdateTeacherDetails,
} = require("../controller/teacherController");
const upload = require("../middleware/multerMiddleware");
const {
  AddCourse,
  ViewCourses,
  ViewPublishCourseByTeacher,
  ViewCourseDetailByID,
  EnrolledCourseByStudentId,
  ViewEnrolledStudentId,
} = require("../controller/courseController");
const {
  AddWishlist,
  ViewWishlistDetails,
} = require("../controller/wishlistController");
const {
  AddReview,
  ViewReviewListByCourseId,
  ViewReviewListByStudentId,
  EditReviewStudentId,
  DeleteReviewStudentId,
  IsReviewedByStudentIdCourseId,
} = require("../controller/reviewController");
const {
  AddQuestion,
  ViewForumQuestionList,
  ViewForumWithQuestionId,
  AddForumAnswer,
  ViewForumQuestionListWithStudentId,
  UpdateQuestion,
  DeleteQuestion,
  ViewAnswerWithStudentId,
  UpdateAnswerWithStudentId,
  DeleteAnswerStudentID,
} = require("../controller/forumController");

Router.post("/register", register);
Router.post("/login", login);

Router.post("/user-Register", registerUser);
Router.post("/user-Login", loginUser);
Router.get("/view-Users", verifyToken, ViewUsers);

//teacher routes
Router.post("/view-teacher-details", verifyToken, ViewTeacherDetails);
Router.post("/update-teacher-details", verifyToken, UpdateTeacherDetails);

//student routes
Router.post("/view-student-details", verifyToken, ViewStudentDetails);
Router.post(
  "/update-student-details",
  verifyTokenNew,
  upload.single("profileImage"),
  UpdateStudentDetails
);

//upload the profile image
Router.post("/upload-profile", upload.single("profileImage"));

//course routes
Router.post("/add-course", verifyToken, AddCourse);
Router.get("/view-courses", ViewCourses);
Router.post(
  "/view-course-teacher-publish",
  verifyToken,
  ViewPublishCourseByTeacher
);
Router.post("/view-courseDetails-ById", ViewCourseDetailByID);

//wishlist routes
Router.post("/add-wishlist", verifyToken, AddWishlist);
Router.post("/view-wishlist", verifyToken, ViewWishlistDetails);

//enrolled course by student routes
Router.post("/add-enrolled", verifyToken, EnrolledCourseByStudentId);
Router.post("/view-enrolled-by-studentID", verifyToken, ViewEnrolledStudentId);

//reviews routes
Router.post("/add-review", verifyTokenNew, AddReview);
Router.post("/view-Review-courseId", ViewReviewListByCourseId);
Router.post(
  "/view-Review-list-studentId",
  verifyToken,
  ViewReviewListByStudentId
);
Router.post("/edit-review-studentId", verifyTokenNew, EditReviewStudentId);
Router.post("/delete-review-studentId", verifyTokenNew, DeleteReviewStudentId);
Router.post(
  "/isReviewed-studentId-courseId",
  verifyTokenNew,
  IsReviewedByStudentIdCourseId
);

//Forum routes
Router.post("/add-question", verifyTokenNew, AddQuestion);
Router.post("/view-Forum-QuestionList", ViewForumQuestionList);
Router.post("/view-forum-question-id", ViewForumWithQuestionId);
Router.post("/add-forum-answer", verifyTokenNew, AddForumAnswer);
Router.post(
  "/view-Forum-QuestionList-studentId",
  verifyToken,
  ViewForumQuestionListWithStudentId
);
Router.post("/update-question", verifyTokenNew, UpdateQuestion);
Router.post('/delete-question',verifyTokenNew,DeleteQuestion);
Router.post('/view-answerList-studentId',verifyTokenNew,ViewAnswerWithStudentId);
Router.post('/update-answer-studentId',verifyTokenNew,UpdateAnswerWithStudentId);
Router.post('/delete-answer-studentId',verifyTokenNew,DeleteAnswerStudentID);

module.exports = Router;
