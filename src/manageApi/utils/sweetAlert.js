import Swal from 'sweetalert2';

// Theme Colors (Matches your Leads UI)
const THEME_COLORS = {
  primary: '#722ed1', // Purple
  secondary: '#d3adf7',
  success: '#52c41a',
  error: '#ff4d4f',
  warning: '#faad14',
  cancel: '#ff4d4f', // Red for cancel
  backdrop: 'rgba(114, 46, 209, 0.1)' // Very subtle purple tint overlay
};

// Common configuration for a consistent look
const baseConfig = {
  backdrop: THEME_COLORS.backdrop,
  buttonsStyling: true,
  customClass: {
    confirmButton: 'swal-purple-btn', // You can use CSS or rely on confirmButtonColor below
    popup: 'swal-rounded-popup'
  }
};

export const showSuccessAlert = (title, text) => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'success',
    confirmButtonColor: THEME_COLORS.primary,
    iconColor: THEME_COLORS.success,
    confirmButtonText: 'Great!',
  });
};

export const showErrorAlert = (title, text) => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'error',
    confirmButtonColor: THEME_COLORS.primary, // Keep primary purple for "Dismiss" to stay on brand
    iconColor: THEME_COLORS.error,
    confirmButtonText: 'Okay',
  });
};

export const showConfirmDialog = (title, text, confirmButtonText = 'Yes, Confirm') => {
  return Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'warning',
    iconColor: THEME_COLORS.warning,
    showCancelButton: true,
    confirmButtonColor: THEME_COLORS.primary,
    cancelButtonColor: THEME_COLORS.cancel,
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true, // Puts the primary action on the right (standard UX)
  });
};

export const showCustomHtmlAlert = (title, html) => {
  return Swal.fire({
    ...baseConfig,
    title,
    html,
    showConfirmButton: false,
    showCloseButton: true,
    width: '600px', // Slightly wider for HTML content
    padding: '2em',
  });
};