import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaPlay,
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../stick/Navbar";

const CourseDescription = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState("introduction");
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add courses to cart");
      navigate("/login");
      return;
    }

    if (userRole !== "student") {
      toast.error("Only students can add courses to cart");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/cart/add/",
        { course_id: courseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Course added to cart successfully!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(
        error.response?.data?.message || "Failed to add course to cart"
      );
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase courses");
      navigate("/login");
      return;
    }
    navigate(`/payment/${courseId}`);
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add courses to wishlist");
      navigate("/login");
      return;
    }

    if (userRole !== "student") {
      toast.error("Only students can add courses to wishlist");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/wishlist/add/",
        { course_id: courseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Course added to wishlist successfully!");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(
        error.response?.data?.message || "Failed to add course to wishlist"
      );
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8000/api/courses/${courseId}/reviews/`,
        {
          rating: userRating,
          comment: userReview,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      toast.success("Review submitted successfully!");
      setUserRating(0);
      setUserReview("");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        };

        const response = await axios.get(
          `http://localhost:8000/api/courses/courses/${courseId}/`,
          { headers }
        );

        if (response.data) {
          console.log('Course data:', response.data); // Add this to debug
          setCourse(response.data);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Add cleanup for video
  useEffect(() => {
    return () => {
      const video = document.querySelector('video');
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, []);

  // Add navigation function for instructor profile
  const navigateToInstructorProfile = (instructorId) => {
    if (instructorId) {
      navigate(`/instructor/${instructorId}`);
    }
  };

  // Update the instructor section in the return statement
  <div
    className="bg-gray-800 p-6 rounded-lg cursor-pointer"
    onClick={() => navigateToInstructorProfile(course?.instructor?.id)}
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-700">
        <img
          src={course?.instructor?.profile_picture || "/default-avatar.png"}
          alt={course?.instructor?.name || "Instructor"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
      </div>
      <div>
        <h3 className="text-white text-xl font-semibold hover:text-[#00FF40]">
          {course?.instructor?.name || "Instructor Name"}
        </h3>
        <p className="text-gray-400">
          {course?.instructor?.title || "Course Instructor"}
        </p>
      </div>
    </div>
    {course?.instructor?.bio && (
      <p className="text-gray-300 text-sm mt-2 border-t border-gray-700 pt-4">
        {course.instructor.bio}
      </p>
    )}
  </div>;

  {
    /* Update the price display */
  }
  <div className="text-3xl font-bold text-[#00FF40] bg-gray-800 p-4 rounded-lg">
    Rs.{" "}
    {parseFloat(course?.price || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}
  </div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      {/* Add top padding to fix visibility issues */}
      <div className="container mx-auto px-4 py-20">
        {" "}
        {/* Changed py-8 to py-20 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Side */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">{course?.title}</h1>
            <p className="text-lg text-gray-300">{course?.description}</p>

            {/* Price - Updated format */}
            <div className="text-3xl font-bold text-[#00FF40] bg-gray-800 p-4 rounded-lg">
              Rs. {(course?.price || 0).toLocaleString()}
            </div>

            {/* Instructor Info - Updated layout */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-700">
                  <img
                    src="/default-avatar.png"
                    alt={course?.instructor_name || "Instructor"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold">
                    {course?.instructor_name || "Instructor Name"}
                  </h3>
                  <p className="text-gray-400">Course Instructor</p>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-3xl font-bold text-[#00FF40] bg-gray-800 p-4 rounded-lg">
              Rs. {(course?.course_price || 0).toLocaleString()}
            </div>

            {/* Rating Display */}
            <div className="flex items-center gap-2 bg-gray-800 p-4 rounded-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className="text-[#00FF40] text-xl" />
              ))}
              <span className="text-white ml-2">
                ({course?.average_rating || "4.5"}) •{" "}
                {course?.total_reviews || "0"} reviews
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBuyNow}
                className="flex-1 px-6 py-4 bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold rounded-lg text-lg"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="p-4 bg-gray-800 hover:bg-gray-700 text-[#00FF40] rounded-lg"
              >
                <FaShoppingCart size={24} />
              </button>
              <button
                onClick={handleAddToWishlist}
                className="p-4 bg-gray-800 hover:bg-gray-700 text-[#00FF40] rounded-lg"
              >
                <FaHeart size={24} />
              </button>
            </div>
          </div>

          {/* Right Side - Video */}
          <div className="relative rounded-lg overflow-hidden">
            {course?.demo_video ? (
              <video
                className="w-full aspect-video"
                controls
                poster={course?.course_thumbnail}
                key={course.demo_video} // Add key to force video reload when source changes
              >
                <source src={course.demo_video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center text-gray-400">
                No demo video available
              </div>
            )}
          </div>
        </div>
        {/* Course Content Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
          <div className="space-y-4">
            {course?.modules?.map((module, index) => (
              <div
                key={module.id}
                className="border border-gray-700 rounded-lg"
              >
                <button
                  className="w-full px-6 py-4 flex justify-between items-center text-white hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === module.id ? null : module.id
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#00FF40] font-medium">
                      Module {index + 1}
                    </span>
                    <span className="text-lg">{module.title}</span>
                  </div>
                  {expandedSection === module.id ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </button>
                {expandedSection === module.id && (
                  <div className="px-6 py-3 border-t border-gray-700">
                    {module.lessons?.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 py-3 text-gray-300 hover-text-white"
                      >
                        <FaPlay className="text-sm text-[#00FF40]" />
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <div className="flex gap-2 text-sm text-gray-400">
                            {lesson.video && <span>Video</span>}
                            {lesson.pdf && <span>PDF</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Reviews & Ratings Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Reviews & Ratings
          </h2>

          {/* Submit Review Form */}
          <div className="mb-8 border-b border-gray-700 pb-8">
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`text-2xl ${
                    star <= userRating ? "text-[#00FF40]" : "text-gray-600"
                  }`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Write your review..."
              className="w-full bg-gray-700 text-white rounded-lg p-4 mb-4"
              rows="4"
            />
            <button
              onClick={handleSubmitReview}
              className="px-6 py-3 bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold rounded-lg"
            >
              Submit Review
            </button>
          </div>

          {/* Existing Reviews */}
          <div className="space-y-6">
            {course?.reviews?.map((review) => (
              <div key={review.id} className="border-b border-gray-700 pb-6">
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={review.user_avatar || "default-avatar.png"}
                    alt={review.user_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="text-white font-medium">
                      {review.user_name}
                    </h4>
                    <div className="flex gap-2">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className={`${
                            index < review.rating
                              ? "text-[#00FF40]"
                              : "text-gray-600"
                          } text-sm`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm ml-auto">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDescription;
