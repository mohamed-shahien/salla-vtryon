import { AppError } from '../utils/app-error.js'
import { getSupabaseClient } from './merchant.service.js'

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface OrderPayload {
  id: string
  merchant: {
    id: number
  }
  customer: {
    id: number
    first_name?: string
    last_name?: string
    email?: string
  }
  items: OrderItem[]
  created_at: {
    date: string
    timezone: string
  } | string
}

/**
 * Attribution Service
 * Connects store orders back to try-on activity for ROI reporting.
 */
export async function attributeOrderToJobs(order: OrderPayload) {
  const db = getSupabaseClient()
  const sallaMerchantId = order.merchant.id
  const customerId = order.customer.id
  
  // Salla created_at can be "2023-10-10 10:00:00" or { date: "..." }
  const rawDate = typeof order.created_at === 'object' ? order.created_at.date : order.created_at
  const orderCreatedAt = new Date(rawDate)
  const windowStart = new Date(orderCreatedAt.getTime() - 48 * 60 * 60 * 1000)

  console.log(`[attribution] processing_order=${order.id} merchant=${sallaMerchantId} customer=${customerId}`)

  const attributionResults = []

  for (const item of order.items) {
    const productId = String(item.id)

    // Find the latest successful try-on for this product/customer within the window
    // and which hasn't been converted yet.
    const { data: matchingJob, error } = await db
      .from('tryon_jobs')
      .select('id, merchant_id')
      .eq('product_id', productId)
      .eq('status', 'completed')
      .eq('is_converted', false)
      // metadata matching for customer id
      .eq('metadata->>customer_id', String(customerId))
      .gte('created_at', windowStart.toISOString())
      .lte('created_at', rawDate)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(`[attribution] error_finding_job order=${order.id} item=${productId}:`, error.message)
      continue
    }

    if (matchingJob) {
      console.log(`[attribution] match_found! job=${matchingJob.id} order=${order.id} item=${productId}`)
      
      // Update the job with attribution data
      const { error: updateError } = await db
        .from('tryon_jobs')
        .update({
          is_converted: true,
          attributed_at: new Date().toISOString(),
          attributed_order_id: String(order.id),
          revenue_impact: item.price * item.quantity
        })
        .eq('id', matchingJob.id)

      if (updateError) {
        console.error(`[attribution] error_updating_job=${matchingJob.id}:`, updateError.message)
      } else {
        attributionResults.push({
          jobId: matchingJob.id,
          productId: productId,
          revenue: item.price * item.quantity
        })
      }
    }
  }

  return attributionResults
}
