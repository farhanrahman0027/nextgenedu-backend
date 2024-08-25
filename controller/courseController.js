const CourseModel = require("../models/courseModel");
const TeacherModel = require("../models/teacherModel");
const StudentModel = require("../models/userModel");
const { validationResult } = require("express-validator");
const httpStatusCode = require("../constant/httpStatusCode");

const AddCourse = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        error: errors.array(),
      });
    }

    // Extract course details from request body
    const {
      courseTitle,
      courseCategory,
      videoLink,
      aboutCourse,
      learnItems,
      materialIncludesItems,
      requirementItems,
      tagItems,
      audienceItems,
    } = req.body.courseDetails;

    // Get teacher ID from authenticated user
    const teacherId = req.user._id;

    // Check if teacher exists
    const teacher = await TeacherModel.findById(teacherId);
    if (!teacher) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Teacher not found!!",
      });
    }

    // Create new course
    const course = await CourseModel.create({
      courseTitle,
      courseCategory,
      videoLink,
      aboutCourse,
      learnItems,
      materialIncludesItems,
      requirementItems,
      tagItems,
      audienceItems,
      teacherId,
      status: "publish",
    });

    // Check if course creation was successful
    if (!course) {
      return res.status(httpStatusCode.METHOD_NOT_ALLOWED).json({
        success: false,
        message: "Something went wrong in the course model!!",
      });
    }

    // Update teacher's courses array
    teacher.courses.push(course._id);
    await teacher.save();

    // Return success response
    return res.status(httpStatusCode.CREATED).json({
      success: true,
      message: "Course added!!",
      data: course,
    });
  } catch (error) {
    // Handle errors
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const ViewCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find().populate("teacherId");
    if (!courses) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "something went wrong in the Course Models",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Courses find successful",
      data: courses,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "something went wrong !!",
      error: error.message,
    });
  }
};

const ViewCourseDetailByID = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await CourseModel.findById(courseId).populate("teacherId");
    if (!course) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "something is wrong in the course model!",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "course is founded",
      data: course,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const ViewPublishCourseByTeacher = async (req, res) => {
  try {
    const TeacherId = req.user._id;
    const courses = await TeacherModel.findById(TeacherId).populate("courses");
    if (!courses) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Something is wrong in the viewing",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "view course successful",
      data: courses,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong !!",
      error: error.message,
    });
  }
};

const EnrolledCourseByStudentId = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Please provide courseId",
      });
    }
    const student = await StudentModel.findById(studentId);
    if (!student) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Student not found!!",
      });
    }
    console.log("course:", courseId);
    console.log("student", studentId);
    console.log("enrolledCourses:", student.enrolledCourses);

    const isEnrolled = student.enrolledCourses && student.enrolledCourses.find(course => course.toString() === courseId);

    if (isEnrolled) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "You are already enrolled in this course!!",
      });
    }
    const enrolled = student.enrolledCourses.push(courseId);
    student.save();
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Enrolled successfully!!",
      data: enrolled,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong !!",
      error: error.message,
    });
  }
};

// View enrolled courses by studentId
const ViewEnrolledStudentId=async (req,res)=>{
  try{
    const studentId=req.user._id;
    const student=await StudentModel.findById(studentId).populate('enrolledCourses');
    if(!student){
      return res.status(httpStatusCode.NOT_FOUND).json({
        success:false,
        message:"Student not found!!"
      })
    }

    return res.status(httpStatusCode.OK).json({
      success:true,
      message:'Enrolled courses',
      data:student.enrolledCourses
    })
  }catch(error){
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success:false,
      message:"Something went wrong!!",
      error:error.message
    })
  }
}

module.exports = {
  AddCourse,
  ViewCourses,
  ViewPublishCourseByTeacher,
  ViewCourseDetailByID,
  EnrolledCourseByStudentId,
  ViewEnrolledStudentId
};
