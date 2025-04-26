import React, { useState } from "react";
import { registerInstructor } from "../../services/instructorAuth";
import { toast } from "react-toastify";
import axios from 'axios';  // Add this at the top with other imports

const InstructorSignupForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    password2: "",
    bio: "",
  });

  const [files, setFiles] = useState({
    verification_document: null,
    profile_picture: null,
  });

  const [fileNames, setFileNames] = useState({
    verification_document: "",
    profile_picture: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles.length > 0) {
      setFiles({ ...files, [name]: selectedFiles[0] });
      setFileNames({ ...fileNames, [name]: selectedFiles[0].name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate password match
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate verification document
    if (!files.verification_document) {
      setError("Please upload a verification document");
      setLoading(false);
      return;
    }

    // Check if verification document is PDF
    if (files.verification_document.type !== "application/pdf") {
      setError("Verification document must be a PDF file");
      setLoading(false);
      return;
    }

    // Create form data for file upload
    const submitData = new FormData();
    submitData.append("fullname", formData.fullname);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("password2", formData.password2);
    submitData.append("bio", formData.bio);
    submitData.append("verification_document", files.verification_document);

    if (files.profile_picture) {
      submitData.append("profile_picture", files.profile_picture);
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/instructors/register/",  // Updated endpoint
        submitData,  // Use submitData instead of formData
        {
          headers: {
            'Content-Type': 'multipart/form-data',  // Important for file upload
          },
        }
      );

      if (response.status === 201) {
        toast.success("Registration successful! Please check your email to verify your account.");
        onClose();
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div>
        <label
          htmlFor="fullname"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="fullname"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label
          htmlFor="password2"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <input
          type="password"
          id="password2"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label
          htmlFor="verification_document"
          className="block text-sm font-medium text-gray-700"
        >
          Verification Document (PDF) *
        </label>
        <div className="mt-1 flex items-center">
          <label className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <span className="mr-2">
              {fileNames.verification_document || "Choose file"}
            </span>
            <input
              type="file"
              id="verification_document"
              name="verification_document"
              accept=".pdf"
              onChange={handleFileChange}
              className="sr-only"
              required
            />
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Please upload a PDF document that verifies your identity and
          qualifications as an instructor.
        </p>
      </div>

      <div>
        <label
          htmlFor="profile_picture"
          className="block text-sm font-medium text-gray-700"
        >
          Profile Picture (Optional)
        </label>
        <div className="mt-1 flex items-center">
          <label className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <span className="mr-2">
              {fileNames.profile_picture || "Choose file"}
            </span>
            <input
              type="file"
              id="profile_picture"
              name="profile_picture"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </form>
  );
};

export default InstructorSignupForm;
