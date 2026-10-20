import Analytics from "../model/analyticsModel.js";
import Project from "../model/projectModel.js";
import { User } from "../model/userModel.js";

export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, tag } = req.query;

    const filter = {
      $or: [
        { owner: userId },
        { "members.user": userId },
      ],
    };

    // Filter by project name or description.
    if (search?.trim()) {
      filter.$and = [
        {
          $or: [
            { name: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
          ],
        },
      ];
    }

    // Filter projects by the selected tag.
    if (tag?.trim()) {
      filter.tags = {
        $in: [tag.trim()],
      };
    }

    const projects = await Project.find(filter)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch projects",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    if (!name || name.trim() === "") {
      return res.json({
        message: "Name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      tags,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

     await Analytics.create({
      project: project._id,
      user: req.user._id,
      action: 'project_created',
      targetName: project.name,
      targetId: project._id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("[CreateProject Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating project",
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const member = project.members.find(
      (m) => m.user?._id.toString() === req.user._id.toString(),
    );

    return res.status(200).json({
      success: true,
      project,
      userRole: member?.role || "owner",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await Analytics.deleteMany({ project: projectId });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting project",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const project = req.project;

    if (name) project.name = name.trim();
    project.description = description.trim(); 
    project.tags = tags;

    await project.save();

    await Analytics.create({
      project: project._id,
      user: req.user._id,
      action: 'project_updated',
      targetName: project.name,
      targetId: project._id,
    });

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updated,
      userRole: req.userRole,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating project',
    });
  }
};



export const inviteMember = async (req, res) => {
  try {
    const { email, role = "member" } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required to invite a member",
      });
    }

    if (!["member", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be member or admin",
      });
    }

    const emailNormalized = email.trim().toLowerCase();

    const userToInvite = await User.findOne({
      email: emailNormalized,
    });

    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        message: "No registered user found with this email",
      });
    }

    const project = req.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const alreadyMember = project.members.some((member) => {
      const memberUserId = member.user?._id ?? member.user;
      return memberUserId?.toString() === userToInvite._id.toString();
    });

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "This user is already a member of the project",
      });
    }

    project.members.push({
      user: userToInvite._id,
      role,
      joinedAt: new Date(),
    });

    await project.save();

    await Analytics.create({
      project: project._id,
      user: req.user._id,
      action: 'member_invited',
      targetName: userToInvite.name,
      targetId: userToInvite._id,
      metadata: { role },
    });
    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return res.status(200).json({
      success: true,
      message: `User ${userToInvite.name} invited as ${role}`,
      members: updatedProject.members,
    });
  } catch (error) {
    console.error("Invite member error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error inviting member",
    });
  }
};



export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = req.project;
    const currentUserId = req.user._id.toString();

    if (project.owner._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'The project owner cannot be removed from the project',
      });
    }

    // Admins cannot remove other admins or owner
    if (req.userRole === 'admin' && currentUserId !== userId) {
      const targetMember = project.members.find(
        (m) => m.user && m.user._id.toString() === userId
      );
      if (targetMember && targetMember.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admins cannot remove other admins. Only the owner can.',
        });
      }
    }

    // Regular members can only remove themselves (leave)
    if (req.userRole === 'member' && currentUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove yourself from the project',
      });
    }

    project.members = project.members.filter(
      (m) => m.user && m.user._id.toString() !== userId
    );

    await project.save();

    await Analytics.create({
      project: project._id,
      user: req.user._id,
      action: 'member_removed',
      targetId: userId,
    });

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    return res.status(200).json({
      success: true,
      message: 'Member removed from project',
      members: updated.members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error removing member',
    });
  }
};



export const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const project = req.project;

    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'member' or 'admin'",
      });
    }

    if (project.owner._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify the role of the project owner',
      });
    }

    const member = project.members.find(
      (m) => m.user && m.user._id.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this project',
      });
    }

    member.role = role;
    await project.save();

    await Analytics.create({
      project: project._id,
      user: req.user._id,
      action: 'member_role_updated',
      targetId: member.user._id,
      metadata: { newRole: role },
    });

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      members: updated.members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating member role',
    });
  }
};