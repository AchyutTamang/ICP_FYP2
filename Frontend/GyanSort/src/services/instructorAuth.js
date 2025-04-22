// import axios from "axios";

// const API_URL = "http://127.0.0.1:8000/api/instructors/";

// // Register instructor with file upload
// export const registerInstructor = async (formData) => {
//   try {
//     console.log("Registering instructor with formData");
//     const response = await axios.post(`${API_URL}register/`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//     console.log("Registration response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Registration error:", error);
//     console.error("Error response:", error.response?.data);
//     throw error.response?.data || { message: "Registration failed" };
//   }
// };

// // Login instructor
// export const loginInstructor = async (email, password) => {
//   try {
//     console.log("Logging in instructor with email:", email);
//     const response = await axios.post(`${API_URL}login/`, {
//       email,
//       password,
//     });

//     console.log("Login response:", response.data);
//     if (response.data.access) {
//       localStorage.setItem("instructorToken", JSON.stringify(response.data));
//       localStorage.setItem("userType", "instructor");
//     }

//     return response.data;
//   } catch (error) {
//     console.error("Login error:", error);
//     console.error("Error response:", error.response?.data);
//     throw error.response?.data || { message: "Login failed" };
//   }
// };

// // Logout instructor
// export const logoutInstructor = () => {
//   localStorage.removeItem("instructorToken");
//   if (localStorage.getItem("userType") === "instructor") {
//     localStorage.removeItem("userType");
//   }
// };

// // Get current instructor
// export const getCurrentInstructor = () => {
//   return JSON.parse(localStorage.getItem("instructorToken"));
// };

// // Check if user is logged in as instructor
// export const isInstructorLoggedIn = () => {
//   return (
//     localStorage.getItem("userType") === "instructor" &&
//     !!localStorage.getItem("instructorToken")
//   );
// };

// // Get instructor profile
// export const getInstructorProfile = async () => {
//   const instructorToken = getCurrentInstructor();
//   if (!instructorToken) return null;

//   try {
//     const response = await axios.get(`${API_URL}profile/`, {
//       headers: {
//         Authorization: `Bearer ${instructorToken.access}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     if (error.response?.status === 401) {
//       logoutInstructor();
//     }
//     throw error.response?.data || { message: "Failed to fetch profile" };
//   }
// };
 
import axios from "axios";

const API_URL = "http://localhost:8000/api/instructors/";

// Login instructor
export const loginInstructor = async (email, password) => {
  try {
    console.log("Logging in instructor with email:", email);
    const response = await axios.post(`${API_URL}login/`, { email, password });
    console.log("Login response:", response.data);

    // Store tokens and user info in localStorage
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
    }

    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }

    localStorage.setItem("user_role", "instructor");

    if (response.data.user) {
      localStorage.setItem("user_info", JSON.stringify(response.data.user));
    }

    // Verify storage was successful
    console.log("Storage check after login:", {
      access_token: !!localStorage.getItem("access_token"),
      refresh_token: !!localStorage.getItem("refresh_token"),
      user_role: localStorage.getItem("user_role"),
      user_info: !!localStorage.getItem("user_info"),
    });

    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Register instructor - Adding the missing function
export const registerInstructor = async (instructorData) => {
  try {
    console.log("Registering instructor:", instructorData);
    const response = await axios.post(`${API_URL}register/`, instructorData);
    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Check if instructor is logged in
export const isInstructorLoggedIn = () => {
  return (
    localStorage.getItem("access_token") &&
    localStorage.getItem("user_role") === "instructor"
  );
};

// Get instructor info
export const getInstructorInfo = () => {
  const userInfo = localStorage.getItem("user_info");
  return userInfo ? JSON.parse(userInfo) : null;
};

// Logout instructor
export const logoutInstructor = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_info");
};