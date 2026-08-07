export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const COMMON_TYPOS: Record<string, string> = {
  'gamail.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'iclou.com': 'icloud.com',
};

/**
 * Validates email addresses strictly:
 * - Proper RFC format with valid TLD (e.g., .com, .org, .io)
 * - Blocks common typos (e.g., @gamail.com)
 * - Rejects incomplete email syntax (e.g., abc@, abc, abc@gmail)
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { isValid: false, message: 'Email address is required.' };
  }

  // Strict RFC email pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    if (!trimmed.includes('@')) {
      return { isValid: false, message: 'Email must contain an "@" symbol.' };
    }
    const parts = trimmed.split('@');
    if (parts.length > 1 && !parts[1].includes('.')) {
      return { isValid: false, message: 'Email domain must include an extension (e.g. .com).' };
    }
    return { isValid: false, message: 'Please enter a valid email address (e.g. user@example.com).' };
  }

  const domain = trimmed.split('@')[1];
  if (COMMON_TYPOS[domain]) {
    return {
      isValid: false,
      message: `Did you mean @${COMMON_TYPOS[domain]}? Please enter a valid email domain.`,
    };
  }

  return { isValid: true };
}

/**
 * Evaluates password strength and enforces requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function evaluatePassword(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password);

  let passedCriteria = 0;
  if (hasMinLength) passedCriteria++;
  if (hasUppercase) passedCriteria++;
  if (hasLowercase) passedCriteria++;
  if (hasNumber) passedCriteria++;
  if (hasSpecialChar) passedCriteria++;

  let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let color = '#ef4444'; // Red

  if (passedCriteria >= 5) {
    label = 'Strong';
    color = '#10b981'; // Green
  } else if (passedCriteria >= 4) {
    label = 'Good';
    color = '#3b82f6'; // Blue
  } else if (passedCriteria >= 3) {
    label = 'Fair';
    color = '#f59e0b'; // Amber
  }

  return {
    score: passedCriteria,
    label,
    color,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
}

export function validatePassword(password: string): ValidationResult {
  const strength = evaluatePassword(password);
  if (!strength.hasMinLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!strength.hasUppercase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!strength.hasLowercase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!strength.hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number (0-9).' };
  }
  if (!strength.hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*).' };
  }

  return { isValid: true };
}
