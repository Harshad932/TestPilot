import groqService from "../services/groqService.js";

export const generateTestCases = async (req, res) => {
  const featureDescription = req.body?.featureDescription?.trim();

  if (!featureDescription) {
    return res.status(400).json({ error: "Feature description is required and cannot be empty." });
  }

  try {
    const testCases = await groqService.generateTestCases(featureDescription);
    return res.status(200).json(testCases);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "Failed to parse AI response as JSON. Please try again." });
    }
    return res.status(500).json({ error: err.message || "An unexpected error occurred while generating test cases." });
  }
};