import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { dirname } from "path"; 
import { fileURLToPath } from "url";
import axios from "axios";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { get } from "http";

const app = express();
const port = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_KEY = "AIzaSyAKOhMfY55r1UpBEGIQ7a5cazUDJTP3RVg";
const upload = multer({ storage: multer.memoryStorage() });
const randomFileID = uuidv4();
const ai = new GoogleGenAI({ apiKey: API_KEY }); // Initialize Google GenAI with your API key
const nodeVersion2 = process.versions.node;

// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const firebaseConfig = {
  apiKey: "AIzaSyBLVVVoUjTV8vXJ2nrOSUbiDz1cLLrGlA0",
  authDomain: "temporary-pdf-store.firebaseapp.com",
  projectId: "temporary-pdf-store",
  storageBucket: "temporary-pdf-store.firebasestorage.app",
  messagingSenderId: "626204259528",
  appId: "1:626204259528:web:f03ab3818262122e5ee1fd",
  measurementId: "G-EYG4BR43TD",
  storageBucket: "temporary-pdf-store.firebasestorage.app",
};

// Initialize Firebase
const storeBucket = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service // bucket
const storage = getStorage(storeBucket);

app.listen(port, () => {
  console.log(`Server is running on port ${port} and Node.js version is ${nodeVersion2}`);
});

app.get("/", (req, res) => {
  res.render("index.ejs", { result: null });
});

// app.post("/upload", upload.single("file_inputName"), async (req, res) => {});

app.post("/analyze", upload.single("file_inputName"), async (req, res) => {
  console.log(req.file.size);

  const userPrompt = req.body["postPrompt"];

  if (req.file.size <= 4129327) {
    try {
      const uploadedfile = req.file;

      // const userPrompt = req.body["postPrompt"];

      const base64PDF = uploadedfile.buffer.toString("base64");

      const payload = {
        contents: [
          {
            role: "user",
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
        { headers: { "Content-Type": "application/json" } }
      );
      // console.log(apiPDFHandler.data.candidates[0].content.parts[0].text);
      res.render("index.ejs", {
        result: apiPDFHandler.data.candidates[0].content.parts[0].text,
      });
    } catch (error) {
      // res.render("index.ejs", { result: error.message });
      console.log(error.message);
    }
  } else {
    console.log("File size exceeds the limit of 4MB. Going to Firebase Storage.");

    const uploadedLargefile = req.file.buffer;

    const storageRef = ref(storage, `${req.file.originalname}`);

    uploadBytes(storageRef, uploadedLargefile, {
      contentType: "application/pdf",
    }).then((snapshot) => {
      console.log("uploaded rawPDF");
      return getDownloadURL(storageRef);
    }).then((url) => {
        // You can handle the URL here, e.g., send it to the client or use it for further processing
        async function main() {
          const pdfResp = await fetch(url)
          .then((response) => response.arrayBuffer());

          const contents = [
            { text: userPrompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: Buffer.from(pdfResp).toString("base64"),
              },
            },
          ];

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
          });
          console.log(response.text);
          res.render("index.ejs", { result: response.text });
        }
        main();
        
      })
      .catch((error) => {
        console.log(error.message);
        // res.render("index.ejs", { result: error.message });
      });
  }

});
