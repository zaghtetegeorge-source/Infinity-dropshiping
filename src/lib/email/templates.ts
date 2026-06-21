interface AbandonedCartItem {
  titleEn: string;
  titleAr: string;
  quantity: number;
  imageUrl?: string;
}

interface AbandonedCartEmailArgs {
  items: AbandonedCartItem[];
  recoveryUrl: string;
  currency: string;
  total: string;
}

// Bilingual (AR + EN) so it works without per-customer locale tracking.
export function abandonedCartEmailHtml({ items, recoveryUrl, total }: AbandonedCartEmailArgs): string {
  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          ${item.imageUrl ? `<img src="${item.imageUrl}" width="64" height="64" style="border-radius:8px;object-fit:cover;vertical-align:middle;margin-left:12px;" />` : ""}
          <span style="font-size:15px;color:#111;">${item.titleEn} / ${item.titleAr}</span>
          <span style="color:#888;font-size:13px;"> &times; ${item.quantity}</span>
        </td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="color:#111;">نسيت شيئاً في سلتك؟ / Forgot something in your cart?</h2>
    <p style="color:#444;font-size:15px;">
      سلتك لا تزال بانتظارك! أكمل طلبك الآن قبل نفاد الكمية.<br/>
      Your cart is still waiting! Complete your order now before stock runs out.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml}</table>
    <p style="font-size:16px;font-weight:bold;color:#111;">Total: ${total}</p>
    <a href="${recoveryUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;margin-top:12px;">
      أكمل الطلب الآن / Complete your order
    </a>
  </div>`;
}
