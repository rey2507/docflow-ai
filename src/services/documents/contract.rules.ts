import { ValidationRule, ValidationResult } from './types';

/**
 * ContractValidationRule
 * 
 * Validates structured data extracted from contracts.
 * Focuses on parties, effective dates, and expiration logic.
 */
export const ContractValidationRule: ValidationRule = {
  validate: (data: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const parties = data.parties?.value;
    if (!parties || !Array.isArray(parties) || parties.length < 2) {
      errors.push('Contracts must identify at least two parties.');
    }

    const effectiveDate = data.effective_date?.value;
    const expirationDate = data.expiration_date?.value;

    if (!effectiveDate) {
      errors.push('Effective date is missing.');
    }

    if (effectiveDate && expirationDate) {
      const start = new Date(effectiveDate);
      const end = new Date(expirationDate);
      
      if (end <= start) {
        errors.push('Expiration date must be after the effective date.');
      }
    } else if (!expirationDate) {
      warnings.push('No expiration date detected. Ensure this is an evergreen contract.');
    }

    if (!data.contract_type?.value) {
      warnings.push('Contract type not clearly identified.');
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? new Error(errors.join('; ')) : null,
      warnings,
    };
  },
};