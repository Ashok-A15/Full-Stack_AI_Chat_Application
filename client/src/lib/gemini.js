import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);



const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  safetySettings,
});

export default model;
