export const FILE_CONFIG = {
  maxSizeMB: 10,
  maxSizeBytes: 10 * 1024 * 1024, // 10MB

  // Allowed types for a developer chat platform
  allowedTypes: [
    // Images
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    // Documents
    "application/pdf", "text/plain", "text/markdown",
    "application/json", "text/csv",
    // Code files
    "text/javascript", "text/typescript", "text/html", "text/css",
    "text/x-python", "text/x-java-source",
    // Archives (safe)
    "application/zip",
  ],

  // Blocked extensions (double-check beyond MIME type)
  blockedExtensions: [
    ".exe", ".sh", ".bat", ".cmd", ".ps1", ".php",
    ".py", ".rb", ".pl", ".vbs", ".js", // executables
    ".dll", ".so", ".dylib",             // binaries
  ],
} as const;

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateFile(file: File): ValidationResult {
  // Check size
  if (file.size > FILE_CONFIG.maxSizeBytes) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `File too large (${sizeMB}MB). Maximum allowed size is ${FILE_CONFIG.maxSizeMB}MB.`,
    };
  }

  // Check MIME type
  if (!FILE_CONFIG.allowedTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: `File type "${file.type || "unknown"}" is not allowed. Only images, documents, and code files are permitted.`,
    };
  }

  // Check extension (defense in depth)
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (FILE_CONFIG.blockedExtensions.includes(ext as any)) {
    return {
      valid: false,
      error: `Files with extension "${ext}" are not allowed for security reasons.`,
    };
  }

  return { valid: true };
}
