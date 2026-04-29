import { invokeLLM } from "../_core/llm";

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}

export interface OutreachDraft {
  venue: string;
  contact: string;
  subject: string;
  body: string;
  followUpDate: string;
}

export class AIAgentService {
  private conversationHistory: AgentMessage[] = [];

  /**
   * Chat with the AI agent
   */
  async chat(userMessage: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Prepare messages for LLM
      const messages = this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call LLM (using Groq via invokeLLM)
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an AI talent agent for musicians and artists. You help with:
- Discovering gigs and booking opportunities
- Negotiating rates and contracts
- Managing outreach to venues and brands
- Tracking performance metrics
- Planning career strategy

Be professional, concise, and actionable. Provide specific recommendations.`,
          },
          ...messages,
        ],
      });

      const content = response.choices?.[0]?.message?.content || "I couldn't process that request.";
      const assistantMessage = typeof content === "string" ? content : JSON.stringify(content);

      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error) {
      console.error("AI agent chat failed:", error);
      throw new Error(`Chat failed: ${error}`);
    }
  }

  /**
   * Generate an outreach email draft
   */
  async generateOutreachDraft(input: {
    artistName: string;
    venueName: string;
    venueType: string;
    artistGenres: string[];
    targetDate?: string;
  }): Promise<OutreachDraft> {
    try {
      const prompt = `Generate a professional outreach email for a musician to contact a ${input.venueType}.

Artist: ${input.artistName}Genres: ${input.artistGenres.join(", ")}\nVenue: ${input.venueName}
Target Date: ${input.targetDate || "flexible"}

Create a compelling, concise email that:
1. Introduces the artist
2. Explains why they're a good fit for this venue
3. Includes a clear call-to-action
4. Suggests a follow-up date

Format the response as JSON with fields: subject, body, followUpDate`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an expert at writing professional music industry outreach emails.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "outreach_email",
            strict: true,
            schema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                followUpDate: { type: "string" },
              },
              required: ["subject", "body", "followUpDate"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) throw new Error("No response from LLM");

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);

      return {
        venue: input.venueName,
        contact: "Booking Manager",
        subject: parsed.subject,
        body: parsed.body,
        followUpDate: parsed.followUpDate,
      };
    } catch (error) {
      console.error("Failed to generate outreach draft:", error);
      throw new Error(`Outreach generation failed: ${error}`);
    }
  }

  /**
   * Analyze a gig opportunity and provide recommendations
   */
  async analyzeGigOpportunity(input: {
    title: string;
    venue: string;
    date: string;
    rate: number;
    description: string;
    artistProfile: {
      name: string;
      genres: string[];
      experience: string;
      previousRate: number;
    };
  }): Promise<{
    relevanceScore: number;
    recommendation: string;
    negotiationTips: string[];
    riskFactors: string[];
  }> {
    try {
      const prompt = `Analyze this gig opportunity for a musician:

Gig: ${input.title}
Venue: ${input.venue}
Date: ${input.date}
Offered Rate: $${input.rate}
Description: ${input.description}

Artist Profile:
- Name: ${input.artistProfile.name}
- Genres: ${input.artistProfile.genres.join(", ")}
- Experience: ${input.artistProfile.experience}
- Previous Rate: $${input.artistProfile.previousRate}

Provide analysis as JSON with:
- relevanceScore (0-100)
- recommendation (brief recommendation)
- negotiationTips (array of 3-5 tips)
- riskFactors (array of potential issues)`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an expert music industry consultant analyzing gig opportunities.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "gig_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                relevanceScore: { type: "number", minimum: 0, maximum: 100 },
                recommendation: { type: "string" },
                negotiationTips: { type: "array", items: { type: "string" } },
                riskFactors: { type: "array", items: { type: "string" } },
              },
              required: ["relevanceScore", "recommendation", "negotiationTips", "riskFactors"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) throw new Error("No response from LLM");

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      return JSON.parse(contentStr);
    } catch (error) {
      console.error("Failed to analyze gig:", error);
      throw new Error(`Gig analysis failed: ${error}`);
    }
  }

  /**
   * Generate contract review summary
   */
  async reviewContract(input: {
    contractText: string;
    artistName: string;
  }): Promise<{
    summary: string;
    redFlags: string[];
    recommendations: string[];
    keyTerms: Record<string, string>;
  }> {
    try {
      const prompt = `Review this music industry contract for ${input.artistName}:

${input.contractText}

Provide analysis as JSON with:
- summary (brief overview of contract terms)
- redFlags (array of concerning clauses)
- recommendations (array of suggested changes)
- keyTerms (object of important terms and their values)`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an expert music industry lawyer reviewing contracts.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "contract_review",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                redFlags: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } },
                keyTerms: { type: "object", additionalProperties: { type: "string" } },
              },
              required: ["summary", "redFlags", "recommendations", "keyTerms"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) throw new Error("No response from LLM");

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      return JSON.parse(contentStr);
    } catch (error) {
      console.error("Failed to review contract:", error);
      throw new Error(`Contract review failed: ${error}`);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): AgentMessage[] {
    return [...this.conversationHistory];
  }
}

export const aiAgentService = new AIAgentService();
