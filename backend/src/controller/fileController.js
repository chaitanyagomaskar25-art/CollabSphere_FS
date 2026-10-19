import path from "path";
import FileModel from "../model/fileModel.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import fs from 'fs';
import mongoose from "mongoose";
import Analytics from "../model/analyticsModel.js";

const CODE_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".json",
  ".html",
  ".css",
  ".md",
  ".txt",
  ".java",
  ".cpp",
  ".c",
  ".go",
  ".rs",
  ".rb",
  ".sql",
  ".yaml",
  ".yml",
  ".env.example",
  ".sh",
  ".xml",
];

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

const DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".csv",
  ".xlsx",
  ".xls",
  ".ppt",
  ".pptx",
];


const categorizeFile = (filename = '', mimeType = '') => {
  const ext = path.extname(filename).toLowerCase();
  const type = mimeType.toLowerCase();

  if (IMAGE_EXTENSIONS.includes(ext) || type.startsWith('image/')) {
    return 'image';
  }

  if (
    CODE_EXTENSIONS.includes(ext) ||
    type.startsWith('text/') ||
    type.includes('json') ||
    type.includes('javascript')
  ) {
    return 'code';
  }

  if (
    DOCUMENT_EXTENSIONS.includes(ext) ||
    type.includes('pdf') ||
    type.includes('document')
  ) {
    return 'document';
  }

  return 'other';
};


export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded',
      });
    }

    const { originalname, filename, path: localFilePath, size, mimetype } = req.file;
    const projectId = req.project._id;
    const category = categorizeFile(originalname, mimetype);

    let textContent = '';
    if (category === 'code' && size < 500 * 1024) {
      try {
        textContent = fs.readFileSync(localFilePath, 'utf-8');
      } catch (readErr) {
        console.warn('Could not read text content:', readErr.message);
      }
    }

    let fileUrl = '';
    let cloudinaryPublicId = '';

    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          folder: `collabsphere/${projectId}`,
          resource_type: category === 'image' ? 'image' : 'raw',
          public_id: `${Date.now()}-${path.parse(originalname).name}`,
        });
        fileUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;

        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      } catch (cloudErr) {
        console.warn('[Cloudinary Error, using local fallback]:', cloudErr.message);
        fileUrl = `/api/projects/${projectId}/files/raw/${filename}`;
      }
    } else {
      fileUrl = `/api/projects/${projectId}/files/raw/${filename}`;
    }

    const newFile = await FileModel.create({
      originalName: originalname,
      storedName: filename,
      mimeType: mimetype,
      size,
      url: fileUrl,
      cloudinaryPublicId,
      category,
      textContent,
      project: projectId,
      uploader: req.user._id,
    });
     await Analytics.create({
      project: projectId,
      user: req.user._id,
      action: 'file_uploaded',
      targetName: originalname,
      targetId: newFile._id,
      metadata: { size, category },
    });

    const populated = await FileModel.findById(newFile._id).populate(
      'uploader',
      'name email avatar'
    );

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: populated,
    });
  } catch (error) {
    console.error('[UploadFile Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during file upload',
    });
  }
};



export const getProjectFiles = async (req, res) => {
  try {
    const projectId = req.project._id;
    const { category, search } = req.query;

    const query = { project: projectId };
    if (category && category !== "all") {
      query.category = category;
    }

    if (search && search.trim()) {
      query.originalName = new RegExp(search.trim(), "i");
    }

    const files = await FileModel.find(query)
      .populate("uploader", "name, email, avatar")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching project files",
    });
  }
};


export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const projectId = req.project._id;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file identifier',
      });
    }

    const file = await FileModel.findOne({ _id: fileId, project: projectId });
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const isUploader = file.uploader.toString() === req.user._id.toString();
    const isAdminOrOwner = req.userRole === 'admin' || req.userRole === 'owner';

    if (!isUploader && !isAdminOrOwner) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only the uploader or project admins can delete this file',
      });
    }

    // Delete from Cloudinary if stored there
    if (file.cloudinaryPublicId && isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
          resource_type: file.category === 'image' ? 'image' : 'raw',
        });
      } catch (cloudErr) {
        console.warn('Could not destroy Cloudinary asset:', cloudErr.message);
      }
    }

    // Delete from local disk if exists
    
    // Delete from local disk if the file exists locally
    if (file.storedName) {
      const localPath = path.join(
        '/tmp/collabsphere_uploads',
        file.storedName
      );

      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (diskErr) {
          console.warn(
            'Could not unlink local file:',
            diskErr.message
          );
        }
      }
    }


    await FileModel.findByIdAndDelete(fileId);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
  console.error('Error deleting file:', error);

  return res.status(500).json({
    success: false,
    message: error.message || 'Error deleting file',
  });
}

}


// export const downloadFile = async (req, res) => {
//   try {
//     const { fileId } = req.params;
//     const projectId = req.project._id;

//     if (!mongoose.Types.ObjectId.isValid(fileId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid file identifier',
//       });
//     }

//     const file = await FileModel.findOne({ _id: fileId, project: projectId });
//     if (!file) {
//       return res.status(404).json({
//         success: false,
//         message: 'File not found',
//       });
//     }

//     // If Cloudinary URL
//     if (file.url && file.url.startsWith('http')) {
//       return res.redirect(file.url);
//     }

//     // Local file fallback
//     const localPath = path.join('/tmp/collabsphere_uploads', file.storedName);
//     if (!fs.existsSync(localPath)) {
//       return res.status(404).json({
//         success: false,
//         message: 'Stored file was not found on disk',
//       });
//     }

//     return res.download(localPath, file.originalName);
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message || 'Error downloading file',
//     });
//   }};