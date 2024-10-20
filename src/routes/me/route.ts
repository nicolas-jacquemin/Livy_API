import express from 'express'
import requireAuth from '../../middlewares/requireAuth.js';
import LiveStream, {LiveStreamDocument} from '../../models/LiveStream.js';
import User from '../../models/user.js';
import {isDeepStrictEqual} from 'util';

const router = express.Router();

router.get('/', async (req, res) => {
    const me = await User.findById(req.userId)
        .populate({
            path: 'likedLiveStreams',
            populate: {
                path: 'category',
                select: '-streams -__v'
            },
            select: '-__v'
        })
        .select('_id createdAt name email role likedLiveStreams');

    const epgTrimmed = JSON.parse(JSON.stringify(me));

    epgTrimmed.likedLiveStreams.forEach((ls: LiveStreamDocument) => {
        delete ls.epg;
    });

    res.send(epgTrimmed);
});

router.post('/livestreams/like/:id', async (req, res) => {
    const me = await User.findById(req.userId);
    const liveStream = await LiveStream.findById(req.params.id)
        .catch(() => null);

    if (!liveStream) {
        res.status(404).json({message: 'Not found'});
        return;
    }

    if (me.likedLiveStreams.includes(liveStream._id)) {
        res.status(400).json({message: 'Already liked'});
        return;
    }

    me.likedLiveStreams.push(liveStream._id);
    await me.save();
    res.json({message: 'Liked'});
});

router.delete('/livestreams/like/:id', async (req, res) => {
    const me = await User.findById(req.userId);
    const liveStream = await LiveStream.findById(req.params.id)
        .catch(() => null);

    if (!liveStream) {
        res.status(404).json({message: 'Not found'});
        return;
    }

    if (!me.likedLiveStreams.includes(liveStream._id)) {
        res.status(400).json({message: 'Not liked'});
        return;
    }

    me.likedLiveStreams = me.likedLiveStreams.filter((ls) => !isDeepStrictEqual(ls, liveStream._id));
    await me.save();
    res.json({message: 'Unliked'});
});

export default router;
export {requireAuth as mainMiddleware}
