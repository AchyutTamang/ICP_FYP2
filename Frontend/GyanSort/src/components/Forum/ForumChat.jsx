
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import forumService from "../../services/forumService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../stick/Navbar";
import Footer from "../stick/Footer";

const ForumChat = () => {
  const { forumId } = useParams();
  const { user, userRole } = useAuth();
  const [forum, setForum] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isForumMember, setIsForumMember] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForumDetails = async () => {
      try {
        const forumResponse = await forumService.getForumDetails(forumId);
        setForum(forumResponse.data);

        // Check if the user is a member of this forum
        if (userRole === 'student') {
          try {
            const participantsResponse = await forumService.getForumParticipants(forumId);
            const participants = participantsResponse.data || [];
            
            // Check if current user is in the participants list
            const isMember = participants.some(participant => 
              String(participant.student_id) === String(user?.id) || 
              participant.student_email === user?.email
            );
            
            setIsForumMember(isMember);
            
            // If not a member, don't load messages
            if (!isMember) {
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error checking forum membership:", error);
          }
        } else if (userRole === 'instructor') {
          // Instructors can access if they created the forum
          const isCreator = String(forumResponse.data.created_by) === String(user?.id) || 
                           forumResponse.data.created_by_email === user?.email;
          setIsForumMember(isCreator);
          
          if (!isCreator) {
            setLoading(false);
            return;
          }
        }

        // Load messages only if user has access
        const messagesResponse = await forumService.getMessages(forumId);
        setMessages(messagesResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching forum details:", error);
        setLoading(false);
      }
    };

    fetchForumDetails();

    // Set up polling for new messages only if user has access
    const interval = setInterval(() => {
      if (isForumMember) {
        forumService
          .getMessages(forumId)
          .then((response) => setMessages(response.data))
          .catch((error) => console.error("Error polling messages:", error));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [forumId, user, userRole, isForumMember]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await forumService.sendMessage({
        forum: forumId,
        content: newMessage,
      });

      // Refresh messages
      const response = await forumService.getMessages(forumId);
      setMessages(response.data);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Enhanced join forum handler
  const handleJoinForum = async () => {
    try {
      await forumService.joinForum(forumId);
      
      // Show success message
      setJoinSuccess(true);
      setLeaveSuccess(false);
      
      // Update forum membership status
      setIsForumMember(true);
      
      // Refresh forum details after joining
      const messagesResponse = await forumService.getMessages(forumId);
      setMessages(messagesResponse.data);
      
      // After 3 seconds, hide the success message
      setTimeout(() => {
        setJoinSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error joining forum:", error);
    }
  };
  
  // Add leave forum handler
  const handleLeaveForum = async () => {
    try {
      await forumService.leaveForum(forumId);
      
      // Show leave success message
      setLeaveSuccess(true);
      setJoinSuccess(false);
      
      // Update forum membership status
      setIsForumMember(false);
      
      // After 3 seconds, hide the success message
      setTimeout(() => {
        setLeaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error leaving forum:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-10">Loading forum chat...</div>
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

  // Show join prompt for students who haven't joined
  if (userRole === 'student' && !isForumMember) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-6 max-w-4xl min-h-screen pt-24">
          <div className="mb-4">
            <Link to="/forum" className="text-green-400 hover:text-green-500">
              &larr; Back to Forums
            </Link>
          </div>
          
          <div className="bg-gray-700 bg-opacity-50 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">{forum.title}</h2>
            <p className="text-gray-300 mb-6">{forum.description}</p>
            
            {joinSuccess && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-4 py-3 rounded mb-6">
                Successfully joined {forum.title}! Loading forum content...
              </div>
            )}
            
            {!joinSuccess && (
              <p className="text-yellow-400 mb-6">Join first to access the chat.</p>
            )}
            
            <button 
              onClick={handleJoinForum}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
              disabled={joinSuccess}
            >
              Join Forum
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl min-h-screen pt-24">
        <div className="mb-4 flex justify-between items-center">
          <Link to="/forum" className="text-green-400 hover:text-green-500">
            &larr; Back to Forums
          </Link>
          
          {/* Leave button for students who have joined */}
          {userRole === 'student' && isForumMember && (
            <div>
              {leaveSuccess ? (
                <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-400 px-4 py-2 rounded">
                  You have left the forum. Redirecting...
                </div>
              ) : (
                <button 
                  onClick={handleLeaveForum}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Leave Forum
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-700 bg-opacity-50 rounded-lg shadow-md overflow-hidden">
          {/* Forum Header */}
          <div className="bg-gray-800 bg-opacity-50 p-4 border-b border-gray-600">
            <div className="flex items-center">
              <div className="mr-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {forum.created_by_name
                      ? forum.created_by_name.charAt(0).toUpperCase()
                      : "K"}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{forum.title}</h2>
                <p className="text-sm text-gray-400">
                  Host: {forum.created_by_name || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-[32rem] overflow-y-auto bg-gray-800 bg-opacity-30">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No messages yet. Be the first to send a message!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.sender_id === user?.id ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg px-4 py-2 max-w-xs sm:max-w-md ${
                      message.sender_id === user?.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {message.sender_name || "Unknown User"}
                    </p>
                    <p>{message.content}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-600 p-4">
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow bg-gray-700 text-white border border-gray-600 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForumChat;
