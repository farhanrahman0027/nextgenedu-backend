const mongoose = require('mongoose');
const httpStatusCode = require("../constant/httpStatusCode");
const UserModel = require("../models/userModel");
const CourseModel = require("../models/courseModel");

const AddWishlist = async (req, res) => {
    try {
        const UserId = req.user._id;
        if (req.user.role === 'teacher' || req.user.role === 'admin') {
            return res.status(httpStatusCode.METHOD_NOT_ALLOWED).json({
                success: false,
                message: "You are not allowed to add wishlist",
            });
        }

        const { courseId } = req.body;
        const user = await UserModel.findById(UserId);
        if (!user) {
            return res.status(httpStatusCode.NOT_FOUND).json({
                success: false,
                message: "User not found"
            });
        }
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return res.status(httpStatusCode.NOT_FOUND).json({
                success: false,
                message: "Course not found"
            });
        }
        const isWishlist = user.wishlist.find(wishlist => wishlist.toString() === courseId);

        if (isWishlist) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                success: false,
                message: "Course already in wishlist",
                data:isWishlist
            });
        }
        // Push courseId into the wishlist array
        user.wishlist.push(courseId);
        await user.save();
        return res.status(httpStatusCode.OK).json({
            success: true,
            message: "Course added to wishlist",
            data:user.wishlist
        });

    } catch (error) {
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
};

const ViewWishlistDetails=async (req,res)=>{
    try{
        const userId=req.user._id;
        const user= await UserModel.findById(userId).populate("wishlist");
        if(!user){
            return res.status(httpStatusCode.BAD_REQUEST).json({
                success:false,
                message:"user not found"
            })
        }
        return res.status(httpStatusCode.OK).json({
            success:true,
            message:"viewed user wishlist",
            data:user.wishlist
        })

    }catch(error){
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Something went wrong!!",
            error: error.message
        });
    }
}

module.exports = {
    AddWishlist,
    ViewWishlistDetails
};
