import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { set, get, del } from "idb-keyval";
import { useAuth } from "../../context/AuthContext";
import InstructorPanel from "./InstructorPanel";
import { FaPlus, FaTrash, FaVideo, FaFilePdf } from "react-icons/fa";

const CreateCourseWithModules = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [courseId, setCourseId] = useState(null);

  // Step 1: Course basic info
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: null,
    preview_video_name: "",
    category: "",
  });
  const [categories, setCategories] = useState([]);

  // Step 2: Modules/Lessons/Contents
  const [modules, setModules] = useState([
    {
      title: "",
      description: "",
      order: 1,
      lessons: [
        {
          title: "",
          description: "",
          order: 1,
          contents: [
            {
              title: "",
              content_type: "video",
              file: null,
              order: 1,
            },
          ],
        },
      ],
    },
  ]);

  // Fetch token and categories on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    setToken(storedToken);

    if (!storedToken) {
      toast.error("You need to be logged in to create a course");
      navigate("/");
    } else {
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      fetchCategories(storedToken);
    }
  }, [navigate]);

  // Fetch categories
  const fetchCategories = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/courses/categories/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch {
      toast.error("Failed to load categories");
    }
  };

  // Step 1 Handlers
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData({
      ...courseData,
      [name]: value,
    });
  };

  const handleCourseFileChange = async (e) => {
    const { name, files } = e.target;
    if (name === "preview_video" && files[0]) {
      await set("preview_video_file", files[0]);
      setCourseData({
        ...courseData,
        preview_video_name: files[0].name,
      });
    } else {
      setCourseData({
        ...courseData,
        [name]: files[0],
      });
    }
  };

  // Step 2 Handlers
  const handleModuleChange = (moduleIndex, e) => {
    const { name, value } = e.target;
    const updatedModules = [...modules];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      [name]: value,
    };
    setModules(updatedModules);
  };
  const handleLessonChange = (moduleIndex, lessonIndex, e) => {
    const { name, value } = e.target;
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex] = {
      ...updatedModules[moduleIndex].lessons[lessonIndex],
      [name]: value,
    };
    setModules(updatedModules);
  };
  const handleContentChange = (moduleIndex, lessonIndex, contentIndex, e) => {
    const { name, value, files } = e.target;
    const updatedModules = [...modules];
    if (name === "file" && files && files.length > 0) {
      updatedModules[moduleIndex].lessons[lessonIndex].contents[contentIndex] =
        {
          ...updatedModules[moduleIndex].lessons[lessonIndex].contents[
            contentIndex
          ],
          file: files[0],
          title: files[0].name,
        };
    } else {
      updatedModules[moduleIndex].lessons[lessonIndex].contents[contentIndex] =
        {
          ...updatedModules[moduleIndex].lessons[lessonIndex].contents[
            contentIndex
          ],
          [name]: value === "pdf" ? "document" : value, // convert "pdf" to "document"
        };
      // If changing content_type, clear file and title
      if (name === "content_type") {
        updatedModules[moduleIndex].lessons[lessonIndex].contents[
          contentIndex
        ].file = null;
        updatedModules[moduleIndex].lessons[lessonIndex].contents[
          contentIndex
        ].title = "";
      }
    }
    setModules(updatedModules);
  };

  // Add/remove functions for modules/lessons/contents
  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
        description: "",
        order: modules.length + 1,
        lessons: [
          {
            title: "",
            description: "",
            order: 1,
            contents: [
              {
                title: "",
                content_type: "video",
                file: null,
                order: 1,
              },
            ],
          },
        ],
      },
    ]);
  };
  const removeModule = (index) => {
    if (modules.length > 1) {
      const updatedModules = [...modules];
      updatedModules.splice(index, 1);
      updatedModules.forEach((module, i) => (module.order = i + 1));
      setModules(updatedModules);
    } else {
      toast.warning("You need at least one module");
    }
  };
  const addLesson = (moduleIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons.push({
      title: "",
      description: "",
      order: updatedModules[moduleIndex].lessons.length + 1,
      contents: [
        {
          title: "",
          content_type: "video",
          file: null,
          order: 1,
        },
      ],
    });
    setModules(updatedModules);
  };
  const removeLesson = (moduleIndex, lessonIndex) => {
    const updatedModules = [...modules];
    if (updatedModules[moduleIndex].lessons.length > 1) {
      updatedModules[moduleIndex].lessons.splice(lessonIndex, 1);
      updatedModules[moduleIndex].lessons.forEach(
        (lesson, i) => (lesson.order = i + 1)
      );
      setModules(updatedModules);
    } else {
      toast.warning("Each module needs at least one lesson");
    }
  };
  const addContent = (moduleIndex, lessonIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex].contents.push({
      title: "",
      content_type: "video",
      file: null,
      order:
        updatedModules[moduleIndex].lessons[lessonIndex].contents.length + 1,
    });
    setModules(updatedModules);
  };
  const removeContent = (moduleIndex, lessonIndex, contentIndex) => {
    const updatedModules = [...modules];
    if (updatedModules[moduleIndex].lessons[lessonIndex].contents.length > 1) {
      updatedModules[moduleIndex].lessons[lessonIndex].contents.splice(
        contentIndex,
        1
      );
      updatedModules[moduleIndex].lessons[lessonIndex].contents.forEach(
        (content, i) => (content.order = i + 1)
      );
      setModules(updatedModules);
    } else {
      toast.warning("Each lesson needs at least one content item");
    }
  };

  // Step Navigation
  const handleNext = async (e) => {
    e.preventDefault();
    // Validate step 1 fields
    if (
      !courseData.title ||
      !courseData.description ||
      !courseData.category ||
      !courseData.thumbnail
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      // Retrieve video file from IndexedDB
      let previewVideoFile = null;
      if (courseData.preview_video_name) {
        previewVideoFile = await get("preview_video_file");
        if (!previewVideoFile) {
          toast.error("Please select a demo video.");
          setLoading(false);
          return;
        }
      }
      const formData = new FormData();
      formData.append("title", courseData.title);
      formData.append("description", courseData.description);
      formData.append("course_price", courseData.price || 0);
      formData.append(
        "is_free",
        courseData.price === "0" ||
          courseData.price === "" ||
          parseFloat(courseData.price) === 0
      );
      formData.append("course_thumbnail", courseData.thumbnail);
      formData.append("category", courseData.category);
      if (previewVideoFile) {
        formData.append(
          "demo_video",
          previewVideoFile,
          courseData.preview_video_name
        );
      }
      // Send instructor id (your backend expects this!)
      const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
      if (userInfo.id) {
        formData.append("instructor", userInfo.id);
      }
      const response = await axios.post(
        "http://localhost:8000/api/courses/courses/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (previewVideoFile) {
        await del("preview_video_file");
      }
      setCourseId(response.data.id);
      setStep(2);
    } catch (error) {
      toast.error(
        "Error creating course: " +
          (error.response?.data?.detail || error.message)
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep(1);
  };

  // Final submit for creating modules/lessons/content
  const handleSubmitModules = async (e) => {
    e.preventDefault();
    if (!courseId) {
      toast.error("Course ID is missing, please complete step 1 first.");
      return;
    }
    setLoading(true);
    try {
      for (const module of modules) {
        const moduleRes = await axios.post(
          "http://localhost:8000/api/courses/modules/",
          {
            title: module.title,
            description: module.description,
            order: module.order,
            course: courseId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const moduleId = moduleRes.data.id;
        for (const lesson of module.lessons) {
          const lessonRes = await axios.post(
            "http://localhost:8000/api/courses/lessons/",
            {
              title: lesson.title,
              description: lesson.description,
              order: lesson.order,
              module: moduleId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const lessonId = lessonRes.data.id;
          for (const content of lesson.contents) {
            const contentFormData = new FormData();
            contentFormData.append(
              "title",
              content.title || (content.file && content.file.name) || ""
            );
            contentFormData.append("content_type", content.content_type);
            contentFormData.append("order", content.order);
            contentFormData.append("lesson", lessonId);
            if (content.file) {
              contentFormData.append("file", content.file);
            }
            if (content.content_type === "document" && !content.file) {
              toast.error("PDF file is required for document content.");
              setLoading(false);
              return;
            }
            await axios.post(
              "http://localhost:8000/api/courses/contents/",
              contentFormData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
          }
        }
      }
      toast.success("Course with modules created successfully!");
      navigate(`/instructor/courses/${courseId}/modules`);
    } catch (error) {
      toast.error(
        "Error creating modules: " +
          (error.response?.data?.detail || error.message)
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // UI for Step 1: Course Info
  const renderStep1 = () => (
    <form onSubmit={handleNext} className="bg-gray-800 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Step 1: Course Info
      </h2>
      <div className="mb-4">
        <label className="block text-white mb-2">Course Title*</label>
        <input
          type="text"
          name="title"
          value={courseData.title}
          onChange={handleCourseChange}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          placeholder="Enter course title"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-2">Description*</label>
        <textarea
          name="description"
          value={courseData.description}
          onChange={handleCourseChange}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          rows="5"
          placeholder="Enter course description"
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-white mb-2">Price</label>
        <input
          type="number"
          name="price"
          value={courseData.price}
          onChange={handleCourseChange}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
        <p className="text-gray-400 text-sm mt-1">Set to 0 for a free course</p>
      </div>
      <div className="mb-4">
        <label className="block text-white mb-2">Course Thumbnail*</label>
        <input
          type="file"
          name="thumbnail"
          onChange={handleCourseFileChange}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          accept="image/*"
          required
        />
        <p className="text-gray-400 text-sm mt-1">
          Recommended size: 1280x720 pixels (16:9 ratio)
        </p>
      </div>
      <div className="mb-6">
        <label className="block text-white mb-2">Demo Video of Course</label>
        <input
          type="file"
          name="preview_video"
          onChange={handleCourseFileChange}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          accept="video/*"
        />
        <p className="text-gray-400 text-sm mt-1">
          Upload a short preview video of your course (max 50MB)
        </p>
        {courseData.preview_video_name && (
          <span className="text-green-300 text-sm">
            Selected: {courseData.preview_video_name}
          </span>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-white mb-2">Select Category*</label>
        <select
          name="category"
          value={courseData.category}
          onChange={handleCourseChange}
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
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded flex items-center"
          disabled={loading}
        >
          {loading ? "Creating..." : "Next"}
          {!loading && <span className="ml-2">→</span>}
        </button>
      </div>
    </form>
  );

  // UI for Step 2: Modules/Lessons/Contents
  const renderStep2 = () => (
    <form onSubmit={handleSubmitModules} className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        Step 2: Modules & Lessons
      </h2>
      {modules.map((module, moduleIndex) => (
        <div
          key={moduleIndex}
          className="mb-8 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              Module {moduleIndex + 1}
            </h3>
            <button
              type="button"
              onClick={() => removeModule(moduleIndex)}
              className="text-red-500 hover:text-red-600"
              disabled={modules.length === 1}
            >
              <FaTrash />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Module Title*</label>
            <input
              type="text"
              name="title"
              value={module.title}
              onChange={(e) => handleModuleChange(moduleIndex, e)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              placeholder="Enter module title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Module Description</label>
            <textarea
              name="description"
              value={module.description}
              onChange={(e) => handleModuleChange(moduleIndex, e)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              rows="3"
              placeholder="Enter module description"
            ></textarea>
          </div>
          {/* Lessons Section */}
          <div className="mt-6 mb-4">
            <h4 className="text-lg font-semibold text-white mb-3">Lessons</h4>
            {module.lessons.map((lesson, lessonIndex) => (
              <div
                key={lessonIndex}
                className="mb-6 border border-gray-600 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-md font-semibold text-white">
                    Lesson {lessonIndex + 1}
                  </h5>
                  <button
                    type="button"
                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                    className="text-red-500 hover:text-red-600"
                    disabled={module.lessons.length === 1}
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="mb-3">
                  <label className="block text-white mb-2">Lesson Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={lesson.title}
                    onChange={(e) =>
                      handleLessonChange(moduleIndex, lessonIndex, e)
                    }
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                    placeholder="Enter lesson title"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">
                    Lesson Description
                  </label>
                  <textarea
                    name="description"
                    value={lesson.description}
                    onChange={(e) =>
                      handleLessonChange(moduleIndex, lessonIndex, e)
                    }
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                    rows="2"
                    placeholder="Enter lesson description"
                  ></textarea>
                </div>
                {/* Content Section */}
                <div className="mt-4">
                  <h6 className="text-sm font-semibold text-white mb-2">
                    Content Items
                  </h6>
                  {lesson.contents.map((content, contentIndex) => (
                    <div
                      key={contentIndex}
                      className="mb-4 border border-gray-500 rounded p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white">
                          Content {contentIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            removeContent(
                              moduleIndex,
                              lessonIndex,
                              contentIndex
                            )
                          }
                          className="text-red-500 hover:text-red-600"
                          disabled={lesson.contents.length === 1}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="mb-2">
                        <label className="block text-white mb-1">
                          Content Type*
                        </label>
                        <select
                          name="content_type"
                          value={content.content_type}
                          onChange={(e) =>
                            handleContentChange(
                              moduleIndex,
                              lessonIndex,
                              contentIndex,
                              e
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                          required
                        >
                          <option value="video">Video</option>
                          <option value="document">PDF</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="block text-white mb-1">
                          {content.content_type === "video" ? (
                            <span className="flex items-center">
                              <FaVideo className="mr-1" /> Upload Video*
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <FaFilePdf className="mr-1" /> Upload PDF*
                            </span>
                          )}
                        </label>
                        <input
                          type="file"
                          name="file"
                          onChange={(e) =>
                            handleContentChange(
                              moduleIndex,
                              lessonIndex,
                              contentIndex,
                              e
                            )
                          }
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                          accept={
                            content.content_type === "video"
                              ? "video/*"
                              : "application/pdf"
                          }
                          required
                        />
                      </div>
                      {content.file && (
                        <p className="text-sm text-green-400">
                          Selected file: {content.file.name}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addContent(moduleIndex, lessonIndex)}
                    className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    <FaPlus className="mr-1" /> Add Content
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addLesson(moduleIndex)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
            >
              <FaPlus className="mr-2" /> Add Lesson
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addModule}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-6"
      >
        <FaPlus className="mr-2" /> Add Module
      </button>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded flex items-center"
          disabled={loading}
        >
          {loading ? "Creating Course..." : "Finish"}
        </button>
      </div>
    </form>
  );

  return (
    <InstructorPanel>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Create a New Course
        </h1>
        <div className="mb-6 flex items-center">
          <div
            className={`px-4 py-2 rounded-full ${
              step === 1 ? "bg-green-500 text-black" : "bg-gray-700 text-white"
            } mr-2`}
          >
            1
          </div>
          <span className="mr-4">Course Info</span>
          <div
            className={`px-4 py-2 rounded-full ${
              step === 2 ? "bg-green-500 text-black" : "bg-gray-700 text-white"
            } mr-2`}
          >
            2
          </div>
          <span>Modules & Lessons</span>
        </div>
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </InstructorPanel>
  );
};

export default CreateCourseWithModules;