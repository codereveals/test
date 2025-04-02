import { Router } from "express";
import { loginUserController, logoutUserController, registerUserController, removeImageFromCloudinary, userAvatarController, verifyEmailController, updateUserDetailController, forgotPasswordController, verifyOtpController, resetPasswordController, refreshTokenController, userDetailsController } from "../controllers/user.controller.js";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";


const userRouter = Router()

userRouter.post("/register", registerUserController)
userRouter.post("/verifyEmail", verifyEmailController)
userRouter.post("/login", loginUserController)
userRouter.get("/logout", auth, logoutUserController)
userRouter.put("/user-avatar", auth, upload.array('avatar'), userAvatarController)
userRouter.delete("/deleteImage", auth, removeImageFromCloudinary)
userRouter.put("/:id", auth, updateUserDetailController)
userRouter.post("/forgot-password", forgotPasswordController)
userRouter.post("/verify-forgot-password-otp", verifyOtpController)
userRouter.post("/reset-password", resetPasswordController)
userRouter.post("/refresh-token", refreshTokenController)
userRouter.get("/user-details", auth, userDetailsController)



export default userRouter