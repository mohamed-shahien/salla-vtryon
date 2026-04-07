/// <reference types="node" />
/**
 * WIDGET CONTRACT VERIFIER
 * This script ensures that GET /api/widget/config/:merchantId returns the EXACT shape
 * required by the storefront widget. Failure here means a breaking change for shoppers.
 */

import { z } from 'zod';

const WidgetConfigSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    merchant_id: z.number(), // Salla ID
    current_product_id: z.string().nullable(),
    
    // LOCKED Legacy Aliases (DO NOT RENAME)
    mode: z.enum(['all', 'selected']),
    products: z.array(z.number()),
    enabled: z.boolean(),
    
    // Extended properties
    widget_mode: z.enum(['all', 'selected']),
    widget_products: z.array(z.number()),
    overall_enabled: z.boolean(),
    current_product_enabled: z.boolean(),
    button_text: z.string(),
    reason: z.string().nullable()
  })
});

async function verifyContract(baseUrl: string, sallaMerchantId: string, productId?: string) {
  const url = `${baseUrl}/api/widget/config/${sallaMerchantId}${productId ? `?productId=${productId}` : ''}`;
  console.log(`🔍 Testing: ${url}`);
  
  try {
    const res = await fetch(url);
    const body = await res.json();
    
    if (!body.ok) {
        console.error('❌ FAIL: API returned error:', body.message);
        process.exit(1);
    }

    const { data } = body;
    const result = WidgetConfigSchema.safeParse(body);
    
    if (!result.success) {
      console.error('❌ FAIL: Widget contract BROKEN!');
      console.error(result.error.format());
      process.exit(1);
    }

    // MANDATORY BUSINESS RULES CHECK
    console.log('✅ PASS: Basic shape is stable.');

    // Rule: selected mode + no products -> enabled MUST be false
    if (data.mode === 'selected' && data.products.length === 0) {
        if (data.enabled !== false) {
            console.error('❌ FAIL: Deterministic Stability Rule Broken! "selected" mode with 0 products MUST have "enabled: false".');
            process.exit(1);
        }
        console.log('✅ PASS: Deterministic behavior (selected + empty) verified.');
    }

    // Rule: all mode -> enabled should respect overall_enabled
    if (data.mode === 'all') {
        if (data.overall_enabled && data.enabled !== true) {
             console.error('❌ FAIL: "all" mode should be enabled if overall_enabled is true.');
             process.exit(1);
        }
        console.log('✅ PASS: "all" mode rendering verified.');
    }

    console.log('📦 Sample Payload (enabled):', data.enabled);
    console.log('📦 Sample Payload (mode):', data.mode);

  } catch (err) {
    console.error('❌ FAIL: Connection refused or invalid JSON', err);
    process.exit(1);
  }
}

// Usage: pnpm tsx scripts/verify-widget-contract.ts http://localhost:3000 <salla_merchant_id> <product_id>
const [,, baseUrl, sallaMerchantId, productId] = process.argv;

if (!baseUrl || !sallaMerchantId) {
  console.log('Usage: pnpm tsx verify-widget-contract.ts <baseUrl> <sallaMerchantId> [productId]');
  process.exit(0);
}

verifyContract(baseUrl, sallaMerchantId, productId);
