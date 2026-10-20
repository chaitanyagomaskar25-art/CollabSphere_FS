import express from 'express';
import { disablePublicSharing, enablePublicSharing } from '../controller/publicshareController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireProjectAdmin } from '../middleware/requireProjectRole.js';

export const shareRoute = express.Router({ mergeParams: true });

shareRoute.post("/", protect,requireProjectAdmin,enablePublicSharing)

shareRoute.patch("/", protect,requireProjectAdmin,disablePublicSharing)


