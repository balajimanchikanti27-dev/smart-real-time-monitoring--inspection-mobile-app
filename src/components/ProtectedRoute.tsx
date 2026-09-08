import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser, userData, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user doesn't have the role
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800">Unauthorized Access</h1>
        <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
        <p className="text-slate-400 text-sm mt-4">Current Role: {userData?.role || 'None'}</p>
        <a href="/login" className="mt-4 text-blue-600 hover:underline">Return to Login</a>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
