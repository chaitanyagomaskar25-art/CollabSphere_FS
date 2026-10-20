import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireProjectMember } from '../middleware/requireProjectRole.js';
import { getProjectAnalytics } from '../controller/analyticsController.js';

export const analyticsRoute = express.Router({ mergeParams: true });

analyticsRoute.get('/', protect, requireProjectMember, getProjectAnalytics);


