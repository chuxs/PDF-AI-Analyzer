import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var imageServer = "";
// const API_URL = "https://picsart-remove-background2.p.rapidapi.com/removebg";
const API_KEY = "AIzaSyAKOhMfY55r1UpBEGIQ7a5cazUDJTP3RVg"


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
