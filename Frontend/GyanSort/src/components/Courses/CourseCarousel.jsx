import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CourseCarousel = ({ courses }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Auto-advance the carousel every 5 seconds
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, courses.length]);

  const nextSlide = () => {
    if (!isTransitioning && courses.length > 0) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % courses.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning && courses.length > 0) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? courses.length - 1 : prevIndex - 1
      );
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center text-white py-12">
        No featured courses available
      </div>
    );
  }

  const currentCourse = courses[currentIndex];

  return (
    <div className="relative h-[960px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${
            currentCourse.course_thumbnail
              ? currentCourse.course_thumbnail.startsWith("http")
                ? currentCourse.course_thumbnail
                : `http://localhost:8000${currentCourse.course_thumbnail}`
              : "https://via.placeholder.com/1200x600"
          })`,
          opacity: 0.3,
        }}
      ></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>

      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="flex flex-col justify-center h-full max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4">
            {currentCourse.title}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {currentCourse.description}
          </p>
          <button className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-3 px-8 rounded-md w-max transition duration-300">
            Enroll Now
          </button>

          {/* Carousel Indicators */}
          <div className="flex space-x-2 mt-8">
            {courses.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? "bg-[#00FF40]" : "bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition duration-300"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <FaChevronLeft />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition duration-300"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default CourseCarousel;
