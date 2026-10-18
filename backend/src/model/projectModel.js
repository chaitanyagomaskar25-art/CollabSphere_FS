import mongoose from 'mongoose';
import crypto from 'crypto';

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Project description cannot exceed 1000 characters'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    isPublic: {
      type: Boolean,
      default: false,
    },
    publicShareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    publicReadmeEnabled: {
      type: Boolean,
      default: false,
    },
    publicReadmeContent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to generate unique, unguessable public share ID
projectSchema.methods.generatePublicShareId = function () {
  this.publicShareId = crypto.randomBytes(16).toString('hex');
  this.isPublic = true;
  return this.publicShareId;
};

// Indexing for fast search and member lookup
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;

