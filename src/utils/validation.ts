// Validation utility functions

import {
  USERNAME_REGEX,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../constants/validation';

/**
 * Validate username format
 * @param username - Username to validate
 * @returns Object with isValid flag and optional error message
 */
export const validateUsername = (
  username: string
): { isValid: boolean; error?: string } => {
  if (username.length === 0) {
    return { isValid: false };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      isValid: false,
      error: `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters (letters, numbers, underscore only)`,
    };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid flag and optional error message
 */
export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validate password confirmation
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Object with isValid flag and optional error message
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Passwords do not match',
    };
  }

  return { isValid: true };
};
