import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EmailVerification from "./components/auth/EmailVerification";
// import StudentHome from "./pages/StudentHome";
// import InstructorHome from "./pages/InstructorHome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        {/* // Add these routes to your existing routes */}
        {/* <Route path="/studenthome" element={<StudentHome />} />
        <Route path="/instructorhome" element={<InstructorHome />} /> */}
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
