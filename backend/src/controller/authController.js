import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";
import bcrypt from "bcrypt";
import { RefreshToken } from "../model/refreshToken.js";
import { generateRandomToken } from "../utils/generateRandomToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { EmailVerification } from "../model/emailVerifyModel.js";
import { ResetPassword } from "../model/resetPassword.js";
import { LoginOtp } from "../model/loginOTP.js";
import crypto from 'crypto'


export const register = async (req, res) => {
  try {
    const { name, email, password, avatar, bio, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(409).json({
        message: "User with this email already exists.",
      });
    }
    const user = User({
      name,
      email,
      password,
      role,
      bio,
      avatar,
    });

    await user.save();

    const token = generateRandomToken();

    await EmailVerification.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Email",
      html: `
    <h2>Welcome ${user.name}</h2>

    <p>Thanks for registering.</p>

    <p>Please click the button below to verify your email.</p>

    <a href="${verificationLink}">
      Verify Email
    </a>

    <p>This link expires in 10 minutes.</p>
  `,
    });

    res.status(201).json({
      message: "Email verification code is send on your email.",
      data: user,
    });
  } catch (error) {
    console.error("Registration error:", error);

  return res.status(500).json({
    message: error.message || "Registration failed.",
  });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "Email and password is required.",
      });
    }

    const userExist = await User.findOne({ email }).select("+password");

    if (!userExist) {
      return res.status(401).json({
        message: "User does not exist.",
      });
    }

    const matchPassword = await bcrypt.compare(password, userExist.password);

    if (!matchPassword) {
      return res.status(401).json({
        message: "User email or password does not match",
      });
    }

    if (!userExist.isEmailVerified) {
  return res.status(403).json({
    message: "Please verify your email before logging in.",
  });
}


    // Check whether an OTP already exists

    const existingOtp = await LoginOtp.findOne({ user: userExist._id });

    if (existingOtp) {
      const cooldown = 60 * 1000;
      const timePassed = Date.now() - existingOtp.createdAt.getTime();

      if (timePassed < cooldown) {
        const remainingSeconds = Math.ceil((cooldown - timePassed) / 1000);

        return res.status(429).json({
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
        });
      }
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await LoginOtp.deleteMany({
      user: userExist._id,
    });

    await LoginOtp.create({
      user: userExist._id,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail({
      to: userExist.email,
      subject: "Your Login OTP",
      html: `
        <h2>Login Verification</h2>

        <p>Hello ${userExist.name},</p>

        <p>Your login OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getme = async (req, res) => {
  try {
    let accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite:  "none",
  path: "/",
};

    let decoded;

    // STEP 1: Verify the access token
    if (accessToken) {
      try {
        decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN
        );
      } catch {
        decoded = null;
      }
    }

    // STEP 2: If access token is invalid, try refresh token
    if (!decoded) {
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Please log in again",
        });
      }

      let refreshDecoded;

      try {
        refreshDecoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN
        );
      } catch {
        return res.status(401).json({
          success: false,
          message: "Refresh token is invalid or expired. Please log in again.",
        });
      }

      // STEP 3: Validate the refresh token against the database
      const existingToken = await RefreshToken.findOne({
        token: refreshToken,
        user: refreshDecoded.userId,
      });

      if (
        !existingToken ||
        existingToken.expiresAt <= new Date()
      ) {
        return res.status(401).json({
          success: false,
          message: "Refresh token not found or expired. Please log in again.",
        });
      }

      // STEP 4: Generate a new access token
      accessToken = jwt.sign(
        { userId: refreshDecoded.userId },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15m" }
      );

      res.cookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN
      );
    }

    // STEP 5: Fetch the user
    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // STEP 6: Return the authenticated user
    return res.status(200).json({
      success: true,
      message: "User found",
      user,
    });
  } catch (error) {
    console.error("getme error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken },
        { revoked: true },
      );
    }

    res.clearCookie("refresh_token");
    res.clearCookie("access_token");

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


export const forgetPassWord = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Avoid revealing whether an email is registered.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, a reset link will be sent.",
      });
    }

    const resetToken = generateRandomToken();

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await ResetPassword.deleteMany({ user: user._id });

    await ResetPassword.create({
      user: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
FRONTEND_URL = "http://localhost:5173"
    const resetLink =
      `http://localhost:5173/reset-password?token=${encodeURIComponent(resetToken)}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your CollabSphere password",
      html: `
        <h2>Password Reset</h2>
        <p>Hello,</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset my password</a></p>
        <p>This link expires in 15 minutes and can only be used once.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "If the account exists, a reset link will be sent.",
    });
  } catch (error) {
    console.error("forgetPassWord error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request right now.",
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    if (!newPassword || !token) {
      return res.status(400).json({
        success: false,
        message: "Password and token are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetRecord = await ResetPassword.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    const user = await User.findById(resetRecord.user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
    }

user.password = newPassword;
await user.save();

    // Delete this one-time reset token.
    await ResetPassword.deleteOne({ _id: resetRecord._id });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};



export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, bio, avatar, currentPassword, newPassword } = req.body;

    if (typeof name === 'string') user.name = name.trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (typeof avatar === 'string') user.avatar = avatar.trim();

    if (newPassword !== undefined && newPassword !== '') {
      if (typeof newPassword !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'New password must be a string',
        });
      }
      if (typeof currentPassword !== 'string' || !currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is not correct',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }
      user.password = newPassword;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile',
    });
  }
};
