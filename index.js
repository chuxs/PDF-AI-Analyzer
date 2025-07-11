import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// var imageServer = "";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_KEY = "AIzaSyAKOhMfY55r1UpBEGIQ7a5cazUDJTP3RVg"
// const API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const upload = multer({ storage: multer.memoryStorage() });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
    res.render("index.ejs", { result: null });
});

app.post("/analyze", upload.single('file_inputName'), async (req, res) => {
   
    // console.log(uploadedfile);


    // const data = new FormData();
    // data.append('pdfFile', uploadedfile.buffer, uploadedfile.originalname);

    // const contents = {
    //     contents: [
    //       { text: "Summarize this document" },

    //       {
    //         inlineData: {
    //           mimeType: 'application/pdf',
    //         //  data: data.getBuffer().toString('base64'),
    //         //  data: Buffer.from(uploadedfile.buffer).toString('base64')
    //           data: base64PDF,
    //         }
    //       }
    //     ]
    //   };

    try {

      const uploadedfile = req.file;

      const userPrompt = req.body["postTitle"];
      
      const base64PDF = uploadedfile.buffer.toString("base64");

      const payload =  {
      contents: [
        {
          role: 'user',
          parts: [ 
            {
              inline_data: {
                mime_type: "application/pdf",
                data: base64PDF,
              },
            },
            { text: `${userPrompt}` },
          ],
        },
      ],
    };

      const apiPDFHandler = await axios.post(`${API_URL}?key=${API_KEY}`, payload, 
          {headers: {'Content-Type': 'application/json'}}
      );
      console.log(apiPDFHandler.data.candidates[0].content.parts[0].text);
        res.render("index.ejs", { result : apiPDFHandler.data.candidates[0].content.parts[0].text});

    } catch (error) {
        // res.render("index.ejs", { result: error.message });
        console.log(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
