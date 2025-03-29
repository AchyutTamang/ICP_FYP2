import axios from "axios";

// Update the API_URL to match your backend endpoint
const API_URL = "http://127.0.0.1:8000/api/students/";

// Add console logging to debug the request
export const registerStudent = async (fullname, email, password) => {
  try {
    console.log("Sending registration request to:", `${API_URL}register/`);
    console.log("Request data:", { fullname, email, password: "***" });
    
    const response = await axios.post(`${API_URL}register/`, {
      fullname,
      email,
      password,
    });
    
    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
    
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login student
export const loginStudent = async (email, password) => {
  try {
    console.log("Sending login request to:", `${API_URL}login/`);

    const response = await axios.post(`${API_URL}login/`, {
      email,
      password,
    });

    console.log("Login successful:", response.data);

    if (response.data.access) {
      localStorage.setItem("studentToken", JSON.stringify(response.data));
      localStorage.setItem("userType", "student");
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);

    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }

    throw error.response?.data || { message: "Login failed" };
  }
};

// Logout student
export const logoutStudent = () => {
  localStorage.removeItem("studentToken");
  if (localStorage.getItem("userType") === "student") {
    localStorage.removeItem("userType");
  }
};

// Get current student
export const getCurrentStudent = () => {
  return JSON.parse(localStorage.getItem("studentToken"));
};

// Check if user is logged in as student
export const isStudentLoggedIn = () => {
  return (
    localStorage.getItem("userType") === "student" &&
    !!localStorage.getItem("studentToken")
  );
};

// Get student profile
export const getStudentProfile = async () => {
  const studentToken = getCurrentStudent();
  if (!studentToken) return null;

  try {
    const response = await axios.get(`${API_URL}profile/`, {
      headers: {
        Authorization: `Bearer ${studentToken.access}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      logoutStudent();
    }
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await axios.get(`${API_URL}verify-email/${token}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Email verification failed" };
  }
};

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}request-password-reset/`, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Password reset request failed" };
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}reset-password/${token}/`, {
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Password reset failed" };
  }
};
