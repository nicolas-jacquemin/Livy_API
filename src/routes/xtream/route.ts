import express from "express";
const router = express.Router();
import requireAuth from "../../middlewares/requireAuth.js";
import { XtreamCodesService } from "../../services/xtream-codes.service.js";
import requireAdmin from "../../middlewares/requireAdmin.js";

router.post("/live/scan", async (req, res) => {
  const xtreamService = XtreamCodesService.getInstance();
  try {
    await xtreamService.scanLiveStreams();
    res.json({ message: "Scanned successfully" });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

export default express.Router().use("", requireAdmin, router);
export { requireAuth as mainMiddleware };
