import express from "express";
const router = express.Router();
import requireAuth from "../../middlewares/requireAuth.js";
import LiveStreamCategory from "../../models/LiveStreamCategory.js";
import { QueryBuilder } from "../../resources/QueryBuilder.js";
import LiveStream from "../../models/LiveStream.js";
import { sendManifest, sendSupplierContent, addQueue, endQueue } from "../../controllers/play.js";

router.get("/categories", async (req, res) => {
  const categories = await new QueryBuilder(LiveStreamCategory)
  .filter("search", "category_name", (value) => ({ $regex: value, $options: "i"}))
  .select("-__v")
  .populate("streams", "-__v -category")
  .paginate(req);
  res.json(categories);
});

router.get("/categories/:id", async (req, res) => {
  const category = await LiveStreamCategory.findById(req.params.id)
  .populate("streams")
  .select("-__v")
  .exec();
  res.json(category);
});

router.get("/", async (req, res) => {
  const liveStreams = await new QueryBuilder(LiveStream)
  .filter("search", "name", (value) => ({ $regex: value, $options: "i"}))
  .select("-__v")
  .sort(["name", "num"])
  .paginate(req);
  res.json(liveStreams);
});

router.get("/:id", async (req, res) => {
  const liveStream = await LiveStream.findById(req.params.id)
  .select("-__v")
  .populate("category", "-__v -streams")
  .exec();
  res.json(liveStream);
});

router.get("/:id/play", async (req, res) => {
  const liveStream = await LiveStream.findById(req.params.id)
  .select("-__v")
  .populate("category", "-__v -streams")
  .exec();
  
  if (!liveStream) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  addQueue(req, res, liveStream);
});

export default router;
export { requireAuth as mainMiddleware };
