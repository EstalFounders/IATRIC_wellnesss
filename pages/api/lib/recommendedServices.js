// pages/api/recommendServices.js
import OpenAI from "openai";
import { speciality } from "../../../src/constant";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { symptoms } = req.body;
    const configuration = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAI();
    try {
      const response = await openai.chat.completions.create({
        model: "text-embedding-ada-002",
        prompt: `Given these symptoms, which services should be recommended? Symptoms: ${symptoms}`,
        max_tokens: 150,
      });

      const recommendedServices = mapServices(
        response.data.choices[0].text.trim()
      );
      res.status(200).json({ success: true, recommendedServices });
    } catch (error) {
      console.error("OpenAI API Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to analyze symptoms" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function mapServices(aiResponse) {
  // Logic to map AI response to available services
  const recommended = [];
  speciality.forEach((service) => {
    if (aiResponse.toLowerCase().includes(service.toLowerCase())) {
      recommended.push(service);
    }
  });
  return recommended;
}
