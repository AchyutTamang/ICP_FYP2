import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, userRole } = useAuth();

  const fetchCartItems = useCallback(async () => {
    // Don't fetch if not authenticated or not a student
    if (!isAuthenticated || userRole !== "student") {
      return;
    }
    
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
      setError("Failed to load cart items");
      setLoading(false);
    }
  }, [isAuthenticated, userRole]);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || userRole !== "student") {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/cart/favorites/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setFavorites(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setLoading(false);
    }
  }, [isAuthenticated, userRole]);

  // Only fetch cart items and favorites when auth state changes
  useEffect(() => {
    if (isAuthenticated && userRole === "student") {
      fetchCartItems();
      fetchFavorites();
    } else {
      setCartItems([]);
      setFavorites([]);
    }
  }, [isAuthenticated, userRole, fetchCartItems, fetchFavorites]);

  const addToCart = useCallback(async (courseId) => {
    if (!isAuthenticated || userRole !== "student") {
      return { success: false, error: "Authentication required" };
    }
    
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
      
      // Update cart items without fetching the entire cart again
      setCartItems(prev => [...prev, response.data]);
      
      return { success: true };
    } catch (err) {
      console.error("Error adding to cart:", err);
      const errorMessage = err.response?.data?.detail || "Failed to add to cart";
      return { success: false, error: errorMessage };
    }
  }, [isAuthenticated, userRole]);

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/api/cart/cart/${cartItemId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.status === 204 || response.status === 200) {
        // Update cart items locally
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));
        return { success: true };
      }
      return { success: false, error: "Failed to remove from cart" };
    } catch (err) {
      console.error("Error removing from cart:", err);
      return { success: false, error: err.response?.data?.detail || "Failed to remove from cart" };
    }
  };

  const addToFavorites = async (courseId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/cart/favorites/",
        { course_id: courseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 201) {
        // Update favorites locally instead of fetching again
        setFavorites(prev => [...prev, response.data]);
        return { success: true };
      }
      return { success: false, error: "Failed to add to favorites" };
    } catch (err) {
      console.error("Error adding to favorites:", err);
      return {
        success: false,
        error: err.response?.data?.detail || "Failed to add to favorites",
      };
    }
  };

  const removeFromFavorites = async (favoriteId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/cart/favorites/${favoriteId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // Update favorites locally instead of fetching again
      setFavorites(prev => prev.filter(item => item.id !== favoriteId));
      return { success: true };
    } catch (err) {
      console.error("Error removing from favorites:", err);
      return { success: false, error: "Failed to remove from favorites" };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        favorites,
        loading,
        error,
        fetchCartItems,
        addToCart,
        removeFromCart,
        addToFavorites,
        removeFromFavorites,
        fetchFavorites
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
