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
    this.model = "openai/gpt-oss-20b";
  }

  async generateTestCases(featureDescription) {
    try {
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
    } catch (error) {
      console.error("Groq API error:", error);
      throw error;
    }
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
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Invalid response format");
    } catch (error) {
      return {
        functional_tests: [],
        edge_cases: [],
        negative_cases: [],
      };
    }
  }

    async generateDocBasedTestCases(context, focusQuery) {
    try {
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
    } catch (error) {
      console.error("Groq API error:", error);
      throw error;
    }
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