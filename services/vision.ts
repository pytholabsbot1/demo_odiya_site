import { OCRResult } from "../types";

export const performOCR = async (base64Image: string, apiKey: string): Promise<OCRResult> => {
  if (!apiKey) {
    throw new Error("Google Vision API Key is missing. Please add it in Settings.");
  }

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  
  const requestBody = {
    requests: [
      {
        image: {
          content: base64Image
        },
        features: [
          {
            type: "TEXT_DETECTION"
          }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to perform OCR");
  }

  const data = await response.json();
  const annotations = data.responses[0]?.textAnnotations;

  if (!annotations || annotations.length === 0) {
    return { fullText: "", blocks: [] };
  }

  // The first annotation is the full text
  const fullText = annotations[0].description;

  // Subsequent annotations are specific words/blocks
  const blocks = annotations.slice(1).map((ann: any) => ({
    text: ann.description,
    boundingBox: ann.boundingPoly.vertices.map((v: any) => ({
      x: v.x || 0,
      y: v.y || 0
    }))
  }));

  return { fullText, blocks };
};