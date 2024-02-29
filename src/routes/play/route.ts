import express from 'express'
const router = express.Router();
import { get_item_from_url } from "../../items.js";
import { sendManifest, sendSupplierContent, addQueue, endQueue } from "../../controllers/play.js";
import requireAuth from "../../middlewares/requireAuth.js";

router.get('/content/supplier/:queueId/*', (req, res) => {
    sendSupplierContent(res, req.params.queueId, req.url);
});

router.get('/manifest/:queueId/index.m3u8', (req, res) => {
    sendManifest(res, req.params.queueId);
});

router.get('/request/:itemId', (req, res) => {
    if (isNaN(Number(req.params.itemId))) {
        res.status(400).send("Bad request");
        return;
    }
    get_item_from_url(Number(req.params.itemId), (item) => {
        if (item) {
            addQueue(req, res, item);
        } else {
            res.status(404).send("Not found");
        }
    })
});

router.get('/stop/:queueId', (req, res) => {
    endQueue(req, res, req.params.queueId);
});

export default router;
export { requireAuth as mainMiddleware }
