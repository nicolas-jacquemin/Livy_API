import express from 'express'
import requireAuth from '../../middlewares/requireAuth.js';
import LiveStream from '../../models/LiveStream.js';
import User from '../../models/user.js';
import { isDeepStrictEqual } from 'util';
const router = express.Router();

router.get('/', async (req, res) => {
  const me = await User.findById(req.userId)
  .populate('likedLiveStreams')
  .select('_id createdAt name email role likedLiveStreams');

  res.send(me);
});

router.post('/livestreams/like/:id', async (req, res) => {
  const me = await User.findById(req.userId);
  const liveStream = await LiveStream.findById(req.params.id)
  .catch(() => null);

  if (!liveStream) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  if (me.likedLiveStreams.includes(liveStream._id)) {
    res.status(400).json({ message: 'Already liked' });
    return;
  }

  me.likedLiveStreams.push(liveStream._id);
  await me.save();
  res.json({ message: 'Liked' });
});

router.post('/livestreams/unlike/:id', async (req, res) => {
  const me = await User.findById(req.userId);
  const liveStream = await LiveStream.findById(req.params.id)
  .catch(() => null);

  if (!liveStream) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  if (!me.likedLiveStreams.includes(liveStream._id)) {
    res.status(400).json({ message: 'Not liked' });
    return;
  }

  me.likedLiveStreams = me.likedLiveStreams.filter((ls) => !isDeepStrictEqual(ls, liveStream._id));
  await me.save();
  res.json({ message: 'Unliked' });
});

export default router;
export { requireAuth as mainMiddleware }
