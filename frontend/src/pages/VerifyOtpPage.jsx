
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

const VerifyOtpPage = () => {
  const { verifyOtp, loading } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // Email and destination passed from LoginPage
  const email = location.state?.email || "";
  const from = location.state?.from || "/dashboard";

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Email is missing. Please log in again.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      const result = await verifyOtp({
        email,
        otp: otp.trim(),
      });

      if (result.success) {
        setMessage(result.message || "OTP verified successfully.");

        // Login succeeded; navigate to the requested page.
        navigate(from, { replace: true });
      } else {
        setError(result.error || "OTP verification failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Verify OTP
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Enter the 6-digit OTP sent to your email.
        </p>

        {email && (
          <p className="mb-4 text-center text-sm text-gray-700">
            Email: <span className="font-medium">{email}</span>
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit}>
          <label
            htmlFor="otp"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            One-Time Password
          </label>

          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="mb-5 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            required
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !email}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="mt-4 w-full text-sm text-gray-600 hover:text-blue-600"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
