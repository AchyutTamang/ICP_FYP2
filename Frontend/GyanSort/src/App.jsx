// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Home from "./pages/home";
// import StudentHome from "./pages/StudentHome";
// import InstructorHome from "./pages/InstructorHome";
// import { useAuth } from "./context/AuthContext";

// // Protected route component
// const ProtectedRoute = ({ children, requiredRole }) => {
//   const { isAuthenticated, userRole } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/" />;
//   }

//   if (requiredRole && userRole !== requiredRole) {
//     return <Navigate to="/" />;
//   }

//   return children;
// };

// // Route that redirects logged-in users to their appropriate homepage
// const HomeRoute = () => {
//   const { isAuthenticated, userRole } = useAuth();

//   if (!isAuthenticated) {
//     return <Home />;
//   }

//   if (userRole === "student") {
//     return <Navigate to="/student" />;
//   }

//   if (userRole === "instructor") {
//     // Updated to match the route path below
//     return <Navigate to="/instructor" />;
//   }

//   return <Home />;
// };

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<HomeRoute />} />
//       <Route
//         path="/student"
//         element={
//           <ProtectedRoute requiredRole="student">
//             <StudentHome />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/instructor"
//         element={
//           <ProtectedRoute requiredRole="instructor">
//             <InstructorHome />
//           </ProtectedRoute>
//         }
//       />
//       <Route path="/InstructorHome" element={<Navigate to="/instructor" />} />
//     </Routes>
//   );
// }

// export default App;

import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/home";
import StudentHome from "./pages/StudentHome";
import InstructorHome from "./pages/InstructorHome";
import { useAuth } from "./context/AuthContext";

// Debug component to help diagnose routing issues
const RouteDebugger = () => {
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    console.log("Current route:", location.pathname);
    console.log("Auth state:", { isAuthenticated, userRole });
  }, [location, isAuthenticated, userRole]);

  return null;
};

 // In your ProtectedRoute component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute check:", {
      path: location.pathname,
      isAuthenticated,
      userRole,
      requiredRole,
      loading
    });
  }, [location, isAuthenticated, userRole, requiredRole, loading]);

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch: expected ${requiredRole}, got ${userRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route that redirects logged-in users to their appropriate homepage
const HomeRoute = () => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (userRole === "student") {
          console.log("Redirecting student to /student");
          navigate("/student", { replace: true });
        } else if (userRole === "instructor") {
          console.log("Redirecting instructor to /instructor");
          navigate("/instructor", { replace: true });
        }
      }
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return <Home />;
};

function App() {
  return (
    <>
      <RouteDebugger />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studenthome"
          element={<Navigate to="/student" replace />}
        />
        <Route
          path="/InstructorHome"
          element={<Navigate to="/instructor" replace />}
        />
        {/* Add a catch-all route */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;