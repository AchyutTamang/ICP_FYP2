import axios from "axios";

// Update the API_URL to match your backend endpoint
const API_URL = "http://127.0.0.1:8000/api/";

// Add console logging to debug the request
export const registerStudent = async (fullname, email, password) => {
  try {
    console.log("Sending registration request to:", `${API_URL}students/register/`);
    console.log("Request data:", { fullname, email, password: "***" });

    const response = await axios.post(`${API_URL}students/register/`, {
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
      throw error.response.data;  // Throw the actual error data
    }

    throw { message: "Registration failed" };
  }
};

export const loginStudent = async (email, password) => {
  try {
    console.log("Sending login request to:", `${API_URL}students/login/`);
    const response = await axios.post(`${API_URL}students/login/`, {
      email,
      password,
    });
    console.log("Login successful:", response.data);

    // Store the new token format
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }
    localStorage.setItem("user_role", "student");

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

