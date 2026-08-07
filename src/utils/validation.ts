/**
 * VitalCore Web Application Authentication & Security Validation Helpers
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: "Email address is required." };
  }
  if (/\s/.test(trimmed)) {
    return { isValid: false, error: "Email address cannot contain spaces." };
  }
  if (!trimmed.includes("@")) {
    return { isValid: false, error: "Email address must contain an '@' symbol." };
  }
  const parts = trimmed.split("@");
  if (parts.length > 2) {
    return { isValid: false, error: "Email address cannot contain multiple '@' symbols." };
  }
  if (!parts[0]) {
    return { isValid: false, error: "Email address is missing username prefix before '@'." };
  }
  if (!parts[1]) {
    return { isValid: false, error: "Email address is missing domain suffix after '@'." };
  }
  if (!parts[1].includes(".")) {
    return { isValid: false, error: "Email domain must contain a valid domain extension (e.g. .com, .org, .edu)." };
  }
  const domainParts = parts[1].split(".");
  if (domainParts.some(p => p.length === 0)) {
    return { isValid: false, error: "Invalid domain formatting in email address." };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email format (e.g. user@domain.com)." };
  }
  return { isValid: true };
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  error?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const passedCount = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  let score = 0;
  if (!password) score = 0;
  else if (passedCount <= 2) score = 1;
  else if (passedCount === 3) score = 2;
  else if (passedCount === 4) score = 3;
  else if (passedCount === 5) score = 4;

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  let error: string | undefined;
  if (!hasMinLength) error = "Password must be at least 8 characters long.";
  else if (!hasUpper) error = "Password must contain at least one uppercase letter (A-Z).";
  else if (!hasLower) error = "Password must contain at least one lowercase letter (a-z).";
  else if (!hasNumber) error = "Password must contain at least one number (0-9).";
  else if (!hasSpecial) error = "Password must contain at least one special character (!@#$%...).";

  return {
    isValid,
    score,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    error
  };
}
