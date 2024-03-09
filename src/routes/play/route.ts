import express from 'express'
const router = express.Router();
import { sendManifest, sendSupplierContent, endQueue } from "../../controllers/play.js";
import requireAuth from "../../middlewares/requireAuth.js";

router.get('/content/supplier/:queueId/*', (req, res) => {
    sendSupplierContent(res, req.params.queueId, req.url);
});

router.get('/manifest/:queueId/index.m3u8', (req, res) => {
    sendManifest(res, req.params.queueId);
});

router.get('/stop/:queueId', (req, res) => {
    endQueue(req, res, req.params.queueId);
});

export default router;
export { requireAuth as mainMiddleware }
