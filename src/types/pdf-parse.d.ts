declare module 'pdf-parse' {
  function pdfParse(data: Buffer | Uint8Array | ArrayBuffer | { text?: string }): Promise<{ text: string }>
  export default pdfParse;
}
