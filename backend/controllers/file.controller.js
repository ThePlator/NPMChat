import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const file = req.file;
    
    // Basic virus scanning simulation (in real app, use actual antivirus)
    if (file.size > 5 * 1024 * 1024) {
      // Remove the uploaded file if it's too large
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit'
      });
    }

    // Create file URL
    const fileUrl = `/api/files/download/${file.filename}`;

    res.status(200).json({
      success: true,
      file: {
        url: fileUrl,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedName: file.filename
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Security check: ensure filename doesn't contain path traversal
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'File download failed'
    });
  }
};
