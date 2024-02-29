import db from "../services/db.js";

const liveStreamCategorySchema = new db.Schema({
  category_id: { type: String, required: true, index: { unique: true } },
  category_name: { type: String, required: true, index: true },
  streams: [{ type: db.Schema.Types.ObjectId, ref: "LiveStream" }],
});

const LiveStreamCategory = db.model(
  "LiveStreamCategory",
  liveStreamCategorySchema
);

export default LiveStreamCategory;
