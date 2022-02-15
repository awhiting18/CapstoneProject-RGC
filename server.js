const Pusher = require("pusher");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./react-pusher/src/config.json");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const pusher = new Pusher({
  appId: config.app_id,
  key: config.key,
  secret: config.secret,
  cluster: config.cluster,
  encrypted: true,
});
app.set("PORT", process.env.PORT || 5000);

app.post("/message", (req, res) => {
  const payload = req.body;
  pusher.trigger("chat", "message", payload);
  res.send(payload);
});

app.listen(app.get("PORT"), () =>
  console.log("Listening at " + app.get("PORT"))
);
