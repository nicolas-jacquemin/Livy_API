import { Player } from 'xtream-codes';
import LiveStream from '../models/LiveStream.js';
import LiveStreamCategory from '../models/LiveStreamCategory.js';

export class XtreamCodesService {
  private static instance: XtreamCodesService;
  private player: Player;

  private constructor() {
    this.player = new Player({
      baseUrl: process.env.XTREAM_CODES_BASE_URL,
      auth: {
        username: process.env.XTREAM_CODES_USERNAME,
        password: process.env.XTREAM_CODES_PASSWORD
      }
    });
  }

  public static getInstance(): XtreamCodesService {
    if (!XtreamCodesService.instance) {
      XtreamCodesService.instance = new XtreamCodesService();
    }
    return XtreamCodesService.instance;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public scanLiveStreams = async () => {
    const categories = await this.player.getLiveStreamCategory();
    for (const category of categories) {
      if (!(await LiveStreamCategory.exists({ category_id: category.category_id }))) {
        await (await LiveStreamCategory.create(category)).save();
      }
      const categoryEntity = await LiveStreamCategory.findOne({ category_id: category.category_id });
      const liveStreams = await this.player.getLiveStreams(category.category_id);
      for (const liveStream of liveStreams) {
        if (!(await LiveStream.exists({ num: liveStream.num }))) {
          const liveStreamEntity = await LiveStream.create({...liveStream, category: categoryEntity._id});
          await liveStreamEntity.save();
          categoryEntity.streams.push(liveStreamEntity._id);
          await categoryEntity.save();
        }
      }
    }
  }
}

const xtreamCodesInstance = new Player({
  baseUrl: process.env.XTREAM_CODES_BASE_URL,
  auth: {
    username: process.env.XTREAM_CODES_USERNAME,
    password: process.env.XTREAM_CODES_PASSWORD
  }
});

export default xtreamCodesInstance; 