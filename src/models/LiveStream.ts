import db from "../services/db.js";
import {XmltvProgramme} from "@iptv/xmltv";

const liveStreamSchema = new db.Schema({
    num: {type: Number, required: true, index: {unique: true}},
    name: {type: String, required: true, index: true},
    internal_name: {type: String, required: false},
    stream_id: {type: Number, required: true},
    stream_icon: {type: String},
    stream_type: {type: String},
    epg_channel_id: {type: String},
    epg: {type: Array, default: []},
    liked: {type: Boolean, readonly: true},
    category: {type: db.Schema.Types.ObjectId, ref: "LiveStreamCategory", index: true},
    enabled: {type: Boolean, required: true, default: true, select: false},
}, {toJSON: {virtuals: true}});

liveStreamSchema.virtual("epg_now")
    .get(function () {
        const now = new Date();
        return this.epg?.find((epg) => epg.start <= now && epg.stop >= now);
    });

const LiveStream = db.model("LiveStream", liveStreamSchema);

export type LiveStreamDocument = db.Document & {
    num: number;
    name: string;
    internal_name?: string;
    stream_id: number;
    stream_icon?: string;
    stream_type?: string;
    epg_channel_id?: string;
    epg?: XmltvProgramme[];
    epg_now?: XmltvProgramme;
    category?: db.Types.ObjectId;
    liked?: boolean;
    enabled: boolean;
};

export default LiveStream;
