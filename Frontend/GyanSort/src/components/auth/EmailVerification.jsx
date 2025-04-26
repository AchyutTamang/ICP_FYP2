import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Call backend verification endpoint directly
        const response = await axios.get(
          `http://localhost:8000/api/students/verify-email/${token}/`
        );

        if (response.data.success) {
          setSuccess(true);
          setMessage(response.data.message);
          
          // Auto-redirect after successful verification
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setSuccess(false);
        setMessage(
          error.response?.data?.message || 
          "Verification failed. Please try again."
        );
        
        // If verification fails, redirect to signup after 3 seconds
        setTimeout(() => {
          navigate("/signup");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden relative p-8">
        {/* Decorative elements */}
        <div className="absolute w-48 h-48 bg-green-100 rounded-full -top-24 -right-24 z-0"></div>
        <div className="absolute w-48 h-48 bg-green-100 rounded-full -bottom-24 -left-24 z-0"></div>

        <h1 className="text-3xl font-bold text-center mb-6 relative z-10">
          Email Verification
        </h1>

        {loading ? (
          <div className="flex flex-col items-center my-8 relative z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
            <p className="text-xl font-medium">Verifying your email...</p>
          </div>
        ) : success ? (
          <div className="text-center my-4 relative z-10">
            <div className="text-[#00FF40] mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Verification Successful!
            </h2>
            <p className="text-gray-700 mb-6">
              Your email has been successfully verified. You can now log in to
              your GyanSort account.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to login page in a few seconds...
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#00FF40] text-black font-medium py-3 px-8 rounded-full hover:bg-[#00DD30] transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div className="text-center my-4 relative z-10">
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Verification Failed</h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              Please try again or contact support if the problem persists.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-[#00FF40] text-black font-medium py-3 px-8 rounded-full hover:bg-[#00DD30] transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
            >
              Back to Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
