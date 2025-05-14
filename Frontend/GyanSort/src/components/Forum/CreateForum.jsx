import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import forumService from "../../services/forumservice"; // Fixed import path (lowercase)
import Navbar from "../stick/Navbar";

const CreateForum = () => {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const forumData = {
        title: title.trim(),
        topic: topic.trim(),
        description: description.trim(),
        is_active: true
      };
      
      console.log('Submitting forum data:', forumData);
      
      const response = await forumService.createForum(forumData);
      console.log('Forum created successfully:', response);
      navigate("/forum");
    } catch (error) {
      console.error("Error creating forum:", error);
      // More detailed error handling
      if (error.response) {
        console.error("Server response:", error.response.data);
        setError(error.response.data.detail || "Server error. Please try again.");
      } else if (error.request) {
        console.error("No response received");
        setError("No response from server. Please check your connection.");
      } else {
        setError(error.message || "Failed to create forum. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate("/forum");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl mt-50">
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-8 mt-52">
          <div className="flex items-center mb-6">
            <Link to="/forum" className="text-green-400 mr-2">
              ←
            </Link>
            <h2 className="text-white text-2xl font-bold">Create Study Room</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-white mb-2">Enter a Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Python, JavaScript, Math"
              />
            </div>

            <div className="mb-4">
              <label className="block text-white mb-2">Room Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Give your room a name"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-white mb-2">Room Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                placeholder="Describe what this room is about"
                required
              ></textarea>
            </div>

            {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              >
                {loading ? "Creating..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateForum;