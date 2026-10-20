import { ai } from "../config/gemini.js";

const MAX_INPUT_LENGTH = 30000;



export const explainContent = async (req, res) => {
  try {
    const { text, context = "note", language } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content text is required to explain",
      });
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Input exceeds ${MAX_INPUT_LENGTH} characters`,
      });
    }

    const systemInstruction =
      "You are an expert software architect and technical educator. " +
      "Explain the provided content in simple language using Markdown headings, " +
      "concise bullet points, and code examples where appropriate.";

    const prompt =
      context === "code"
        ? `Explain this ${language || "programming"} code:\n\n\`\`\`${language || ""}\n${text}\n\`\`\``
        : `Explain the following project documentation or note in simple, clear language:\n\n${text}`;

    const model = process.env.GEMINI_MODEL;

    if (!model) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_MODEL is missing from backend .env",
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const result = response.text;

    if (!result) {
      return res.status(502).json({
        success: false,
        message: "Gemini returned no generated text",
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Gemini explanation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error communicating with Gemini AI",
    });
  }
};



export const improveContet = async (req, res) => {
  try {
    // Extract text from the frontend request
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content text is required to improve",
      });
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Input size exceeds maximum allowed limit of ${MAX_INPUT_LENGTH} characters`,
      });
    }

    const systemInstruction =
      "You are a senior technical writer. Improve the grammar, phrasing, " +
      "logical flow, formatting, and clarity of the supplied Markdown text. " +
      "Preserve the original technical meaning, code blocks, links, and intent. " +
      "Return only the improved Markdown content.";

    const prompt = `Improve the following Markdown note:\n\n${text}`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const result = response.text;

    if (!result) {
      return res.status(502).json({
        success: false,
        message: "Gemini returned no generated text",
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Gemini improve error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error communicating with Gemini AI service",
    });
  }
};


export const generateCodeDocs = async (req, res) => {
  try {
    const { code, language = "javascript", title } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Source code is required to generate documentation",
      });
    }

    if (code.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Code snippet exceeds maximum allowed limit of ${MAX_INPUT_LENGTH} characters`,
      });
    }

    const systemInstruction =
      "You are a senior technical lead. Generate professional developer documentation for the provided code. Include an overview, purpose, parameters/arguments, return values, exceptions/errors, complexity (time/space if applicable), and a practical usage example.";

    const prompt = `Generate technical documentation for the following ${language} code${title ? ` (${title})` : ""}:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: prompt,
    });
    const result = response.text;

    if (!result) {
      return res.status(502).json({
        message:
          "Gemini returned no generated text. Return only the README.md content. Do not include introductory explanations. Do not wrap the entire README in a markdown code block. Start directly with the project's main heading.",
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Error communicating with Gemini AI service",
    });
  }
};

export const generateReadme = async (req, res) => {
  try {
    const {
      name,
      description,
      technologies,
      features,
      setupRequirements,
      codeOverview,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required to generate README",
      });
    }

    const systemInstruction =
      "You are a lead software architect and open-source maintainer. Generate a complete, polished, professional GitHub-ready README.md file in Markdown. Include badges, table of contents, features, architecture overview, tech stack, prerequisites, installation steps, environment variables, usage, API summary if relevant, and license.";

    const prompt = `Please generate a comprehensive README.md for the following project:
- Project Name: ${name}
- Description: ${description || "N/A"}
- Technology Stack: ${Array.isArray(technologies) ? technologies.join(", ") : technologies || "N/A"}
- Key Features: ${Array.isArray(features) ? features.join(", ") : features || "N/A"}
- Setup Requirements: ${setupRequirements || "Node.js, npm, and environment configuration"}
${codeOverview ? `- Optional Code Architecture Context: ${codeOverview}` : ""}
`;
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: prompt,
    });
    const result = response.text;

    if (!result) {
      return res.status(502).json({
        message:
          "Gemini returned no generated text. Return only the README.md content. Do not include introductory explanations. Do not wrap the entire README in a markdown code block. Start directly with the project's main heading.",
      });
    }

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Error communicating with Gemini AI service",
    });
  }
};



 