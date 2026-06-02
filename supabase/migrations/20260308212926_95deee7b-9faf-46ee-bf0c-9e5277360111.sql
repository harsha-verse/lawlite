
-- Create lawyer_reviews table
CREATE TABLE public.lawyer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL,
  client_id uuid NOT NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE SET NULL,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating integer CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  knowledge_rating integer CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
  responsiveness_rating integer CHECK (responsiveness_rating >= 1 AND responsiveness_rating <= 5),
  review_text text,
  is_verified boolean NOT NULL DEFAULT false,
  is_flagged boolean NOT NULL DEFAULT false,
  flag_reason text,
  admin_moderated boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id, consultation_id)
);

-- Enable RLS
ALTER TABLE public.lawyer_reviews ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read non-flagged reviews
CREATE POLICY "Anyone can read published reviews"
  ON public.lawyer_reviews FOR SELECT
  USING (is_flagged = false OR client_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- RLS: Clients can create reviews
CREATE POLICY "Clients can create reviews"
  ON public.lawyer_reviews FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- RLS: Clients can update own reviews
CREATE POLICY "Clients can update own reviews"
  ON public.lawyer_reviews FOR UPDATE
  USING (client_id = auth.uid());

-- RLS: Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON public.lawyer_reviews FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Function to update lawyer rating aggregate
CREATE OR REPLACE FUNCTION public.update_lawyer_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating numeric;
  review_count integer;
BEGIN
  SELECT 
    ROUND(AVG(overall_rating)::numeric, 1),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.lawyer_reviews
  WHERE lawyer_id = COALESCE(NEW.lawyer_id, OLD.lawyer_id)
    AND is_flagged = false;

  UPDATE public.lawyer_profiles
  SET rating = COALESCE(avg_rating, 0),
      total_reviews = COALESCE(review_count, 0),
      updated_at = now()
  WHERE user_id = COALESCE(NEW.lawyer_id, OLD.lawyer_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to auto-update ratings
CREATE TRIGGER update_lawyer_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.lawyer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lawyer_rating();

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.lawyer_reviews;
