import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentImage, documentType, fullName, dateOfBirth } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Use Gemini 2.5 Pro for multimodal analysis (FREE during promo period)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are an AI KYC verification specialist. Analyze identity documents for:
1. Document authenticity (detect forgeries, tampering)
2. Text extraction (OCR) - extract name, DOB, document number, expiry
3. Face detection - verify photo is clear and matches document type
4. Document type validation
5. Fraud indicators

Return structured analysis in JSON format.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${documentType} document. Expected name: ${fullName}, DOB: ${dateOfBirth}. Provide detailed verification analysis.`
              },
              {
                type: "image_url",
                image_url: {
                  url: documentImage // Base64 data URL
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "kyc_verification_result",
              description: "Return structured KYC verification analysis",
              parameters: {
                type: "object",
                properties: {
                  isAuthentic: {
                    type: "boolean",
                    description: "Whether the document appears authentic"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score 0-100"
                  },
                  documentType: {
                    type: "string",
                    description: "Detected document type"
                  },
                  extractedData: {
                    type: "object",
                    properties: {
                      fullName: { type: "string" },
                      dateOfBirth: { type: "string" },
                      documentNumber: { type: "string" },
                      expiryDate: { type: "string" },
                      nationality: { type: "string" }
                    }
                  },
                  faceDetection: {
                    type: "object",
                    properties: {
                      faceDetected: { type: "boolean" },
                      faceQuality: { type: "string", enum: ["excellent", "good", "fair", "poor"] },
                      photoTampering: { type: "boolean" }
                    }
                  },
                  fraudIndicators: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of detected fraud indicators"
                  },
                  recommendation: {
                    type: "string",
                    enum: ["approve", "reject", "manual_review"],
                    description: "Verification recommendation"
                  },
                  reasoning: {
                    type: "string",
                    description: "Detailed reasoning for the recommendation"
                  }
                },
                required: ["isAuthentic", "confidence", "recommendation", "reasoning"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "kyc_verification_result" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract the structured response from tool call
    const toolCall = result.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No structured response from AI");
    }

    const verification = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        success: true,
        verification,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("KYC verification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
