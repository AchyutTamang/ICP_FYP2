import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import forumService from "../../services/forumService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../stick/Navbar";

const ForumList = () => {
  const [forums, setForums] = useState([]);
  const [filteredForums, setFilteredForums] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [forumParticipants, setForumParticipants] = useState({});
  const { userRole, user } = useAuth();
  const navigate = useNavigate();

  // List of topics for the sidebar
  const topics = ["All", "Python", "DSA", "SEO"];

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await forumService.getForums();
        // Initialize with empty array if response.data is undefined
        const forumsData = response.data || [];
        setForums(forumsData);
        setFilteredForums(forumsData);

        // Fetch participants for each forum
        const participantsData = {};
        for (const forum of forumsData) {
          try {
            const participantsResponse = await forumService.getForumParticipants(forum.id);
            participantsData[forum.id] = participantsResponse.data || [];
          } catch (error) {
            console.error(`Error fetching participants for forum ${forum.id}:`, error);
            participantsData[forum.id] = [];
          }
        }

        setForumParticipants(participantsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching forums:", error);
        setForums([]);
        setFilteredForums([]);
        setLoading(false);
      }
    };

    fetchForums();
  }, []);

  // Filter forums based on search term and selected topic
  useEffect(() => {
    let filtered = forums;

    // Filter by topic if not "All"
    if (selectedTopic !== "All") {
      filtered = filtered.filter((forum) =>
        forum.title.toLowerCase().includes(selectedTopic.toLowerCase())
      );
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (forum) =>
          forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (forum.description &&
            forum.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (forum.created_by_name &&
            forum.created_by_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredForums(filtered);
  }, [searchTerm, selectedTopic, forums]);

  const handleForumClick = (forumId) => {
    navigate(`/forums/${forumId}/chat`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleJoinForum = async (e, forumId) => {
    e.stopPropagation(); // Prevent forum click event

    try {
      await forumService.joinForum(forumId);
      // Refresh participants for this forum
      const participantsResponse = await forumService.getForumParticipants(
        forumId
      );
      setForumParticipants((prev) => ({
        ...prev,
        [forumId]: participantsResponse.data,
      }));
    } catch (error) {
      console.error("Error joining forum:", error);
    }
  };

  // Check if user is the creator of the forum
  const isForumCreator = (forum) => {
    return (
      forum.created_by === user?.id || forum.created_by_email === user?.email
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-10 text-white mt-20">
          Loading forums...
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex pt-24">
        {/* Left Sidebar */}
        <div className="w-1/5 pr-6">
          <h3 className="text-white text-xl mb-4">Browse Topics</h3>
          <ul>
            {topics.map((topic) => (
              <li
                key={topic}
                className={`py-2 cursor-pointer ${
                  selectedTopic === topic
                    ? "text-green-400 font-medium"
                    : "text-white hover:text-green-400"
                }`}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <button
              className="text-green-400 flex items-center"
              onClick={() => setSelectedTopic("All")}
            >
              MORE <span className="ml-2">▼</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-4/5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-white text-2xl font-bold">ROOMS</h2>
              <p className="text-gray-400 text-sm">
                {filteredForums.length} rooms available
              </p>
            </div>

            {userRole === "instructor" && (
              <Link
                to="/forum/create"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full inline-block"
              >
                + Create One
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <button className="text-green-400 mr-4 pb-1 border-b-2 border-green-400">
              All Rooms
            </button>
          </div>

          {/* Forums List */}
          <div className="space-y-4">
            {filteredForums.length === 0 ? (
              <div className="text-center py-4 text-white">
                {searchTerm
                  ? "No rooms match your search."
                  : "No rooms available."}
              </div>
            ) : (
              filteredForums.map((forum) => (
                <div
                  key={forum.id}
                  className="bg-gray-700 bg-opacity-50 rounded-lg p-4 cursor-pointer hover:bg-opacity-70 transition-all"
                  onClick={() => handleForumClick(forum.id)}
                >
                  <div className="flex items-start">
                    <div className="mr-4">
                      <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center overflow-hidden">
                        {forum.created_by_profile_picture ? (
                          <img
                            src={forum.created_by_profile_picture}
                            alt={forum.created_by_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {forum.created_by_name
                              ? forum.created_by_name.charAt(0).toUpperCase()
                              : "K"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{forum.title}</h3>
                      <p className="text-green-400 text-sm">
                        Host @
                        {forum.created_by_name
                          ? forum.created_by_name
                              .toLowerCase()
                              .replace(/\s+/g, "")
                          : "unknown"}
                      </p>
                      <p className="text-white text-sm mt-2">
                        {forum.description || "Lesson & descr"}
                      </p>
                      <div className="mt-2">
                        <span className="inline-block bg-gray-600 rounded-md px-2 py-1 text-xs text-white">
                          {forum.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 text-right">
                      created:
                      <br />
                      {new Date(forum.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between items-center">
                    <div className="flex items-center text-gray-400">
                      <span className="flex items-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                            fill="currentColor"
                          />
                        </svg>
                        {forumParticipants[forum.id]?.length > 1 && (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="-ml-2"
                          >
                            <path
                              d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                              fill="currentColor"
                            />
                          </svg>
                        )}
                        {forumParticipants[forum.id]?.length || 0} people joined
                      </span>
                    </div>

                    {/* Only show Join Now button for students and forums they didn't create */}
                    {userRole === "student" && !isForumCreator(forum) && (
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full"
                        onClick={(e) => handleJoinForum(e, forum.id)}
                      >
                        Join Now
                      </button>
                    )}

                    {/* Show "Your Forum" for instructors who created this forum */}
                    {userRole === "instructor" && isForumCreator(forum) && (
                      <span className="text-green-400 px-4 py-1">
                        Your Forum
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumList;
