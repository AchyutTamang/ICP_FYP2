import React from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";
import { toast } from "react-toastify";

const CourseCard = ({
  course,
  onAddToCart,
  onAddToFavorites,
  isAuthenticated,
  userRole,
}) => {
  // Generate star rating display
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar key={`empty-star-${i}`} className="text-yellow-400" />
      );
    }

    return stars;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login as a student to add courses to cart");
      return;
    }

    if (userRole !== "student") {
      toast.error("Only students can add courses to cart");
      return;
    }

    onAddToCart();
  };

  const handleAddToFavorites = () => {
    if (!isAuthenticated) {
      toast.error("Please login as a student to add courses to favorites");
      return;
    }

    if (userRole !== "student") {
      toast.error("Only students can add courses to favorites");
      return;
    }

    onAddToFavorites();
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:transform hover:scale-105">
      {/* Course Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.course_thumbnail || "/default-course-thumbnail.jpg"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleAddToFavorites}
          className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all duration-300"
          title="Add to favorites"
          disabled={!isAuthenticated || userRole !== "student"}
        >
          <FaHeart
            className={`${
              isAuthenticated && userRole === "student"
                ? "text-red-500"
                : "text-gray-400"
            }`}
          />
        </button>
      </div>

      <div className="p-6">
        {/* Course Title */}
        <Link to={`/courses/${course.id}`}>
          <h3 className="text-xl font-bold text-white mb-2 truncate hover:text-[#00FF40] transition-colors duration-300">
            {course.title}
          </h3>
        </Link>

        {/* Course Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex mr-2">{renderRating(course.rating || 3.5)}</div>
          <span className="text-gray-400 text-sm">
            ({course.reviews_count || 0} reviews)
          </span>
        </div>

        {/* Course Price and Add to Cart */}
        <div className="flex justify-between items-center">
          <span className="text-[#00FF40] font-bold text-xl">
            {course.display_price ||
              (course.is_free
                ? "Free"
                : `Rs. ${course.course_price?.toFixed(2) || "0.00"}`)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!isAuthenticated || userRole !== "student"}
            className={`py-2 px-4 rounded-md flex items-center transition-colors duration-300 ${
              isAuthenticated && userRole === "student"
                ? "bg-[#00FF40] hover:bg-[#00DD30] text-black"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FaShoppingCart className="mr-2" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
