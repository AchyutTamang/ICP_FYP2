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
import CoursesPage from "./components/Courses/CoursesPage";
import CartPage from "./components/Courses/CartPage";
import FavoritesPage from "./components/Courses/FavoritesPage";
import InstructorCoursesPage from "./components/Courses/InstructorCoursesPage";
import PaymentPage from "./components/Courses/PaymentPage";
import OrderConfirmationPage from "./components/Courses/OrderConfirmationPage";
import { CartProvider } from "./context/CartContext";
import ForumList from "./components/Forum/ForumList";
import CreateForum from "./components/Forum/CreateForum";
import ForumChat from "./components/Forum/ForumChat";
import Profile from "./components/Profile/Profile";
import AllCourses from "./pages/AllCourses";
import { AuthProvider } from "./context/AuthContext";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

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
      loading,
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
      <CartProvider>
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
          <Route path="/courses" element={<CoursesPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="student">
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute requiredRole="student">
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:orderId"
            element={
              <ProtectedRoute requiredRole="student">
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:orderId"
            element={
              <ProtectedRoute requiredRole="student">
                <OrderConfirmationPage />
              </ProtectedRoute>
            }
          />
          {/* Add a catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* Forum routes - fixed to use ProtectedRoute and auth context */}
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <ForumList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/forum/create"
            element={
              <ProtectedRoute requiredRole="instructor">
                <CreateForum />
              </ProtectedRoute>
            }
          />

          <Route
            path="/forums/:forumId/chat"
            element={
              <ProtectedRoute>
                <ForumChat />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />

          {/* ... existing routes ... */}
          <Route path="/allcourses" element={<AllCourses />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

         
          <Route path="/reset-password/:userType/:uidb64/:token" element={<ResetPassword />} />
        </Routes>
      </CartProvider>
    </>
  );
}

export default App;