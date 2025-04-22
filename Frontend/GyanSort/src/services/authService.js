// import axios from "axios";

// // Update the API_URL to match your backend endpoint
// const API_URL = "http://127.0.0.1:8000/api/";

// // Add console logging to debug the request
// export const registerStudent = async (fullname, email, password) => {
//   try {
//     console.log("Sending registration request to:", `${API_URL}register/`);
//     console.log("Request data:", { fullname, email, password: "***" });

//     const response = await axios.post(`${API_URL}register/`, {
//       fullname,
//       email,
//       password,
//     });

//     console.log("Registration successful:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Registration error:", error);

//     if (error.response) {
//       console.error("Error status:", error.response.status);
//       console.error("Error data:", error.response.data);
//     }

//     throw error.response?.data || { message: "Registration failed" };
//   }
// };

// // Update the loginStudent function to properly store authentication data
// export const loginStudent = async (email, password) => {
//   try {
//     console.log("Sending login request to:", `${API_URL}students/login/`);
//     const response = await axios.post(`${API_URL}students/login/`, {
//       email,
//       password,
//     });
//     console.log("Login successful:", response.data);

//     // Explicitly check and store each item
//     if (response.data.access) {
//       localStorage.setItem("access_token", response.data.access);
//     }

//     if (response.data.refresh) {
//       localStorage.setItem("refresh_token", response.data.refresh);
//     }

//     // Always set the user role
//     localStorage.setItem("user_role", "student");

//     if (response.data.user) {
//       localStorage.setItem("user_info", JSON.stringify(response.data.user));
//     }

//     // Verify storage was successful
//     console.log("Storage verification:", {
//       access_token: localStorage.getItem("access_token"),
//       refresh_token: localStorage.getItem("refresh_token"),
//       user_role: localStorage.getItem("user_role"),
//       user_info: localStorage.getItem("user_info"),
//     });

//     return response.data;
//   } catch (error) {
//     console.error("Login error:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// // Logout student
// export const logoutStudent = () => {
//   localStorage.removeItem("studentToken");
//   if (localStorage.getItem("userType") === "student") {
//     localStorage.removeItem("userType");
//   }
// };

// // Get current student
// export const getCurrentStudent = () => {
//   return JSON.parse(localStorage.getItem("studentToken"));
// };

// // Check if user is logged in as student
// export const isStudentLoggedIn = () => {
//   return (
//     localStorage.getItem("userType") === "student" &&
//     !!localStorage.getItem("studentToken")
//   );
// };

// // Get student profile
// export const getStudentProfile = async () => {
//   const studentToken = getCurrentStudent();
//   if (!studentToken) return null;

//   try {
//     const response = await axios.get(`${API_URL}profile/`, {
//       headers: {
//         Authorization: `Bearer ${studentToken.access}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     if (error.response?.status === 401) {
//       logoutStudent();
//     }
//     throw error.response?.data || { message: "Failed to fetch profile" };
//   }
// };

// // Verify email
// export const verifyEmail = async (token) => {
//   try {
//     const response = await axios.get(`${API_URL}verify-email/${token}/`);
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || { message: "Email verification failed" };
//   }
// };

// // Request password reset
// export const requestPasswordReset = async (email) => {
//   try {
//     const response = await axios.post(`${API_URL}request-password-reset/`, {
//       email,
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || { message: "Password reset request failed" };
//   }
// };

// // Reset password
// export const resetPassword = async (token, password) => {
//   try {
//     const response = await axios.post(`${API_URL}reset-password/${token}/`, {
//       password,
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || { message: "Password reset failed" };
//   }
// };

import axios from "axios";

// Update the API_URL to match your backend endpoint
const API_URL = "http://127.0.0.1:8000/api/";

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

    throw error.response?.data || { message: "Registration failed" };
  }
};

// Update the loginStudent function to properly store authentication data
export const loginStudent = async (email, password) => {
  try {
    console.log("Sending login request to:", `${API_URL}students/login/`);
    const response = await axios.post(`${API_URL}students/login/`, {
      email,
      password,
    });
    console.log("Login successful:", response.data);

    // Explicitly check and store each item
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
    }

    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }

    // Always set the user role
    localStorage.setItem("user_role", "student");

    if (response.data.user) {
      localStorage.setItem("user_info", JSON.stringify(response.data.user));
    }

    // Verify storage was successful
    console.log("Storage verification:", {
      access_token: localStorage.getItem("access_token"),
      refresh_token: localStorage.getItem("refresh_token"),
      user_role: localStorage.getItem("user_role"),
      user_info: localStorage.getItem("user_info"),
    });

    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Update logoutStudent to match the keys used in loginStudent
export const logoutStudent = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_info");
};

// Update getCurrentStudent to match the keys used in loginStudent
export const getCurrentStudent = () => {
  const userInfo = localStorage.getItem("user_info");
  return userInfo ? JSON.parse(userInfo) : null;
};

// Update isStudentLoggedIn to match the keys used in loginStudent
export const isStudentLoggedIn = () => {
  return (
    localStorage.getItem("user_role") === "student" &&
    !!localStorage.getItem("access_token")
  );
};

// Update getStudentProfile to use the new token storage
export const getStudentProfile = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) return null;

  try {
    const response = await axios.get(`${API_URL}students/profile/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

// Login instructor
export const loginInstructor = async (email, password) => {
  try {
    console.log(
      "Sending instructor login request to:",
      `${API_URL}instructors/login/`
    );
    const response = await axios.post(`${API_URL}instructors/login/`, {
      email,
      password,
    });
    console.log("Instructor login successful:", response.data);

    // Explicitly check and store each item
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
    }

    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }

    // Always set the user role
    localStorage.setItem("user_role", "instructor");

    if (response.data.user) {
      localStorage.setItem("user_info", JSON.stringify(response.data.user));
    }

    // Verify storage was successful
    console.log("Storage verification:", {
      access_token: localStorage.getItem("access_token"),
      refresh_token: localStorage.getItem("refresh_token"),
      user_role: localStorage.getItem("user_role"),
      user_info: localStorage.getItem("user_info"),
    });

    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Register instructor
export const registerInstructor = async (instructorData) => {
  try {
    console.log("Registering instructor:", instructorData);
    const response = await axios.post(
      `${API_URL}instructors/register/`,
      instructorData
    );
    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("access_token");
};

// Get user role
export const getUserRole = () => {
  return localStorage.getItem("user_role");
};

// Logout user (general)
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_info");
};