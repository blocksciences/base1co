-- Enable realtime for kyc_submissions table so clients can subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.kyc_submissions;