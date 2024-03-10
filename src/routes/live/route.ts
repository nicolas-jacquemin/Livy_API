import express from "express";
const router = express.Router();
import requireAuth from "../../middlewares/requireAuth.js";
import LiveStreamCategory from "../../models/LiveStreamCategory.js";
import { QueryBuilder } from "../../resources/QueryBuilder.js";
import LiveStream from "../../models/LiveStream.js";
import { sendManifest, sendSupplierContent, addQueue, endQueue } from "../../controllers/play.js";
import User from "../../models/user.js";

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

  const user = await User.findById(req.userId);

  liveStream.liked = user?.likedLiveStreams.includes(liveStream.id) || false;

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

router.get("/:id/stream_icon", async (req, res) => {
  const liveStream = await LiveStream.findById(req.params.id)
  .select("stream_icon")
  .exec();
  if (!liveStream) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  try {
    const icon = await fetch(liveStream.stream_icon);
    res.set("Content-Type", icon.headers.get("Content-Type"));
    const buffer = await icon.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(404).json({ message: "Stream Icon Not Found" });
  }
});

export default router;
export { requireAuth as mainMiddleware };
