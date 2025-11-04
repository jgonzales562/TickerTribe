// Validation constants for forms and inputs

// Username validation
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Password validation
export const PASSWORD_MIN_LENGTH = 6;

// Timing constants (in milliseconds)
export const USERNAME_CHECK_DEBOUNCE = 300; // Debounce delay for username availability check
export const USERNAME_CHECK_DELAY = 500; // Simulated API delay for username check
export const LOGIN_SIMULATION_DELAY = 1000; // Simulated login API delay
export const SIGNUP_SIMULATION_DELAY = 1000; // Simulated signup API delay
