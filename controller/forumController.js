const ForumModel = require("../models/forumModel");
const StudentModel = require("../models/userModel");
const TeacherModel = require("../models/teacherModel");
const httpStatusCode = require("../constant/httpStatusCode");
const { validationResult, ExpressValidator } = require("express-validator");

const AddQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "User not found",
      });
    }

    const { question, description, tags } = req.body.questionDetails;
    const tagsList = tags.split(",");
    const role = req.user.role;
    let Forum;
    if (role === "student") {
      Forum = await ForumModel.create({
        question,
        description,
        tags: tagsList,
        studentId: userId,
        role,
      });
    } else if (role === "teacher") {
      Forum = await ForumModel.create({
        question,
        description,
        tags: tagsList,
        teacherId: userId,
        role,
      });
    }

    let userUpdateQuery = {};
    if (req.user.role === "student") {
      userUpdateQuery = { $push: { forumQuestion: Forum._id } };
    } else if (req.user.role === "teacher") {
      userUpdateQuery = { $push: { forumQuestion: Forum._id } };
    }

    const User = req.user.role === "student" ? StudentModel : TeacherModel;
    const updatedUser = await User.findByIdAndUpdate(userId, userUpdateQuery, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: `${req.user.role} is not found and push the forum question`,
      });
    }

    return res.status(httpStatusCode.CREATED).json({
      success: true,
      message: "Question added",
      data: Forum,
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const ViewForumQuestionList = async (req, res) => {
  try {
    const ForumQuestionList = await ForumModel.find()
      .populate("studentId")
      .populate("teacherId");
    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Forum Question List",
      data: ForumQuestionList,
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const ViewForumWithQuestionId = async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Please provide the question Id",
      });
    }
    const ForumQuestion = await ForumModel.findById(questionId)
      .populate({
        path: "studentId",
      })
      .populate({
        path: "answers",
        populate: {
          path: "studentId",
        },
      })
      .populate({
        path: "answers",
        populate: {
          path: "teacherId",
        },
      })
      .populate("teacherId");
    if (!ForumQuestion) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Forum Question",
      data: ForumQuestion,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const AddForumAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    if (!questionId || !answer) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "please provide the questionId and answer",
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "UserId is not provided",
      });
    }
    const role = req.user.role;
    let ForumAnswer = {};
    if (role === "student") {
      ForumAnswer = await ForumModel.findByIdAndUpdate(questionId, {
        $push: {
          answers: {
            answer,
            studentId: userId,
            vote: 0,
            role,
          },
        },
      });
    } else if (role === "teacher") {
      ForumAnswer = await ForumModel.findByIdAndUpdate(questionId, {
        $push: {
          answers: {
            answer,
            teacherId: userId,
            vote: 0,
            role,
          },
        },
      });
    }

    if (!ForumAnswer) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Forum question is not found",
      });
    }

    let userUpdateQuery = {};
    if (req.user.role === "student") {
      userUpdateQuery = { $push: { forumAnswer: ForumAnswer._id } };
    } else if (req.user.role === "teacher") {
      userUpdateQuery = { $push: { forumAnswer: ForumAnswer._id } };
    }

    const User = req.user.role === "student" ? StudentModel : TeacherModel;
    const updatedUser = await User.findByIdAndUpdate(userId, userUpdateQuery, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: `${req.user.role} is not found and push the forum question`,
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Answer added successfully",
      data: ForumAnswer,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const ViewForumQuestionListWithStudentId = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "UserId is not provided",
      });
    }

    const QuestionList = await StudentModel.findById(userId)
      .populate("forumQuestion")
      .populate("forumAnswer");
    if (!QuestionList) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "user is not found",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Forum Question List",
      data: QuestionList,
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const UpdateQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "User not found",
      });
    }

    const { question, description, tags } = req.body.questionDetails;
    const { forumId } = req.body;
    const tagsList = tags.split(",");
    const role = req.user.role;

    if (!question || !description || !tags) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "question or description or tags is empty",
      });
    }
    const Forum = await ForumModel.findByIdAndUpdate(forumId, {
      question,
      description,
      tags: tagsList,
    });

    if (!Forum) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Forum is not found!!",
      });
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Question updated",
      data: Forum,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const DeleteQuestion = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "UserId is not found",
      });
    }

    const role = req.user.role;
    const { forumId } = req.body;
    if (!forumId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "ForumId is not Found",
      });
    }

    // Check if the user is allowed to delete the question
    const forumQuestion = await ForumModel.findById(forumId);
    if (!forumQuestion) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "Forum question not found",
      });
    }

    if (
      (role === "student" &&
        forumQuestion.studentId.toString() !== userId.toString()) ||
      (role === "teacher" &&
        forumQuestion.teacherId.toString() !== userId.toString())
    ) {
      return res.status(httpStatusCode.FORBIDDEN).json({
        success: false,
        message: "User is not authorized to delete this question",
      });
    }

    // Delete the forum question
    await ForumModel.findByIdAndDelete(forumId);

    // Remove the forumId from the user's forumQuestion array and save
    if (role === "student") {
      const student = await StudentModel.findById(userId);
      student.forumQuestion.pull(forumId);
      await student.save();
    } else if (role === "teacher") {
      const teacher = await TeacherModel.findById(userId);
      teacher.forumQuestion.pull(forumId);
      await teacher.save();
    }

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Forum question deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong !!",
    });
  }
};

const ViewAnswerWithStudentId = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "UserId is not found",
      });
    }

    const role = req.user.role;
    // Fetch the user and populate the forumAnswer field
    const user = await StudentModel.findById(userId).populate("forumAnswer");
    if (!user) {
      return res.status(httpStatusCode.NOT_FOUND).json({
        success: false,
        message: "User is not found",
      });
    }

    // Collect all answers given by the student
    let studentAnswers = [];
    // Use Promise.all to wait for all async operations
    await Promise.all(
      user.forumAnswer.map(async (forum) => {
        let QuestionUser;
        if (forum.role === "student") {
          QuestionUser = await StudentModel.findById(forum.studentId);
        } else if (forum.role === "teacher") {
          QuestionUser = await TeacherModel.findById(forum.teacherId);
        }

        if (forum.answers && forum.answers.length > 0) {
          forum.answers.forEach((answer) => {
            if (
              answer &&
              answer.studentId &&
              answer.studentId.toString() === userId.toString()
            ) {
              studentAnswers.push({
                forum: forum,
                answerId: answer._id,
                answer: answer.answer,
                answer_Vote: answer.vote,
                answerUpdateAt: answer.updatedAt,
                QuestionUser,
              });
            }
          });
        }
      })
    );

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Answer list found",
      data: studentAnswers,
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

const UpdateAnswerWithStudentId = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "UserId is not found",
      });
    }
    const { answerText, forumId, answerId } = req.body;

    if (!answerText || !forumId || !answerId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "AnswerText or forumId or answerId is empty",
      });
    }

    const Forum = await ForumModel.findById(forumId);
    if (!Forum) {
      return res.status(httpStatusCode.FORBIDDEN).json({
        success: false,
        message: "Forum is not found",
      });
    }
    Forum.answers.map(async (answer) => {
      if (answer._id.toString() === answerId.toString()) {
        answer.answer = answerText;
        await answer.save();
      }
    });
    await Forum.save();

    return res.status(httpStatusCode.OK).json({
      success: true,
      message: "Update Successfully",
    });
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!!",
      error: error.message,
    });
  }
};

const DeleteAnswerStudentID = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const userId = req.user._id;
    if (!userId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "UserId is not given",
      });
    }

    const { forumId, answerId } = req.body;
    if (!forumId || !answerId) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "ForumId or AnswerId is empty",
      });
    }

    const role = req.user.role;

    const Forum = await ForumModel.findById(forumId);
    if(!Forum){
      return res.status(httpStatusCode.NOT_FOUND).json({
        success:false,
        message:"Forum is not found"
      })
    }
    const AnswerIndex=Forum.answers.findIndex((answer)=>answer._id.toString()===answerId.toString());
    if(AnswerIndex==-1){
      return res.status(httpStatusCode.NOT_FOUND).json({
        success:false,
        message:"Answer is not found"
      })
    }

    Forum.answers.splice(AnswerIndex,1);
    await Forum.save();

    if(role==='student'){
      const Student=await StudentModel.findById(userId);
      if(!Student){
        return res.status(httpStatusCode.NOT_FOUND).json({
          success:false,
          message:"Student is not found"
        })
      }
      const StudentAnswerIndex=Student.forumAnswer.findIndex((answer) =>answer.toString()===forumId.toString());
      if(StudentAnswerIndex==-1){
        return res.status(httpStatusCode.NOT_FOUND).json({
          success:false,
          message:"Student forum answer is not found"
        })
      }

      Student.forumAnswer.splice(StudentAnswerIndex,1);
      await Student.save();
    }else  if(role==='teacher'){
      const Teacher=await TeacherModel.findById(userId);
      if(!Teacher){
        return res.status(httpStatusCode.NOT_FOUND).json({
          success:false,
          message:"Teacher is not found"
        })
      }
      const TeacherAnswerIndex=Teacher.forumAnswer.findIndex((answer) =>answer.toString()===forumId.toString());
      if(TeacherAnswerIndex==-1){
        return res.status(httpStatusCode.NOT_FOUND).json({
          success:false,
          message:"Teacher forum answer is not found"
        })
      }

      Teacher.forumAnswer.splice(TeacherAnswerIndex,1);
      await Teacher.save();
    }

    return res.status(httpStatusCode.OK).json({
      success:true,
      message:"Answer is deleted successfully"
    })
  } catch (error) {
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong !!",
      error: error.message,
    });
  }
};
module.exports = {
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
};
