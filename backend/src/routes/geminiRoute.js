import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { explainContent, generateCodeDocs, generateReadme, improveContet } from "../controller/geminiController.js";
import { aiLimiter } from "../middleware/rateLimit.js";

export const geminiRouter = Router()

geminiRouter.post("/explain", protect, aiLimiter, explainContent)
geminiRouter.post("/improve", protect,aiLimiter, improveContet)
geminiRouter.post("/docs", protect, aiLimiter, generateCodeDocs)
geminiRouter.post("/readme", protect, aiLimiter, generateReadme)


