import api from "../api";

const profileService = {
  getInstructorCourses: (instructorEmail) => {
    return api.get('/courses/courses/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'X-User-Email': instructorEmail
      },
      params: {
        created_by: true,
        instructor_view: true
      }
    });
  },

  getInstructorForums: (instructorEmail) => {
    return api.get('/forums/forums/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'X-User-Email': instructorEmail
      },
      params: {
        created_by: true,
        instructor_view: true
      }
    });
  },

  getProfile: () => {
    return api.get('/instructors/profile/');
  },

  updateProfile: (formData) => {
    return api.patch('/instructors/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteCourse: (courseId) => {
    return api.delete(`/courses/courses/${courseId}/`);
  },

  deleteForum: (forumId) => {
    return api.delete(`/forums/forums/${forumId}/`);
  }
};

export default profileService;