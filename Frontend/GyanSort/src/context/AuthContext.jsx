// import React, { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is logged in (e.g., by checking localStorage or a token)
//     const token = localStorage.getItem("token");
//     const savedUserRole = localStorage.getItem("userRole");

//     if (token) {
//       setIsAuthenticated(true);
//       setUserRole(savedUserRole || "student"); // Default to student if role not found

//       // You would typically fetch user data from your API here
//       setUser({
//         name: "User",
//         email: "user@example.com",
//         role: savedUserRole || "student",
//       });
//     }

//     setLoading(false);
//   }, []);

//   const login = (userData, role, token) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("userRole", role);

//     setIsAuthenticated(true);
//     setUserRole(role);
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userRole");

//     setIsAuthenticated(false);
//     setUserRole(null);
//     setUser(null);
//   };

//   const value = {
//     isAuthenticated,
//     userRole,
//     user,
//     loading,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };
import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context outside of any component
const AuthContext = createContext();

// Define the useAuth hook before the provider
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
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

          const userInfoStr = localStorage.getItem("user_info");
          if (userInfoStr) {
            try {
              setUserInfo(JSON.parse(userInfoStr));
            } catch (e) {
              console.error("Error parsing user info:", e);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error in auth check:", error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserInfo(null);
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

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_info");
    setIsAuthenticated(false);
    setUserRole(null);
    setUserInfo(null);
  };

  const refreshAuthState = () => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    const userInfoStr = localStorage.getItem("user_info");

    console.log(
      "Refreshing auth state - Token exists:",
      !!token,
      "Role:",
      role
    );

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);

      if (userInfoStr) {
        try {
          setUserInfo(JSON.parse(userInfoStr));
        } catch (e) {
          console.error("Error parsing user info:", e);
          setUserInfo(null);
        }
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserInfo(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userInfo,
        loading,
        logout,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};