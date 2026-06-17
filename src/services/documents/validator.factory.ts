import { DocumentType } from '../../types/document';
import { ValidationRule } from './types';
import { InvoiceValidationRule } from './invoice.rules';
import { ContractValidationRule } from './contract.rules';
import { FormValidationRule } from './form.rules';

const ruleRegistry: Partial<Record<DocumentType, ValidationRule>> = {
  invoice: InvoiceValidationRule,
  contract: ContractValidationRule,
  form: FormValidationRule,
};

export const getValidator = (type: DocumentType): ValidationRule | null => {
  return ruleRegistry[type] || null;
};