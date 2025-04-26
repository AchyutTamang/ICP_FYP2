import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';  // Fixed import path

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {  // Only fetch cart items if user is logged in
      fetchCartItems();
    }
  }, [user]);  // Re-run effect when user state changes

  const fetchCartItems = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      setCartItems([]);
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/cart/items/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCartItems(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setCartItems([]);
      }
      console.error('Error fetching cart items:', error);
    }
  };

  const addToCart = async (course) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/cart/add/', {
        course_id: course.id
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        await fetchCartItems(); // Refresh cart items after adding
        return true;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (courseId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      await axios.delete(`http://127.0.0.1:8000/api/cart/remove/${courseId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      await fetchCartItems(); // Refresh cart items after removing
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart,
      fetchCartItems 
    }}>
      {children}
    </CartContext.Provider>
  );
};
