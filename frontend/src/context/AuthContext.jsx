
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import api from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check whether the user is authenticated
  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");

      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);

      // A 401 is expected when the user is not logged in.
      // Only log unexpected errors.
      if (err.response?.status !== 401) {
        console.error(
          "Failed to check authentication:",
          err.response?.data?.message || err.message
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Register a new user
  const register = async ({ name, email, password, bio = "" }) => {
    setAuthError(null);

    try {
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        bio: bio.trim(),
      });

      return {
        success: true,
        message:
          res.data?.message ||
          "Registration successful. Please verify your email.",
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

      setAuthError(message);
      console.error("Registration failed:", message);

      return {
        success: false,
        error: message,
      };
    }
  };

  // Log in and initiate OTP verification
  const login = async ({ email, password }) => {
    setAuthError(null);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      return {
        success: true,
        requiresOtp: true,
        message: res.data?.message || "Please verify your OTP.",
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials.";

      setAuthError(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  // Verify OTP and authenticate the user
  const verifyOtp = async ({ email, otp }) => {
    setAuthError(null);

    try {
      const res = await api.post("/auth/verify-otp", {
        email: email.trim(),
        otp: String(otp).trim(),
      });

      if (!res.data?.success || !res.data?.user) {
        const message =
          res.data?.message ||
          "OTP verification response was incomplete.";

        setAuthError(message);

        return {
          success: false,
          error: message,
        };
      }

      setUser(res.data.user);

      return {
        success: true,
        user: res.data.user,
        message:
          res.data.message || "OTP verified successfully.",
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "OTP verification failed.";

      setAuthError(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  // Log out the current user
  const logout = async () => {
    setAuthError(null);

    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(
        "Logout request failed:",
        err.response?.data?.message || err.message
      );
    } finally {
      setUser(null);
    }
  };

  // Update the user's profile
  const updateProfile = async (profileData) => {
    setAuthError(null);

    try {
      const res = await api.put("/auth/profile", profileData);

      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);

        return {
          success: true,
          user: res.data.user,
          message:
            res.data.message ||
            "Profile updated successfully.",
        };
      }

      const message =
        res.data?.message || "Failed to update profile.";

      setAuthError(message);

      return {
        success: false,
        error: message,
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile.";

      setAuthError(message);

      console.error("Profile update failed:", message);

      return {
        success: false,
        error: message,
      };
    }
  };

  const value = {
    user,
    loading,
    authError,
    register,
    login,
    logout,
    updateProfile,
    verifyOtp,
    checkAuthStatus,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};
