import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaHeart } from "react-icons/fa";
import Navbar from "../stick/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import KhaltiCheckout from "khalti-checkout-web";


// Make sure the component name matches what you're exporting
const CartPage = () => {
  const { cartItems, removeFromCart, fetchCartItems } = useCart();
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
        console.log("Fetching cart items..."); // Debug log
        await fetchCartItems();
        console.log("Cart items fetched:", cartItems); // Debug log
        setLoading(false);
      } catch (err) {
        console.error("Error loading cart:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadCart();
  }, [user, navigate, fetchCartItems]);

  // Add this debug log
  useEffect(() => {
    console.log("Current cart items:", cartItems);
  }, [cartItems]);

  // Calculate total price whenever cart items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      const priceString = item.course_details?.course_price || "0";
      const numericPrice = parseFloat(priceString.replace(/[^\d.]/g, "")) || 0;
      return sum + numericPrice;
    }, 0);
    setTotalPrice(total.toFixed(2)); 
  }, [cartItems]);

  const handleRemoveFromCart = async (cartItemId) => {
    const result = await removeFromCart(cartItemId);
    if (result.success) {
      toast.success("Item removed from cart");
    } else {
      toast.error(result.error || "Failed to remove item from cart");
    }
  };

  const handleAddToFavorites = async (courseId) => {
    const result = await addToFavorites(courseId);
    if (result.success) {
      toast.success("Course added to favorites successfully!");
    } else {
      if (result.error === "Course already in favorites") {
        toast.info("This course is already in your favorites");
      } else {
        toast.error(result.error || "Failed to add course to favorites");
      }
    }
  };

  const khaltiKey = "9cdb33a2b0724d56bdc1be878157f7e0"; 
  
  // Update the handleCheckout function
  const handleCheckout = async () => {
    try {
      // Create an order from cart items
      const response = await axios.post(
        "http://localhost:8000/api/orders/create/",
        { cart_items: cartItems.map((item) => item.id) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
  
      if (response.status === 201) {
        const orderId = response.data.order_id;
        
        // Configure Khalti
        let config = {
          publicKey: khaltiKey,
          productIdentity: orderId,
          productName: "GyanSort Courses",
          productUrl: "http://localhost:5173",
          eventHandler: {
            onSuccess: async (payload) => {
              // Verify payment on your backend
              try {
                const verifyResponse = await axios.post(
                  "http://localhost:8000/api/payment/verify/",
                  {
                    token: payload.token,
                    amount: payload.amount,
                    order_id: orderId
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                  }
                );
  
                if (verifyResponse.data.success) {
                  navigate(`/payment-status/success?orderId=${orderId}`);
                } else {
                  navigate(`/payment-status/failure?orderId=${orderId}`);
                }
              } catch (error) {
                console.error("Payment verification failed:", error);
                navigate(`/payment-status/failure?orderId=${orderId}`);
              }
            },
            onError: (error) => {
              console.log(error);
              navigate(`/payment-status/failure?orderId=${orderId}`);
            },
            onClose: () => {
              console.log('Widget is closing');
            }
          },
          paymentPreference: ["KHALTI"],
        };
  
        // Initialize Khalti checkout
        let checkout = new KhaltiCheckout(config);
        
        // Convert total price to paisa (Khalti uses paisa)
        const amount = Math.round(totalPrice * 100);
        
        // Open Khalti widget
        checkout.show({ amount });
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      toast.error(err.response?.data?.detail || "Failed to process checkout");
    }
  };

  console.log("cartItems:", cartItems);

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
                       {item.course_details?.display_price || 0}
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
                      onClick={() => handleRemoveFromCart(item.id)}  // Changed from course_details?.id to item.id
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300"
                      title="Remove from cart"
                    >
                      <FaTrash />
                    </button>

                 
                    <div className="text-[#00FF40] font-bold text-xl">
                      RS {item.course_details?.course_price || 0}  
                    </div>
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
                  className="w-full bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-3 rounded-md transition duration-300"
                >
                  Proceed to Checkout
                </button>
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

// This line is crucial - make sure it exists and the name matches
export default CartPage;
