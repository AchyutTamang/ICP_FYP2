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
  const [participants, setParticipants] = useState([]); // <-- NEW
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isForumMember, setIsForumMember] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Load forum details and membership
  useEffect(() => {
    const fetchForumDetails = async () => {
      try {
        const forumResponse = await forumService.getForumDetails(forumId);
        setForum(forumResponse.data || forumResponse);

        // Fetch participants and set
        const participantsResp = await forumService.getForumParticipants(
          forumId
        );
        setParticipants(participantsResp.data || participantsResp);

        // Membership logic
        let isMember = false;
        if (userRole === "student") {
          isMember = (participantsResp.data || participantsResp).some(
            (p) =>
              String(p.student_id) === String(user?.id) ||
              p.student_email === user?.email
          );
          setIsForumMember(isMember);
          if (isMember) {
            const messagesResponse = await forumService.getMessages(forumId);
            setMessages(messagesResponse.data || messagesResponse);
          }
        } else if (userRole === "instructor") {
          const isCreator =
            String(
              forumResponse.data?.created_by || forumResponse.created_by
            ) === String(user?.id) ||
            forumResponse.data?.created_by_email === user?.email ||
            forumResponse.created_by_email === user?.email;
          setIsForumMember(isCreator);
          if (isCreator) {
            const messagesResponse = await forumService.getMessages(forumId);
            setMessages(messagesResponse.data || messagesResponse);
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchForumDetails();

    const interval = setInterval(() => {
      if (isForumMember) {
        forumService
          .getMessages(forumId)
          .then((response) => setMessages(response.data || response))
          .catch(() => {});
        // Also refetch participants in case someone else joins
        forumService
          .getForumParticipants(forumId)
          .then((resp) => setParticipants(resp.data || resp))
          .catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [forumId, user, userRole, isForumMember]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message and/or file
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    let sentMessage = null;
    try {
      const msgContent = newMessage.trim()
        ? newMessage
        : file
        ? "Sent an attachment"
        : "";
      let messageId = null;
      if (msgContent) {
        const result = await forumService.sendMessage({
          forum: forumId,
          content: msgContent,
        });
        sentMessage = result.data || result;
        messageId = sentMessage.id;
      }

      if (file) {
        const formData = new FormData();
        formData.append("forum", forumId);
        formData.append("file", file);
        if (!messageId && messages.length > 0) {
          messageId = messages[messages.length - 1].id;
        }
        if (messageId) formData.append("message", messageId);
        formData.append("sender_type", userRole);
        formData.append("sender_id", user?.id);

        await forumService.uploadAttachment(formData);
      }

      const response = await forumService.getMessages(forumId);
      setMessages(response.data || response);
      setNewMessage("");
      setFile(null);
    } catch (error) {
      alert("Error sending message or attachment.");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const allowed =
        selected.type.startsWith("image/") ||
        selected.type === "application/pdf";
      if (!allowed) {
        alert("Only image or PDF files are allowed.");
        return;
      }
      setFile(selected);
    }
  };

  // Join forum handler
  const handleJoinForum = async () => {
    try {
      await forumService.joinForum(forumId);
      setJoinSuccess(true);
      setIsForumMember(true);
      // Fetch participants after joining
      const participantsResp = await forumService.getForumParticipants(forumId);
      setParticipants(participantsResp.data || participantsResp);
      // Get messages after joining
      const messagesResponse = await forumService.getMessages(forumId);
      setMessages(messagesResponse.data || messagesResponse);
      setTimeout(() => setJoinSuccess(false), 2000);
    } catch (error) {
      alert(
        error.response?.data?.detail || error.message || "Error joining forum."
      );
    }
  };

  // Leave forum handler
  const handleLeaveForum = async () => {
    try {
      await forumService.leaveForum(forumId);
      setLeaveSuccess(true);
      setIsForumMember(false);
      setTimeout(() => navigate("/forum"), 1500);
    } catch (error) {
      alert(
        error.response?.data?.detail || error.message || "Error leaving forum."
      );
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

  // Show join prompt for students who haven't joined and aren't already members
  if (userRole === "student" && !isForumMember && !loading) {
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
            <button
              onClick={handleJoinForum}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Join Forum
            </button>
            {joinSuccess && (
              <div className="mt-4 text-green-400">
                Successfully joined the forum!
              </div>
            )}
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
          {userRole === "student" && isForumMember && (
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
          {/* Forum Header with participant count */}
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
                <p className="text-sm text-gray-400 font-semibold">
                  Participants: {participants.length}
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
                    {/* Attachments display */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2">
                        {message.attachments.map((att) => (
                          <div key={att.id} className="mb-1">
                            {att.file_type.startsWith("image/") ? (
                              <a
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={att.file_url}
                                  alt={att.file_name}
                                  className="w-32 h-32 object-cover rounded border mt-1"
                                />
                              </a>
                            ) : att.file_type === "application/pdf" ? (
                              <a
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 underline"
                              >
                                📄 {att.file_name}
                              </a>
                            ) : (
                              <span>{att.file_name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(
                        message.sent_at || message.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-600 p-4">
            <form
              onSubmit={handleSendMessage}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow bg-gray-700 text-white border border-gray-600 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="bg-gray-700 text-white px-2 py-1 rounded"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg"
              >
                Send
              </button>
            </form>
            {file && (
              <div className="mt-2 text-gray-300 text-sm">
                File to upload: {file.name}{" "}
                <button
                  type="button"
                  className="ml-2 text-red-400"
                  onClick={() => setFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForumChat;
