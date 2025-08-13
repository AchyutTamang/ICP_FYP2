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

  // getForumParticipants: (forumId) =>
  //   api.get(`/forums/participants/?forum=${forumId}`),

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
      const userId =
        localStorage.getItem("userId") || localStorage.getItem("id");
      const userEmail = localStorage.getItem("email");

      // First check if already a member
      const isMember = await forumService.isForumMember(forumId);
      if (isMember) {
        return { success: true, message: "Already a member of this forum" };
      }

      const response = await api.post(`/forums/forums/${forumId}/join/`, {
        student_id: userId,
        student_email: userEmail,
      });

      return {
        success: true,
        message: "Successfully joined the forum",
        data: response.data,
      };
    } catch (error) {
      // Check if the error is because user is already a member
      if (
        error.response?.data?.detail ===
        "You are already a member of this forum."
      ) {
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
