import db from "../services/db.js";

const liveStreamSchema = new db.Schema({
  num: { type: Number, required: true, index: { unique: true } },
  name: { type: String, required: true, index: true },
  stream_id: { type: Number, required: true },
  stream_icon: { type: String },
  category: { type: db.Schema.Types.ObjectId, ref: "LiveStreamCategory", index: true},
});

const LiveStream = db.model("LiveStream", liveStreamSchema);

export default LiveStream;
