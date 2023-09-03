import request from "request";
import type { Item } from "../items.js";
import type { Request, Response } from "express";

interface Session extends Item {
  manifestURL?: string;
  manifestMime?: string;
  manifest?: string;
}

type userQueue = {
  id: string;
  session: Session;
  time: {
    start: number;
    lastRequest: number;
  };
  UA: string;
  IP: string;
};

let playingQueue: {
  [key: string]: userQueue;
} = {};

let playingSession: Session[] = [];

const sendUserQueue = (res: Response, userQueue: userQueue) => {
  res.json({
    id: userQueue.id,
    session: userQueue.session.id,
    manifest: `/api/play/manifest/${userQueue.id}/index.m3u8`,
    stop: `/api/play/stop/${userQueue.id}`,
  });
};

const endQueue = (req: Request, res: Response, userID: string) => {
  if (!playingQueue[userID]) {
    res.status(304).send("Not modified");
    return;
  }
  delete playingQueue[userID];
  deleteSession();
  res.status(200).send("OK");
};

const getAccreditation = (item: Item) => {
  let numOfSession = 0;
  for (let i = 0; i < playingSession.length; i++) {
    if (playingSession[i].id !== item.id) {
      numOfSession++;
    }
  }
  if (numOfSession < parseInt(process.env.LV_MAX_SESSIONS)) {
    return true;
  } else {
    return false;
  }
};

const manifestModify = (m3u8: string, userQueue: userQueue) => {
  if (!m3u8)
    return;
  let m3u8a = m3u8.split("\n");
  for (let i = 0; i < m3u8.length; i++) {
    if (m3u8[i][0] == "/") {
      m3u8a[i] = `/api/play/content/supplier/${userQueue.id}${m3u8a[i]}`;
    }
  }
  return m3u8a.join("\n");
};

const retrieveFirstManifest = async (session: Session, res: Response, userQueue: userQueue) => {
  try {
    let manifest = await fetch(`${process.env.LV_URL}/${process.env.LV_USER}/${process.env.LV_PASS}/${session.idSupplier}.m3u8`, {
      method: "GET",
      headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        'Host': process.env.LV_HOST
      }
    });
    let responseText = await manifest.text();
    if (manifest.status !== 200 || responseText === "\n") {
      console.log(`${process.env.LV_URL}/${process.env.LV_USER}/${process.env.LV_PASS}/${session.idSupplier}.m3u8` + " Error: " + manifest.status);
      res.status(503).json({ error: "Content provider error" });
      delete playingQueue[userQueue.id];
      return;
    }
    session.manifestURL = manifest.url;
    session.manifest = responseText;
    session.manifestMime = manifest.headers.get("content-type");
    if (res)
      sendUserQueue(res, userQueue);
  } catch (e) {
    console.log(e)
    res.status(503).json({ error: "Content provider error" })
    delete playingQueue[userQueue.id];
    return;
  }

};

const sendManifest = (res: Response, userID: string) => {
  if (!playingQueue[userID]) {
    res.status(404).send("Not found");
    return;
  }

  let userQueue = playingQueue[userID];
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  res.set("Content-Type", userQueue.session.manifestMime);
  res.send(manifestModify(userQueue.session.manifest, userQueue));
  userQueue.time.lastRequest = Date.now();
};

const sendSupplierContent = (res: Response, userID: string, url: string) => {
  if (!playingQueue[userID]) {
    res.status(404).send("Not found");
    return;
  }

  let userQueue = playingQueue[userID];
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  let supplierFQDN = userQueue.session.manifestURL
    .split("://")[1]
    .split("/")[0];
  let supplierProto = userQueue.session.manifestURL.split("://")[0];
  let supplierURI = url.split(userID)[1];

  request(
    `${supplierProto}://${supplierFQDN}${supplierURI}`,
  ).pipe(res);
};

const addSession = (item: Item, res: Response, userQueue: userQueue) => {
  for (let i = 0; i < playingSession.length; i++) {
    if (item.id === playingSession[i].id) {
      userQueue.session = playingSession[i];
      sendUserQueue(res, userQueue);
      return;
    }
  }
  playingSession.push(item);
  userQueue.session = item;
  retrieveFirstManifest(userQueue.session, res, userQueue);
  return item;
};

const newQueue = (req: Request) => {
  let userID =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  if (playingQueue[userID]) {
    newQueue(req);
  } else {
    playingQueue[userID] = {
      id: userID,
      UA: req.headers["user-agent"],
      IP: req.headers["x-forwarded-for"].toString(),
      time: {
        start: Date.now(),
        lastRequest: Date.now(),
      },
      session: {
        id: 0,
        idSupplier: "",
        manifestURL: "",
        manifestMime: "",
        name: ""
      },
    };
    return playingQueue[userID];
  }
};

const addQueue = (req: Request, res: Response, item: Item) => {
  if (getAccreditation(item)) {
    addSession(item, res, newQueue(req));
    return true;
  } else {
    res.status(403).send("Max session reached");
    return false;
  }
};

const listSession = (req: Request, res: Response) => {
  res.json({ number: playingSession.length, sessions: playingSession });
};

const listQueue = (req: Request, res: Response) => {
  res.json({ number: Object.keys(playingQueue).length, queue: playingQueue });
};

const retrieveManifestOfSessions = async () => {
  for (let i = 0; i < playingSession.length; i++) {
    if (!playingSession[i].manifestURL) continue;
    try {
      let manifest = await fetch(playingSession[i].manifestURL, {
        method: "GET",
        headers: {
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
          'Host': process.env.LV_HOST
        }
      });
      let responseText = await manifest.text();
      if (manifest.status !== 200 || responseText === "\n") {
        try {
          console.log(`Service ${playingSession[i].idSupplier} is down... Retrying...`);
          retrieveFirstManifest(playingSession[i], null, null);
        } catch (e) { }
        return;
      }
      playingSession[i].manifest = responseText;
    } catch (e) {
      try {
        console.log(`Service ${playingSession[i].idSupplier} is down... Retrying...`);
        retrieveFirstManifest(playingSession[i], null, null);
      } catch (e) { }
    }
  }
};

setInterval(retrieveManifestOfSessions, 2000);

const deleteSession = () => {
  for (let i = 0; i < playingSession.length; i++) {
    let j = 0;
    for (let userQueue of Object.values(playingQueue)) {
      if (userQueue.session.id === playingSession[i].id) {
        j++;
        break;
      }
    }
    if (j === 0) {
      playingSession.splice(i, 1);
    }
  }
}

setInterval(() => {
  for (let userQueue of Object.values(playingQueue)) {
    if (userQueue.time.lastRequest + 20000 < Date.now()) {
      delete playingQueue[userQueue.id];
    }
  }
  deleteSession();
}, 1000);

export { addQueue, listSession, listQueue, sendManifest, sendSupplierContent, endQueue };
