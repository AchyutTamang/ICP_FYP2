import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import InstructorPanel from './InstructorPanel';
import { FaPlus, FaTrash } from 'react-icons/fa';

const CreateModules = () => {
  const { courseId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  
  // Modules data
  const [modules, setModules] = useState([
    { title: '', description: '', order: 1 }
  ]);
  
  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/courses/${courseId}/`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setCourseDetails(response.data);
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error('Failed to fetch course details');
      }
    };
    
    fetchCourseDetails();
  }, [courseId, token]);
  
  // Handle module changes
  const handleModuleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], [name]: value };
    setModules(updatedModules);
  };
  
  // Add new module
  const addModule = () => {
    setModules([...modules, { title: '', description: '', order: modules.length + 1 }]);
  };
  
  // Remove module
  const removeModule = (index) => {
    if (modules.length > 1) {
      const updatedModules = [...modules];
      updatedModules.splice(index, 1);
      // Update order for remaining modules
      updatedModules.forEach((module, i) => {
        module.order = i + 1;
      });
      setModules(updatedModules);
    } else {
      toast.warning("You need at least one module");
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate modules
    if (modules.some(module => !module.title)) {
      toast.error('Please provide a title for all modules');
      return;
    }
    
    // Save modules
    setLoading(true);
    try {
      const savedModules = [];
      
      for (const module of modules) {
        const moduleData = {
          title: module.title,
          description: module.description,
          order: module.order,
          course_id: courseId
        };
        
        const response = await axios.post(
          'http://localhost:8000/api/courses/modules/create/',
          moduleData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        savedModules.push(response.data);
      }
      
      toast.success('Modules created successfully!');
      // Navigate to the first module's lessons page
      if (savedModules.length > 0) {
        navigate(`/instructor/courses/${courseId}/modules/${savedModules[0].id}/lessons`);
      } else {
        navigate(`/instructor/courses`);
      }
    } catch (error) {
      console.error('Error creating modules:', error);
      toast.error(error.response?.data?.error || 'Failed to create modules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorPanel>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Add Modules</h1>
        {courseDetails && (
          <p className="text-gray-400 mb-6">Course: {courseDetails.title}</p>
        )}
        
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
          {modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="mb-8 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Module {moduleIndex + 1}</h3>
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
            </div>
          ))}
          
          <button
            type="button"
            onClick={addModule}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-6"
          >
            <FaPlus className="mr-2" /> Add Another Module
          </button>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(`/instructor/courses/${courseId}`)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-2 rounded flex items-center"
              disabled={loading}
            >
              {loading ? "Saving..." : "Next"}
              {!loading && <span className="ml-2">→</span>}
            </button>
          </div>
        </form>
      </div>
    </InstructorPanel>
  );
};

export default CreateModules;