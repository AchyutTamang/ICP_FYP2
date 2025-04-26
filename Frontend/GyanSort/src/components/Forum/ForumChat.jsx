import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import forumService from "../../services/forumService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../stick/Navbar";
import Footer from "../stick/Footer";


const ForumChat = () => {
  const { forumId } = useParams();
  const { user } = useAuth();
  const [forum, setForum] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchForumDetails = async () => {
      try {
        const forumResponse = await forumService.getForumDetails(forumId);
        setForum(forumResponse.data);
        
        const messagesResponse = await forumService.getMessages(forumId);
        setMessages(messagesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching forum details:", error);
        setLoading(false);
      }
    };

    fetchForumDetails();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      forumService.getMessages(forumId)
        .then(response => setMessages(response.data))
        .catch(error => console.error("Error polling messages:", error));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [forumId]);

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

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl min-h-screen pt-24">
        <div className="mb-4">
          <Link to="/forum" className="text-green-400 hover:text-green-500">
            &larr; Back to Forums
          </Link>
        </div>
        
        <div className="bg-gray-700 bg-opacity-50 rounded-lg shadow-md overflow-hidden">
          {/* Forum Header */}
          <div className="bg-gray-800 bg-opacity-50 p-4 border-b border-gray-600">
            <div className="flex items-center">
              <div className="mr-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {forum.created_by_name ? forum.created_by_name.charAt(0).toUpperCase() : "K"}
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