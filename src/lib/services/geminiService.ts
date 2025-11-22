import { GoogleGenAI } from "@google/genai";
import { Customer, Ticket } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a professional greeting and a quick insight summary for the teller
 * based on the customer's segment and transaction type.
 */
export const generateCustomerInsight = async (ticket: Ticket): Promise<string> => {
  if (!ticket.customer) return "Standard customer. Proceed with request.";

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a helpful AI assistant for a bank teller.
      
      Context:
      - Customer Name: ${ticket.customer.name}
      - Segment: ${ticket.customer.segment} (Diamond/Gold are VIPs)
      - Service Requested: ${ticket.serviceType}
      - Simulated History: ${ticket.customer.historySummary || "Long time customer, high savings balance."}

      Task:
      1. Provide a 1-sentence professional warm greeting script for the teller to say.
      2. Provide 1 bullet point of a "Smart Cross-sell" or "Care Tip" based on their profile.

      Format:
      Greeting: [Script]
      Insight: [Tip]
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "System: Unable to generate insight.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System: AI Service Unavailable. Proceed with standard greeting.";
  }
};

export const analyzeQueueTrends = async (queueData: any): Promise<string> => {
    // Used for the dashboard to give a summary
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `
          Analyze this simplified queue data snapshot and give a 2-sentence executive summary for the Branch Manager.
          Identify bottlenecks if any.
          
          Data: ${JSON.stringify(queueData)}
        `;
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        return response.text || "No analysis available.";
    } catch (e) {
        return "Analysis failed.";
    }
}