import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import Navbar from "../stick/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated or not a student
    if (!isAuthenticated) {
      navigate("/");
      toast.error("Please login to view your favorites");
      return;
    }

    if (userRole !== "student") {
      navigate("/");
      toast.error("Only students can access favorites");
      return;
    }

    fetchFavorites();
  }, [isAuthenticated, userRole, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/cart/favorites/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setFavorites(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Failed to load favorites. Please try again later.");
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/cart/favorites/${favoriteId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // Update favorites after successful removal
      setFavorites(favorites.filter((item) => item.id !== favoriteId));
      toast.success("Item removed from favorites");
    } catch (err) {
      console.error("Error removing item from favorites:", err);
      toast.error("Failed to remove item from favorites");
    }
  };

  const handleAddToCart = async (courseId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/cart/cart/",
        { course_id: courseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Course added to cart successfully!");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(err.response?.data?.detail || "Failed to add course to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-white mb-8">Your Favorites</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF40]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl text-white mb-4">
              Your favorites list is empty
            </h2>
            <p className="text-gray-400 mb-6">
              Browse our courses and add some to your favorites
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-2 px-6 rounded-md transition duration-300"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
              >
                <div className="relative">
                  <img
                    src={
                      item.course.thumbnail ||
                      "https://via.placeholder.com/300x200"
                    }
                    alt={item.course.title}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.course.title}
                  </h3>

                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {item.course.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="text-[#00FF40] font-bold text-xl">
                      RS {item.course.price || 0}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCart(item.course.id)}
                        className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-medium py-2 px-4 rounded-md flex items-center transition-colors duration-300"
                      >
                        <FaShoppingCart className="mr-2" /> Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromFavorites(item.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300"
                        title="Remove from favorites"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

export default FavoritesPage;
