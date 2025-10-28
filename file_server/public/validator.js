export class FileValidator {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
      '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx',
      '.mp4', '.avi', '.mov', '.zip', '.rar'
    ];
  }

  validateFile(filename, size) {
    const result = { valid: true, errors: [] };

    if (!filename || filename.trim() === '') {
      result.valid = false;
      result.errors.push('No filename provided');
      return result;
    }

    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!this.allowedExtensions.includes(ext)) {
      result.valid = false;
      result.errors.push(`File extension '${ext}' not allowed`);
    }

    if (size > this.maxFileSize) {
      result.valid = false;
      result.errors.push(`File size exceeds limit of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    return result;
  }
}
