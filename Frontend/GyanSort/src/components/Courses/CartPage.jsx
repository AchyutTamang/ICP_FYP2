import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import Navbar from "../stick/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated or not a student
    if (!isAuthenticated) {
      navigate("/");
      toast.error("Please login to view your cart");
      return;
    }

    if (userRole !== "student") {
      navigate("/");
      toast.error("Only students can access the cart");
      return;
    }

    fetchCartItems();
  }, [isAuthenticated, userRole, navigate]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/cart/cart/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setCartItems(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to load cart items. Please try again later.");
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:8000/api/cart/cart/${cartItemId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // Update cart items after successful removal
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Error removing item from cart:", err);
      toast.error("Failed to remove item from cart");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.course.price || 0),
      0
    );
  };

  const handleCheckout = () => {
    // Implement checkout functionality
    toast.info("Checkout functionality will be implemented soon!");
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-700 py-4 last:border-b-0"
                    >
                      <div className="flex items-center mb-4 md:mb-0">
                        <img
                          src={
                            item.course.thumbnail ||
                            "https://via.placeholder.com/80x80"
                          }
                          alt={item.course.title}
                          className="w-20 h-20 object-cover rounded-md mr-4"
                        />
                        <div>
                          <h3 className="text-white font-semibold">
                            {item.course.title}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {item.course.instructor_name || "Instructor"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full md:w-auto">
                        <span className="text-[#00FF40] font-bold md:mr-8">
                          RS {item.course.price || 0}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-500 hover:text-red-400 transition-colors duration-300"
                          title="Remove from cart"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg overflow-hidden sticky top-24">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">RS {calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount</span>
                      <span className="text-white">RS 0</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4 flex justify-between">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-[#00FF40] font-bold">
                        RS {calculateTotal()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-3 px-4 rounded-md transition duration-300"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
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

export default CartPage;
