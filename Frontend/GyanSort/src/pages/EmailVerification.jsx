import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token and user type from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const userType = queryParams.get('type'); // 'student' or 'instructor'
  
  // Extract token from path if it's in the URL path instead of query params
  // This handles direct links from email that go to /verify-email/TOKEN
  const pathParts = location.pathname.split('/');
  const pathToken = pathParts[pathParts.length - 1];
  
  // Use token from either query params or path
  const verificationToken = token || (pathToken !== 'verify-email' ? pathToken : null);

  const handleVerification = async () => {
    if (!verificationToken) {
      setError('Invalid verification link. Please check your email again.');
      return;
    }

    // If userType is not provided in query params, try both student and instructor
    const userTypes = userType ? [userType] : ['student', 'instructor'];
    
    setLoading(true);
    setError(null);

    let verified = false;
    
    // Try each user type until one works
    for (const type of userTypes) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/${type}s/verify-email/`, {
          token: verificationToken
        });

        // Check verification status and user type for appropriate messaging
        const { success, message, user_type, verification_status } = response.data;
        
        if (success) {
          setVerified(true);
          verified = true;
          toast.success(message || 'Email verified successfully!');
          
          // Different redirect logic based on user type
          setTimeout(() => {
            if (user_type === 'instructor' && verification_status === 'under_review') {
              navigate('/instructor-verification-pending');
            } else {
              navigate('/login');
            }
          }, 3000);
          
          // Break the loop if verification is successful
          break;
        }
      } catch (err) {
        console.error(`Verification error for ${type}:`, err);
        // Continue to the next user type if this one fails
      }
    }
    
    // If none of the user types worked, show an error
    if (!verified) {
      setError('Verification failed. The token may be invalid or expired.');
    }
    
    setLoading(false);
  };

  // Auto-verify if token is present
  useEffect(() => {
    if (verificationToken && !verified && !loading) {
      handleVerification();
    }
  }, [verificationToken]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Email Verification</h2>
          
          {loading ? (
            <div className="my-8 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#00FF40] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-white">Verifying your email...</p>
            </div>
          ) : verified ? (
            <div className="my-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="mt-4 text-xl text-white">Your email has been verified successfully!</p>
              <p className="mt-2 text-gray-400">You will be redirected to the login page shortly.</p>
            </div>
          ) : (
            <div className="my-8">
              {error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                  <p>{error}</p>
                </div>
              ) : (
                <p className="text-gray-300 mb-6">Please click the button below to verify your email address.</p>
              )}
              
              <button
                onClick={handleVerification}
                disabled={loading}
                className="w-full bg-[#00FF40] hover:bg-[#00CC33] text-black font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              >
                Verify Email
              </button>
            </div>
          )}
          
          <div className="mt-6">
            <p className="text-gray-400">
              Already verified? <a href="/" className="text-[#00FF40] hover:underline">Return to home</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;