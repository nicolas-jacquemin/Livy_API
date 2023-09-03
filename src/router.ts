import app from "./server.js";
import fs from "fs";

let routes: string[] = [];

const init_routes = (cb: () => any) => {
  console.log("Loading routes...");
  routes = [];
  const get_files = (fld: string) => {
    fs.readdirSync("./dist/routes/" + fld).forEach((file) => {
      if (fs.lstatSync("./dist/routes/" + fld + file).isDirectory()) {
        routes.push(fld + file);
      }
    });
  };

  get_files("");

  let numCalls = 0;

  routes.forEach((route) => {
    import(`./routes/${route}/route.js`).then((module) => {
      console.log(`Loading route: /api/${route}`);
      if (module.mainMiddleware)
        app.use(`/api/${route}`, module.mainMiddleware, module.default);
      else app.use(`/api/${route}`, module.default);
      numCalls++;
      if (numCalls === routes.length) {
        console.log("Routes loaded.");
        cb();
      }
    });
  });
};

export default init_routes;
