import {parseXmltv, type Xmltv} from '@iptv/xmltv';
import liveStream, {LiveStreamDocument} from "../models/LiveStream.js";;

export class XMLTVGrabber {
    private xmltv: Xmltv;

    constructor(private readonly xmltvfrURL: string) {
    }

    private async fetchXMLTV() {
        try {
            const response = await fetch(this.xmltvfrURL);
            if (!response.ok) throw new Error("Failed to fetch XMLTV");
            return response.text();
        } catch (error) {
            throw new Error("Failed to fetch XMLTV");
        }
    }

    private async parseXMLTV() {
        try {
            this.xmltv = parseXmltv(await this.fetchXMLTV());
            if (this.xmltv)
                return this.xmltv;
            throw new Error("Failed to parse XMLTV");
        } catch (error) {
            throw new Error("Failed to parse XMLTV");
        }
    }

    public async fetchAndParseXMLTV() {
        try {
            return this.parseXMLTV();
        } catch (error) {
            throw new Error("Failed to fetch and parse XMLTV");
        }
    }

    public getXMLTV() {
        return this.xmltv;
    }

    private findChannel(channelId: string) {
        return this.xmltv.channels.find((channel) =>
            channel.id && channel.id.toLowerCase() === channelId.toLowerCase()
        ) || this.xmltv.channels.find((channel) =>
            channel.id && channel.id.toLowerCase() === channelId.toLowerCase()
                .replace("c+", "canalplus")
                .replace("beinsport", "beinsports")
        );
    }

    public async populateLiveStream(liveStream: LiveStreamDocument) {
        if (!liveStream.epg_channel_id) return;
        const xmltvChannel = this.findChannel(liveStream.epg_channel_id);
        if (xmltvChannel) {
            if (xmltvChannel.icon && xmltvChannel.icon.length > 0)
                liveStream.stream_icon = xmltvChannel.icon.find((icon) => icon.src)?.src;
            if (xmltvChannel.displayName && xmltvChannel.displayName.length > 0) {
                if (!liveStream.internal_name)
                    liveStream.internal_name = liveStream.name;
                liveStream.name = xmltvChannel.displayName.find((displayName) => displayName._value)?._value;
            }
            await liveStream.save();
        }
    }

    public async populateLiveStreams() {
        const liveStreams = await liveStream.find({enabled: true});
        for (const liveStream of liveStreams) {
            await this.populateLiveStream(liveStream);
        }
    }

    public async fetchEPGEventLiveStream(liveStream: LiveStreamDocument) {
        if (!liveStream.epg_channel_id) return;
        const xmltvChannel = this.findChannel(liveStream.epg_channel_id);
        if (xmltvChannel) {
            liveStream.epg = this.xmltv.programmes.filter((programme) => programme.channel && programme.channel === xmltvChannel.id);
            await liveStream.save();
        }
    }

    public async fetchEPGEventLiveStreams() {
        const liveStreams = await liveStream.find({enabled: true});
        for (const liveStream of liveStreams) {
            await this.fetchEPGEventLiveStream(liveStream);
        }
    }
}