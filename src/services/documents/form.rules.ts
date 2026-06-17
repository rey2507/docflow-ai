import { ValidationRule, ValidationResult } from './types';

/**
 * FormValidationRule
 * 
 * Validates extracted key-value pairs from general forms.
 */
export const FormValidationRule: ValidationRule = {
  validate: (data: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const fieldCount = Object.keys(data || {}).filter(k => k !== 'validation_suggestions').length;

    if (fieldCount === 0) {
      errors.push('No form fields were detected.');
    } else if (fieldCount < 3) {
      warnings.push('Very few form fields detected. Please check extraction quality.');
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? new Error(errors.join('; ')) : null,
      warnings,
    };
  },
};