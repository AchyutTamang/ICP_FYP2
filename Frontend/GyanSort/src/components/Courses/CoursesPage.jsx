 import React, { useState, useEffect } from "react";
 import axios from "axios";
 import { toast } from "react-toastify";
 import { useNavigate } from "react-router-dom";
 import Navbar from "../stick/Navbar";
 import CourseCarousel from "./CourseCarousel";
 import CourseCard from "./CourseCard";
 import { useAuth } from "../../context/AuthContext";
 import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

 const CoursesPage = () => {
   const [featuredCourses, setFeaturedCourses] = useState([]);
   const [allCourses, setAllCourses] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [currentPage, setCurrentPage] = useState(1);
   const coursesPerPage = 3;
   const { isAuthenticated, userRole } = useAuth();
   const navigate = useNavigate();
   

     useEffect(() => {
       const fetchCourses = async () => {
         try {
           setLoading(true);

           // Try to fetch courses without authentication first
           try {
             const response = await axios.get(
               "http://127.0.0.1:8000/api/courses/courses/"
             );

             if (response.data) {
               // Set featured courses (first 5 courses)
               setFeaturedCourses(response.data.slice(0, 5));

               // Set all courses
               setAllCourses(response.data);
               setLoading(false);
               return;
             }
           } catch (error) {
             console.log("Trying with authentication instead...");
           }

           // If unauthenticated request fails, try with authentication
           const token = localStorage.getItem("access_token");
           if (token) {
             const response = await axios.get(
               "http://127.0.0.1:8000/api/courses/courses/",
               {
                 headers: {
                   Authorization: `Bearer ${token}`,
                 },
               }
             );

             if (response.data) {
               setFeaturedCourses(response.data.slice(0, 5));
               setAllCourses(response.data);
             }
           } else {
             setError(
               "Authentication required to view courses. Please log in."
             );
           }

           setLoading(false);
         } catch (err) {
           console.error("Error fetching courses:", err);

           if (err.response && err.response.status === 401) {
             setError(
               "Authentication required to view courses. Please log in."
             );
           } else {
             setError("Failed to load courses. Please try again later.");
           }

           setLoading(false);
         }
       };

       fetchCourses();
     }, []);
     
   const handleAddToCart = async (courseId) => {
     if (!isAuthenticated) {
       toast.error("Please login as a student to add courses to cart");
       return;
     }

     if (userRole !== "student") {
       toast.error("Only students can add courses to cart");
       return;
     }

     try {
       const response = await axios.post(
         "http://localhost:8000/api/cart/cart/",
         { course_id: courseId },
         {
           headers: {
             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
           },
         }
       );

       if (response.status === 201) {
         toast.success("Course added to cart successfully!");
       }
     } catch (err) {
       console.error("Error adding to cart:", err);
       toast.error(
         err.response?.data?.detail || "Failed to add course to cart"
       );
     }
   };

   const handleAddToFavorites = async (courseId) => {
     if (!isAuthenticated) {
       toast.error("Please login as a student to add courses to favorites");
       return;
     }

     if (userRole !== "student") {
       toast.error("Only students can add courses to favorites");
       return;
     }

     try {
       const response = await axios.post(
         "http://localhost:8000/api/cart/favorites/",
         { course_id: courseId },
         {
           headers: {
             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
           },
         }
       );

       if (response.status === 201) {
         toast.success("Course added to favorites successfully!");
       }
     } catch (err) {
       console.error("Error adding to favorites:", err);
       toast.error(
         err.response?.data?.detail || "Failed to add course to favorites"
       );
     }
   };

   // Calculate pagination
   const indexOfLastCourse = currentPage * coursesPerPage;
   const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
   const currentCourses = allCourses.slice(
     indexOfFirstCourse,
     indexOfLastCourse
   );
   const totalPages = Math.ceil(allCourses.length / coursesPerPage);

   const paginate = (pageNumber) => {
     if (pageNumber > 0 && pageNumber <= totalPages) {
       setCurrentPage(pageNumber);
     }
   };

   return (
     <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
       <Navbar />
     
       {/* Hero Section with Featured Courses Carousel */}
       <section className="pt-24 pb-12 relative">
         {loading ? (
           <div className="container mx-auto flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF40]"></div>
           </div>
         ) : error ? (
           <div className="container mx-auto text-center py-12">
             <p className="text-red-500 mb-4">{error}</p>
             {error.includes("Authentication required") && !isAuthenticated && (
               <button
                 onClick={() => navigate("/")}
                 className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-2 px-6 rounded-md transition duration-300"
               >
                 Go to Login
               </button>
             )}
           </div>
         ) : (
           <CourseCarousel courses={featuredCourses} />
         )}
       </section>
       {/* All Courses Section - Update the error display here too */}
       <section className="py-12 bg-gray-900 bg-opacity-50">
         <div className="container mx-auto px-4">
           <h2 className="text-3xl font-bold text-white mb-8">
             Available Courses
           </h2>

           {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF40]"></div>
             </div>
           ) : error ? (
             <div className="text-center py-12">
               <p className="text-red-500 mb-4">{error}</p>
               {error.includes("Authentication required") &&
                 !isAuthenticated && (
                   <button
                     onClick={() => navigate("/")}
                     className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-2 px-6 rounded-md transition duration-300"
                   >
                     Go to Login
                   </button>
                 )}
             </div>
           ) : (
             <>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {currentCourses.map((course) => (
                   <CourseCard
                     key={course.id}
                     course={course}
                     onAddToCart={() => handleAddToCart(course.id)}
                     onAddToFavorites={() => handleAddToFavorites(course.id)}
                     isAuthenticated={isAuthenticated}
                     userRole={userRole}
                   />
                 ))}
               </div>
 

               {/* Pagination */}
               <div className="flex justify-center mt-12">
                 <div className="flex space-x-2">
                   <button
                     onClick={() => paginate(currentPage - 1)}
                     disabled={currentPage === 1}
                     className={`px-3 py-1 rounded-md ${
                       currentPage === 1
                         ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                         : "bg-[#00FF40] text-black hover:bg-[#00DD30]"
                     }`}
                   >
                     <FaArrowLeft />
                   </button>

                   {[...Array(totalPages)].map((_, index) => (
                     <button
                       key={index}
                       onClick={() => paginate(index + 1)}
                       className={`px-3 py-1 rounded-md ${
                         currentPage === index + 1
                           ? "bg-[#00FF40] text-black"
                           : "bg-gray-700 text-white hover:bg-gray-600"
                       }`}
                     >
                       {index + 1}
                     </button>
                   ))}

                   <button
                     onClick={() => paginate(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className={`px-3 py-1 rounded-md ${
                       currentPage === totalPages
                         ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                         : "bg-[#00FF40] text-black hover:bg-[#00DD30]"
                     }`}
                   >
                     <FaArrowRight />
                   </button>
                 </div>
               </div>
             </>
           )}
         </div>
       </section>
       {/* Footer */}
       <footer className="bg-gray-900 py-8 mt-16">
         <div className="container mx-auto px-4 text-center text-gray-400">
           <p>© 2024 GyanSort. All rights reserved.</p>
         </div>
       </footer>
     </div>
   );
 };

export default CoursesPage;
