import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true, // size in bytes
    },
    url: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['image', 'code', 'document', 'other'],
      default: 'other',
    },
    textContent: {
      type: String,
      default: '', // stored for text/code preview & AI explanation
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ project: 1, category: 1 });

const FileModel = mongoose.model('File', fileSchema);

export default FileModel;

