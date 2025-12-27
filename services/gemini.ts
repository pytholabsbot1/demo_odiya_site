import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Attachment, ProjectDocument } from "../types";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

// Helper to convert internal Message type to Gemini Content type
const mapMessagesToHistory = (messages: Message[]): Content[] => {
  return messages
    .filter(msg => !msg.isError && (msg.text?.trim() || (msg.attachments && msg.attachments.length > 0)))
    .map((msg) => {
      const parts: Part[] = [];

      // Add attachments if they exist
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((att) => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data,
            },
          });
        });
      }

      // Add text
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      return {
        role: msg.role,
        parts: parts,
      };
    });
};

export const streamGeminiResponse = async (
  history: Message[],
  prompt: string,
  attachments: Attachment[],
  projectDocuments: ProjectDocument[],
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct dynamic system instruction with RAG context
    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    
    if (projectDocuments && projectDocuments.length > 0) {
      const contextText = projectDocuments.map(doc => 
        `--- DOCUMENT: ${doc.name} ---\n${doc.content}\n--- END DOCUMENT ---`
      ).join("\n\n");
      
      dynamicSystemInstruction += `\n\n**PROJECT KNOWLEDGE BASE (RAG CONTEXT):**\nUse the following project documents to answer user queries. Do not invent facts not present here if the question implies looking up facts.\n\n${contextText}`;
    }

    // Create chat with history
    const chatHistory = mapMessagesToHistory(history);
    
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: chatHistory,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.7,
      },
    });

    // Prepare current message parts
    const currentParts: Part[] = [];
    if (attachments.length > 0) {
      attachments.forEach((att) => {
        currentParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data,
          },
        });
      });
    }
    
    // Add text part if prompt exists
    if (prompt) {
      currentParts.push({ text: prompt });
    }

    if (currentParts.length === 0) {
      throw new Error("Message must contain text or attachments.");
    }

    // Use sendMessageStream with the message content
    const result = await chat.sendMessageStream({
      message: {
        role: 'user',
        parts: currentParts
      }
    });

    let fullText = "";
    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }

    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};