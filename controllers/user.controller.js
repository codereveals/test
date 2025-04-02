import UserModel from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import sendEmail from "../config/emailService.js";



// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,       // Click 'View API Keys' above to copy your API secret
    secure: true
});

/// Controller for User Register 
const registerUserController = async (req, res) => {
    try {

        // Declaring a User 
        let user;

        const { email, name, password } = req.body;

        // Check User and Password not Empty 
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: true, message: "Provide email, name, and password." })
        }

        // Check Existing User 
        user = await UserModel.findOne({ email: email });
        if (user) {
            return res.status(400).json({ success: false, error: true, message: "User already registered with this email." })
        }


        // Generate OTP
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Generate Salt 
        const salt = await bcryptjs.genSalt(10)

        // Password Hashed
        const hashedPassword = await bcryptjs.hash(password, salt);


        // Save User in Database 
        user = new UserModel({
            email: email,
            password: hashedPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + 600000
        })


        await user.save()


        // Send Email Verification 
        const emailTemplate = VerificationEmail(verifyCode);
        await sendEmailFun(email, "Code Reveals Verification Code", "Text Body", verifyCode);

        // Create JWT Token 

        const token = jwt.sign({
            email: user.email, id: user._id
        }, process.env.JSON_WEB_TOKEN_SECRET_KEY)


        return res.status(201).json({
            success: true,
            error: false,
            message: "User registered successfully! Please verify your email.",
            token: token
        });



    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
};

/// Controller for Verify Email 
const verifyEmailController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ success: false, error: true, message: "User Not Found !!" })
        }

        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires > Date.now();

        if (isCodeValid && isNotExpired) {
            user.verifyEmail = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return res.status(200).json({ error: false, success: true, message: "Email Verified Successfully" })
        } else if (!isCodeValid) {
            return res.status(400).json({ error: true, success: false, message: "Invalid OTP" })
        } else {
            return res.status(400).json({ error: true, success: false, message: "OTP Expired" })
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

/// Controller for Login User
const loginUserController = async (req, res) => {
    try {
        // Declaring variable 

        let user;

        const { email, password } = req.body;

        user = await UserModel.findOne({ email: email })

        if (!user) {
            return res.status(400).json({ success: false, error: true, message: "User Not Register !!" })
        }
        if (user.status !== "Active") {
            return res.status(400).json({ success: false, error: true, message: "User is not Active. Please Contact to Admin !!" })
        }
        if (user.verifyEmail !== true) {
            return res.status(400).json({ success: false, error: true, message: "Please Verify Email" })
        }
        const checkPassword = await bcryptjs.compare(password, user.password)

        if (!checkPassword) {
            return res.status(400).json({ success: false, error: true, message: "Wrong Password " })
        }

        let accessToken = await generateAccessToken(user._id)
        let refreshToken = await generateRefreshToken(user._id)

        const updateUser = await UserModel.findByIdAndUpdate(user?._id, { last_login_date: Date.now() })


        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        res.cookie('accessToken', accessToken, cookieOption)
        res.cookie('refreshToken', refreshToken, cookieOption)


        return res.json({
            message: "Login SuccessFully", error: false, success: true, data: {
                accessToken, refreshToken
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

/// Controller for Logout User
const logoutUserController = async (req, res) => {
    try {
        const userid = req.userId;
        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        res.clearCookie('accessToken', cookieOption)
        res.clearCookie('refreshToken', cookieOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, { refresh_token: "" })
        return res.json({
            message: "Logout Successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

/// Image Upload of USER AVATAR
var imagesArr = []
const userAvatarController = async (req, res) => {
    try {
        imagesArr = [];
        const userId = req.userId;
        const user = await UserModel.findOne({ _id: userId })

        // first Image Remove 

        const userAvatar = user.avatar;
        const urlArr = userAvatar.split("/");
        const imageAvatar = urlArr[urlArr.length - 1];
        const imageName = imageAvatar.split(".")[0];

        if (!imageName) {
            return res.status(400).json({ message: "Invalid image name", error: true });
        }

        // Destroy image from Cloudinary
        const resp = await cloudinary.uploader.destroy(imageName);



        // ---- Original Image Store ====


        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false
        }

        for (let i = 0; i < req?.files?.length; i++) {



            const img = await cloudinary.uploader.upload(
                req?.files[i]?.path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req?.files[i]?.filename}`);
                    console.log(result);
                }
            )

            user.avatar = imagesArr[0];
            await user.save()

            return res.status(200).json({
                _id: userId,
                avatar: imagesArr[0]
            })
        }

    } catch (error) {
        console.error("Error uploading avatar:", error.message);
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
};


/// Image Remove of USER AVATAR
const removeImageFromCloudinary = async (req, res) => {
    try {
        const imgUrl = req.query.img;
        const urlArr = imgUrl.split("/");
        const image = urlArr[urlArr.length - 1];
        const imageName = image.split(".")[0];

        if (!imageName) {
            return res.status(400).json({ message: "Invalid image name", error: true });
        }


        // Destroy image from Cloudinary
        const resp = await cloudinary.uploader.destroy(imageName);

        if (resp.result === "ok") {
            return res.status(200).json({ message: "Image deleted successfully", success: true });
        } else {
            return res.status(400).json({ message: "Failed to delete image", error: true });
        }
    } catch (error) {
        console.error("Error deleting image:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
};


// Update User Details 
const updateUserDetailController = async (req, res) => {
    try {
        const userId = req.userId; // Auth Middleware 
        const { name, email, password, mobile } = req.body;

        // Check User Exits

        const userExist = await UserModel.findById(userId);

        if (!userExist) {
            return res.status(400).send("User Can't updated!!")
        }

        // If user Update there email need to verify the email 

        let verifyCode = "";

        if (email !== userExist.email) {
            verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        }

        let hashedPassword = "";

        if (password) {
            const salt = await bcryptjs.genSalt(10);
            hashedPassword = await bcryptjs.hash(password, salt);
        } else {
            hashedPassword = userExist.password;
        }

        const updateUser = await UserModel.findByIdAndUpdate(userId,
            {
                name: name,
                mobile: mobile,
                email: email,
                verifyEmail: email !== userExist.email ? false : true,
                password: hashedPassword,
                otp: verifyCode !== "" ? verifyCode : null,
                otpExpires: verifyCode !== "" ? Date.now() + 600000 : "",
            },
            {
                new: true
            }
        )

        // Send Verification Email  


        if (email !== userExist.email) {
            const emailTemplate = VerificationEmail(verifyCode);
            await sendEmailFun(email, "Code Reveals Verification Code", "Text Body", verifyCode);
        }

        return res.status(201).json({
            success: true,
            error: false,
            message: "User Detail Update successfully!",
            user: updateUser
        });

    } catch (error) {
        console.error("Error Updating User Details:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}


// Forgot a Password 
const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(500).json({
                message: error.message || "User not Registered !",
                error: true,
                success: false
            });
        }

        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,
            {
                otp: verifyCode,
                otpExpires: Date.now() + 600000,
            },
            {
                new: true
            }
        )

        const emailTemplate = VerificationEmail(verifyCode);
        await sendEmailFun(user?.email, "Code Reveals Verification Code", "Text Body", verifyCode);

        return res.status(301).json({
            success: true,
            error: false,
            message: "Check you email Otp Sent on Your Email.",
            user: updateUser

        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}


// Verify OTP 
const verifyOtpController = async (req, res) => {
    try {

        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email });


        // Check USer 
        if (!user) {
            return res.status(500).json({
                message: error.message || "Email not Registered !",
                error: true,
                success: false
            });
        }


        if (!email || !otp) {
            return res.status(500).json({
                message: error.message || "Required Email and OTP",
                error: true,
                success: false
            });
        }

        if (otp !== user.otp) {
            return res.status(500).json({
                message: error.message || "OTP not Valid !",
                error: true,
                success: false
            });
        }

        const currentTime = new Date().toISOString();

        if (user.otpExpires < currentTime) {
            return res.status(300).json({
                message: error.message || "OTP Expired",
                error: true,
                success: false
            });
        }

        user.otp = "";
        user.otpExpires = "";

        await user.save();


        // Return finale 

        return res.status(300).json({
            message: "OTP Varified",
            error: false,
            success: true
        });



    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

// Reset Password 

const resetPasswordController = async (req, res) => {

    try {

        const { email, newPassword, confirmPassword } = req.body;
        // Define user 
        const user = await UserModel.findOne({ email });

        // Check User is register or not
        if (!user) {
            return res.status(500).json({
                message: error.message || "Email not Registered !",
                error: true,
                success: false
            });
        }


        // Validate email, New password and confirm Password
        if (!email || !newPassword || !confirmPassword) {
            return res.status(500).json({
                message: error.message || "Email, New Password and Confirm Password not valid !",
                error: true,
                success: false
            });
        }

        // Check new password and confirm passwiord same 

        if (newPassword !== confirmPassword) {
            return res.status(500).json({
                message: error.message || "Confirm password not match",
                error: true,
                success: false
            });
        }

        // Generate Salt 
        const salt = await bcryptjs.genSalt(10)

        // Password Hashed
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        // Update User with New Password 
        const updatedUser = await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword })

        // Updated finale 

        return res.json({
            message: "Password Updated Successfully",
            error: false,
            success: true
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }

}


// Refresh Token 

const refreshTokenController = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]

        if (!refreshToken) {
            return res.status(400).json({
                message: "Invalid Token",
                error: true,
                success: false
            });
        }
        // Verify Token 

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);

        if (!verifyToken) {
            return res.status(400).json({
                message: " Token is Expired",
                error: true,
                success: false
            });
        }

        const userId = verifyToken?._id;
        const newAccessToken = await generateAccessToken(userId)

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        res.cookie("accessToken", newAccessToken, cookieOption)

        return res.status(200).json({
            message: "New Access Token Generated",
            error: false,
            success: true,
            date: {
                accessToken: newAccessToken
            }
        });


    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}


// Get User Details 
const userDetailsController = async (req, res) => {
    try {

        const userId = req.userId;
        console.log(userId)

        const user = await UserModel.findById(userId).select('-password -refresh_token');

        return res.status(200).json({
            message: "Fetch User Detail SuccessFull",
            error: false,
            success: true,
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export { registerUserController, verifyEmailController, loginUserController, logoutUserController, userAvatarController, removeImageFromCloudinary, updateUserDetailController, forgotPasswordController, verifyOtpController, resetPasswordController, refreshTokenController, userDetailsController }