const express = require("express");
const app = express();
const database = require("./db.js");
const { parse } = require("url");
const { readFileSync, existsSync } = require("fs");
const bp = require("body-parser"); // IMPORTANT: need it for parsing req.body, need to npm i first
const path = require("path");
const next = require("next");
const { ExpressPeerServer } = require("peer");
const fs = require("fs");

// PeerJS Sever for WebRTC streaming
const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/peer-server", // The path on which PEer server responds for requests. The server responds for requests to the root URL + path.
  ssl: {
    key: fs.readFileSync("/etc/letsencrypt/live/matherium.com/fullchain.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/matherium.com/privkey.pem"),
  }, // pass in key and cert to ssl dictionary
});

app.use("/peerjs", peerServer);

//CITATION:winton github. Winston logs errors

const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({
      filename: "/var/www/matherium/server/winston_error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "/var/www/matherium/server/winston_combined.log",
    }),
  ],

  exceptionHandlers: [
    new winston.transports.File({
      filename: "/var/www/matherium/server/exceptions.log",
    }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

//TODO: use something less obvious
let port = 8080;

//next js endpoint
// try {

//next js code
//Set up next js app
// next_app = next({"dev":process.env.NODE_ENV !== 'production', dir:"./next_client", quiet:false});
// const handle = next_app.getRequestHandler();
// next_app.prepare().then((err) => {
//     if (err) throw err;

// app.get('*', (err,req, res) => {
//         if (err) throw err;
//         return handle(req, res);

// });

// app.listen(port, (err) => {
//     if (err) {throw err;}
//     // console.log('> Ready on http://localhost:8080');
// })

// });
//-next code without catch
//     .catch((ex) => {
//     console.error(ex.stack);

//     //stops running the server- imp for iframe
//     process.exit(1);
// })
// }

// catch(err){
//     console.error(err);

// }

//TODO: change this to something else for prod
// app.get('*',
// 	(err,req, res) => {
//         if(err) throw err;
//         console.info("entered endpoint");
//         return handle(req,res);
//     });

//UNCOMMENT START

const client = path.join(__dirname, "../client");
// console.log(__dirname)

app.use(express.static(client));
app.use(bp.json()); // IMPORTANT: need to do this to auto-parse req.body as json whenever needed

// Endpoints ==>

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../client") });
});

app.post("/emailupdate", async (req, res) => {
  try {
    await database.insertEmail(req.body);
  } catch (error) {
    //TODO: handle this
    // console.log("Error with calling insertEmail(): ", error);
  }
  res.end();
});

// app.get("/demo", (req, res) => {
//   res.sendFile("stream-demo.html", { root: path.join(__dirname, "../client") });
// });

app.get("/webrtc-demo", (req, res) => {
  res.sendFile("webrtc-demo.html", { root: path.join(__dirname, "../client") });
});

//Handles phone POST requests
app.post("/voice", async (req, res) => {
  //write a simple string
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "This is the demo text" }));
});

//Handles phone POST requests
app.post("/convert-text", async (req, res) => {
  //variable for the received message
  // let received_message = 'new'
  // //write a simple string
  // req.json().then((data)=>{
  //     res.json(data);
  // })

  // if (req.ok){
  //     received_message = req.json()
  // }
  // else{
  //     received_message = 'not ok'
  // }

  // res.writeHead(200, {"Content-Type" : "application/json"});
  // res.end(JSON.stringify({message:'This is the audii'}));
  // res.json(req.json())
  // res.end(JSON.stringify(req.json()));
  // console.log(req.body)
  res.send(req.body);
});

// Handles MIME types of css, javascript, html and image types(.png,.jpeg,.jpg etc).
app.get("*", (req, res) => {
  const urlParsed = parse(req.url);
  const path = urlParsed.pathname.replace("/", "");
  if (existsSync(path)) {
    if (path.endsWith(".html")) {
      res.writeHead(200, { "Content-Type": "text/html" });
    } else if (path.endsWith(".css")) {
      res.writeHead(200, { "Content-Type": "text/css" });
    } else if (path.endsWith(".js")) {
      res.writeHead(200, { "Content-Type": "text/javascript" });
    }
    res.write(readFileSync(path));
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
});

// npm run on development
// if (process.env.NODE_ENV !== 'production'){
//     // logger.log("error", "in development mode")
//     //development server port
//     port = 435;
//     app.listen(port, "127.0.0.1", (err)=>{
//         if (err) {throw err;}
//         console.log("here");

//         // logger.log("error","server listening at "+port);
//     });
// }
// logger.log("error",process.env.NODE_ENV !== 'production');

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  logger.info("here");
  logger.info(process.env.NODE_ENV !== "production");
});
