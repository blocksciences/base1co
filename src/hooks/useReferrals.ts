import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useReferrals = (walletAddress?: string) => {
  const queryClient = useQueryClient();

  // Get user's referral code
  const { data: referralCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ["referralCode", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("wallet_address", walletAddress)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!walletAddress,
  });

  // Get referral statistics
  const { data: stats } = useQuery({
    queryKey: ["referralStats", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;

      const [referralsData, rewardsData] = await Promise.all([
        supabase
          .from("referrals")
          .select("*")
          .eq("referrer_wallet", walletAddress),
        supabase
          .from("referral_rewards")
          .select("*")
          .eq("wallet_address", walletAddress),
      ]);

      return {
        totalReferrals: referralsData.data?.length || 0,
        totalEarned: rewardsData.data?.reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        unclaimed: rewardsData.data?.filter(r => !r.claimed).reduce((sum, r) => sum + Number(r.amount), 0) || 0,
        referrals: referralsData.data || [],
        rewards: rewardsData.data || [],
      };
    },
    enabled: !!walletAddress,
  });

  // Create referral code
  const createCode = useMutation({
    mutationFn: async () => {
      if (!walletAddress) throw new Error("Wallet not connected");

      // Generate code using database function
      const { data: codeData, error: codeError } = await supabase
        .rpc("generate_referral_code", { user_wallet: walletAddress });

      if (codeError) throw codeError;

      // Insert the code
      const { data, error } = await supabase
        .from("referral_codes")
        .insert({
          wallet_address: walletAddress,
          code: codeData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referralCode", walletAddress] });
      toast.success("Referral code created!");
    },
    onError: (error) => {
      toast.error("Failed to create referral code");
      console.error(error);
    },
  });

  // Register with referral code
  const registerReferral = useMutation({
    mutationFn: async (code: string) => {
      if (!walletAddress) throw new Error("Wallet not connected");

      // Check if code exists
      const { data: codeData, error: codeError } = await supabase
        .from("referral_codes")
        .select("wallet_address")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (codeError) throw new Error("Invalid referral code");

      // Can't refer yourself
      if (codeData.wallet_address.toLowerCase() === walletAddress.toLowerCase()) {
        throw new Error("Cannot use your own referral code");
      }

      // Check if already used a referral
      const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referee_wallet", walletAddress)
        .single();

      if (existing) throw new Error("Already used a referral code");

      // Create referral
      const { data, error } = await supabase
        .from("referrals")
        .insert({
          referrer_wallet: codeData.wallet_address,
          referee_wallet: walletAddress,
          referral_code: code.toUpperCase(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Referral code applied!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to apply referral code");
    },
  });

  return {
    referralCode,
    isLoadingCode,
    stats,
    createCode,
    registerReferral,
  };
};
