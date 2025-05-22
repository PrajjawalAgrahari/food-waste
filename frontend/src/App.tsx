import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./components/home";
import Login from "./components/login";
import Donor from "./components/donor";
import Register from "./components/register";
import RecipientPage from "./components/reciever";
import DonorDashboard from "./components/donor-dashboard";
import CheckoutPage from "./components/checkout";
import ConfirmationPage from "./components/confirmation";
import DonorPendingDeliveries from "./components/donor-pending-deliveries";
import ReceiverPendingDeliveries from "./components/receiver-pending-deliveries";
import DonorProfile from "./components/donor-profile";
import DonationPage from "./components/donation-page";
import DonorList from "./components/donor-list";

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  token: string | null;
  userRole: string | null;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  token,
  userRole,
  requiredRole,
}) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [userRole, setUserRole] = useState<string | null>(
    localStorage.getItem("userRole")
  );

  const handleSetToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleSetUserRole = (newRole: string) => {
    localStorage.setItem("userRole", newRole);
    setUserRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setToken(null);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <Login setToken={handleSetToken} setUserRole={handleSetUserRole} />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/donor"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="DONOR"
            >
              <Donor onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receiver"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="RECEIVER"
            >
              <RecipientPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor-dashboard"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="DONOR"
            >
              <DonorDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor-pending-deliveries"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="DONOR"
            >
              <DonorPendingDeliveries onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receiver-pending-deliveries"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="RECEIVER"
            >
              <ReceiverPendingDeliveries onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="RECEIVER"
            >
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="RECEIVER"
            >
              <ConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/profile"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="DONOR"
            >
              <DonorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donors"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="RECEIVER"
            >
              <DonorList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donate/:donorId"
          element={
            <ProtectedRoute
              token={token}
              userRole={userRole}
              requiredRole="RECEIVER"
            >
              <DonationPage />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </Router>
  );
};

export default App;
