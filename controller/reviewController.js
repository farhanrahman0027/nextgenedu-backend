const ReviewModel = require("../models/reviewModel");
const UserModel = require("../models/userModel");
const CourseModel = require("../models/courseModel");
const httpStatusCode = require("../constant/httpStatusCode");
const { validationResult } = require("express-validator");

const AddReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { courseId } = req.body;
    const { rating, reviewText } = req.body.reviewDetails;
    const userId = req.user._id;

    if (!courseId || !userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "CourseId or userId is missing",
      });
    }

    const review = await ReviewModel.create({
      course: courseId,
      student: userId,
      rating,
      reviewText,
    });

    const course = await CourseModel.findByIdAndUpdate(
      courseId,
      {
        $push: { reviews: review._id },
      },
      { new: true }
    );

    if (!course) {
      await ReviewModel.findByIdAndDelete(review._id); // Rollback review creation
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Course not found",
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { reviews: review._id },
      },
      { new: true }
    );

    if (!user) {
      await ReviewModel.findByIdAndDelete(review._id); // Rollback review creation
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(httpStatusCode.CREATED).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const ViewReviewListByCourseId = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Invalid courseId",
      });
    }

    const reviewList = await ReviewModel.find({ course: courseId }).populate(
      "student"
    );

    if (!reviewList || reviewList.length === 0) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "No reviews found for this course",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Review list",
      data: reviewList,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const ViewReviewListByStudentId = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "User is not found",
      });
    }
    const reviewList = await ReviewModel.find({ student: userId })
      .populate("course")
      .populate("student");
    if (!reviewList) {
      return res.status(httpStatusCode.METHOD_NOT_ALLOWED).json({
        success: false,
        message: "No reviews found ",
      });
    }
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Reviews list founded",
      data: reviewList,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong !!",
      error: error.message,
    });
  }
};

const EditReviewStudentId = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "user is not found",
      });
    }
    const { reviewId, reviewText, rating } = req.body;
    if (!reviewId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "ReviewId is not found",
      });
    }

    const review = await ReviewModel.findByIdAndUpdate(
      reviewId,
      {
        reviewText,
        rating,
      },
      { new: true }
    );

    if (!review) {
      return res.status(httpStatusCode.METHOD_NOT_ALLOWED).json({
        success: false,
        message: "error in review model",
      });
    }


    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "review updated successfully",
      data: review,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};


const DeleteReviewStudentId=async (req,res)=>{
  try{
    const userId=req.user._id;
    if(!userId){
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success:false,
        message:"User is not valid"
      })
    }
    const {reviewId}=req.body;
    if(!reviewId){
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success:false,
        message:"reviewId is not valid"
      })
    }

    const review=await ReviewModel.deleteOne({ _id: reviewId });
    if(!review){
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success:false,
        message:"review is not delete"
      })
    }
  

    return res.status(httpStatusCode.OK).json({
      success:true,
      message:"Review is delete",
      data:review
    })
  }catch(error){
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success:false,
      message:"Something went wrong !!",
      error:error.message
    })
  }
}

const IsReviewedByStudentIdCourseId=async (req,res)=>{
  try{
    const userId=req.user._id;
    if(!userId){
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success:false,
        message:"userId is required"
      })
    }
    const {courseId}=req.body;
    if(!courseId){
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success:false,
        message:"CourseId is not found "
      })
    }

    const IsExistReviewCourseId=await ReviewModel.find({course:courseId,student:userId});
    if(IsExistReviewCourseId.length>0){
      return res.status(httpStatusCode.OK).json({
        success:true,
        message:"Review is already added",
        data:IsExistReviewCourseId
      })
    }

    return res.status(httpStatusCode.BAD_REQUEST).json({
      success:false,
      message:"Review is not added yet",
    })

  }catch(error){
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success:false,
      message:"Something went wrong !!",
      error:error.message
    })
  
  }
}
module.exports = {
  AddReview,
  ViewReviewListByCourseId,
  ViewReviewListByStudentId,
  EditReviewStudentId,
  DeleteReviewStudentId,
  IsReviewedByStudentIdCourseId
};
