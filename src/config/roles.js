// src/config/roles.js
export const ROLES = {
  USER: 'user',
  MECHANIC: 'mechanic',
  ADMIN: 'admin',
};

export const ROLE_LEVELS = {
  [ROLES.USER]: 1,
  [ROLES.MECHANIC]: 2,
  [ROLES.ADMIN]: 3,
};

export const ROLE_LABELS = {
  [ROLES.USER]: 'Customer',
  [ROLES.MECHANIC]: 'Service Provider',
  [ROLES.ADMIN]: 'Administrator',
};

// Helper function to check if user has required role
export const hasRole = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

// Get default route based on role
export const getDefaultRoute = (userRole) => {
  switch (userRole) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.MECHANIC:
      return '/mechanic/dashboard';
    default:
      return '/dashboard';
  }
};