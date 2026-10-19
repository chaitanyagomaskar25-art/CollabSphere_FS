import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'project_created',
        'project_updated',
        'member_invited',
        'member_removed',
        'member_role_updated',
        'note_created',
        'note_updated',
        'note_deleted',
        'file_uploaded',
        'file_deleted',
        'readme_generated',
        'project_published',
        'project_unpublished',
      ],
    },
    targetName: {
      type: String,
      default: '',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ project: 1, createdAt: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;

