import express from "express";

const router = express.Router();
import requireAuth from "../../middlewares/requireAuth.js";
import {XtreamCodesService} from "../../services/xtream-codes.service.js";
import requireAdmin from "../../middlewares/requireAdmin.js";
import {XMLTVGrabber} from "../../services/xmltv-grabber.service.js";
import fs from "fs";
import LiveStream from "../../models/LiveStream.js";

router.post("/live/scan", async (req, res) => {
    const xtreamService = XtreamCodesService.getInstance();
    try {
        await xtreamService.scanLiveStreams();
        res.json({message: "Scanned successfully"});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post("/live/xmltv/populate", async (req, res) => {
    const xmlTVService = new XMLTVGrabber(process.env.XMLTV_URL);
    try {
        await xmlTVService.fetchAndParseXMLTV();
        await xmlTVService.populateLiveStreams();
        res.json({message: "Livestreams populated with EPG data"});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});
router.post("/live/xmltv/fetchEpg", async (req, res) => {
    const xmlTVService = new XMLTVGrabber(process.env.XMLTV_URL);
    try {
        await xmlTVService.fetchAndParseXMLTV();
        await xmlTVService.fetchEPGEventLiveStreams();
        res.json({message: "EPG Fetched and synced with livestreams"});
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post("/live/:livestreamId/xmltv/fetchEpg", async (req, res) => {
    const xmlTVService = new XMLTVGrabber(process.env.XMLTV_URL);
    try {
        const liveStream = await LiveStream.findById(req.params.livestreamId);
        await xmlTVService.fetchAndParseXMLTV();
        await xmlTVService.fetchEPGEventLiveStream(liveStream);
        res.json(liveStream);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});

router.post("/live/:livestreamId/xmltv/populate", async (req, res) => {
    const xmlTVService = new XMLTVGrabber(process.env.XMLTV_URL);
    try {
        const liveStream = await LiveStream.findById(req.params.livestreamId);
        await xmlTVService.fetchAndParseXMLTV();
        await xmlTVService.populateLiveStream(liveStream);
        res.json(liveStream);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
});


export default express.Router().use("", requireAdmin, router);
export {requireAuth as mainMiddleware};
