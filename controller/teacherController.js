const httpStatusCode = require("../constant/httpStatusCode");
const TeacherModel = require("../models/teacherModel");
const { validationResult } = require("express-validator");

const ViewTeacherDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        errors: errors.array(),
      });
    }
    const teacher = await TeacherModel.findById(req.user._id);
    if (!teacher) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Teacher is not found",
      });
    }
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Teacher details",
      data: teacher,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

const UpdateTeacherDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      firstname,
      lastname,
      email,
      phone,
      expertise,
      username,
      password,
      confirmPassword,
      profileImage,
      pincode,
      address,
      city,
      country,
      aboutInfo,
      personalWebsite,
      githubProfile,
    } = req.body.userDetails;

    console.log(req.body);
    const updatedTeacher = await TeacherModel.findByIdAndUpdate(
      req.user._id,
      {
        firstname,
        lastname,
        phone,
        expertise,
        username,
        profileImage,
        pincode,
        address,
        city,
        country,
        aboutInfo,
        personalWebsite,
        githubProfile,
      },
      { new: true }
    ); // Ensure you get the updated document back

    if (!updatedTeacher) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Teacher details successfully updated",
      data: updatedTeacher,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update teacher details",
      error: error.message,
    });
  }
};

module.exports = { ViewTeacherDetails, UpdateTeacherDetails };
