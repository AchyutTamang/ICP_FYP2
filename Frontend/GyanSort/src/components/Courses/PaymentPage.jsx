import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../stick/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import KhaltiPayment from "../Payment/KhaltiPayment";

const PaymentPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    // Redirect if not authenticated or not a student
    if (!isAuthenticated) {
      navigate("/");
      toast.error("Please login to access payment");
      return;
    }

    if (userRole !== "student") {
      navigate("/");
      toast.error("Only students can access payment");
      return;
    }

    fetchOrderDetails();
  }, [isAuthenticated, userRole, navigate, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/orders/${orderId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details. Please try again later.");
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (paymentMethod === "credit_card") {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        toast.error("Please fill in all card details");
        return;
      }

      if (cardNumber.length < 16) {
        toast.error("Invalid card number");
        return;
      }

      if (cvv.length < 3) {
        toast.error("Invalid CVV");
        return;
      }
    }

    try {
      setProcessingPayment(true);

      // Process payment
      const response = await axios.post(
        `http://localhost:8000/api/orders/${orderId}/process-payment/`,
        {
          payment_method: paymentMethod,
          card_details:
            paymentMethod === "credit_card"
              ? {
                  card_number: cardNumber,
                  card_name: cardName,
                  expiry_date: expiryDate,
                  cvv: cvv,
                }
              : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Payment successful!");
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      toast.error(err.response?.data?.detail || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-white mb-8">Payment</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF40]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : !order ? (
          <div className="text-center text-red-500 py-12">Order not found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-4">
                  <p className="text-gray-400">Order ID:</p>
                  <p className="text-white">{order.id}</p>
                </div>

                <div className="border-b border-gray-700 pb-4">
                  <p className="text-gray-400">Items:</p>
                  <ul className="mt-2 space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span className="text-white">{item.course.title}</span>
                        <span className="text-[#00FF40]">
                          RS {item.course.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-[#00FF40]">
                    RS {order.total_amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Payment Method
              </h2>

              <form onSubmit={handlePaymentSubmit}>
                <div className="mb-4">
                  <div className="flex space-x-4 mb-4">
                    <label className="flex items-center text-white">
                      <input
                        type="radio"
                        value="credit_card"
                        checked={paymentMethod === "credit_card"}
                        onChange={() => setPaymentMethod("credit_card")}
                        className="mr-2"
                      />
                      Credit/Debit Card
                    </label>

                    <label className="flex items-center text-white">
                      <input
                        type="radio"
                        value="khalti"
                        checked={paymentMethod === "khalti"}
                        onChange={() => setPaymentMethod("khalti")}
                        className="mr-2"
                      />
                      Khalti
                    </label>

                    <label className="flex items-center text-white">
                      <input
                        type="radio"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={() => setPaymentMethod("paypal")}
                        className="mr-2"
                      />
                      PayPal
                    </label>
                  </div>
                </div>

                {/* Render payment form based on selected method */}
                {paymentMethod === "credit_card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 16)
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF40]"
                        maxLength={16}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF40]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF40]"
                          maxLength={5}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-2">CVV</label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 4)
                            )
                          }
                          placeholder="123"
                          className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00FF40]"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "khalti" && (
                  <KhaltiPayment
                    amount={order.total_amount * 100} // Convert to paisa
                    productName={order.items
                      .map((item) => item.course.title)
                      .join(", ")}
                    description={`Payment for course(s): ${order.items
                      .map((item) => item.course.title)
                      .join(", ")}`}
                  />
                )}

                {paymentMethod === "paypal" && (
                  <div className="text-white mb-4">
                    <p>
                      You will be redirected to PayPal to complete your payment.
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className={`w-full bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-3 px-8 rounded-md transition duration-300 ${
                      processingPayment ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {processingPayment
                      ? "Processing..."
                      : `Pay RS ${order.total_amount}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2024 GyanSort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PaymentPage;
