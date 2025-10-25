import { pipeline } from "@xenova/transformers";
import { services } from "../../../src/constant"; // adjust path as needed

let embedder;

// Helper: cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  try {
    const { description } = req.body;
    if (!description || typeof description !== "string") {
      res.status(400).json({ error: "Invalid description" });
      return;
    }

    if (!embedder) {
      embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    }

    // Create embeddings
    const [descEmbedding] = await embedder(description, {
      pooling: "mean",
      normalize: true,
    });
    const serviceEmbeddings = await Promise.all(
      services.map(async (s) => {
        const [embed] = await embedder(s, { pooling: "mean", normalize: true });
        return { service: s, embedding: embed };
      })
    );

    // Rank services by similarity
    const ranked = serviceEmbeddings
      .map(({ service, embedding }) => ({
        service,
        score: cosineSimilarity(descEmbedding, embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3 matches

    res
      .status(200)
      .json({ description, suggestions: ranked.map((r) => r.service) });
  } catch (err) {
    console.error("Error in USE suggest-services:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
