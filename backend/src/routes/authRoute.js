import { Router } from "express";
import { forgetPassWord, getme, login, logout, register, resetPassword } from "../controller/authController.js";
import { verifyEmailToken, verifyLoginOtp } from "../controller/verifyEmailController.js";

export const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)

authRouter.post("/verify-otp", verifyLoginOtp)
authRouter.post("/logout", logout)

authRouter.post("/forget-password", forgetPassWord)
authRouter.post("/reset-password", resetPassword)

authRouter.get("/verify-email", verifyEmailToken)
authRouter.get("/profile", getme)

