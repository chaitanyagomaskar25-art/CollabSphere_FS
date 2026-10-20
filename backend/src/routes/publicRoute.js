import express from 'express';
import { getPublicProject } from '../controller/publicshareController.js';

export const publicRouter = express.Router(); 

publicRouter.get('/projects/:shareId', getPublicProject);