import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginInstructor } from "../../services/instructorAuth";
import { toast } from "react-toastify";

const InstructorLoginForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ... existing code ...
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginInstructor(formData.email, formData.password);
      toast.success("Login successful!");
      onClose();
      navigate("/instructorhome"); // Changed from /instructor-dashboard to /instructorhome
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.detail || err.message || "Invalid credentials. Please try again."
      );

      // Check for verification status
      if (
        err.verification_status === "pending" ||
        err.verification_status === "under_review"
      ) {
        toast.info(
          "Your account is still under review. Please wait for admin approval."
        );
      } else if (err.verification_status === "rejected") {
        toast.error("Your verification was rejected. Please contact support.");
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
};

export default InstructorLoginForm;
