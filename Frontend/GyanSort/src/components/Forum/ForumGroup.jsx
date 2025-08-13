import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import forumService from "../../services/forumService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../stick/Navbar";
import Footer from "../stick/Footer";

const ForumGroup = () => {
  const { forumId } = useParams();
  const { user, userRole } = useAuth();
  const [forum, setForum] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isForumMember, setIsForumMember] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch forum and participants
  useEffect(() => {
    const fetchForumDetails = async () => {
      try {
        const forumResponse = await forumService.getForumDetails(forumId);
        setForum(forumResponse.data || forumResponse);

        const participantsResp = await forumService.getForumParticipants(
          forumId
        );
        setParticipants(participantsResp);

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchForumDetails();
  }, [forumId]);

  // Check membership whenever participants or user changes
  useEffect(() => {
    if (!loading && participants.length > 0 && user) {
      const userId = user?.id || localStorage.getItem("userId");
      const userEmail = user?.email || localStorage.getItem("email");
      const member = participants.some(
        (p) =>
          String(p.student_id) === String(userId) ||
          String(p.student_email) === String(userEmail)
      );
      setIsForumMember(member);

      // If already a member, redirect to chat
      if (member && userRole === "student") {
        navigate(`/forums/${forumId}/chat`, { replace: true });
      }
    }
  }, [participants, user, userRole, loading, forumId, navigate]);

  const handleJoinForum = async () => {
    try {
      await forumService.joinForum(forumId);
      setJoinSuccess(true);
      // Refetch participants after join
      const participantsResp = await forumService.getForumParticipants(forumId);
      setParticipants(participantsResp);

      // Will trigger the useEffect above to redirect if now a member!
    } catch (error) {
      alert(
        error.response?.data?.detail || error.message || "Error joining forum."
      );
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-10">Loading forum...</div>
        <Footer />
      </>
    );
  }

  if (!forum) {
    return (
      <>
        <Navbar />
        <div className="text-center py-10">Forum not found</div>
        <Footer />
      </>
    );
  }

  // Only show join button if NOT a member and NOT loading
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl min-h-screen pt-24">
        <div className="mb-4">
          <Link to="/forum" className="text-green-400 hover:text-green-500">
            &larr; Back to Forums
          </Link>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">{forum.title}</h2>
          <p className="text-gray-300 mb-6">{forum.description}</p>
          <p className="text-gray-300 mb-2">
            Participants: {participants.length}
          </p>
          {!isForumMember && !loading && (
            <button
              onClick={handleJoinForum}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
              disabled={joinSuccess}
            >
              Join Forum
            </button>
          )}
          {joinSuccess && (
            <div className="mt-4 text-green-400">
              Successfully joined! Redirecting to chat...
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForumGroup;
