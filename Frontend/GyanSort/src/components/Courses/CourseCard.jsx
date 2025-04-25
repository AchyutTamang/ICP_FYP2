import React, { useState, useCallback } from "react";
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
  // Add state for tooltips
  const [showCartTooltip, setShowCartTooltip] = useState(false);
  const [showFavoriteTooltip, setShowFavoriteTooltip] = useState(false);
  const [showBottomFavoriteTooltip, setShowBottomFavoriteTooltip] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

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

  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please login as a student to add courses to cart");
      return;
    }

    if (userRole !== "student") {
      toast.error("Only students can add courses to cart");
      return;
    }

    // Prevent multiple clicks
    if (isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);
      await onAddToCart();
    } finally {
      setIsAddingToCart(false);
    }
  }, [isAuthenticated, userRole, onAddToCart, isAddingToCart]);

  const handleAddToFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please login as a student to add courses to favorites");
      return;
    }

    if (userRole !== "student") {
      toast.error("Only students can add courses to favorites");
      return;
    }

    // Prevent multiple clicks
    if (isAddingToFavorites) return;
    
    try {
      setIsAddingToFavorites(true);
      await onAddToFavorites();
    } finally {
      setIsAddingToFavorites(false);
    }
  }, [isAuthenticated, userRole, onAddToFavorites, isAddingToFavorites]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg transition-transform duration-100 hover:transform hover:scale-105">
      {/* Course Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.course_thumbnail || "/default-course-thumbnail.jpg"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="relative">
          <button
            onClick={handleAddToFavorites}
            className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all duration-300"
            title={
              isAuthenticated && userRole === "student"
                ? "Add to favorites"
                : ""
            }
            disabled={!isAuthenticated || userRole !== "student" || isAddingToFavorites}
            onMouseEnter={() =>
              !isAuthenticated || userRole !== "student"
                ? setShowFavoriteTooltip(true)
                : null
            }
            onMouseLeave={() => setShowFavoriteTooltip(false)}
          >
            {isAddingToFavorites ? (
              <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaHeart
                className={`${
                  isAuthenticated && userRole === "student"
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              />
            )}
          </button>
          {showFavoriteTooltip &&
            (!isAuthenticated || userRole !== "student") && (
              <div className="absolute top-12 right-2 bg-black bg-opacity-80 text-white text-xs p-2 rounded z-50 w-36 text-center">
                Login as a student first
              </div>
            )}
        </div>
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
          <div className="flex gap-2">
            {/* Favorite Button First */}
            <div className="relative">
              <button
                onClick={handleAddToFavorites}
                disabled={!isAuthenticated || userRole !== "student" || isAddingToFavorites}
                title={
                  isAuthenticated && userRole === "student"
                    ? "Add to Favorite"
                    : "Login to access this feature"
                }
                onMouseEnter={() =>
                  !isAuthenticated || userRole !== "student"
                    ? setShowBottomFavoriteTooltip(true)
                    : null
                }
                onMouseLeave={() => setShowBottomFavoriteTooltip(false)}
                className={`py-2 px-4 rounded-md flex items-center transition-colors duration-300 ${
                  isAuthenticated && userRole === "student"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                } ${isAddingToFavorites ? "opacity-75" : ""}`}
              >
                {isAddingToFavorites ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <FaHeart className="mr-2" />
                )}
                Favorite
              </button>
              {showBottomFavoriteTooltip &&
                (!isAuthenticated || userRole !== "student") && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-black bg-opacity-90 text-white text-xs p-2 rounded z-50 w-40 text-center pointer-events-none">
                    Login as a student first
                  </div>
                )}
            </div>

            {/* Cart Button Second */}
            <div className="relative">
              <button
                onClick={handleAddToCart}
                disabled={!isAuthenticated || userRole !== "student" || isAddingToCart}
                title={
                  isAuthenticated && userRole === "student"
                    ? "Add to cart"
                    : "Login to access this feature"
                }
                onMouseEnter={() =>
                  !isAuthenticated || userRole !== "student"
                    ? setShowCartTooltip(true)
                    : null
                }
                onMouseLeave={() => setShowCartTooltip(false)}
                className={`py-2 px-4 rounded-md flex items-center transition-colors duration-300 ${
                  isAuthenticated && userRole === "student"
                    ? "bg-[#00FF40] hover:bg-[#00DD30] text-black"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                } ${isAddingToCart ? "opacity-75" : ""}`}
              >
                {isAddingToCart ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <FaShoppingCart className="mr-2" />
                )}
                Add to Cart
              </button>
              {showCartTooltip &&
                (!isAuthenticated || userRole !== "student") && (
                  <div className="absolute bottom-12 right-0 bg-black bg-opacity-80 text-white text-xs p-2 rounded z-50 w-36 text-center">
                    Login as a student first
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
