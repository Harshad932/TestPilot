import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

class GroqService {
  constructor() {
    this.client = client;
    this.model = "openai/gpt-oss-120b";
  }

  async generateTestCases(featureDescription) {
    const prompt = this.buildPrompt(featureDescription);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
      throw new Error("No response received from Groq API.");
    }

    return this.parseTestCaseResponse(text);
  }

  buildPrompt(featureDescription) {
    return `You are a QA engineer. Respond ONLY in valid JSON. No markdown, no extra text.

Generate structured test cases for the following feature description:
"${featureDescription}"

Return a JSON object with exactly this schema:
{
  "functional_tests": [
    {
      "id": "FT-01",
      "title": "string",
      "preconditions": "string",
      "steps": ["step1", "step2"],
      "expected_result": "string"
    }
  ],
  "edge_cases": [
    {
      "id": "EC-01",
      "title": "string",
      "preconditions": "string",
      "steps": ["step1", "step2"],
      "expected_result": "string"
    }
  ],
  "negative_cases": [
    {
      "id": "NC-01",
      "title": "string",
      "preconditions": "string",
      "steps": ["step1", "step2"],
      "expected_result": "string"
    }
  ]
}

Rules:
- Generate at least 3 test cases per category.
- All test cases must be specific to the described feature, not generic.
- Return ONLY the JSON object. No explanation, no markdown fences.`;
  }

  parseTestCaseResponse(text) {
    const stripped = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Groq returned non-JSON output: ${stripped.slice(0, 200)}`);
    }

    return JSON.parse(jsonMatch[0]);
  }

  async generateDocBasedTestCases(context, focusQuery) {
    const prompt = this.buildDocPrompt(context, focusQuery);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
      throw new Error("No response received from Groq API.");
    }

    return this.parseTestCaseResponse(text);
  }

  buildDocPrompt(context, focusQuery) {
    return `You are a QA engineer. Use ONLY the document content below to generate test cases. Respond ONLY in valid JSON. No markdown, no extra text.

Document Content:
${context}

Focus Area: ${focusQuery}

Return a JSON object with exactly this schema:
{
  "functional_tests": [
    {
      "id": "FT-01",
      "title": "string",
      "preconditions": "string",
      "steps": ["step1", "step2"],
      "expected_result": "string"
    }
  ],
  "edge_cases": [
    {
      "id": "EC-01",
      "title": "string",
      "preconditions": "string",
      "steps": ["step1", "step2"],
      "expected_result": "string"
    }
  ],
  "negative_cases": [
    {
      "id": "NC-01",
      "title": "string",
      "preconditions": "string",
      "steps": ["step1", "step2"],
      "expected_result": "string"
    }
  ]
}

Rules:
- Generate at least 3 test cases per category.
- Base ALL test cases ONLY on the document content above.
- Do NOT invent scenarios not mentioned in the document.
- Return ONLY the JSON object. No explanation, no markdown fences.`;
  }
}

export default new GroqService();