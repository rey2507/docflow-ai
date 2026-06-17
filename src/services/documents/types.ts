export interface ValidationResult {
  isValid: boolean;
  error: Error | null;
  warnings?: string[];
}

export interface ValidationRule {
  validate(data: Record<string, any>): ValidationResult;
}