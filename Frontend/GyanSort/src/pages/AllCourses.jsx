import React, { useState, useEffect } from "react";
import Navbar from "../components/Stick/Navbar";
import Footer from "../components/Stick/Footer";
import styled from "@emotion/styled";
import CourseCard from "../components/Courses/CourseCard";
import { FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #1a2332;
  color: white;
`;

const ContentWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #1e2a3a;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;

  input {
    background: transparent;
    border: none;
    color: white;
    width: 100%;
    padding: 0.5rem;
    &:focus {
      outline: none;
    }
    &::placeholder {
      color: #6b7280;
    }
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  select {
    background: #1e2a3a;
    color: white;
    padding: 0.5rem;
    border: 1px solid #374151;
    border-radius: 6px;
    min-width: 150px;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #00ff40;
    }
  }
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SearchSection = styled.div`
  background: #1e2a3a;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
`;

const PageButton = styled.button`
  background: ${(props) => (props.active ? "#00FF40" : "#1e2a3a")};
  color: ${(props) => (props.active ? "black" : "white")};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) => (props.active ? "#00DD30" : "#2d3748")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ff4040;
  background: rgba(255, 64, 64, 0.1);
  border-radius: 8px;
  margin-top: 2rem;
`;

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated, userRole } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/courses/courses/"
      );

      if (Array.isArray(response.data)) {
        const formattedCourses = response.data.map((course) => ({
          ...course,
          display_price: course.is_free
            ? "Free"
            : Number.isFinite(parseFloat(course.course_price))
            ? `Rs${parseFloat(course.course_price).toFixed(2)}`
            : "Rs0.00",
        }));
        setCourses(formattedCourses);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/courses/categories/"
      );
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to load categories");
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  // Add to cart
  const handleAddToCart = async (course) => {
    if (!isAuthenticated) {
      toast.warning("Please login as a student to add courses to cart");
      return;
    }

    if (userRole !== "student") {
      toast.warning("Only students can add courses to cart");
      return;
    }

    try {
      const result = await addToCart(course);
      if (result?.success) {
        toast.success("Course added to cart successfully!");
      } else {
        toast.error(result?.error || "Failed to add course to cart");
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error("Failed to add course to cart");
    }
  };

  // Add to favorites (implement if needed)
  const handleAddToFavorites = async (courseId) => {
    if (!isAuthenticated) {
      toast.warning("Please login as a student to add to favorites");
      return;
    }

    if (userRole !== "student") {
      toast.warning("Only students can add favorites");
      return;
    }

    try {
      // Implement your logic here
    } catch (error) {
      toast.error("Failed to add to favorites");
    }
  };

  // Robust category key getter
  const getCourseCategoryKey = (course) => {
    if (course.category_name) return course.category_name;
    if (typeof course.category === "string") return course.category;
    if (
      course.category &&
      typeof course.category === "object" &&
      course.category.name
    )
      return course.category.name;
    return "";
  };

  // Filtering and pagination logic
  const getFilteredCourses = () => {
    return courses.filter((course) => {
      const searchTerm = searchQuery.toLowerCase().trim();
      const matchesSearch =
        searchTerm === "" ||
        (course.title && course.title.toLowerCase().includes(searchTerm)) ||
        (course.description &&
          course.description.toLowerCase().includes(searchTerm));
      const courseCategoryKey = getCourseCategoryKey(course);
      const matchesCategory =
        category === "all" || courseCategoryKey === category;

      let matchesPrice = true;
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        const price = parseFloat(course.course_price) || 0;

        if (priceRange === "0-0") {
          matchesPrice = course.is_free === true;
        } else if (priceRange === "10001-") {
          matchesPrice = !course.is_free && price > 10000;
        } else {
          matchesPrice =
            !course.is_free &&
            price >= min &&
            (typeof max === "number" && !isNaN(max) ? price <= max : true);
        }
      }
      return matchesSearch && matchesCategory && matchesPrice;
    });
  };

  const filteredCourses = getFilteredCourses();
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <PageContainer>
      <Navbar />
      <ContentWrapper>
        <Header>
          <h1>All Courses</h1>
          {isAuthenticated && (
            <div style={{ color: "#00FF40" }}>Welcome, {userRole}</div>
          )}
        </Header>

        <SearchSection>
          <SearchBar>
            <FaSearch color="#6b7280" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>

          <FilterSection>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="0-0">Free</option>
              <option value="1-1000">Rs 0 - Rs 1000</option>
              <option value="1001-5000">Rs 1001 - Rs 5000</option>
              <option value="5001-10000">Rs 5001 - Rs 10000</option>
              <option value="10001-">Above Rs 10000</option>
            </select>
          </FilterSection>
        </SearchSection>

        {loading ? (
          <LoadingSpinner>Loading courses...</LoadingSpinner>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : currentCourses.length === 0 ? (
          <ErrorMessage>No courses found matching your criteria.</ErrorMessage>
        ) : (
          <>
            <CoursesGrid>
              {currentCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onAddToCart={() => handleAddToCart(course)}
                  onAddToFavorites={() => handleAddToFavorites(course.id)}
                  isAuthenticated={isAuthenticated}
                  userRole={userRole}
                />
              ))}
            </CoursesGrid>

            {totalPages > 1 && (
              <PaginationContainer>
                <PageButton
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                >
                  <FaArrowLeft />
                </PageButton>

                {[...Array(totalPages)].map((_, index) => (
                  <PageButton
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </PageButton>
                ))}

                <PageButton
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaArrowRight />
                </PageButton>
              </PaginationContainer>
            )}
          </>
        )}
      </ContentWrapper>
      <Footer />
    </PageContainer>
  );
};

export default AllCourses;
