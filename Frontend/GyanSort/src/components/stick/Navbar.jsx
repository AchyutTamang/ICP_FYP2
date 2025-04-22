// import React, { useState, createContext, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import AuthModal from "../../components/AuthModal";
// import logo from "/logo.png";
// import {
//   isStudentLoggedIn,
//   logoutStudent,
//   getCurrentStudent,
// } from "../../services/authService";
// import {
//   isInstructorLoggedIn,
//   logoutInstructor,
//   getCurrentInstructor,
// } from "../../services/instructorAuth";
// import { toast } from "react-toastify";

// // Create a context to expose the auth modal functionality
// export const AuthModalContext = createContext();

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authType, setAuthType] = useState("login"); // 'login' or 'signup'
//   const [userType, setUserType] = useState("student"); // 'student' or 'instructor'
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check login status
//     const studentLoggedIn = isStudentLoggedIn();
//     const instructorLoggedIn = isInstructorLoggedIn();

//     setIsLoggedIn(studentLoggedIn || instructorLoggedIn);

//     if (studentLoggedIn) {
//       setUserType("student");
//       setCurrentUser(getCurrentStudent());
//     } else if (instructorLoggedIn) {
//       setUserType("instructor");
//       setCurrentUser(getCurrentInstructor());
//     }
//   }, []);

//   const toggleMenu = () => {
//     setIsOpen(!isOpen);
//   };

//   const toggleUserMenu = () => {
//     setShowUserMenu(!showUserMenu);
//   };

//   const openAuthModal = (type, user = "student") => {
//     setAuthType(type);
//     setUserType(user);
//     setShowAuthModal(true);
//   };

//   const handleLogout = () => {
//     if (userType === "student") {
//       logoutStudent();
//     } else {
//       logoutInstructor();
//     }
//     setIsLoggedIn(false);
//     setCurrentUser(null);
//     toast.success("Logged out successfully");
//     navigate("/");
//   };

//   return (
//     <AuthModalContext.Provider value={{ openAuthModal }}>
//       <nav className="fixed top-0 left-0 right-0 mx-48 z-50 bg-black bg-opacity-60 rounded-[50px] mt-4 py-2">
//         <div className="max-w-screen-2xl mx-auto px-20 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo Section */}
//             <div className="flex items-center">
//               <Link to="/">
//                 <img src={logo} alt="Logo" className="h-14" />
//               </Link>
//             </div>

//             {/* Desktop Navigation */}
//             <div className="hidden md:block">
//               <div className="ml-10 flex items-center space-x-4">
//                 <Link
//                   to="/"
//                   className="text-white hover:text-[#00FF40] px-3 py-2 rounded-md text-2xl font-thin"
//                 >
//                   Home
//                 </Link>
//                 <Link
//                   to="/courses"
//                   className="text-white hover:text-[#00FF40] px-3 py-2 rounded-md text-2xl font-thin"
//                 >
//                   Courses
//                 </Link>
//                 <Link
//                   to="/blog"
//                   className="text-white hover:text-[#00FF40] px-3 py-2 rounded-md text-2xl font-thin"
//                 >
//                   Blog
//                 </Link>
//                 <Link
//                   to="/about"
//                   className="text-white hover:text-[#00FF40] px-3 py-2 rounded-md text-2xl font-thin"
//                 >
//                   About Us
//                 </Link>
//                 <Link
//                   to="/contact"
//                   className="text-white hover:text-[#00FF40] px-3 py-2 rounded-md text-2xl font-thin"
//                 >
//                   Contact Us
//                 </Link>
//               </div>
//             </div>

//             {/* Auth Buttons or User Menu */}
//             <div className="hidden md:block">
//               {isLoggedIn ? (
//                 <div className="relative">
//                   <button
//                     onClick={toggleUserMenu}
//                     className="flex items-center space-x-2 text-white hover:text-[#00FF40]"
//                   >
//                     <div className="w-8 h-8 rounded-full bg-[#00FF40] flex items-center justify-center text-black">
//                       {currentUser?.fullname?.charAt(0) || "U"}
//                     </div>
//                     <span>{currentUser?.fullname || "User"}</span>
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M19 9l-7 7-7-7"
//                       ></path>
//                     </svg>
//                   </button>

//                   {/* User Dropdown Menu */}
//                   {showUserMenu && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
//                       <Link
//                         to={`/${userType}-dashboard`}
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Dashboard
//                       </Link>
//                       <Link
//                         to={`/${userType}-profile`}
//                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Profile
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex items-center space-x-4">
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
//             </div>

//             {/* Mobile menu button */}
//             <div className="md:hidden">
//               <button
//                 onClick={toggleMenu}
//                 className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#00FF40] focus:outline-none"
//               >
//                 <svg
//                   className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M4 6h16M4 12h16M4 18h16"
//                   />
//                 </svg>
//                 <svg
//                   className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile menu */}
//         <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             <Link
//               to="/"
//               className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//             >
//               Home
//             </Link>
//             <Link
//               to="/courses"
//               className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//             >
//               Courses
//             </Link>
//             <Link
//               to="/blog"
//               className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
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

//             {isLoggedIn ? (
//               <>
//                 <Link
//                   to={`/${userType}-dashboard`}
//                   className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
//                 >
//                   Dashboard
//                 </Link>
//                 <Link
//                   to={`/${userType}-profile`}
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

//         {/* Auth Modal */}
//         {showAuthModal && (
//           <AuthModal
//             isOpen={showAuthModal}
//             onClose={() => setShowAuthModal(false)}
//             type={authType}
//             userType={userType}
//           />
//         )}
//       </nav>
//     </AuthModalContext.Provider>
//   );
// };

// export default Navbar;

import React, { useState, createContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaHeart, FaShoppingCart, FaUser } from "react-icons/fa";
import AuthModal from "../AuthModal";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

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
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search here..."
                className="bg-gray-800 text-white rounded-full py-2 px-4 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-[#00FF40]"
              />
              <FaSearch className="absolute left-3 text-gray-400" />
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {userRole === "student" && (
                    <>
                      <Link
                        to="/wishlist"
                        className="text-white hover:text-[#00FF40]"
                      >
                        <FaHeart />
                      </Link>
                      <Link
                        to="/cart"
                        className="text-white hover:text-[#00FF40]"
                      >
                        <FaShoppingCart />
                      </Link>
                    </>
                  )}
                  <div className="relative group">
                    <button className="text-white hover:text-[#00FF40] flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-[#00FF40] flex items-center justify-center text-black">
                        {user?.fullname?.charAt(0) || "U"}
                      </div>
                      <span className="hidden md:inline">
                        {user?.fullname || "User"}
                      </span>
                    </button>
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

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#00FF40] focus:outline-none"
                >
                  <svg
                    className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <svg
                    className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
            >
              Courses
            </Link>
            <Link
              to="/blog"
              className="text-white hover:text-[#00FF40] block px-3 py-2 rounded-md text-base font-medium"
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
