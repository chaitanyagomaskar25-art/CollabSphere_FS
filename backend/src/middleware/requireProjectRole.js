import Project from "../model/projectModel.js";

export const requireProjectOwner = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can delete this project",
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error("Project owner middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Error checking project ownership",
    });
  }
};




export const requireProjectAdmin = async (req, res, next) => {
  try {
    
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const currentUserId = req.user._id.toString();

    const isOwner =
      project.owner.toString() === currentUserId;

    const membership = project.members.find((member) => {
      const memberUserId = member.user?._id ?? member.user;
      return memberUserId?.toString() === currentUserId;
    });

    const isAdmin = membership?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner or admins can perform this action",
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error("Project authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Error checking project permissions",
    });
  }
};




export const requireProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const currentUserId = req.user._id.toString();

    // Check whether the user owns the project.
    const isOwner =
      project.owner.toString() === currentUserId;

    // Check whether the user is in the members array.
    const isMember = project.members.some((member) => {
      const memberUserId = member.user?._id ?? member.user;

      return memberUserId?.toString() === currentUserId;
    });

    // Allow the owner and all project members.
    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    // Make the project available to the controller.
    req.project = project;

    next();
  } catch (error) {
    console.error("Project member middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Error checking project membership",
    });
  }
};

