import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { userType, uidb64, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Params:', { userType, uidb64, token }); // Debug parameters
  }, [userType, uidb64, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Add 's' to userType for the API endpoint
      const userTypeWithS = userType === 'student' ? 'students' : 'instructors';
      const response = await axios.post(
        `http://127.0.0.1:8000/api/${userTypeWithS}/reset-password/${uidb64}/${token}/`,
        { password }
      );
      
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1e2a3a] rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Your Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a2332] text-white rounded p-2 border border-gray-600"
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-white mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#1a2332] text-white rounded p-2 border border-gray-600"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00FF40] text-black py-2 px-4 rounded hover:bg-[#00DD30] transition-colors"
          >
            Reset Password
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;