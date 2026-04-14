import multer from "multer";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import groqService from "../services/groqService.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".pdf" || ext === ".txt") {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf and .txt files are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const generateDocBasedTest = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let rawText = "";

    if (ext === ".txt") {
      rawText = fs.readFileSync(filePath, "utf-8");
    } else if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(buffer);
      rawText = parsed.text;
    }

    if (!rawText || rawText.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Document has no readable text or is too short." });
    }

    const cleanedText = rawText.replace(/\s+/g, " ").trim();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const chunks = await splitter.splitText(cleanedText);

    const docs = chunks.map((chunk) => new Document({ pageContent: chunk }));

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    const focusQuery =
      req.body?.focusQuery?.trim() ||
      "generate test cases for this document";

    const relevantDocs = await vectorStore.similaritySearch(focusQuery, 5);

    const context = relevantDocs
      .map((doc, i) => `[Chunk ${i + 1}]: ${doc.pageContent}`)
      .join("\n\n");

    const testCases = await groqService.generateDocBasedTestCases(
      context,
      focusQuery
    );

    return res.status(200).json(testCases);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res
        .status(500)
        .json({ error: "Failed to parse AI response as JSON. Please try again." });
    }
    return res
      .status(500)
      .json({ error: err.message || "An unexpected error occurred." });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};