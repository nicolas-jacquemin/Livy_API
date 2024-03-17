import express from "express";

const router = express.Router();
import requireAuth from "../../middlewares/requireAuth.js";
import LiveStreamCategory from "../../models/LiveStreamCategory.js";
import {QueryBuilder} from "../../resources/QueryBuilder.js";
import LiveStream from "../../models/LiveStream.js";
import {addQueue} from "../../controllers/play.js";
import User from "../../models/user.js";
import xtreamCodesInstance from "../../services/xtream-codes.service.js";
import {fromBase64} from "../../utils/fromBase64.js";
import liveStream from "../../models/LiveStream.js";

router.get("/categories", async (req, res) => {
    const categories = await new QueryBuilder(LiveStreamCategory)
        .filter("search", "category_name", (value) => ({$regex: value, $options: "i"}))
        .select("-__v")
        .populate("streams", "-__v -category")
        .hide(["streams.epg"])
        .paginate(req);
    res.json(categories);
});

router.get("/categories/:id", async (req, res) => {
    try {
        const category = await LiveStreamCategory.findById(req.params.id)
            .populate("streams", "-__v -category -epg")
            .select("-__v")
            .exec();
        res.json(category);
    } catch (error) {
        res.status(404).json({message: "Not found"});
    }
});

router.get("/", async (req, res) => {
    const liveStreams = await new QueryBuilder(LiveStream)
        .filter("search", "name", (value) => ({$regex: value, $options: "i"}))
        .select("-__v")
        .sort(["name", "num"])
        .hide(["epg"])
        .paginate(req);
    res.json(liveStreams);
});

router.get("/:id", async (req, res) => {
    try {
        const liveStream = await LiveStream.findById(req.params.id)
            .select("-__v")
            .populate("category", "-__v -streams")
            .exec();

        const user = await User.findById(req.userId);

        liveStream.liked = user?.likedLiveStreams.includes(liveStream.id) || false;

        res.json(liveStream);
    } catch (error) {
        res.status(404).json({message: "Not found"});
    }
});

router.get("/:id/epg", async (req, res) => {
    try {
        const liveStreamEPG = await LiveStream.findById(req.params.id)
            .select("epg")
            .exec();

        res.json(liveStreamEPG);
    } catch (error) {
        res.status(404).json({message: "Not found"});
    }
});

router.get("/:id/epg/now", async (req, res) => {
    try {
        const liveStream = await LiveStream.findById(req.params.id)
            .select("stream_id")
            .exec();

        const epg = (await xtreamCodesInstance.getAllEPGLiveStreams(liveStream.stream_id)).epg_listings
            .map((el) => {
                el.title = fromBase64(el.title);
                el.description = fromBase64(el.description);
                return el;
            });
        res.json(epg);
    } catch (error) {
        res.status(404).json({message: "Not found"});
    }
});

router.get("/:id/play", async (req, res) => {
    try {
        const liveStream = await LiveStream.findById(req.params.id)
            .select("-__v")
            .populate("category", "-__v -streams")
            .exec();

        addQueue(req, res, liveStream);
    } catch (error) {
        res.status(404).json({message: "Not found"});
    }
});

router.get("/:id/stream_icon", async (req, res) => {
    try {
        const liveStream = await LiveStream.findById(req.params.id)
            .select("stream_icon")
            .exec();
        try {
            const icon = await fetch(liveStream.stream_icon);
            res.set("Content-Type", icon.headers.get("Content-Type"));
            const buffer = await icon.arrayBuffer();
            res.send(Buffer.from(buffer));
        } catch (error) {
            res.status(404).json({message: "Stream Icon Not Found"});
        }
    } catch (error) {
        res.status(404).json({message: "Not found"});
    }
});

export default router;
export {requireAuth as mainMiddleware};
