import express from "express";
const router = express.Router();
import requireAuth from "../../middlewares/requireAuth.js";
import LiveStreamCategory from "../../models/LiveStreamCategory.js";
import { QueryBuilder } from "../../resources/QueryBuilder.js";

router.get("/categories", async (req, res) => {
  const categories = await new QueryBuilder(LiveStreamCategory)
  .filter("search", "category_name", (value) => ({ $regex: value, $options: "i"}))
  .filter("id", "category_id")
  .select("-__v")
  .populate("streams", "-__v -category")
  .paginate(req);
  res.json(categories);
});

router.get("/categories/:id", async (req, res) => {
  const category = await LiveStreamCategory.findOne({ category_id: req.params.id })
  .populate("streams")
  .select("-__v")
  .exec();
  res.json(category);
});

export default router;
export { requireAuth as mainMiddleware };
