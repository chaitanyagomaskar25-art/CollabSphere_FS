
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router";
import api from "../services/api.js";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your email...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("Verification token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/verify-email", {
          params: { token },
        });

        setMessage(
          response.data.message || "Email verified successfully."
        );

        navigate("/dashboard", { replace: true });
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Email Verification</h1>

      <p>{message}</p>

      {!loading && (
        <Link to="/login" className="text-blue-600 underline">
          Go to Login
        </Link>
      )}
    </div>
  );
};

export default VerifyEmail;
