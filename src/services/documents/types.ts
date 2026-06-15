export interface ValidationResult {
  isValid: boolean;
  error: Error | null;
}

export interface ValidationRule {
  validate(data: Record<string, any>): ValidationResult;
}