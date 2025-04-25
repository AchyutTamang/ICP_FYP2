// import React, { useState, createContext, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { FaSearch, FaHeart, FaShoppingCart, FaUser } from "react-icons/fa";
// import AuthModal from "../AuthModal";
// import { useAuth } from "../../context/AuthContext";
// import { toast } from "react-toastify";

// // Create context for opening auth modal
// export const AuthModalContext = createContext();

// function Navbar() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState("login");
//   const [userType, setUserType] = useState("student");
//   const [isOpen, setIsOpen] = useState(false); // For mobile menu
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Use auth context
//   const { isAuthenticated, userRole, user, logout } = useAuth();

//   // Function to check if a path is active
//   const isActive = (path) => {
//     if (path === "/") {
//       return location.pathname === "/";
//     }
//     return location.pathname.startsWith(path);
//   };

//   const openAuthModal = (type, role = "student") => {
//     setModalType(type);
//     setUserType(role);
//     setIsModalOpen(true);
//   };

//   const handleLogout = () => {
//     // Enhanced logout to ensure all tokens and user data are cleared
//     logout();

//     // Explicitly clear all auth-related items from localStorage
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     localStorage.removeItem("user_role");
//     localStorage.removeItem("user_info");

//     // Clear any other potential cached data
//     sessionStorage.clear();

//     // Force reload the page to ensure all state is reset
//     toast.success("Logged out successfully");
//     setTimeout(() => {
//       window.location.href = "/"; // Use window.location instead of navigate for a full page reload
//     }, 500);
//   };

//   const toggleMenu = () => {
//     setIsOpen(!isOpen);
//   };

//   // Inside your Navbar component, add this state
//   const [searchQuery, setSearchQuery] = useState("");

//   // Add this function to handle search
//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
//     }
//   };
//   // Add debugging to see what's happening with user data
//   useEffect(() => {
//     if (isAuthenticated && userRole === "instructor") {
//       console.log("Navbar - Instructor user data:", user);
//       console.log("localStorage user_info:", localStorage.getItem("user_info"));
//     }
//   }, [isAuthenticated, userRole, user]);


//   // Helper function to get email from localStorage
//   const getEmailFromLocalStorage = () => {
//     try {
//       const userInfoStr = localStorage.getItem("user_info");
//       const userRole = localStorage.getItem("user_role");

//       // Log for debugging
//       console.log("Current user role:", userRole);
//       console.log("Raw user_info from localStorage:", userInfoStr);

//       if (userInfoStr) {
//         const userInfo = JSON.parse(userInfoStr);
//         console.log("Parsed user info:", userInfo);

//         // Verify that the user_role matches the expected role
//         if (userRole === "instructor" && userInfo.email) {
//           return userInfo.email;
//         }
//       }
//     } catch (e) {
//       console.error("Error parsing user_info:", e);
//     }
//     return null;
//   };

//   // Helper function to get the correct display name
// const getDisplayName = () => {
//     if (!user) {
//       // Try to get from localStorage directly if user object is not available
//       try {
//         const userInfoStr = localStorage.getItem("user_info");
//         if (userInfoStr) {
//           const userInfo = JSON.parse(userInfoStr);
//           // Return fullname if available, otherwise use email
//           return userInfo.fullname || (userInfo.email ? userInfo.email.split("@")[0] : "User");
//         }
//       } catch (e) {
//         console.error("Error parsing user_info:", e);
//       }

//       return userRole === "instructor" ? "Instructor" : "Student";
//     }

//     // For both instructors and students, prioritize fullname
//     return user.fullname || (user.email ? user.email.split("@")[0] : "User");
//   };

//     const getProfilePicture = () => {
//     if (!user) {
//       try {
//         const userInfoStr = localStorage.getItem("user_info");
//         if (userInfoStr) {
//           const userInfo = JSON.parse(userInfoStr);
//           return userInfo.profile_picture || userInfo.profilePicture;
//         }
//       } catch (e) {
//         console.error("Error parsing user_info for profile picture:", e);
//       }
//       return null;
//     }
    
//     return user.profile_picture || user.profilePicture;
//   };
//     // For instructors, prioritize using the email
//     if (userRole === "instructor") {
//       // First try to get email directly from user object
//       if (user.email) {
//         const displayName = user.email.split("@")[0];
//         console.log(
//           "Using email-based display name from user object:",
//           displayName
//         );
//         return displayName;
//       }

//       // If not available, try localStorage
//       try {
//         const userInfoStr = localStorage.getItem("user_info");
//         if (userInfoStr) {
//           const userInfo = JSON.parse(userInfoStr);
//           if (userInfo.email) {
//             const displayName = userInfo.email.split("@")[0];
//             console.log(
//               "Using email-based display name from localStorage:",
//               displayName
//             );
//             return displayName;
//           }
//         }
//       } catch (e) {
//         console.error("Error parsing user_info:", e);
//       }

//       // Fallbacks
//       return user.fullname || user.name || "Instructor";
//     }

//     // For students
//     return user.fullname || user.name || "Student";
//   };

//   return (
//     <AuthModalContext.Provider value={openAuthModal}>
//       <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-sm fixed w-full z-50 shadow-lg">
//         <div className="container mx-auto px-4">
//           <div className="flex justify-between items-center py-4">
//             {/* Logo */}
//             <Link to="/" className="flex items-center">
//               <img
//                 src="/logo.png"
//                 alt="GyanSort Logo"
//                 className="h-12 w-auto"
//               />
//             </Link>
//             {/* Navigation Links */}
//             <div className="hidden md:flex items-center space-x-8">
//               <Link
//                 to="/"
//                 className={
//                   isActive("/")
//                     ? "text-[#00FF40] hover:text-[#00DD30]"
//                     : "text-white hover:text-[#00FF40]"
//                 }
//               >
//                 Home
//               </Link>
//               {/* <Link to="/" className="text-white hover:text-[#00FF40]">
//                 Home
//               </Link> */}

//               <Link
//                 to="/courses"
//                 className={
//                   isActive("/courses")
//                     ? "text-[#00FF40] hover:text-[#00DD30]"
//                     : "text-white hover:text-[#00FF40]"
//                 }
//               >
//                 Courses
//               </Link>
//               <Link
//                 to="/blog"
//                 className={
//                   isActive("/blog")
//                     ? "text-[#00FF40] hover:text-[#00DD30]"
//                     : "text-white hover:text-[#00FF40]"
//                 }
//               >
//                 Blog
//               </Link>
//               <Link
//                 to="/about"
//                 className={
//                   isActive("/about")
//                     ? "text-[#00FF40] hover:text-[#00DD30]"
//                     : "text-white hover:text-[#00FF40]"
//                 }
//               >
//                 About Us
//               </Link>
//               <Link
//                 to="/contact"
//                 className={
//                   isActive("/contact")
//                     ? "text-[#00FF40] hover:text-[#00DD30]"
//                     : "text-white hover:text-[#00FF40]"
//                 }
//               >
//                 Contact Us
//               </Link>
//               {isAuthenticated && (
//                 <Link
//                   to="/forum"
//                   className={
//                     isActive("/forum")
//                       ? "text-[#00FF40] hover:text-[#00DD30]"
//                       : "text-white hover:text-[#00FF40]"
//                   }
//                 >
//                   Forum
//                 </Link>
//               )}
//             </div>
//             {/* Search Bar */}

//             <form
//               onSubmit={handleSearch}
//               className="hidden md:flex items-center relative"
//             >
//               <input
//                 type="text"
//                 placeholder="search courses here..."
//                 className="bg-gray-800 text-white rounded-full py-2 px-4 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-[#00FF40]"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <button type="submit" className="absolute left-3 text-gray-400">
//                 <FaSearch />
//               </button>
//             </form>
//             {/* Right Side Icons */}
//             <div className="flex items-center space-x-4">
//               {isAuthenticated ? (
//                 <>
//                   {userRole === "student" && (
//                     <>
//                       <Link
//                         to="/wishlist"
//                         className="text-white hover:text-[#00FF40]"
//                       >
//                         <FaHeart />
//                       </Link>
//                       <Link
//                         to="/cart"
//                         className="text-white hover:text-[#00FF40]"
//                       >
//                         <FaShoppingCart />
//                       </Link>
//                     </>
//                   )}

//                   <div className="relative group">
//                      <button className="text-white hover:text-[#00FF40] flex items-center space-x-2">
//     {getProfilePicture() ? (
//       <img
//         src={getProfilePicture()}
//         alt={getDisplayName()}
//         className="w-8 h-8 rounded-full object-cover"
//       />
//     ) : (
//       <div className="w-8 h-8 rounded-full bg-[#00FF40] flex items-center justify-center text-black">
//         {getDisplayName().charAt(0).toUpperCase()}
//       </div>
//     )}
//     <span className="hidden md:inline">
//       {getDisplayName()}
//     </span>
//   </button>
//                     {/* Dropdown menu */}
//                     <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
//                       <Link
//                         to={`/${userRole}-dashboard`}
//                         className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
//                       >
//                         Dashboard
//                       </Link>
//                       <Link
//                         to={`/${userRole}-profile`}
//                         className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
//                       >
//                         Profile
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="hidden md:flex items-center space-x-4">
//                   {/* Login Dropdown */}
//                   <div className="relative group">
//                     <button className="bg-transparent hover:bg-white text-white hover:text-black border border-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
//                       Login
//                     </button>
//                     <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
//                       <div
//                         className="py-1"
//                         role="menu"
//                         aria-orientation="vertical"
//                       >
//                         <button
//                           data-auth="login-student"
//                           onClick={() => openAuthModal("login", "student")}
//                           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                           role="menuitem"
//                         >
//                           Student Login
//                         </button>
//                         <button
//                           data-auth="login-instructor"
//                           onClick={() => openAuthModal("login", "instructor")}
//                           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                           role="menuitem"
//                         >
//                           Instructor Login
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Signup Dropdown */}
//                   <div className="relative group">
//                     <button className="bg-[#00FF40] hover:bg-white text-black px-4 py-2 rounded-md text-sm font-medium transition-colors">
//                       Sign Up
//                     </button>
//                     <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
//                       <div
//                         className="py-1"
//                         role="menu"
//                         aria-orientation="vertical"
//                       >
//                         <button
//                           data-auth="signup-student"
//                           onClick={() => openAuthModal("signup", "student")}
//                           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                           role="menuitem"
//                         >
//                           Student Sign Up
//                         </button>
//                         <button
//                           data-auth="signup-instructor"
//                           onClick={() => openAuthModal("signup", "instructor")}
//                           className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                           role="menuitem"
//                         >
//                           Instructor Sign Up
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Mobile menu button */}
//               <div className="md:hidden">
//                 <button
//                   onClick={toggleMenu}
//                   className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#00FF40] focus:outline-none"
//                 >
//                   <svg
//                     className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M4 6h16M4 12h16M4 18h16"
//                     />
//                   </svg>
//                   <svg
//                     className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Mobile menu */}
//         <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             <Link
//               to="/"
//               className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
//             >
//               Home
//             </Link>
//             <Link
//               to="/courses"
//               className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
//             >
//               Courses
//             </Link>
//             <Link
//               to="/blog"
//               className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
//             >
//               Blog
//             </Link>
//             <Link
//               to="/about"
//               className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//             >
//               About Us
//             </Link>
//             <Link
//               to="/contact"
//               className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//             >
//               Contact Us
//             </Link>

//             {isAuthenticated ? (
//               <>
//                 <Link
//                   to={`/${userRole}-profile`}
//                   className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//                 >
//                   Profile
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <>
//                 <div className="border-t border-gray-700 pt-2 mt-2">
//                   <p className="px-3 py-1 text-xs text-gray-400">Student</p>
//                   <button
//                     onClick={() => openAuthModal("login", "student")}
//                     className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//                   >
//                     Student Login
//                   </button>
//                   <button
//                     onClick={() => openAuthModal("signup", "student")}
//                     className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//                   >
//                     Student Sign Up
//                   </button>
//                 </div>
//                 <div className="border-t border-gray-700 pt-2 mt-2">
//                   <p className="px-3 py-1 text-xs text-gray-400">Instructor</p>
//                   <button
//                     onClick={() => openAuthModal("login", "instructor")}
//                     className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//                   >
//                     Instructor Login
//                   </button>
//                   <button
//                     onClick={() => openAuthModal("signup", "instructor")}
//                     className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//                   >
//                     Instructor Sign Up
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </nav>

//       {/* Auth Modal */}
//       <AuthModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         type={modalType}
//         userType={userType}
//       />
//     </AuthModalContext.Provider>
//   );
// };
// export default Navbar;

import React, { useState, createContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaHeart, FaShoppingCart, FaUser } from "react-icons/fa";
import AuthModal from "../AuthModal";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";

// Create context for opening auth modal
export const AuthModalContext = createContext();

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [userType, setUserType] = useState("student");
  const [isOpen, setIsOpen] = useState(false); // For mobile menu
  const navigate = useNavigate();
  const location = useLocation();

  // Use auth context
  const { isAuthenticated, userRole, user, logout } = useAuth();

  const { cartCount, favoritesCount } = useCart();

  // Function to check if a path is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const openAuthModal = (type, role = "student") => {
    setModalType(type);
    setUserType(role);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    // Enhanced logout to ensure all tokens and user data are cleared
    logout();

    // Explicitly clear all auth-related items from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_info");

    // Clear any other potential cached data
    sessionStorage.clear();

    // Force reload the page to ensure all state is reset
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/"; // Use window.location instead of navigate for a full page reload
    }, 500);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Inside your Navbar component, add this state
  const [searchQuery, setSearchQuery] = useState("");

  // Add this function to handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Add debugging to see what's happening with user data
  useEffect(() => {
    if (isAuthenticated && userRole === "instructor") {
      console.log("Navbar - Instructor user data:", user);
      console.log("localStorage user_info:", localStorage.getItem("user_info"));
    }
  }, [isAuthenticated, userRole, user]);

  // Helper function to get email from localStorage
  const getEmailFromLocalStorage = () => {
    try {
      const userInfoStr = localStorage.getItem("user_info");
      const userRole = localStorage.getItem("user_role");

      // Log for debugging
      console.log("Current user role:", userRole);
      console.log("Raw user_info from localStorage:", userInfoStr);

      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        console.log("Parsed user info:", userInfo);

        // Verify that the user_role matches the expected role
        if (userRole === "instructor" && userInfo.email) {
          return userInfo.email;
        }
      }
    } catch (e) {
      console.error("Error parsing user_info:", e);
    }
    return null;
  };

  // Helper function to get the correct display name
  const getDisplayName = () => {
    if (!user) {
      // Try to get from localStorage directly if user object is not available
      try {
        const userInfoStr = localStorage.getItem("user_info");
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          // Return fullname if available, otherwise use email
          return (
            userInfo.fullname ||
            (userInfo.email ? userInfo.email.split("@")[0] : "User")
          );
        }
      } catch (e) {
        console.error("Error parsing user_info:", e);
      }

      return userRole === "instructor" ? "Instructor" : "Student";
    }

    // For all users, prioritize fullname over email
    return user.fullname || (user.email ? user.email.split("@")[0] : "User");
  };

  // Helper function to get profile picture
  const getProfilePicture = () => {
    try {
      // Determine the current role
      const currentRole = user ? userRole : localStorage.getItem("user_role");
      console.log("Current role for profile picture:", currentRole);

      // Get user info either from context or localStorage
      let userInfo = user;
      if (!userInfo) {
        const userInfoStr = localStorage.getItem("user_info");
        if (userInfoStr) {
          try {
            userInfo = JSON.parse(userInfoStr);
          } catch (e) {
            console.error("Error parsing user_info:", e);
            return null;
          }
        } else {
          return null;
        }
      }

      // Log the entire user object to see what fields are available
      console.log("User info object for profile picture:", userInfo);

      // Get the profile picture based on role - regardless of verification status
      let profilePic = null;
      if (currentRole === "student") {
        profilePic = userInfo.profile_pic || userInfo.profilePic;
        console.log("Raw student profile pic:", profilePic);
      } else if (currentRole === "instructor") {
        profilePic = userInfo.profile_picture || userInfo.profilePicture;
        console.log("Raw instructor profile picture:", profilePic);
      }

      if (!profilePic) {
        console.log("No profile picture found for user");
        return null;
      }

      // If the profile pic is already a full URL, use it directly
      if (profilePic.startsWith("http")) {
        console.log("Using direct URL:", profilePic);
        return profilePic;
      }

      // For Django media files, we need to add the base URL
      const baseUrl = "http://localhost:8000";

      // Construct the full URL - ensure we don't have double slashes
      const fullUrl =
        baseUrl + (profilePic.startsWith("/") ? profilePic : "/" + profilePic);
      console.log("Constructed full URL for image:", fullUrl);
      return fullUrl;
    } catch (error) {
      console.error("Error in getProfilePicture:", error);
      return null;
    }
  };

  return (
    <AuthModalContext.Provider value={openAuthModal}>
      <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-sm fixed w-full z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="GyanSort Logo"
                className="h-12 w-auto"
              />
            </Link>
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={
                  isActive("/")
                    ? "text-[#00FF40] hover:text-[#00DD30]"
                    : "text-white hover:text-[#00FF40]"
                }
              >
                Home
              </Link>
              {/* <Link to="/" className="text-white hover:text-[#00FF40]">
                Home
              </Link> */}

              <Link
                to="/courses"
                className={
                  isActive("/courses")
                    ? "text-[#00FF40] hover:text-[#00DD30]"
                    : "text-white hover:text-[#00FF40]"
                }
              >
                Courses
              </Link>
              <Link
                to="/blog"
                className={
                  isActive("/blog")
                    ? "text-[#00FF40] hover:text-[#00DD30]"
                    : "text-white hover:text-[#00FF40]"
                }
              >
                Blog
              </Link>
              <Link
                to="/about"
                className={
                  isActive("/about")
                    ? "text-[#00FF40] hover:text-[#00DD30]"
                    : "text-white hover:text-[#00FF40]"
                }
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className={
                  isActive("/contact")
                    ? "text-[#00FF40] hover:text-[#00DD30]"
                    : "text-white hover:text-[#00FF40]"
                }
              >
                Contact Us
              </Link>
              {isAuthenticated && (
                <Link
                  to="/forum"
                  className={
                    isActive("/forum")
                      ? "text-[#00FF40] hover:text-[#00DD30]"
                      : "text-white hover:text-[#00FF40]"
                  }
                >
                  Forum
                </Link>
              )}
            </div>
            {/* Search Bar */}

            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center relative"
            >
              <input
                type="text"
                placeholder="search courses here..."
                className="bg-gray-800 text-white rounded-full py-2 px-4 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-[#00FF40]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute left-3 text-gray-400">
                <FaSearch />
              </button>
            </form>
            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {userRole === "student" && (
                    <>
                      <Link to="/wishlist" className="text-gray-300 hover:text-white relative">
                  <FaHeart className="text-xl" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#00FF40] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="text-gray-300 hover:text-white relative">
                  <FaShoppingCart className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#00FF40] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                    </>
                  )}

                  <div className="relative group">
                    <button className="text-white hover:text-[#00FF40] flex items-center space-x-2">
                      {(() => {
                        try {
                          // Get user info directly from localStorage
                          const userInfoStr = localStorage.getItem("user_info");
                          let userInfo = null;

                          if (userInfoStr) {
                            userInfo = JSON.parse(userInfoStr);
                            console.log(
                              "User info from localStorage:",
                              userInfo
                            );

                            // Get profile picture path based on role
                            const currentRole =
                              localStorage.getItem("user_role");
                            let profilePicPath = null;

                            if (currentRole === "student") {
                              profilePicPath =
                                userInfo.profile_pic || userInfo.profilePic;
                            } else if (currentRole === "instructor") {
                              profilePicPath =
                                userInfo.profile_picture ||
                                userInfo.profilePicture;
                            }

                            console.log(
                              "Profile picture path:",
                              profilePicPath
                            );

                            if (profilePicPath) {
                              // If it's already a full URL, use it directly
                              if (profilePicPath.startsWith("http")) {
                                console.log(
                                  "Using direct URL:",
                                  profilePicPath
                                );

                                return (
                                  <img
                                    src={profilePicPath}
                                    alt={getDisplayName()}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      console.error(
                                        "Image failed to load:",
                                        e.target.src
                                      );
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                      const parent = e.target.parentNode;
                                      const initial =
                                        document.createElement("div");
                                      initial.className =
                                        "w-8 h-8 rounded-full bg-[#00FF40] flex items-center justify-center text-black";
                                      initial.innerHTML = getDisplayName()
                                        .charAt(0)
                                        .toUpperCase();
                                      parent.appendChild(initial);
                                    }}
                                  />
                                );
                              }

                              // For Django media files, construct the full URL
                              const baseUrl = "http://localhost:8000";
                              const fullUrl =
                                baseUrl +
                                (profilePicPath.startsWith("/")
                                  ? profilePicPath
                                  : "/" + profilePicPath);
                              console.log(
                                "Constructed full URL for image:",
                                fullUrl
                              );

                              return (
                                <img
                                  src={fullUrl}
                                  alt={getDisplayName()}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    console.error(
                                      "Image failed to load:",
                                      e.target.src
                                    );
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    const parent = e.target.parentNode;
                                    const initial =
                                      document.createElement("div");
                                    initial.className =
                                      "w-8 h-8 rounded-full bg-[#00FF40] flex items-center justify-center text-black";
                                    initial.innerHTML = getDisplayName()
                                      .charAt(0)
                                      .toUpperCase();
                                    parent.appendChild(initial);
                                  }}
                                />
                              );
                            }
                          }
                        } catch (error) {
                          console.error(
                            "Error displaying profile picture:",
                            error
                          );
                        }

                        // Fallback to initial if no profile picture is available
                        return (
                          <div className="w-8 h-8 rounded-full bg-[#00FF40] flex items-center justify-center text-black">
                            {getDisplayName().charAt(0).toUpperCase()}
                          </div>
                        );
                      })()}
                      <span className="hidden md:inline">
                        {getDisplayName()}
                      </span>
                    </button>
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                      <Link
                        to={`/${userRole}-dashboard`}
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to={`/${userRole}-profile`}
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  {/* Login Dropdown */}
                  <div className="relative group">
                    <button className="bg-transparent hover:bg-white text-white hover:text-black border border-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Login
                    </button>
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        <button
                          data-auth="login-student"
                          onClick={() => openAuthModal("login", "student")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          role="menuitem"
                        >
                          Student Login
                        </button>
                        <button
                          data-auth="login-instructor"
                          onClick={() => openAuthModal("login", "instructor")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          role="menuitem"
                        >
                          Instructor Login
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Signup Dropdown */}
                  <div className="relative group">
                    <button className="bg-[#00FF40] hover:bg-white text-black px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Sign Up
                    </button>
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        <button
                          data-auth="signup-student"
                          onClick={() => openAuthModal("signup", "student")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          role="menuitem"
                        >
                          Student Sign Up
                        </button>
                        <button
                          data-auth="signup-instructor"
                          onClick={() => openAuthModal("signup", "instructor")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          role="menuitem"
                        >
                          Instructor Sign Up
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile menu */}
              <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  <Link
                    to="/"
                    className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/courses"
                    className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
                  >
                    Courses
                  </Link>
                  <Link
                    to="/blog"
                    className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
                  >
                    Blog
                  </Link>
                  <Link
                    to="/about"
                    className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Contact Us
                  </Link>

                  {isAuthenticated ? (
                    <>
                      {/* Add profile picture in mobile menu */}
                      <div className="flex items-center space-x-2 px-3 py-2">
                        {(() => {
                          try {
                            // Get user info directly from localStorage
                            const userInfoStr =
                              localStorage.getItem("user_info");
                            let userInfo = null;

                            if (userInfoStr) {
                              userInfo = JSON.parse(userInfoStr);

                              // Get profile picture path based on role
                              const currentRole =
                                localStorage.getItem("user_role");
                              let profilePicPath = null;

                              if (currentRole === "student") {
                                profilePicPath =
                                  userInfo.profile_pic || userInfo.profilePic;
                              } else if (currentRole === "instructor") {
                                profilePicPath =
                                  userInfo.profile_picture ||
                                  userInfo.profilePicture;
                              }

                              if (profilePicPath) {
                                // If it's already a full URL, use it directly
                                if (profilePicPath.startsWith("http")) {
                                  return (
                                    <img
                                      src={profilePicPath}
                                      alt={getDisplayName()}
                                      className="w-8 h-8 rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  );
                                }

                                // For Django media files, construct the full URL
                                const baseUrl = "http://localhost:8000";
                                const fullUrl =
                                  baseUrl +
                                  (profilePicPath.startsWith("/")
                                    ? profilePicPath
                                    : "/" + profilePicPath);

                                return (
                                  <img
                                    src={fullUrl}
                                    alt={getDisplayName()}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                    }}
                                  />
                                );
                              }
                            }
                          } catch (error) {
                            console.error(
                              "Error displaying profile picture:",
                              error
                            );
                          }

                          // Fallback to initial if no profile picture is available
                          return (
                            <div className="w-8 h-8 rounded-full bg-[#00FF40] flex items-center justify-center text-black">
                              {getDisplayName().charAt(0).toUpperCase()}
                            </div>
                          );
                        })()}
                        <span className="text-white font-medium">
                          {getDisplayName()}
                        </span>
                      </div>
                      <Link
                        to={`/${userRole}-dashboard`}
                        className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to={`/${userRole}-profile`}
                        className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-gray-700 pt-2 mt-2">
                        <p className="px-3 py-1 text-xs text-gray-400">
                          Student
                        </p>
                        <button
                          onClick={() => openAuthModal("login", "student")}
                          className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                        >
                          Student Login
                        </button>
                        <button
                          onClick={() => openAuthModal("signup", "student")}
                          className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                        >
                          Student Sign Up
                        </button>
                      </div>
                      <div className="border-t border-gray-700 pt-2 mt-2">
                        <p className="px-3 py-1 text-xs text-gray-400">
                          Instructor
                        </p>
                        <button
                          onClick={() => openAuthModal("login", "instructor")}
                          className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                        >
                          Instructor Login
                        </button>
                        <button
                          onClick={() => openAuthModal("signup", "instructor")}
                          className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                        >
                          Instructor Sign Up
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
            >
              Courses
            </Link>
            <Link
              to="/blog"
              className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-9xl font-medium"
            >
              Blog
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
            >
              Contact Us
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={`/${userRole}-profile`}
                  className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <p className="px-3 py-1 text-xs text-gray-400">Student</p>
                  <button
                    onClick={() => openAuthModal("login", "student")}
                    className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Student Login
                  </button>
                  <button
                    onClick={() => openAuthModal("signup", "student")}
                    className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Student Sign Up
                  </button>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <p className="px-3 py-1 text-xs text-gray-400">Instructor</p>
                  <button
                    onClick={() => openAuthModal("login", "instructor")}
                    className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Instructor Login
                  </button>
                  <button
                    onClick={() => openAuthModal("signup", "instructor")}
                    className="w-full text-left text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Instructor Sign Up
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        userType={userType}
      />
    </AuthModalContext.Provider>
  );
}

export default Navbar;