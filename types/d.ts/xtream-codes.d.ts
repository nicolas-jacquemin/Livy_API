declare module 'xtream-codes' {

  export type LiveStream = {
    num: number;
    name: string;
    stream_id: number;
    stream_icon: string;
    category: LiveStreamCategory;
  };

  export type LiveStreamCategory = {
    category_id: string;
    category_name: string;
    streams: LiveStream[];
  };

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
    getEPGLivetreams(streamId: number, limit: number): Promise<any>;
    getAllEPGLiveStreams(streamId: number): Promise<any>;
  }
}