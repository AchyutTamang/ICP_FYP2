import api from "../api";

const forumService = {
  // Get all forums
  getForums: () => {
    return api.get("/forums/forums/");
  },

  // Create a new forum (instructors only)
  createForum: (forumData) => {
    // Get the token and email from localStorage
    const token = localStorage.getItem('access_token');
    const userEmail = localStorage.getItem('user_email');
    const userRole = localStorage.getItem('user_role');
    
    console.log("Creating forum with credentials:", {
      token: token ? token.substring(0, 10) + "..." : "none",
      email: userEmail,
      role: userRole
    });
    
    if (userRole !== 'instructor') {
      console.error("Only instructors can create forums");
      return Promise.reject("Only instructors can create forums");
    }
    
    // Create a new object that includes instructor identification
    const enrichedData = {
      ...forumData,
      instructor_email: userEmail,
      is_instructor_request: true,
      is_active: true
    };
    
    console.log("Sending forum creation request with data:", enrichedData);
    
    return api.post("/forums/forums/", enrichedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Email': userEmail,
        'X-User-Role': 'instructor'
      }
    });
  },

  // Get forum details
  getForumDetails: (forumId) => {
    return api.get(`/forums/forums/${forumId}/`);
  },

  // Join a forum (students only)
  joinForum: (forumId) => {
    return api.post(`/forums/forums/${forumId}/join/`);
  },

  // Leave a forum (students only)
  leaveForum: (forumId) => {
    return api.post(`/forums/forums/${forumId}/leave/`);
  },

  // Get messages for a forum
  getMessages: (forumId) => {
    return api.get(`/forums/forums/${forumId}/messages/`);
  },
  
  sendMessage: (messageData) => {
    return api.post(`/forums/forums/${messageData.forum}/messages/`, messageData);
  },

  // Upload attachment
  uploadAttachment: (formData) => {
    return api.post("/forums/attachments/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get attachments for a message
  getAttachments: (messageId) => {
    return api.get(`/forums/attachments/?message=${messageId}`);
  },
  
  
  
  // Get participants for a forum
  getForumParticipants: (forumId) => {
    return api.get(`/forums/forums/${forumId}/participants/`);
  },
};

export default forumService;
