import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no authentication token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth Middleware] Verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid or expired",
    });
  }
};