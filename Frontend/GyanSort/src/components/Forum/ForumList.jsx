import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import forumService from "../../services/forumService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../stick/Navbar";
import { jwtDecode } from "jwt-decode";

const ForumList = () => {
  const [forums, setForums] = useState([]);
  const [filteredForums, setFilteredForums] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [forumParticipants, setForumParticipants] = useState({});
  const { userRole, user } = useAuth();
  const navigate = useNavigate();

  const topics = ["All", "Python", "DSA", "SEO"];

  const [decodedUser, setDecodedUser] = useState(null);
  const [localUserType, setLocalUserType] = useState(
    localStorage.getItem("userType")
  );

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    setLocalUserType(userType);

    // Decode token to get user information
    const decodeToken = () => {
      try {
        const token = localStorage.getItem("access");
        if (token) {
          const decoded = jwtDecode(token);
          setDecodedUser(decoded);
        }
      } catch (error) {
        // ignore
      }
    };

    decodeToken();
  }, []);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const response = await forumService.getForums();
        const forumsData = Array.isArray(response.data) ? response.data : [];

        // Get current user info (logic same as before)
        const userInfo = decodedUser || {};
        const currentUserRole = userInfo.role || userRole;
        const currentUserId = userInfo.user_id || user?.id;
        const currentUserEmail = userInfo.email || user?.email;

        let visibleForums = forumsData;
        if (currentUserRole === "instructor") {
          visibleForums = forumsData.filter(
            (forum) =>
              forum.created_by === currentUserId ||
              forum.created_by_email === currentUserEmail
          );
        }
        setForums(visibleForums);
        setFilteredForums(visibleForums);

        // Fetch participants for each forum (only count active ones)
        const participantsData = {};
        for (const forum of visibleForums) {
          try {
            const participantsResponse =
              await forumService.getForumParticipants(forum.id);
            // Only count is_active === true memberships
            const participantsArr =
              participantsResponse.data || participantsResponse || [];
            const activeParticipants = participantsArr.filter(
              (p) => p.is_active === true
            );
            participantsData[forum.id] = activeParticipants.length || 0;
          } catch (error) {
            participantsData[forum.id] = 0;
          }
        }
        setForumParticipants(participantsData);
      } catch (error) {
        setForums([]);
        setFilteredForums([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, [user, userRole, decodedUser]);

  // Filter forums based on search term and selected topic
  useEffect(() => {
    let filtered = forums;

    if (selectedTopic !== "All") {
      filtered = filtered.filter((forum) =>
        forum.title.toLowerCase().includes(selectedTopic.toLowerCase())
      );
    }

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
    e.stopPropagation();

    try {
      await forumService.joinForum(forumId);
      // Refresh participants for this forum
      const participantsResponse = await forumService.getForumParticipants(
        forumId
      );
      const participantsArr =
        participantsResponse.data || participantsResponse || [];
      const activeParticipants = participantsArr.filter(
        (p) => p.is_active === true
      );
      setForumParticipants((prev) => ({
        ...prev,
        [forumId]: activeParticipants.length || 0,
      }));
    } catch (error) {
      // ignore
    }
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
                  className="bg-gray-700 bg-opacity-50 rounded-lg p-4 cursor-pointer hover:bg-opacity-70 transition-all flex items-start"
                  onClick={() => handleForumClick(forum.id)}
                >
                  {/* Participant count on the left */}
                  <div className="flex flex-col items-center justify-center mr-4 min-w-[48px]">
                    <span className="text-green-400 font-bold text-lg">
                      {forumParticipants[forum.id] || 0}
                    </span>
                    <span className="text-xs text-gray-400">Joined</span>
                  </div>
                  {/* Avatar and forum info */}
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
                    <h3 className="text-white text-lg font-semibold">
                      {forum.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">
                      {forum.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-gray-400 text-xs">
                        Host: {forum.created_by_name || "Unknown"}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {forumParticipants[forum.id] || 0} participants
                      </div>
                    </div>
                    {/* Join button */}
                    {localStorage.getItem("userType") === "student" &&
                      String(forum.created_by) !==
                        String(localStorage.getItem("userId")) && (
                        <div className="mt-3 text-right">
                          <button
                            onClick={(e) => handleJoinForum(e, forum.id)}
                            className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                          >
                            Join Room
                          </button>
                        </div>
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
