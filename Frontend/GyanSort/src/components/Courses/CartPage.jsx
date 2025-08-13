import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaHeart } from "react-icons/fa";
import Navbar from "../stick/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import KhaltiCheckout from "khalti-checkout-web";

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

  // Khalti widget-based checkout
  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to proceed.");
      return;
    }
    const config = {
      publicKey: "test_public_key_dc74b9a8d8c94a4ca9b6d8a2b68b1cb7", // <-- Replace with your actual key!
      productIdentity: Date.now().toString(),
      productName: "GyanSort Courses",
      productUrl: window.location.origin,
      amount: Math.round(totalPrice * 100), // paisa
      eventHandler: {
        onSuccess: async (payload) => {
          try {
            const verifyRes = await axios.post(
              "http://localhost:8000/api/payments/payments/verify-khalti/",
              { pidx: payload.pidx },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "access_token"
                  )}`,
                },
              }
            );
            if (verifyRes.data.success) navigate(`/payment-status/success`);
            else navigate(`/payment-status/failure`);
          } catch (error) {
            navigate(`/payment-status/failure`);
          }
        },
        onError: (error) => {
          toast.error("Payment failed. Try again.");
          navigate(`/payment-status/failure`);
        },
        onClose: () => {
          // Optionally handle widget close
        },
      },
      paymentPreference: [
        "KHALTI",
        "EBANKING",
        "MOBILE_BANKING",
        "CONNECT_IPS",
        "SCT",
      ],
    };
    let checkout = new KhaltiCheckout(config);
    checkout.show({ amount: Math.round(totalPrice * 100) });
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
                <button
                  onClick={handleCheckout}
                  className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-2 px-6 rounded-md transition duration-300"
                >
                  Proceed to Checkout
                </button>
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
