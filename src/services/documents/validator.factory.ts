import { DocumentType } from '../../types/document';
import { ValidationRule } from './types';
import { InvoiceValidationRule } from './invoice.rules';

const ruleRegistry: Partial<Record<DocumentType, ValidationRule>> = {
  invoice: InvoiceValidationRule,
  // Register future rules here: contract: ContractValidationRule, etc.
};

export const getValidator = (type: DocumentType): ValidationRule | null => {
  return ruleRegistry[type] || null;
};