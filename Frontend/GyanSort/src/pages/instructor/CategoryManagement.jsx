import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import InstructorPanel from "./InstructorPanel";

const CategoryManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fromCourseCreation = location.state?.fromCourseCreation;
  const courseData = location.state?.courseData;

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://localhost:8000/api/courses/categories/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    // Store the selected category in localStorage
    localStorage.setItem("selected_category_id", selectedCategoryId);

    // If coming from course creation, create the course with the selected category
    if (fromCourseCreation && courseData) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("title", courseData.title);
        formData.append("description", courseData.description);
        formData.append("course_price", courseData.price || 0);
        formData.append(
          "is_free",
          courseData.price === "0" || courseData.price === "" ? "true" : "false"
        );
        formData.append("category", selectedCategoryId);

        if (courseData.thumbnail)
          formData.append("course_thumbnail", courseData.thumbnail);
        if (courseData.preview_video)
          formData.append("demo_video", courseData.preview_video);

        const courseResponse = await axios.post(
          "http://localhost:8000/api/courses/courses/",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Course created successfully!");
        navigate(`/instructor/courses/${courseResponse.data.id}/modules`);
      } catch (error) {
        console.error("Course creation failed:", error);
        toast.error("Failed to create course");
      } finally {
        setLoading(false);
      }
      // return;
    }

    // Navigate to CreateModules page with state to ensure proper routing
    navigate("/instructor/create-modules", {
      state: { categoryId: selectedCategoryId },
    });

    // Log for debugging
    console.log(
      "Navigating to create-modules with category:",
      selectedCategoryId
    );
  };

  return (
    <InstructorPanel>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Select Course Category
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-lg p-6 mb-8"
        >
          <label className="block text-white mb-2">Select Category</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded mb-4"
            required
          >
            <option value="">-- Select a Category --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded"
          >
            {loading ? "Processing..." : "Next"}
          </button>
        </form>
      </div>
    </InstructorPanel>
  );
};

export default CategoryManagement;
