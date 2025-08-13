import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaHeart } from "react-icons/fa";
import Navbar from "../stick/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import KhaltiPayment from "../Payment/KhaltiPayment";

const API_BASE_URL = "http://localhost:8000"; // Change to your backend URL if needed

const CartPage = () => {
  const { cartItems, removeFromCart, fetchCartItems, addToFavorites } =
    useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!user) {
          navigate("/login");
          return;
        }
        await fetchCartItems();
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadCart();
  }, [user, navigate, fetchCartItems]);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      const priceNum = Number(item.course_details?.course_price) || 0;
      return sum + priceNum;
    }, 0);
    setTotalPrice(total);
  }, [cartItems]);

  const handleRemoveFromCart = async (cartItemId) => {
    const result = await removeFromCart(cartItemId);
    if (result.success) toast.success("Item removed from cart");
    else toast.error(result.error || "Failed to remove item from cart");
  };

  const handleAddToFavorites = async (courseId) => {
    const result = await addToFavorites(courseId);
    if (result.success) toast.success("Course added to favorites!");
    else if (result.error === "Course already in favorites")
      toast.info("Already in favorites");
    else toast.error(result.error || "Failed to add to favorites");
  };

  // eSewa payment initiation with JWT from localStorage
  const handleEsewaPay = async () => {
    try {
      if (cartItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }
      const productId = cartItems[0]?.course_details?.id || "gyansort-cart";
      const token = localStorage.getItem("access_token"); // Get JWT token from localStorage
      if (!token) {
        toast.error("You must be logged in to proceed with payment.");
        navigate("/login");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/payments/initiate-esewa/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalPrice,
          product_id: productId,
        }),
        credentials: "include",
      });

      console.log("eSewa API HTTP status:", res.status);

      const data = await res.json();
      console.log("Esewa API response:", data);

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        toast.error(data.error || "Failed to initiate eSewa payment");
      }
    } catch (err) {
      toast.error("Failed to initiate eSewa payment");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF40]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">
              Browse our courses and add some to your cart
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-2 px-6 rounded-md transition duration-300"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              {cartItems.map((item) => (
                <div
                  key={item.course_details?.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-700 py-4"
                >
                  <div className="flex items-center mb-4 md:mb-0">
                    <img
                      src={
                        item.course_details?.course_thumbnail ||
                        "https://via.placeholder.com/100x100"
                      }
                      alt={item.course_details?.title}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {item.course_details?.title}
                      </h3>
                      <p className="text-gray-400 line-clamp-1">
                        {item.course_details?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="text-[#00FF40] font-bold text-xl">
                      RS {item.course_details?.course_price || 0}
                    </div>
                    <button
                      onClick={() =>
                        handleAddToFavorites(item.course_details?.id)
                      }
                      className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-300"
                      title="Add to favorites"
                    >
                      <FaHeart />
                    </button>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300"
                      title="Remove from cart"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-8 border-t border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl text-white">Total:</span>
                  <span className="text-2xl font-bold text-[#00FF40]">
                    RS {totalPrice}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <KhaltiPayment
                    amount={Math.round(totalPrice * 100)}
                    productName="GyanSort Courses"
                    description="Purchase from GyanSort"
                  />
                  <button
                    className="esewa-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition duration-300"
                    onClick={handleEsewaPay}
                  >
                    Pay with eSewa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="bg-gray-900 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2024 GyanSort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CartPage;
