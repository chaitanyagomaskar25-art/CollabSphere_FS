import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireProjectMember } from "../middleware/requireProjectRole.js";
import { deleteFile, getProjectFiles, uploadFile } from "../controller/fileController.js";
import { upload } from "../middleware/upload.js";

export const fileRouter = Router({ mergeParams: true });


fileRouter.get("/", protect, requireProjectMember, getProjectFiles)

fileRouter.post("/", protect, requireProjectMember, upload.single('file'), uploadFile)

fileRouter.delete("/:fileId", protect, requireProjectMember, deleteFile)


// fileRouter.get('/:fileId/download',protect, requireProjectMember, downloadFile);
