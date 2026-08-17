import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Verifying admin credentials...</span>
        </div>
      </div>
    );
  }

  // Strict Admin role check
  const isAdmin =
    user?.role === 'ROLE_ADMIN' ||
    user?.role === 'ADMIN' ||
    (Array.isArray(user?.roles) && user.roles.some((r) => String(r).toUpperCase().includes('ADMIN')));

  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
