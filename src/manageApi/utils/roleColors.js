// src/utils/roleColors.js

// Role-based color configuration
export const roleColors = {
  '0': { // SuperAdmin
    primary: '#7E22CE',
    light: '#F3E8FF',
    gradient: 'from-purple-600 to-purple-400',
    text: 'text-purple-600',
    bg: 'bg-purple-600'
  },
  '1': { // Admin
    primary: '#2563EB',
    light: '#DBEAFE',
    gradient: 'from-blue-600 to-blue-400',
    text: 'text-blue-600',
    bg: 'bg-blue-600'
  },
  '5': { // Vendor-B2C
    primary: '#DC2626',
    light: '#FEE2E2',
    gradient: 'from-red-600 to-red-400',
    text: 'text-red-600',
    bg: 'bg-red-600'
  },
  '6': { // Vendor-B2B
    primary: '#EA580C',
    light: '#FFEDD5',
    gradient: 'from-orange-600 to-orange-400',
    text: 'text-orange-600',
    bg: 'bg-orange-600'
  },
  '7': { // Freelancer
    primary: '#059669',
    light: '#D1FAE5',
    gradient: 'from-green-600 to-green-400',
    text: 'text-green-600',
    bg: 'bg-green-600'
  },
  '8': { // Freelancer-Business
    primary: '#0D9488',
    light: '#CCFBF1',
    gradient: 'from-teal-600 to-teal-400',
    text: 'text-teal-600',
    bg: 'bg-teal-600'
  },
  default: {
    primary: '#4F46E5',
    light: '#EEF2FF',
    gradient: 'from-indigo-600 to-indigo-400',
    text: 'text-indigo-600',
    bg: 'bg-indigo-600'
  }
};

// Get color scheme based on role code
export const getRoleColors = (roleCode) => {
  return roleColors[roleCode] || roleColors.default;
};