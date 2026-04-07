# Virtual Try-On Final Production Execution Plan (Executive Reference)

This document serves as the definitive reference for transitioning the Virtual Try-On project for Salla to a stable, production-ready environment. It eliminates technical debt, optimizes the AI pipeline, and simplifies the user experience.

---

## 1. Root Cause Review: Why the "Service Busy" (429) Persists
- **Replicate API Tier Lag**: Accounts with < $5 balance are restricted (6 req/min). The system's internal gate (`MAX_GLOBAL_CONCURRENCY = 1`) works, but consecutive rapid requests from different users hit the Replicate API's internal burst limit before the gate can reset.
- **Polling Density**: Development tunnels (Ngrok) throttle requests that occur faster than 7s-10s intervals.
- **Processor Fragility**: The current job processor fails immediately upon encountering a 429 rather than pausing and retrying during the `retry_after` window.
- **Legacy UI Constraints**: The manual selection of "Upper body", "Lower body", and "Dresses" is an outdated UX pattern that often leads to incorrect prompt generation when the user selects the wrong category for an item.

---

## 2. Final Architecture: Cloud-Native Hybrid Pipeline
- **Frontend**: Stateless, unified Storefront Widget.
- **Backend API**: Stateless Express.js orchestrator managing Supabase (DB) and Bunny.net (CDN).
- **Job Engine**: Asynchronous DB-backed Queue.
- **AI Worker**: Rate-limit-aware sequential processor.

---

## 3. Improved Model Prompt: Universal Descriptive Prompt (Nano-Banana)
The new pipeline eliminates manual categories in favor of a **Universal Prompt** that provides high-fidelity instructions based on visual analysis:

> "Professionally apply the garment image (2nd image) onto the person (1st image). 
> Meticulously preserve the person's exact body proportions, pose, skin tone, and facial features. 
> The garment must drape realistically over the body, respecting all occlusions, shadows, and perspective. 
> The final output must be a photorealistic, high-resolution fashion editorial shot with the garment seamlessly integrated into the person's environment. 
> Output Format: JPG."

---

## 4. Request / Response Contracts

### Job Creation (POST `/api/widget/job`)
- **Request**: `FormData` containing `file` (User photo) and `product_image_url`.
- **Note**: `category` field is deprecated and will default to `universal`.

### Job Status (GET `/api/widget/job/:id`)
- **Response**:
```json
{
  "status": "processing" | "completed" | "failed",
  "result_image_url": "https://cdn.vtryon.dev/...",
  "metadata": {
    "current_step": "PREPARING_GARMENT" | "GENERATING_RESULT" | "FINALIZING",
    "queue_position": 0
  }
}
```

---

## 5. Job System Design & State Machine
1. **PENDING**: Job stored in DB.
2. **PROCESSING**:
   - **Step A (ANALYZING)**: Quality/Body Pose/Lighting check.
   - **Step B (PREPROCESSING)**: Remove BG + Garment Caching.
   - **Step C (REPLICATE)**: AI generation with **Exponential Backoff Retry** for 429s.
3. **COMPLETED / FAILED**: Final result or localized Arabic error reason.

---

## 6. Concurrency Handling: The "Sequential Gate"
- **Global Concurrency Lock**: `MAX_GLOBAL_CONCURRENCY` remains at 1 until account tier is upgraded.
- **Retry Strategy**: 
  - If 429 is caught: **Wait 15s** and Retry (Limit 3 attempts).
  - This prevents job failure for users who just happen to hit the button at the same time.

---

## 7. Performance & Cost Optimizations
- **Garment Caching**: Reuse previously cleaned garment files for the same `product_id`.
- **Sharp/Bunny Optimization**: Only process result images locally if resizing/cropping is needed; otherwise, stream directly to Bunny CDN.
- **Adaptive Polling**: Widget polls every 10s initially, only increasing to 5s once the job enters the "GENERATING_RESULT" phase.

---

## 8. Testing & Console Monitoring Checklist
- [ ] **Check [REPLICATE]**: Watch for "Retry logic triggered" logs.
- [ ] **Check [WIDGET]**: Confirm no "Category" buttons appear in the shell.
- [ ] **Check [BUNNY]**: Confirm final image is < 700KB for fast loading.
- [ ] **Check [DB]**: Ensure `credit_transactions` matches the number of successful jobs.

---

## 9. Final Production Recommendation
**The system is production-ready when deployed on a funded (> $50) Replicate account.** 
Unified prompting is the most scalable approach for a multi-tenant Salla App, as it handles all garment types (Thobes, Abayas, Dresses, Suits) without manual UI branching.
