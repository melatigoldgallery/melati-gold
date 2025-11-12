/**
 * Toast Notification Composable
 * Lightweight toast notification system for Nuxt 3
 * No external dependencies required
 */

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

// Global reactive state for toasts
const toasts = ref<ToastMessage[]>([]);

export const useToast = () => {
  /**
   * Add a new toast notification
   */
  const addToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration: number = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const toast: ToastMessage = {
      id,
      type,
      message,
      duration,
    };

    toasts.value.push(toast);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  /**
   * Remove a toast by ID
   */
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  /**
   * Show success toast
   */
  const success = (message: string, duration?: number) => {
    return addToast(message, "success", duration);
  };

  /**
   * Show error toast
   */
  const error = (message: string, duration?: number) => {
    return addToast(message, "error", duration);
  };

  /**
   * Show warning toast
   */
  const warning = (message: string, duration?: number) => {
    return addToast(message, "warning", duration);
  };

  /**
   * Show info toast
   */
  const info = (message: string, duration?: number) => {
    return addToast(message, "info", duration);
  };

  /**
   * Clear all toasts
   */
  const clear = () => {
    toasts.value = [];
  };

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear,
  };
};
