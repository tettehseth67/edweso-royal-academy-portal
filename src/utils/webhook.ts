/**
 * Utility helper to dispatch payloads to n8n webhooks with automatic fallback
 * from test endpoints to production endpoints, handling CORS or network drops gracefully.
 */

export const N8N_ENDPOINTS = {
  ENROLLMENT: {
    TEST: 'https://yaw0869.app.n8n.cloud/webhook-test/edweso-enrollment',
    PROD: 'https://yaw0869.app.n8n.cloud/webhook/edweso-enrollment',
  },
  PAYMENT_CONFIRM: {
    TEST: 'https://yaw0869.app.n8n.cloud/webhook-test/edweso-payment-confirm',
    PROD: 'https://yaw0869.app.n8n.cloud/webhook/edweso-payment-confirm',
  },
};

export async function dispatchWebhookWithFallback(
  testUrl: string,
  prodUrl: string,
  payload: Record<string, any>
): Promise<{ ok: boolean; status?: number; data?: string; error?: string }> {
  // 1. Try test webhook endpoint first
  try {
    const res = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const text = await res.text().catch(() => 'OK');
      console.log('[n8n Webhook Success - Test]', testUrl);
      return { ok: true, status: res.status, data: text };
    }
  } catch {
    console.info(`Test webhook unreachable (${testUrl}), attempting production endpoint...`);
  }

  // 2. Fallback to production webhook endpoint
  try {
    const res = await fetch(prodUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const text = await res.text().catch(() => 'OK');
      console.log('[n8n Webhook Success - Production]', prodUrl);
      return { ok: true, status: res.status, data: text };
    } else {
      const text = await res.text().catch(() => '');
      console.warn(`[n8n Webhook Notice] Production webhook responded with status ${res.status}`);
      return { ok: false, status: res.status, error: text };
    }
  } catch (err) {
    console.info(`[n8n Webhook Notice] External webhook endpoint offline or CORS restricted. Proceeding with local application ledger update.`);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
