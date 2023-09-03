import fs from "fs";

export type Item = {
  id: number;
  name: string;
  idSupplier: string;
}

let items: Item[] = [];

const get_item_from_url = (itemId: number, cb: (item: Item | null) => any) => {
  let item = items.find((item) => item.id === itemId);
  if (!item) {
    cb(null);
    return;
  }
  cb(item);
};

const load_items = () => {
  fs.readFile("./items.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    try{
      items = JSON.parse(data.toString());
    } catch (e) {
      console.error("Error parsing items.json");
    }
  });
};

load_items();
setInterval(load_items, 10000);

export { get_item_from_url };
