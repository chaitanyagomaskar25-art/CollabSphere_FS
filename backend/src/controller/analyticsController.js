import Analytics from "../model/analyticsModel.js";
import FileModel from "../model/fileModel.js";
import Note from "../model/notesModel.js";

export const getProjectAnalytics = async (req, res) => {
  try {
    const projectId = req.project._id;

    // 1. Get total notes and files
    const [totalNotes, totalFiles, totalActivities] = await Promise.all([
      Note.countDocuments({ project: projectId }),
      FileModel.countDocuments({ project: projectId }),
      Analytics.countDocuments({ project: projectId }),
    ]);

    // 2. Get total members
    const totalMembers = req.project.members.length;

    // 3. Get files grouped by category for the pie chart
    const filesByCategory = await FileModel.aggregate([
      { $match: { project: projectId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Get recent project activities
    const recentActivities = await Analytics.find({
      project: projectId,
    })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(20);

    // 5. Send only the data required by the frontend
    return res.status(200).json({
      success: true,
      summary: {
        totalNotes,
        totalFiles,
        totalMembers,
        totalActivities,
      },
      filesByCategory,
      recentActivities,
    });
  } catch (error) {
    console.error("[Analytics Error]:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error compiling project analytics",
    });
  }
};
