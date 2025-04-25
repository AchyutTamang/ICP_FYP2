import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import Navbar from "../stick/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const OrderConfirmationPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    // Redirect if not authenticated or not a student
    if (!isAuthenticated) {
      navigate("/");
      toast.error("Please login to view order confirmation");
      return;
    }

    if (userRole !== "student") {
      navigate("/");
      toast.error("Only students can access order confirmation");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF40]"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : !order ? (
            <div className="text-center text-red-500 py-12">
              Order not found
            </div>
          ) : (
            <div className="text-center">
              <FaCheckCircle className="text-[#00FF40] text-6xl mx-auto mb-6" />

              <h1 className="text-3xl font-bold text-white mb-4">
                Order Confirmed!
              </h1>

              <p className="text-gray-400 mb-8">
                Thank you for your purchase. Your order has been successfully
                processed.
              </p>

              <div className="bg-gray-700 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Order Details
                </h2>

                <div className="grid grid-cols-2 gap-4 text-left mb-6">
                  <div>
                    <p className="text-gray-400">Order ID:</p>
                    <p className="text-white">{order.id}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Date:</p>
                    <p className="text-white">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Payment Method:</p>
                    <p className="text-white capitalize">
                      {order.payment_method || "Credit Card"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Total Amount:</p>
                    <p className="text-[#00FF40] font-bold">
                      RS {order.total_amount}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-3 text-left">
                  Purchased Courses
                </h3>

                <ul className="space-y-3">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between border-b border-gray-600 pb-2"
                    >
                      <span className="text-white">{item.course.title}</span>
                      <span className="text-[#00FF40]">
                        RS {item.course.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => navigate("/my-courses")}
                  className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-3 px-8 rounded-md transition duration-300"
                >
                  Go to My Courses
                </button>

                <button
                  onClick={() => navigate("/courses")}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-md transition duration-300"
                >
                  Browse More Courses
                </button>
              </div>
            </div>
          )}
        </div>
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

export default OrderConfirmationPage;
