// import React, { useState } from "react";
// import { register } from "../services/authService";

// function Register() {
//   const [fullname, setFullname] = useState("");
//   const [email, setEmail] = useState("");
//   const [studentId, setStudentId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       await register(fullname, email, studentId, password);
//       setSuccess(
//         "Registration successful! Please check your email to verify your account."
//       );
//       // Clear form
//       setFullname("");
//       setEmail("");
//       setStudentId("");
//       setPassword("");
//     } catch (error) {
//       setError(error.message);
//       console.error(error.message);
//     }
//   };

//   return (
//     <div className="register-container">
//       <h2>Student Registration</h2>
//       {error && <div className="error-message">{error}</div>}
//       {success && <div className="success-message">{success}</div>}

//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="fullname">Full Name</label>
//           <input
//             type="text"
//             id="fullname"
//             value={fullname}
//             onChange={(e) => setFullname(e.target.value)}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="studentId">Student ID</label>
//           <input
//             type="text"
//             id="studentId"
//             value={studentId}
//             onChange={(e) => setStudentId(e.target.value)}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         <button type="submit">Register</button>
//       </form>
//     </div>
//   );
// }

// export default Register;
