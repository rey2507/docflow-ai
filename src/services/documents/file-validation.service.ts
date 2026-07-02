export const FILE_SIGNATURES: Record<string, Uint8Array[]> = {
  pdf: [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
  png: [new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
  jpg: [
    new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]),
    new Uint8Array([0xFF, 0xD8, 0xFF, 0xE1]),
    new Uint8Array([0xFF, 0xD8, 0xFF, 0xE8]),
  ],
  docx: [new Uint8Array([0x50, 0x4B, 0x03, 0x04])],
  xlsx: [new Uint8Array([0x50, 0x4B, 0x03, 0x04])],
  pptx: [new Uint8Array([0x50, 0x4B, 0x03, 0x04])],
  zip: [new Uint8Array([0x50, 0x4B, 0x03, 0x04])],
  ole: [new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])],
};

const EXECUTABLE_SIGNATURES: Uint8Array[] = [
  new Uint8Array([0x4D, 0x5A]),
  new Uint8Array([0x7F, 0x45, 0x4C, 0x46]),
  new Uint8Array([0xFE, 0xED, 0xFA, 0xCE]),
  new Uint8Array([0xFE, 0xED, 0xFA, 0xCF]),
];

export function detectFileType(file: File): { type: string; confidence: 'high' | 'medium' | 'low' } {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'pptx'];

  if (!allowedExtensions.includes(ext)) {
    return { type: 'unsupported', confidence: 'high' };
  }

  if (ext === 'doc') {
    return { type: 'doc', confidence: 'medium' };
  }

  // normalize jpeg
  if (ext === 'jpeg') return { type: 'jpg', confidence: 'medium' };

  // text-like files
  if (ext === 'txt' || ext === 'csv') return { type: ext, confidence: 'high' };

  // office formats that are zipped packages (docx, xlsx, pptx)
  if (ext === 'docx' || ext === 'xlsx' || ext === 'pptx') return { type: ext, confidence: 'medium' };

  return { type: ext, confidence: 'medium' };
}

export async function validateFileSignature(file: File): Promise<{ valid: boolean; detectedType?: string; error?: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const buffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  for (const [type, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      if (bytes.length >= signature.length) {
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
          if (bytes[i] !== signature[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          return { valid: true, detectedType: type };
        }
      }
    }
  }

  // If file is empty or too small to check, allow it
  if (bytes.length === 0) {
    return { valid: false, error: 'File is empty or unreadable.' };
  }

  // Allow text-based files (.txt, .csv) if content does not look like an executable
  if (ext === 'txt' || ext === 'csv') {
    const isExecutable = EXECUTABLE_SIGNATURES.some(sig => {
      if (bytes.length >= sig.length) {
        return sig.every((b, i) => bytes[i] === b);
      }
      return false;
    });
    if (!isExecutable) {
      return { valid: true, detectedType: ext };
    }
    return { valid: false, error: 'File type does not match its extension. Upload rejected for security.' };
  }

  // No signature match found
  return { valid: false, error: 'File type does not match its extension. Upload rejected for security.' };
}

export function validateFileSize(file: File, maxSizeBytes: number = 25 * 1024 * 1024): { valid: boolean; error?: string } {
  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File exceeds maximum size of ${Math.round(maxSizeBytes / 1024 / 1024)}MB.` };
  }
  return { valid: true };
}

export function getFileTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    pdf: 'PDF Document',
    png: 'PNG Image',
    jpg: 'JPEG Image',
    doc: 'Word Document (DOC)',
    docx: 'Word Document (DOCX)',
    xlsx: 'Spreadsheet (XLSX)',
    pptx: 'Presentation (PPTX)',
    csv: 'CSV (Comma-separated values)',
    txt: 'Plain text',
  };
  return labels[type] || 'Unknown';
}
