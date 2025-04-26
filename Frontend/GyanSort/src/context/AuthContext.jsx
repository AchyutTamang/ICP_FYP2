import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// Define API URL
const API_URL = "http://localhost:8000/api"; // Adjust this to match your backend URL

// Create the context outside of any component
const AuthContext = createContext();

// Define the useAuth hook before the provider
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const role = localStorage.getItem("user_role");

        console.log("Auth check - Raw values:", {
          token: token,
          role: role,
        });

        if (token && role) {
          setIsAuthenticated(true);
          setUserRole(role);

          // Get user info from localStorage first
          const userInfoStr = localStorage.getItem("user_info");
          let userInfo = null;

          if (userInfoStr) {
            try {
              userInfo = JSON.parse(userInfoStr);
              console.log("User info from localStorage:", userInfo);

              // Ensure we have the correct properties set
              if (role === "instructor") {
                userInfo.fullname =
                  userInfo.fullname || userInfo.name || "Instructor";
                userInfo.profilePicture =
                  userInfo.profile_picture || userInfo.profilePicture || null;
              } else {
                userInfo.fullname =
                  userInfo.fullname ||
                  (userInfo.first_name && userInfo.last_name
                    ? `${userInfo.first_name} ${userInfo.last_name}`
                    : "Student");
                userInfo.profilePicture =
                  userInfo.profile_pic || userInfo.profilePicture || null;
              }

              setUser(userInfo);
            } catch (e) {
              console.error("Error parsing user info:", e);
            }
          }

          // Fetch fresh user data to ensure we have the latest info
          try {
            let endpoint = "";
            if (role === "student") {
              endpoint = `${API_URL}/students/profile/`;
            } else if (role === "instructor") {
              endpoint = `${API_URL}/instructors/profile/`;
            }

            if (endpoint) {
              console.log("Fetching profile from:", endpoint);
              const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
              });

              console.log("API Response:", response.data);

              // Log all fields in the response for debugging
              console.log("All fields in response:");
              Object.keys(response.data).forEach((key) => {
                console.log(`${key}:`, response.data[key]);
              });

              // Create a user object with appropriate data based on role
              let userData = {
                ...response.data,
              };

              // Handle different data structures for student vs instructor
              if (role === "instructor") {
                // Try all possible field names for instructor name
                userData.fullname =
                  response.data.fullname ||
                  response.data.full_name ||
                  response.data.name ||
                  "Instructor";

                // Try all possible field names for profile picture
                userData.profilePicture =
                  response.data.profile_picture ||
                  response.data.profilePicture ||
                  response.data.profile_pic ||
                  null;

                console.log("Final instructor data:", {
                  fullname: userData.fullname,
                  profilePicture: userData.profilePicture,
                });
              } else {
                // For students
                userData.fullname =
                  response.data.first_name && response.data.last_name
                    ? `${response.data.first_name} ${response.data.last_name}`
                    : response.data.fullname || response.data.name || "Student";
                userData.profilePicture = response.data.profile_pic || null;
              }

              console.log("Processed user data:", userData);

              // Update localStorage with fresh data
              localStorage.setItem("user_info", JSON.stringify(userData));
              setUser(userData);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            // If we can't fetch fresh data, use what we have from localStorage
            if (userInfo) {
              setUser(userInfo);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Add event listener for storage changes
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Replace the existing login function with this updated version
  const login = (userData, role, token, refreshToken) => {
    console.log("Login data:", userData, role);

    // Create user object with appropriate data based on role
    let userWithFullName = {
      ...userData,
    };

    // Handle different data structures for student vs instructor
    if (role === "instructor") {
      // For instructors, check if we have a name field directly
      userWithFullName.fullname =
        userData.fullname ||
        userData.full_name ||
        userData.name ||
        "Instructor";
      userWithFullName.profilePicture =
        userData.profile_picture ||
        userData.profilePicture ||
        userData.profile_pic ||
        null;
      userWithFullName.email = userData.email; // Store email explicitly
      console.log("Processed instructor data:", userWithFullName);
    } else {
      // For students
      userWithFullName.fullname =
        userData.fullname ||
        (userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : "Student");
      userWithFullName.profilePicture =
        userData.profile_pic || userData.profilePicture || null;
      userWithFullName.email = userData.email; // Store email explicitly
    }
    console.log("Processed login data:", userWithFullName);

    localStorage.setItem("access_token", token);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    localStorage.setItem("user_role", role);
    localStorage.setItem("user_info", JSON.stringify(userWithFullName));
    localStorage.setItem("user_email", userWithFullName.email); // Store email in localStorage

    setIsAuthenticated(true);
    setUserRole(role);
    setUser(userWithFullName);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_info");

    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
  };

  

  const refreshAuthState = async () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    console.log(
      "Refreshing auth state - Token exists:",
      !!token,
      "Role:",
      role
    );

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);

      // Try to get fresh user data
      try {
        let endpoint = "";
        if (role === "student") {
          endpoint = `${API_URL}/students/profile/`;
        } else if (role === "instructor") {
          endpoint = `${API_URL}/instructors/profile/`;
        }

        if (endpoint) {
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log(`${role} profile data received:`, response.data);

          // Create a user object with appropriate data based on role
          let userData = {
            ...response.data,
          };

          // For instructors, ensure we're using the correct name field
          if (role === "instructor") {
            // Log all fields to see what's available
            console.log(
              "Instructor profile fields:",
              Object.keys(response.data)
            );

            // Use the fullname field directly from the response
            userData.fullname =
              response.data.fullname ||
              (response.data.email
                ? response.data.email.split("@")[0]
                : "Instructor");

            userData.profilePicture = response.data.profile_picture || null;

            console.log("Final instructor user data:", userData);
          } else {
            // For students
            userData.fullname =
              response.data.first_name && response.data.last_name
                ? `${response.data.first_name} ${response.data.last_name}`
                : response.data.fullname || response.data.name || "Student";
            userData.profilePicture = response.data.profile_pic || null;
          }

          localStorage.setItem("user_info", JSON.stringify(userData));
          setUser(userData);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);

        // Fall back to stored user info
        const userInfoStr = localStorage.getItem("user_info");
        if (userInfoStr) {
          try {
            setUser(JSON.parse(userInfoStr));
          } catch (e) {
            console.error("Error parsing user info:", e);
            setUser(null);
          }
        }
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
    }
  };

 

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        user,
        loading,
        login,
        logout,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;


// Inside the login function
const login = async (email, password, role) => {
  try {
    setLoading(true);
    
    // Determine which API endpoint to use based on role
    const endpoint = role === 'instructor' ? '/instructors/login/' : '/students/login/';
    
    const response = await api.post(endpoint, {
      email,
      password,
    });
    
    const { access, refresh } = response.data;
    
    // Store tokens and user info in localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_email', email);  // Store the email
    
    // Set auth state
    setIsAuthenticated(true);
    setUserRole(role);
    setUserEmail(email);
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  } finally {
    setLoading(false);
  }
};
