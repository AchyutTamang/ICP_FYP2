import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentStatus = () => {
  const { status } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');

  useEffect(() => {
    if (status === 'success') {
      toast.success('Payment completed successfully!');
    } else {
      toast.error('Payment failed. Please try again.');
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">
          {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
        <p className="text-gray-300 mb-6">
          {status === 'success'
            ? 'Thank you for your purchase. You can now access your courses.'
            : 'Something went wrong with your payment. Please try again.'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#00FF40] hover:bg-[#00DD30] text-black px-6 py-2 rounded-md"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/courses')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md"
          >
            Browse More Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;