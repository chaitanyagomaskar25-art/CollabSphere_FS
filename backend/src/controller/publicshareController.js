import Analytics from "../model/analyticsModel.js";
import Project from "../model/projectModel.js";

export const enablePublicSharing = async (req, res) => {
  try {


    const { publicReadmeEnabled, publicReadmeContent } = req.body;
    const project = req.project;

    if (!project.publicShareId) {
      project.generatePublicShareId();
    } else {
      project.isPublic = true;
    }

    if (typeof publicReadmeEnabled === 'boolean') {
      project.publicReadmeEnabled = publicReadmeEnabled;
    }

    if (typeof publicReadmeContent === 'string') {
      project.publicReadmeContent = publicReadmeContent;
    }

    await project.save();

    await Analytics.create({
      project: project._id,
      user: req.user._id,
      action: 'project_published',
      targetName: project.name,
      metadata: { publicShareId: project.publicShareId },
    });

    return res.status(200).json({
      success: true,
      message: 'Project public sharing enabled',
      isPublic: project.isPublic,
      publicShareId: project.publicShareId,
      publicReadmeEnabled: project.publicReadmeEnabled,
      publicReadmeContent: project.publicReadmeContent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error configuring public sharing',
    });
  }
};



export const disablePublicSharing = async (req, res) => {
  try {
    const project = req.project;

    project.isPublic = false;
    await project.save();

    await Analytics.create({
      project: project._id,
      user: req.user._id,
      action: 'project_unpublished',
      targetName: project.name,
    });

    return res.status(200).json({
      success: true,
      message: 'Public sharing disabled',
      isPublic: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error disabling public sharing',
    });
  }
};



export const getPublicProject = async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!shareId || shareId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Share ID is required',
      });
    }


    const project = await Project.findOne({
      publicShareId: shareId,
      isPublic: true,
    }).populate('owner', 'name avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Public project not found or sharing has been disabled by the owner',
      });
    }

    return res.status(200).json({
      success: true,
      project: {
        name: project.name,
        description: project.description,
        tags: project.tags,
        owner: {
          name: project.owner?.name || 'Maintainer',
          avatar: project.owner?.avatar || '',
        },
        publicReadmeEnabled: project.publicReadmeEnabled,
        publicReadmeContent: project.publicReadmeEnabled ? project.publicReadmeContent : '',
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving public project',
    });
  }
};

