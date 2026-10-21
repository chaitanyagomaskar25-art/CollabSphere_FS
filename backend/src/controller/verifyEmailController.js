import { EmailVerification } from "../model/emailVerifyModel.js";
import { RefreshToken } from "../model/refreshToken.js";
import { User } from "../model/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { LoginOtp } from "../model/loginOTP.js";


export const verifyEmailToken = async (req, res) => {
  try {
    // 1. Get token from the URL query string
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: "Token not found",
      });
    }

    // 2. Find the verification token in the database
    const tokenExist = await EmailVerification.findOne({ token });

    if (!tokenExist) {
      return res.status(400).json({
        message: "Token is invalid or already used.",
      });
    }

    // 3. Check whether the token has expired
    if (tokenExist.expiresAt < new Date()) {
      await EmailVerification.deleteOne({
        _id: tokenExist._id,
      });

      return res.status(400).json({
        message: "Token has expired. Please register or request a new verification email.",
      });
    }

    // 4. Find the user associated with this token
    const user = await User.findById(tokenExist.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "failed",
      });
    }

    // 5. Mark the user's email as verified
    user.isEmailVerified = true;
    await user.save();

    // 6. Delete the used verification token
    await EmailVerification.deleteOne({
      _id: tokenExist._id,
    });

    return res.status(200).json({
      message: "Email verified successfully",
      status: "success",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
      status: "failed",
    });
  }
};



export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Find OTP record
    const otpRecord = await LoginOtp.findOne({
      user: user._id,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already used. Please log in again.",
      });
    }

    // 4. Check OTP expiration
    if (otpRecord.expiresAt <= new Date()) {
      await LoginOtp.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please log in again.",
      });
    }

    // 5. Compare entered OTP with hashed OTP
    const isValid = await bcrypt.compare(
      String(otp).trim(),
      otpRecord.otp
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 6. Delete OTP after successful verification
    await LoginOtp.deleteOne({ _id: otpRecord._id });

    // 7. Check JWT secrets
    if (!process.env.ACCESS_TOKEN || !process.env.REFRESH_TOKEN) {
      throw new Error("ACCESS_TOKEN or REFRESH_TOKEN is missing in .env");
    }

    // 8. Create access token
    const access_token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    // 9. Create refresh token
    const refresh_token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    // 10. Save refresh token in database
    await RefreshToken.create({
      user: user._id,
      token: refresh_token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // 11. Set authentication cookies
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 12. Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    // Print the actual error in your backend terminal
    console.error("verifyLoginOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};
