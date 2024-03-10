import express from "express";
const router = express.Router();
import requireAuth from "../../middlewares/requireAuth.js";
import { getSessions } from "../../controllers/play.js";

router.get("/", async (req, res) => {
  const sessions = await getSessions();
  res.json(sessions);
});

export default router;
export { requireAuth as mainMiddleware };
