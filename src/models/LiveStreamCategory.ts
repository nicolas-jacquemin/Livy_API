import db from "../services/db.js";

const liveStreamCategorySchema = new db.Schema({
  category_id: { type: String, required: true, index: { unique: true } },
  category_name: { type: String, required: true, index: true },
});

liveStreamCategorySchema.virtual("streams", {
  ref: "LiveStream",
  localField: "category_id",
  foreignField: "category",
});

const LiveStreamCategory = db.model(
  "LiveStreamCategory",
  liveStreamCategorySchema
);

export default LiveStreamCategory;
