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
  FaVideo,
  FaFilePdf,
  FaFile,
  FaTimes,
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
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        };

        const response = await axios.get(
          `http://localhost:8000/api/courses/courses/${courseId}/`,
          { headers }
        );

        if (response.data) {
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

  useEffect(() => {
    return () => {
      const video = document.querySelector("video");
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
    };
  }, []);

  const navigateToInstructorProfile = (instructorId) => {
    if (instructorId) {
      navigate(`/instructor/${instructorId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Side */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">{course?.title}</h1>
            <p className="text-lg text-gray-300">{course?.description}</p>

            {/* Instructor Info */}
            <div
              className="bg-gray-800 p-6 rounded-lg cursor-pointer"
              onClick={() => navigateToInstructorProfile(course?.instructor)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-700">
                  <img
                    src={
                      course?.instructor_profile_picture || "/gyansort-logo.png"
                    }
                    alt={course?.instructor_name || "Instructor"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/gyansort-logo.png";
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold hover:text-[#00FF40]">
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
                key={course.demo_video}
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
                className="border border-gray-700 rounded-lg overflow-hidden mb-4 hover:border-[#00FF40] transition-colors"
              >
                <button
                  className="w-full px-6 py-4 flex justify-between items-center text-white hover:bg-gray-700/50 transition-all"
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === module.id ? null : module.id
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#00FF40] font-medium bg-[#00FF40]/10 px-3 py-1 rounded-full text-sm">
                      Module {index + 1}
                    </span>
                    <span className="text-lg font-medium">{module.title}</span>
                  </div>
                  {expandedSection === module.id ? (
                    <FaChevronUp className="text-[#00FF40] transition-transform duration-200" />
                  ) : (
                    <FaChevronDown className="text-[#00FF40] transition-transform duration-200" />
                  )}
                </button>

                {expandedSection === module.id && (
                  <div className="border-t border-gray-700">
                    <p className="text-gray-400 px-6 py-3 bg-gray-800/30 italic">
                      {module.description}
                    </p>
                    <div className="divide-y divide-gray-700/50">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="bg-gray-800/20">
                          <div
                            className="px-6 py-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                            onClick={() =>
                              setExpandedLesson(
                                expandedLesson === lesson.id ? null : lesson.id
                              )
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-sm">
                                  Lesson {lessonIndex + 1}
                                </span>
                                <h3 className="font-medium text-white">
                                  {lesson.title}
                                </h3>
                              </div>
                              {expandedLesson === lesson.id ? (
                                <FaChevronUp className="text-gray-400 text-sm" />
                              ) : (
                                <FaChevronDown className="text-gray-400 text-sm" />
                              )}
                            </div>
                          </div>

                          {expandedLesson === lesson.id && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-400 text-sm mb-3 ml-6">
                                {lesson.description}
                              </p>
                              <div className="space-y-2 ml-6">
                                {lesson.contents?.map(
                                  (content, contentIndex) => (
                                    <div
                                      key={content.id}
                                      className="flex items-center gap-3 text-gray-300 hover:text-[#00FF40] transition-colors cursor-pointer"
                                      onClick={() => {
                                        if (content.content_type === "video") {
                                          setSelectedVideo(content);
                                          setIsVideoModalOpen(true);
                                        } else if (
                                          content.content_type === "pdf"
                                        ) {
                                          setActiveContent(
                                            activeContent === content.id
                                              ? null
                                              : content.id
                                          );
                                        }
                                      }}
                                    >
                                      {content.content_type === "video" ? (
                                        <FaPlay className="text-xs" />
                                      ) : content.content_type === "pdf" ? (
                                        <FaFilePdf className="text-xs" />
                                      ) : (
                                        <FaFile className="text-xs" />
                                      )}
                                      <span className="text-sm">
                                        {content.title}
                                      </span>
                                      <span className="text-xs text-gray-500 ml-auto">
                                        {content.content_type}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>

                              {/* PDF Viewer */}
                              {activeContent &&
                                lesson.contents?.find(
                                  (c) => c.id === activeContent
                                )?.content_type === "pdf" && (
                                  <div className="mt-4 rounded-lg overflow-hidden bg-gray-800/30 p-4">
                                    <iframe
                                      src={
                                        lesson.contents.find(
                                          (c) => c.id === activeContent
                                        )?.file
                                      }
                                      className="w-full h-[600px]"
                                      title={
                                        lesson.contents.find(
                                          (c) => c.id === activeContent
                                        )?.title
                                      }
                                    >
                                      Your browser does not support PDF viewing.
                                    </iframe>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Video Modal */}
        {isVideoModalOpen && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-[90%] max-w-4xl bg-gray-900 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setIsVideoModalOpen(false);
                  setSelectedVideo(null);
                }}
                className="absolute top-4 right-4 text-white hover:text-[#00FF40] transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
              <div className="relative" style={{ paddingTop: "56.25%" }}>
                <video
                  controls
                  autoPlay
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  src={selectedVideo.cloudfront_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )}

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
