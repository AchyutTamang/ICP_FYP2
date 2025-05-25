// import api from "../api";
// import axios from "axios";

// const forumService = {
//   // Get all forums
//   getForums: () => {
//     return api.get("/forums/forums/");
//   },

//   // Create a new forum (instructors only)
//   createForum: async (forumData) => {
//     // Get the correct token - try both access and access_token
//     const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    
//     if (!token) {
//       console.error('No authentication token found');
//       throw new Error('You must be logged in to create a forum');
//     }
    
//     console.log('Using token:', token.substring(0, 10) + '...');
    
//     const userEmail = localStorage.getItem('email');
//     const userType = localStorage.getItem('userType');
    
//     // Try different possible user ID storage keys
//     const userId = localStorage.getItem('userId') || 
//                   localStorage.getItem('user_id') || 
//                   localStorage.getItem('id');
    
//     // Get user info if available
//     let userInfo = null;
//     try {
//       const userInfoStr = localStorage.getItem('user_info');
//       if (userInfoStr) {
//         userInfo = JSON.parse(userInfoStr);
//       }
//     } catch (e) {
//       console.error('Error parsing user info:', e);
//     }
    
//     // Check if the instructor is verified
//     if (userType === 'instructor') {
//       const verificationStatus = userInfo?.verification_status || 'pending';
//       if (verificationStatus !== 'verified') {
//         throw new Error('Your account is not verified by admin yet. You cannot create forums until verification is complete.');
//       }
//     }
    
//     // Get the most reliable user identifier
//     const userIdentifier = userId || 
//                           (userInfo && userInfo.id) || 
//                           (userInfo && userInfo.pk) || 
//                           userEmail;
    
//     console.log('Forum creation attempt with credentials:', {
//       userType,
//       userEmail,
//       userId,
//       userInfo: userInfo ? 'Available' : 'Not available',
//       userIdentifier
//     });
    
//     // Make sure we have all required fields
//     if (!forumData.title || !forumData.description) {
//       throw new Error('Title and description are required');
//     }
    
//     // Prepare the data according to what the backend expects
//     const enrichedData = {
//       title: forumData.title.trim(),
//       description: forumData.description.trim(),
//       topic: forumData.topic?.trim() || 'General',
//       is_active: true,
//       created_by: userIdentifier
//     };
    
//     console.log('Sending forum data:', enrichedData);
    
//     try {
//       // Use the api instance which should handle token properly
//       const response = await api.post(
//         "/forums/forums/", 
//         enrichedData
//       );
//       console.log('Forum creation successful:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Forum creation error details:', {
//         status: error.response?.status,
//         data: error.response?.data,
//         message: error.message
//       });
      
//       // Handle authentication errors specifically
//       if (error.response?.status === 401) {
//         console.log('Authentication failed. Attempting to refresh token...');
//         // You might want to implement token refresh logic here
//         throw new Error('Your session has expired. Please log in again.');
//       }
      
//       // Check if this is a permission error from the backend
//       if (error.response?.status === 403) {
//         throw new Error('Your account is not verified by admin yet. You cannot create forums until verification is complete.');
//       }
      
//       throw new Error('Failed to create forum: ' + 
//         (error.response?.data?.created_by || 
//          error.response?.data?.detail || 
//          error.message));
//     }
//   },

//   // Get forum details by ID
//   getForumDetails: (forumId) => {
//     return api.get(`/forums/${forumId}/`);
//   },

//   // Get participants for a forum
//   getForumParticipants: async (forumId) => {
//     try {
//       const response = await api.get(`/forums/forums/${forumId}/participants/`);
//       return response.data;
//     } catch (error) {
//       // If endpoint not found, return empty array instead of throwing error
//       if (error.response?.status === 404) {
//         return [];
//       }
//       throw error;
//     }
//   },

//   // Join a forum (students only)
//   joinForum: async (forumId) => {
//     try {
//       const userId = localStorage.getItem('userId') || 
//                     localStorage.getItem('user_id') || 
//                     localStorage.getItem('id');
//       const userEmail = localStorage.getItem('email');
      
//       const response = await api.post(`/forums/forums/${forumId}/join/`, {
//         student_id: userId,
//         student_email: userEmail
//       });
      
//       return response.data;
//     } catch (error) {
//       console.error('Error joining forum:', error);
//       throw error;
//     }
//   },

//   // Leave a forum (students only)
//   leaveForum: async (forumId) => {
//     try {
//       const userId = localStorage.getItem('userId') || 
//                     localStorage.getItem('user_id') || 
//                     localStorage.getItem('id');
//       const userEmail = localStorage.getItem('email');
      
//       const response = await api.post(`/forums/forums/${forumId}/leave/`, {
//         student_id: userId,
//         student_email: userEmail
//       });
      
//       return response.data;
//     } catch (error) {
//       console.error('Error leaving forum:', error);
//       throw error;
//     }
//   },

//   // Check if user is forum member
//   isForumMember: async (forumId) => {
//     try {
//       const userId = localStorage.getItem('userId') || 
//                     localStorage.getItem('user_id') || 
//                     localStorage.getItem('id');
//       const userEmail = localStorage.getItem('email');
//       const userType = localStorage.getItem('userType');
      
//       // If user is instructor and created the forum, they are considered a member
//       if (userType === 'instructor') {
//         const forumDetails = await forumService.getForumDetails(forumId);
//         if (String(forumDetails.created_by) === String(userId) || 
//             forumDetails.created_by_email === userEmail) {
//           return true;
//         }
//       }
      
//       const participants = await forumService.getForumParticipants(forumId);
      
//       return participants.some(participant => 
//         int(participant.student_id) === int(userId) || 
//         participant.student_email === userEmail
//       );
//     } catch (error) {
//       console.error('Error checking forum membership:', error);
//       return false;
//     }
//   },

//   // Join a forum (students only)
//   joinForum: async (forumId) => {
//     try {
//       const isMember = await forumService.isForumMember(forumId);
      
//       if (isMember) {
//         return { success: true, message: 'Already a member' };
//       }

//       const userId = localStorage.getItem('userId') || 
//                     localStorage.getItem('user_id') || 
//                     localStorage.getItem('id');
//       const userEmail = localStorage.getItem('email');
      
//       const response = await api.post(`/forums/forums/${forumId}/join/`, {
//         student_id: userId,
//         student_email: userEmail
//       });
      
//       return response.data;
//     } catch (error) {
//       console.error('Error joining forum:', error);
//       throw error;
//     }
//   },

//   // Remove duplicate methods and keep only these versions
//   getMessages: (forumId) => {
//     return api.get(`/forums/forums/${forumId}/messages/`);
//   },
  
//   sendMessage: (messageData) => {
//     return api.post(`/forums/forums/${messageData.forum}/messages/`, messageData);
//   },

//   // Upload attachment
//   uploadAttachment: (formData) => {
//     return api.post("/forums/attachments/", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   },

//   // Get attachments for a message
//   getAttachments: (messageId) => {
//     return api.get(`/forums/attachments/?message=${messageId}`);
//   },
  
  
  
//   // Get participants for a forum
//   getForumParticipants: (forumId) =>
//     api.get(`/forums/participants/?forum=${forumId}`),
//   
//   // Fix: Add proper data extraction
//   getForumParticipants: async (forumId) => {
//     const response = await api.get(`/forums/participants/?forum=${forumId}`);
//     return response.data || [];
//   },

//   // Get messages for a forum
//   getMessages: (forumId) => {
//     return api.get(`/forums/messages/?forum=${forumId}`);
//   },
  
//   sendMessage: (messageData) => {
//     return api.post(`/forums/messages/`, {
//       forum: messageData.forum,
//       content: messageData.content
//     });
//   },

//   // Join a forum (students only)
//   joinForum: async (forumId) => {
//     try {
//       // Get user ID from localStorage
//       const userId = localStorage.getItem('userId') || 
//                     localStorage.getItem('user_id') || 
//                     localStorage.getItem('id');
      
//       const userEmail = localStorage.getItem('email');
      
//       // If not a member, proceed with joining
//       const response = await api.post(`/forums/participants/`, {
//         forum: forumId,
//         student_id: userId,
//         student_email: userEmail
//       });
      
//       console.log('Join forum response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Error joining forum:', error.response?.data || error.message);
//       throw error;
//     }
//   },

//   // Leave a forum (students only)
//   leaveForum: async (forumId) => {
//     try {
//       const userId = localStorage.getItem('userId') || 
//                     localStorage.getItem('user_id') || 
//                     localStorage.getItem('id');
      
//       const userEmail = localStorage.getItem('email');
      
//       const response = await api.delete(`/forums/participants/${forumId}/`, {
//         data: {
//           student_id: userId,
//           student_email: userEmail
//         }
//       });
      
//       console.log('Leave forum response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Error leaving forum:', error.response?.data || error.message);
//       throw error;
//     }
//   },
// };

// // Add these methods to your existing forumService
// const getForumMessages = async (forumId) => {
//   const response = await axios.get(`http://localhost:8000/api/forums/${forumId}/messages/`, {
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//     },
//   });
//   return response.data;
// };

// const sendForumMessage = async (forumId, content) => {
//   const response = await axios.post(`http://localhost:8000/api/forums/${forumId}/messages/`, {
//     content
//   }, {
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//     },
//   });
//   return response.data;
// };

// // Fix the export section at the bottom of the file
// export default forumService;
import api from "../api";
import axios from "axios";

const forumService = {
  getForums: () => api.get("/forums/forums/"),

  getForumDetails: (forumId) => api.get(`/forums/forums/${forumId}/`),

  createForum: async (forumData) => {
    const token =
      localStorage.getItem("access") || localStorage.getItem("access_token");
    if (!token) throw new Error("You must be logged in to create a forum");

    const userType = localStorage.getItem("userType");
    const userEmail = localStorage.getItem("email");
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      localStorage.getItem("id");

    let userInfo = null;
    try {
      userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
    } catch (e) {
      console.error("Error parsing user_info:", e);
    }

    if (userType === "instructor") {
      if ((userInfo?.verification_status || "pending") !== "verified") {
        throw new Error("Your account is not verified by admin yet.");
      }
    }

    if (!forumData.title || !forumData.description) {
      throw new Error("Title and description are required");
    }

    const enrichedData = {
      title: forumData.title.trim(),
      description: forumData.description.trim(),
      topic: forumData.topic?.trim() || "General",
      is_active: true,
      created_by: userId || userInfo?.id || userEmail,
    };

    try {
      const response = await api.post("/forums/forums/", enrichedData);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.detail || error.message;
      if (status === 401)
        throw new Error("Session expired. Please log in again.");
      if (status === 403) throw new Error("Your account is not verified.");
      throw new Error(`Failed to create forum: ${msg}`);
    }
  },

  getForumParticipants: (forumId) =>
    api.get(`/forums/participants/?forum=${forumId}`),

  // Fix: Add proper data extraction
  getForumParticipants: async (forumId) => {
    const response = await api.get(`/forums/participants/?forum=${forumId}`);
    return response.data || [];
  },

  isForumMember: async (forumId) => {
    try {
      const userId =
        localStorage.getItem("userId") || localStorage.getItem("id");
      const userEmail = localStorage.getItem("email");
      const userType = localStorage.getItem("userType");

      if (userType === "instructor") {
        const forumDetails = await forumService.getForumDetails(forumId);
        if (
          forumDetails.created_by == userId ||
          forumDetails.created_by_email === userEmail
        ) {
          return true;
        }
      }

      const participants = await forumService.getForumParticipants(forumId);
      return participants.some(
        (p) =>
          String(p.student_id) === String(userId) ||
          p.student_email === userEmail
      );
    } catch (error) {
      console.error("Error checking membership:", error);
      return false;
    }
  },

  joinForum: async (forumId) => {
    try {
      const userId = localStorage.getItem("userId") || localStorage.getItem("id");
      const userEmail = localStorage.getItem("email");

      // First check if already a member
      const isMember = await forumService.isForumMember(forumId);
      if (isMember) {
        return { success: true, message: "Already a member of this forum" };
      }

      const response = await api.post(`/forums/forums/${forumId}/join/`, {
        student_id: userId,
        student_email: userEmail
      });

      return { success: true, message: "Successfully joined the forum", data: response.data };
    } catch (error) {
      // Check if the error is because user is already a member
      if (error.response?.data?.detail === "You are already a member of this forum.") {
        return { success: true, message: "Already a member of this forum" };
      }
      throw error;
    }
  },

  leaveForum: async (forumId) => {
    const userId = localStorage.getItem("userId") || localStorage.getItem("id");
    const userEmail = localStorage.getItem("email");

    const response = await api.post(`/forums/forums/${forumId}/leave/`, {
      student_id: userId,
      student_email: userEmail,
    });

    return response.data;
  },

  getMessages: (forumId) => api.get(`/forums/messages/?forum=${forumId}`),

  sendMessage: (messageData) =>
    api.post(`/forums/messages/`, {
      forum: messageData.forum,
      content: messageData.content,
    }),

  uploadAttachment: (formData) =>
    api.post("/forums/attachments/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getAttachments: (messageId) =>
    api.get(`/forums/attachments/?message=${messageId}`),

  // Optional: Direct axios usage if needed
  getForumMessages: async (forumId) => {
    const response = await axios.get(
      `http://localhost:8000/api/forums/${forumId}/messages/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  },

  sendForumMessage: async (forumId, content) => {
    const response = await axios.post(
      `http://localhost:8000/api/forums/${forumId}/messages/`,
      {
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  },
};

export default forumService;
