import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const pidx = searchParams.get('pidx');
        if (pidx) {
            verifyPayment(pidx);
        }
    }, []);

    const verifyPayment = async (pidx) => {
        try {
            const response = await axios.post(
                'http://localhost:8000/api/payments/verify-khalti/',
                { pidx },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === 'success') {
                // Payment verified successfully
                alert('Payment successful!');
                navigate('/dashboard'); // or wherever you want to redirect
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
            <p>Please wait while we verify your payment.</p>
        </div>
    );
};

export default PaymentSuccess;