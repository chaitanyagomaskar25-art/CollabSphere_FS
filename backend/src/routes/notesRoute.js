import { Router } from "express";
import { createNote, deleteNote, getNoteById, getProjectNotes, updateNote } from "../controller/noteController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireProjectMember } from "../middleware/requireProjectRole.js";

export const noteRoutes = Router({ mergeParams: true });

noteRoutes.get("/",protect,requireProjectMember, getProjectNotes)

noteRoutes.post("/", protect, requireProjectMember, createNote) 

noteRoutes.put("/:noteId", protect, requireProjectMember, updateNote)

noteRoutes.delete("/:noteId", protect, requireProjectMember, deleteNote)

noteRoutes.get("/:noteId", protect, requireProjectMember, getNoteById)
