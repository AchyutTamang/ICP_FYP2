import api from "../api";
import axios from "axios";

const forumService = {
  // Get all forums
  getForums: () => {
    return api.get("/forums/forums/");
  },

  // Create a new forum (instructors only)
  createForum: async (forumData) => {
    // Get the correct token - try both access and access_token
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('You must be logged in to create a forum');
    }
    
    console.log('Using token:', token.substring(0, 10) + '...');
    
    const userEmail = localStorage.getItem('email');
    const userType = localStorage.getItem('userType');
    
    // Try different possible user ID storage keys
    const userId = localStorage.getItem('userId') || 
                  localStorage.getItem('user_id') || 
                  localStorage.getItem('id');
    
    // Get user info if available
    let userInfo = null;
    try {
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) {
        userInfo = JSON.parse(userInfoStr);
      }
    } catch (e) {
      console.error('Error parsing user info:', e);
    }
    
    // Check if the instructor is verified
    if (userType === 'instructor') {
      const verificationStatus = userInfo?.verification_status || 'pending';
      if (verificationStatus !== 'verified') {
        throw new Error('Your account is not verified by admin yet. You cannot create forums until verification is complete.');
      }
    }
    
    // Get the most reliable user identifier
    const userIdentifier = userId || 
                          (userInfo && userInfo.id) || 
                          (userInfo && userInfo.pk) || 
                          userEmail;
    
    console.log('Forum creation attempt with credentials:', {
      userType,
      userEmail,
      userId,
      userInfo: userInfo ? 'Available' : 'Not available',
      userIdentifier
    });
    
    // Make sure we have all required fields
    if (!forumData.title || !forumData.description) {
      throw new Error('Title and description are required');
    }
    
    // Prepare the data according to what the backend expects
    const enrichedData = {
      title: forumData.title.trim(),
      description: forumData.description.trim(),
      topic: forumData.topic?.trim() || 'General',
      is_active: true,
      created_by: userIdentifier
    };
    
    console.log('Sending forum data:', enrichedData);
    
    try {
      // Use the api instance which should handle token properly
      const response = await api.post(
        "/forums/forums/", 
        enrichedData
      );
      console.log('Forum creation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Forum creation error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        console.log('Authentication failed. Attempting to refresh token...');
        // You might want to implement token refresh logic here
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Check if this is a permission error from the backend
      if (error.response?.status === 403) {
        throw new Error('Your account is not verified by admin yet. You cannot create forums until verification is complete.');
      }
      
      throw new Error('Failed to create forum: ' + 
        (error.response?.data?.created_by || 
         error.response?.data?.detail || 
         error.message));
    }
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

// Add these methods to your existing forumService
const getForumMessages = async (forumId) => {
  const response = await axios.get(`http://localhost:8000/api/forums/${forumId}/messages/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return response.data;
};

const sendForumMessage = async (forumId, content) => {
  const response = await axios.post(`http://localhost:8000/api/forums/${forumId}/messages/`, {
    content
  }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return response.data;
};

// Fix the export section at the bottom of the file
export default forumService;
