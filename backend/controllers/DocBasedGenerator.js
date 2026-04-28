import multer from "multer";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
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


function scoreChunks(chunks, query) {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2); 

  return chunks
    .map((chunk, index) => {
      const lower = chunk.toLowerCase();
      const score = queryWords.reduce(
        (acc, word) => acc + (lower.includes(word) ? 1 : 0),
        0
      );
      return { chunk, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);
}

function selectContext(chunks, focusQuery, maxChars = 6000) {
  const fullText = chunks.join("\n\n");
  if (fullText.length <= maxChars) {
    return fullText;
  }

  const scored = scoreChunks(chunks, focusQuery);
  let context = "";
  let charsUsed = 0;

  for (const { chunk } of scored) {
    if (charsUsed + chunk.length > maxChars) break;
    context += `\n\n${chunk}`;
    charsUsed += chunk.length;
  }

  return context.trim();
}

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

    const focusQuery =
      req.body?.focusQuery?.trim() ||
      "generate test cases for this document";

    const context = selectContext(chunks, focusQuery);

    const testCases = await groqService.generateDocBasedTestCases(
      context,
      focusQuery
    );

    return res.status(200).json(testCases);
  } catch (err) {
    console.error("generateDocBasedTest error:", err);

    if (err instanceof SyntaxError) {
      return res.status(500).json({
        error: "Failed to parse AI response as JSON. Please try again.",
      });
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