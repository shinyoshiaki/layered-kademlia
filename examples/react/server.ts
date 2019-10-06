import * as express from "express";

const PORT = 9000;

const app = express();
app.use(express.static("build"));
app.listen(PORT, () => console.log("Example app listening on port " + PORT));
