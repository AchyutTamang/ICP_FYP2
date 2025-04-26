import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';  // Using relative path since files are in same directory

export const CartContext = createContext();
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {  // Only fetch cart items if user is logged in
      fetchCartItems();
    }
  }, [user]);  // Re-run effect when user state changes

  const fetchCartItems = async () => {
    // Check both possible token names
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token || !user) {
      console.log('No token found or user not logged in');
      setCartItems([]);
      return;
    }

    try {
      console.log("Fetching cart with token:", token);
      const response = await axios.get('http://127.0.0.1:8000/api/cart/cart/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Cart response:", response.data);
      if (response.data) {
        setCartItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error.response || error);
      setCartItems([]);
    }
};

const addToCart = async (course) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/cart/cart/', {
        course_id: course.id
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        await fetchCartItems();
        return { success: true };
      }
    } catch (error) {
      console.error('Error adding to cart:', error.response || error);
      throw error;
    }
};

  const removeFromCart = async (courseId) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/cart/cart/${courseId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200 || response.status === 204) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== courseId));
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (courseId) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/cart/favorites/${courseId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200 || response.status === 204) {
        setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== courseId));
        await fetchFavorites(); // Refresh the favorites list
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  const fetchFavorites = async () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token || !user) return;

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/courses/favorites/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const addToFavorites = async (courseId) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    try {
      await axios.post('http://127.0.0.1:8000/api/courses/favorites/', {
        course_id: courseId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      await fetchFavorites();
      return { success: true };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      favorites,
      addToCart, 
      removeFromCart,
      fetchCartItems,
      removeFromFavorites,
      addToFavorites,
      fetchFavorites
    }}>
      {children}
    </CartContext.Provider>
  );
};
