import type { User, Inspection } from '../types';

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === 'SUPER_ADMIN';
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
};

export const isInspector = (user: User | null): boolean => {
  return user?.role === 'INSPECTOR';
};

export const isOrganization = (user: User | null): boolean => {
  return user?.role === 'ORGANIZATION';
};

/**
 * Checks if the user has permission to view a specific inspection.
 */
export const canViewInspection = (user: User | null, inspection: Inspection): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (isInspector(user) && inspection.inspectorId === user.uid) return true;
  if (isOrganization(user) && inspection.organizationId === user.organizationId) return true;
  return false;
};

/**
 * Checks if the user has permission to edit a specific inspection.
 */
export const canEditInspection = (user: User | null, inspection: Inspection): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  // Inspectors can only edit their own inspections
  if (isInspector(user) && inspection.inspectorId === user.uid) return true;
  return false;
};
