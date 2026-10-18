import { Router } from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, inviteMember, removeMember, updateMemberRole, updateProject } from "../controller/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireProjectAdmin, requireProjectMember, requireProjectOwner } from "../middleware/requireProjectRole.js";


export const projectRouter = Router()


projectRouter.get("/",protect, getAllProjects)

projectRouter.post("/", protect ,createProject)

projectRouter.delete("/:projectId", protect, requireProjectOwner, deleteProject)


projectRouter.put("/:projectId", protect, requireProjectAdmin, updateProject)


projectRouter.post('/:projectId/members', protect, requireProjectAdmin, inviteMember);

projectRouter.get("/:projectId",protect, requireProjectMember, getProjectById)



projectRouter.delete('/:projectId/members/:userId', protect, requireProjectMember, removeMember);

projectRouter.patch('/:projectId/members/:userId', protect, requireProjectOwner, updateMemberRole)
