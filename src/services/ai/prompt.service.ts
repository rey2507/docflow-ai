import { DocumentType } from '../../types/document';

/**
 * PromptService
 * 
 * Centralizes all AI prompt templates and generation logic.
 * Ensures consistent instructions and structured output formatting across the app.
 */

export const PromptService = {
  /**
   * Generates a prompt for extracting data from a specific document type.
   * 
   * @param type The category of the document.
   * @param context Optional additional instructions or context.
   */
  getExtractionPrompt(type: DocumentType, context?: string): string {
    const baseInstructions = `
      You are an expert document analysis AI. 
      Your task is to extract structured data from the provided text.
      
      IMPORTANT:
      1. For every field specified in the EXTRACTION SCHEMA, you must return an object with:
         - "value": The extracted information (following the requested type).
         - "confidence": A float between 0.0 and 1.0 representing your certainty.
      
      2. Additionally, include a top-level field "validation_suggestions" (array of strings).
         Provide actionable advice if data is missing, conflicting, or has low confidence (e.g., "Invoice date is blurry, please verify").
      
      Example output structure: 
      { 
        "field_name": { "value": "extracted_data", "confidence": 0.98 },
        "validation_suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"]
      }

      Return ONLY a valid JSON object. Do not include markdown formatting, backticks, or explanations.
    `;

    const templates: Record<DocumentType, string> = {
      invoice: `
        Extract the following fields from this invoice:
        - invoice_number (string)
        - vendor_name (string)
        - date (ISO date string)
        - total_amount (number)
        - currency (3-letter code)
        - line_items (array of objects with: description, quantity, unit_price, total)
      `,
      contract: `
        Extract the following fields from this contract:
        - contract_type (string)
        - parties (array of strings)
        - effective_date (ISO date string)
        - expiration_date (ISO date string)
        - key_obligations (short summary string)
      `,
      form: `Extract all visible form fields and their corresponding values as key-value pairs.`,
      image: `Describe the contents of the image and extract any visible text or numerical data points.`,
      spreadsheet: `Summarize the data structure and extract key column headers and row totals.`,
      other: `Summarize the document and extract any relevant metadata, dates, or entities.`
    };

    const specificInstructions = templates[type] || templates['other'];
    
    return `
      ${baseInstructions}
      
      DOCUMENT TYPE: ${type.toUpperCase()}
      
      EXTRACTION SCHEMA:
      ${specificInstructions}
      
      ${context ? `ADDITIONAL BUSINESS RULES:\n${context}` : ''}
      
      [START OF DOCUMENT TEXT]
    `.trim();
  }
};