import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Checking access permissions...</span>
        </div>
      </div>
    );
  }

  // Strict role check: If user is an Admin, redirect them directly to /admin
  const isAdmin =
    user?.role === 'ROLE_ADMIN' ||
    user?.role === 'ADMIN' ||
    (Array.isArray(user?.roles) && user.roles.some((r) => String(r).toUpperCase().includes('ADMIN')));

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
