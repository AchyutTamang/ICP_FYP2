import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import Navbar from '../stick/Navbar';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [forums, setForums] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    profilePicture: null
  });

  useEffect(() => {
    console.log('Current userRole:', userRole);
    loadProfileData();
  }, [userRole]);

  const loadProfileData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user_info'));
      console.log('User Info:', userInfo);

      // Set profile data first
      setProfile({
        fullName: userInfo?.fullname || userInfo?.username || 'User',
        bio: userInfo?.bio || 'No bio available',
        profilePicture: userInfo?.profile_picture || '/default-avatar.png'
      });

      setFormData({
        fullName: userInfo?.fullname || userInfo?.username || '',
        bio: userInfo?.bio || '',
        profilePicture: null
      });

      if (userRole === 'instructor') {
        try {
          const instructorEmail = userInfo.email;
          console.log('Fetching data for instructor:', instructorEmail);

          const coursesRes = await profileService.getInstructorCourses(instructorEmail);
          const forumsRes = await profileService.getInstructorForums(instructorEmail);
          
          console.log('Courses Response:', coursesRes.data);
          console.log('Forums Response:', forumsRes.data);
          
          setCourses(coursesRes.data || []);
          setForums(forumsRes.data || []);
        } catch (error) {
          console.error('Error fetching instructor content:', error);
          toast.error('Failed to load instructor content');
        }
      }
      else {
        try {
          const enrolledRes = await profileService.getEnrolledCourses(userInfo.student_id);
          const joinedRes = await profileService.getJoinedForums(userInfo.student_id);
          setCourses(enrolledRes.data || []);
          setForums(joinedRes.data || []);
        } catch (error) {
          console.error('Error fetching student data:', error);
          toast.error('Failed to load student content');
        }
      }
    } catch (error) {
      console.error('Error in loadProfileData:', error);
      toast.error('Error loading profile data');
    }
  };

  const handleDelete = async (type, id) => {
    try {
      if (type === 'course') {
        await profileService.deleteCourse(id);
        setCourses(courses.filter(course => course.id !== id));
      } else {
        await profileService.deleteForum(id);
        setForums(forums.filter(forum => forum.id !== id));
      }
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      toast.error(`Error deleting ${type}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('fullname', formData.fullName); // Changed to match backend field name
    data.append('bio', formData.bio);
    if (formData.profilePicture) {
      data.append('profile_pic', formData.profilePicture); // Changed to match backend field name
    }

    try {
      await profileService.updateProfile(data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Reload user info after update
      const response = await profileService.getProfile();
      localStorage.setItem('user_info', JSON.stringify(response.data));
      loadProfileData();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error updating profile');
    }
  };

  // Add new function for course/forum creation
  // Update the handleCreate function to include the token in localStorage
  const handleCreate = (type) => {
    console.log(`Attempting to navigate to ${type} creation page`);
    console.log('Current user role:', userRole);
    
    // Make sure the token is available in localStorage before navigation
    const token = localStorage.getItem('access_token');
    console.log('Token available:', !!token);
    
    if (type === 'course') {
      console.log('Navigating to /instructor/create-course');
      // Navigate to create course page
      navigate('/instructor/create-course');
    } else {
      navigate('/forum/create');
    }
  };

  // Update the Courses and Forums sections to include create buttons
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Profile Header */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-8 mb-8">
          <div className="flex items-start gap-8">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={profile?.profilePicture || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full"
                >
                  <FaEdit className="text-white" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="flex-1">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="bg-gray-800 text-white rounded px-4 py-2 w-full mb-4"
                  placeholder="Full Name"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="bg-gray-800 text-white rounded px-4 py-2 w-full mb-4"
                  placeholder="Bio"
                  rows="3"
                />
                <input
                  type="file"
                  onChange={(e) => setFormData({...formData, profilePicture: e.target.files[0]})}
                  className="mb-4"
                  accept="image/*"
                />
                <div className="flex gap-4">
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile?.fullName}
                </h1>
                <p className="text-gray-300 mb-4">{userRole === 'instructor' ? 'Instructor' : 'Student'}</p>
                <p className="text-white mb-6">{profile?.bio}</p>
                
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{courses.length}</div>
                    <div className="text-sm text-gray-400">
                      {userRole === 'instructor' ? 'Created Courses' : 'Enrolled Courses'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{forums.length}</div>
                    <div className="text-sm text-gray-400">
                      {userRole === 'instructor' ? 'Created Forums' : 'Joined Forums'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Courses and Forums */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Courses Section */}
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {userRole === 'instructor' ? 'Created Courses' : 'Enrolled Courses'}
              </h2>
              {userRole === 'instructor' && (
                <button
                  onClick={() => handleCreate('course')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create Course
                </button>
              )}
            </div>
            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">{course.title}</h3>
                    <p className="text-gray-400 text-sm">{course.description}</p>
                  </div>
                  {userRole === 'instructor' && (
                    <button
                      onClick={() => handleDelete('course', course.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Forums Section */}
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {userRole === 'instructor' ? 'Created Forums' : 'Joined Forums'}
              </h2>
              {userRole === 'instructor' && (
                <button
                  onClick={() => handleCreate('forum')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create Forum
                </button>
              )}
            </div>
            <div className="space-y-4">
              {forums.map(forum => (
                <div key={forum.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">{forum.title}</h3>
                    <p className="text-gray-400 text-sm">{forum.description}</p>
                  </div>
                  {userRole === 'instructor' && (
                    <button
                      onClick={() => handleDelete('forum', forum.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;