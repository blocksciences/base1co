import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KYCVerificationRequest {
  documentImage: string; // Base64 data URL
  documentType: string;
  fullName: string;
  dateOfBirth: string;
}

interface KYCVerificationResult {
  isAuthentic: boolean;
  confidence: number;
  documentType?: string;
  extractedData?: {
    fullName?: string;
    dateOfBirth?: string;
    documentNumber?: string;
    expiryDate?: string;
    nationality?: string;
  };
  faceDetection?: {
    faceDetected: boolean;
    faceQuality: string;
    photoTampering: boolean;
  };
  fraudIndicators?: string[];
  recommendation: "approve" | "reject" | "manual_review";
  reasoning: string;
}

export const useAIKYCVerification = () => {
  return useMutation({
    mutationFn: async (request: KYCVerificationRequest): Promise<KYCVerificationResult> => {
      const { data, error } = await supabase.functions.invoke("ai-kyc-verify", {
        body: request,
      });

      if (error) {
        if (error.message.includes("429")) {
          throw new Error("AI service is currently busy. Please try again in a moment.");
        }
        if (error.message.includes("402")) {
          throw new Error("AI verification service is temporarily unavailable.");
        }
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || "Verification failed");
      }

      return data.verification;
    },
    onError: (error: Error) => {
      console.error("AI KYC verification error:", error);
      toast.error(error.message || "Failed to verify document");
    },
  });
};
