import express from "express";
const router = express.Router();
import requireAuth from "../../middlewares/requireAuth.js";
import LiveStreamCategory from "../../models/LiveStreamCategory.js";
import { QueryBuilder } from "../../resources/QueryBuilder.js";

router.get("/categories", async (req, res) => {
  const categories = await new QueryBuilder(LiveStreamCategory)
  .filter("search", "category_name", (value) => ({ $regex: value, $options: "i"}))
  .filter("id", "category_id")
  .paginate(req);
  res.json(categories);
});

export default router;
export { requireAuth as mainMiddleware };
