import { Router } from "express";
import healthRoutes from "./health.js";
import collectionsRoutes from "./collections.js";
import searchRoutes from "./search.js";
import documentsRoutes from "./documents.js";

const router = Router();

// Mount all route modules on their respective paths
router.use("/health", healthRoutes);
router.use("/collections", collectionsRoutes);
router.use("/search", searchRoutes);
router.use("/ai-search", searchRoutes);
router.use("/count", documentsRoutes);
router.use("/add", documentsRoutes);

export default router;
