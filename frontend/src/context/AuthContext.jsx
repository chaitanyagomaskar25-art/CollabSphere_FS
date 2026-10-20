import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get("/auth/profile");
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
        }
         else {
        setUser(null);
      }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register
  const register = async ({ name, email, password, bio }) => {
    setLoading(true);
    setAuthError(null);

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        bio,
      });

      return {
        success: true,
        message: res.data.message,
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

      setAuthError(msg);

      return {
        success: false,
        error: msg,
      };
    } finally {
      setLoading(false);
    }
  };

  // Login
  
const login = async ({ email, password }) => {
  setLoading(true);
  setAuthError(null);

  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    return {
      success: true,
      requiresOtp: true,
      message: res.data.message,
    };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Login failed. Invalid credentials.";

    setAuthError(msg);

    return {
      success: false,
      error: msg,
    };
  } finally {
    setLoading(false);
  }
};

// verify-otp
 const verifyOtp = async ({ email, otp }) => {
  setLoading(true);
  setAuthError(null);

  try {
    const res = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    if (!res.data.success || !res.data.user) {
      return {
        success: false,
        error: "OTP verification response was incomplete.",
      };
    }

    // Update the logged-in user only after OTP verification.
    setUser(res.data.user);

    return {
      success: true,
      user: res.data.user,
      message: res.data.message,
    };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "OTP verification failed.";

    setAuthError(msg);

    return {
      success: false,
      error: msg,
    };
  } finally {
    setLoading(false);
  }
};


  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout network error:", err);
    } finally {
      setUser(null);
    }
  };

  // Update profile
  

const updateProfile = async (profileData) => {
  setLoading(true);
  setAuthError(null);

  try {
    const res = await api.put("/auth/profile", profileData);

    if (res.data.success && res.data.user) {
      setUser(res.data.user);

      return {
        success: true,
        user: res.data.user,
        message: res.data.message,
      };
    }

    const msg = res.data.message || "Failed to update profile";

    setAuthError(msg);
    return { success: false, error: msg };
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Failed to update profile";

    setAuthError(msg);
    console.error("Profile update failed:", msg);

    return {
      success: false,
      error: msg,
    };
  } finally {
    setLoading(false);
  }
};



  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        register,
        login,
        logout,
        updateProfile,
        verifyOtp,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
