-- Migration: Add Conversion Attribution columns to tryon_jobs
-- Created: 2026-04-12
-- Focus: ROI Evidence for Merchants

-- 1. Add columns for conversion tracking
ALTER TABLE public.tryon_jobs 
ADD COLUMN IF NOT EXISTS is_converted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS attributed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attributed_order_id TEXT,
ADD COLUMN IF NOT EXISTS revenue_impact DECIMAL(12, 2);

-- 2. Add index for faster attribution lookups
-- We search by (merchant_id, product_id, status) within a time window
CREATE INDEX IF NOT EXISTS idx_tryon_jobs_attribution 
ON public.tryon_jobs (merchant_id, product_id, status) 
WHERE status = 'completed' AND is_converted = false;

-- 3. Add comment to columns for documentation
COMMENT ON COLUMN public.tryon_jobs.is_converted IS 'Flag indicating if this try-on job led to a purchase.';
COMMENT ON COLUMN public.tryon_jobs.revenue_impact IS 'The price of the product at the time of the attributed purchase.';
