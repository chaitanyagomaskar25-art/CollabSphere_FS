import Analytics from "../model/analyticsModel.js";
import Note from "../model/notesModel.js";
import mongoose from "mongoose";

export const getProjectNotes = async (req, res) => {
  try {
    const projectId = req.project._id;
    const { search, tag } = req.query;

    const query = { project: projectId };

    if (search && search.trim()) {
      query.$or = [
        { title: new RegExp(search.trim(), "i") },
        { content: new RegExp(search.trim(), "i") },
      ];
    }

    if (tag && tag.trim()) {
      query.tags = tag.trim();
    }

    const notes = await Note.find(query)
      .populate("author", "name email avatar")
      .sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("[GetProjectNotes Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching notes",
    });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, tags, isPinned } = req.body;
    const projectId = req.project._id;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note title is required",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content || "",
      project: projectId,
      author: req.user._id,
      tags,
      isPinned: Boolean(isPinned),
    });

    await Analytics.create({
      project: projectId,
      user: req.user._id,
      action: 'note_created',
      targetName: note.title,
      targetId: note._id,
    });

    const populatedNote = await Note.findById(note._id).populate(
      "author",
      "name email avatar",
    );

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      note: populatedNote,
    });
  } catch (error) {
    console.error("[CreateNote Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating note",
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const projectId = req.project._id;
    const { title, content, tags, isPinned } = req.body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note identifier',
      });
    }

    const note = await Note.findOne({ _id: noteId, project: projectId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const isAuthor = note.author.toString() === req.user._id.toString();
    const isAdminOrOwner = req.userRole === 'admin' || req.userRole === 'owner';

    if (!isAuthor && !isAdminOrOwner) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only the note author or project admins can edit this note',
      });
    }

    if (title && title.trim()) note.title = title.trim();
    if (typeof content === 'string') note.content = content;
    if (typeof isPinned === 'boolean') note.isPinned = isPinned;
    note.tags = tags;
    
    await note.save();

    await Analytics.create({
      project: projectId,
      user: req.user._id,
      action: 'note_updated',
      targetName: note.title,
      targetId: note._id,
    });

    const updated = await Note.findById(note._id).populate(
      'author',
      'name email avatar'
    );

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updated,
    });
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating note',
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const projectId = req.project._id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note identifier',
      });
    }

    const note = await Note.findOne({ _id: noteId, project: projectId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const isAuthor = note.author.toString() === req.user._id.toString();
    const isAdminOrOwner = req.userRole === 'admin' || req.userRole === 'owner';

    if (!isAuthor && !isAdminOrOwner) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only the note author or project admins can delete this note',
      });
    }

    await Note.findByIdAndDelete(noteId);

    await Analytics.create({
      project: projectId,
      user: req.user._id,
      action: 'note_deleted',
      targetName: note.title,
    });

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting note',
    });
  }
};


export const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    const projectId = req.project._id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note identifier',
      });
    }

    const note = await Note.findOne({ _id: noteId, project: projectId }).populate(
      'author',
      'name email avatar'
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found in this project',
      });
    }

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching note',
    });
  }
};