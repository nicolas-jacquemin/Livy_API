declare module 'xtream-codes' {

  export type LiveStream = {
    num: number;
    name: string;
    stream_id: number;
    stream_icon: string;
    category: LiveStreamCategory;
    epg_channel_id: string;
  };

  export type LiveStreamCategory = {
    category_id: string;
    category_name: string;
    streams: LiveStream[];
  };

  export type EPGContent = {
    id: string;
    epq_id: string;
    title: string;
    lang: string;
    start: string;
    end: string;
    description: string;
    channel_id: string;
    start_timestamp: number;
    stop_timestamp: number;
    now_playing: boolean;
    has_archive: boolean;
  };

  type EPGLiveStreamResponse = {
    epg_listings: EPGContent[];
  }

  export class Player {
    constructor(options: {
      baseUrl: string;
      auth: {
        username: string;
        password: string;
      }
    });
    setBaseURL(url: string): void;
    setAuth(username: string, password: string): void;
    execute(method: string, filter: any): Promise<any>;
    getAccountInfo(): Promise<any>;
    getLiveStreamCategory(): Promise<LiveStreamCategory[]>;
    getVODStreamCategories(): Promise<any>;
    getLiveStreams(category: string): Promise<LiveStream[]>;
    getVODStreams(category: string): Promise<any>;
    getVODInfo(streamId: number): Promise<any>;
    getEPGLivetreams(streamId: string, limit: number): Promise<EPGLiveStreamResponse>;
    getAllEPGLiveStreams(streamId: string | number): Promise<EPGLiveStreamResponse>;
  }
}