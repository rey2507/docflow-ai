import { ValidationRule, ValidationResult } from './types';

/**
 * InvoiceValidationRule
 * 
 * Implements mandatory field and format checks specific to Invoices.
 */
export const InvoiceValidationRule: ValidationRule = {
  validate(data: Record<string, any>): ValidationResult {
    const mandatoryFields = [
      'invoice_number',
      'vendor_name',
      'date',
      'total_amount',
      'currency',
      'line_items',
    ];

    for (const field of mandatoryFields) {
      if (!data[field]) {
        return { isValid: false, error: new Error(`Invoice validation failed: Missing mandatory field '${field}'.`) };
      }
    }

    // Basic type and value checks
    if (typeof data.invoice_number !== 'string' || data.invoice_number.trim() === '') 
      return { isValid: false, error: new Error('Invoice validation failed: Invalid invoice_number.') };
    
    if (typeof data.vendor_name !== 'string' || data.vendor_name.trim() === '') 
      return { isValid: false, error: new Error('Invoice validation failed: Invalid vendor_name.') };
    
    if (typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/.test(data.date)) 
      return { isValid: false, error: new Error('Invoice validation failed: Invalid date format (expected ISO string).') };
    
    if (typeof data.total_amount !== 'number' || data.total_amount <= 0) 
      return { isValid: false, error: new Error('Invoice validation failed: Invalid total_amount.') };
    
    if (typeof data.currency !== 'string' || data.currency.length !== 3) 
      return { isValid: false, error: new Error('Invoice validation failed: Invalid currency (expected 3-letter code).') };
    
    if (!Array.isArray(data.line_items) || data.line_items.length === 0) 
      return { isValid: false, error: new Error('Invoice validation failed: Missing or empty line_items.') };

    return { isValid: true, error: null };
  }
};