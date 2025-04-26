import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Stick/Navbar";
import Footer from "../components/Stick/Footer";
import styled from "@emotion/styled";
import CourseCard from "../components/Courses/CourseCard";
import { FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import axios from 'axios';
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

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
      border-color: #00FF40;
    }
  }
`;

// Update the CoursesGrid styling for wider cards
const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
`;

// Add new styling for the search section
const SearchSection = styled.div`
  background: #1e2a3a;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// Update the search and filter implementation
const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(9);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const loadCourses = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/courses/courses/');
      const formattedCourses = response.data.map(course => ({
        ...course,
        displayPrice: course.is_free 
          ? "Free" 
          : typeof course.course_price === 'number'
            ? `Rs${course.course_price.toFixed(2)}`
            : "Rs0.00",
        isFavorite: false // Add favorite status
      }));
      setCourses(formattedCourses);
      setLoading(false);
    } catch (error) {
      console.error("Error loading courses:", error);
      setLoading(false);
    }
  };

  const handleAddToCart = async (course) => {
    if (!user) {
      alert("Please login to add courses to cart");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }
      
      await addToCart(course);
      alert("Course added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        alert("Your session has expired. Please login again.");
      } else {
        alert("Failed to add course to cart. Please try again.");
      }
    }
  };

  const handleToggleFavorite = async (courseId) => {
    if (!user) {
      alert("Please login to add favorites");
      return;
    }
    try {
      // Toggle favorite status in the UI
      setCourses(courses.map(course => 
        course.id === courseId 
          ? { ...course, isFavorite: !course.isFavorite }
          : course
      ));
      
      // Update favorite status in the backend
      await axios.post(`http://127.0.0.1:8000/api/courses/toggle-favorite/${courseId}/`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite status");
    }
  };

  // Fix the price filtering logic
  const getFilteredCourses = () => {
    return courses.filter(course => {
      const searchTerm = searchQuery.toLowerCase().trim();
      const matchesSearch = searchTerm === '' || 
        course.title?.toLowerCase().includes(searchTerm) ||
        course.description?.toLowerCase().includes(searchTerm);
        
      const matchesCategory = category === 'all' || course.category === category;
      
      let matchesPrice = true;
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(Number);
        const price = parseFloat(course.course_price) || 0;

        if (priceRange === '10001-') {
          matchesPrice = price > 10000;
        } else {
          matchesPrice = price >= min && price <= max;
        }

        if (course.is_free) {
          matchesPrice = min === 0;
        }
      }

      return matchesSearch && matchesCategory && matchesPrice;
    });
  };

  // Get current courses for pagination
  const filteredCourses = getFilteredCourses();
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Add the missing PaginationContainer styling
  const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin: 2rem 0;
  `;
  
  const PageButton = styled.button`
    background: ${props => props.active ? '#00FF40' : '#1e2a3a'};
    color: ${props => props.active ? 'black' : 'white'};
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  
    &:hover:not(:disabled) {
      background: ${props => props.active ? '#00DD30' : '#2d3748'};
    }
  
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  // Update the Footer section in the return statement
  return (
    <PageContainer>
      <Navbar />
      <ContentWrapper>
        <Header>
          <h1>All Courses</h1>
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
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="music">Music</option>
            </select>

            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="all">All Prices</option>
              <option value="0-1000">Rs 0 - Rs 1000</option>
              <option value="1001-5000">Rs 1000 - Rs 5000</option>
              <option value="5001-10000">Rs 5000- Rs 10000</option>
              <option value="10001-">Above Rs 10000</option>
            </select>
          </FilterSection>
        </SearchSection>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <CoursesGrid>
              {currentCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  onAddToCart={() => handleAddToCart(course)}
                  onToggleFavorite={() => handleToggleFavorite(course.id)}
                  isStudent={user?.role === 'student'}
                />
              ))}
            </CoursesGrid>

            <PaginationContainer>
              <PageButton
                onClick={() => setCurrentPage(prev => prev - 1)}
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
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
              >
                <FaArrowRight />
              </PageButton>
            </PaginationContainer>
          </>
        )}
      </ContentWrapper>
      
      <Footer />
    </PageContainer>
  );
};

export default AllCourses;
