import type { Order } from "~/types/order";
import { ORDER_STATUS_LABELS } from "~/types/order";

/**
 * Composable untuk cetak invoice & label pengiriman (client-side, tanpa server).
 * Menggunakan browser print API — tidak butuh library PDF eksternal.
 */
export const useInvoicePrinter = () => {
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // ============================================
  // INVOICE HTML
  // ============================================

  const generateInvoiceHtml = (order: Order): string => {
    const itemsRows = (order.items ?? [])
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${item.product_title}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${item.karat_type ?? "-"}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.unit_price)}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.subtotal)}</td>
        </tr>`,
      )
      .join("");

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${order.order_number}</title>
  <style>
    body { font-family: 'Poppins', Arial, sans-serif; color: #111; margin: 0; padding: 24px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .brand { font-size: 20px; font-weight: 700; color: #591927; }
    .brand small { display: block; font-size: 11px; font-weight: 400; color: #666; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { margin: 0 0 4px; font-size: 16px; color: #591927; }
    .section { margin-bottom: 16px; }
    .section h4 { margin: 0 0 4px; font-size: 12px; color: #888; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #591927; color: #fff; padding: 8px; text-align: left; font-size: 12px; }
    .total-row td { font-weight: 700; background: #faf7f2; }
    .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; background:#d1fae5; color:#065f46; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Melati Gold Shop<small>melatigoldshop.com</small></div>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <div><strong>${order.order_number}</strong></div>
      <div style="color:#666;">${formatDate(order.created_at)}</div>
      <div class="badge">${ORDER_STATUS_LABELS[order.status]}</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px;">
    <div class="section">
      <h4>Pelanggan</h4>
      <strong>${order.customer_name}</strong><br>
      ${order.customer_phone}<br>
      ${order.customer_address ? `<span style="color:#666;">${order.customer_address}</span>` : ""}
    </div>
    <div class="section">
      <h4>Pembayaran</h4>
      Metode: <strong>${order.payment_method.toUpperCase()}</strong><br>
      ${order.shipping_courier ? `Kurir: <strong>${order.shipping_courier}</strong><br>` : ""}
      ${order.shipping_tracking_number ? `No. Resi: <strong>${order.shipping_tracking_number}</strong>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Produk</th>
        <th style="text-align:center;">Kadar</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Harga Satuan</th>
        <th style="text-align:right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
      <tr class="total-row">
        <td colspan="4" style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Total</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(order.total_amount)}</td>
      </tr>
    </tbody>
  </table>

  ${order.notes ? `<div class="section"><h4>Catatan</h4><p style="margin:0;color:#555;">${order.notes}</p></div>` : ""}

  <div class="footer">Terima kasih telah berbelanja di Melati Gold Shop · Dokumen ini dicetak secara otomatis</div>
</body>
</html>`;
  };

  // ============================================
  // LABEL PENGIRIMAN HTML
  // ============================================

  const generateShippingLabelHtml = (order: Order): string => {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Label ${order.order_number}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 16px; }
    .label { border: 2px solid #111; padding: 16px; max-width: 320px; }
    .label-header { text-align: center; font-size: 11px; color: #666; margin-bottom: 12px; border-bottom: 1px dashed #ccc; padding-bottom: 8px; }
    .label-brand { font-weight: 700; font-size: 14px; color: #591927; }
    .section-title { font-size: 10px; text-transform: uppercase; color: #888; margin: 8px 0 2px; }
    .recipient { font-size: 15px; font-weight: 700; }
    .address { font-size: 13px; color: #333; margin-top: 4px; }
    .phone { font-size: 12px; color: #555; }
    .order-no { margin-top: 12px; padding-top: 8px; border-top: 1px dashed #ccc; font-size: 11px; }
    .courier-box { margin-top: 10px; background: #111; color: #fff; text-align: center; padding: 6px; font-size: 13px; font-weight: 700; border-radius: 4px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="label">
    <div class="label-header">
      <div class="label-brand">MELATI GOLD SHOP</div>
      <div>melatigoldshop.com</div>
    </div>

    <div class="section-title">Kepada</div>
    <div class="recipient">${order.customer_name}</div>
    <div class="phone">${order.customer_phone}</div>
    ${order.customer_address ? `<div class="address">${order.customer_address}</div>` : ""}

    ${order.shipping_courier ? `<div class="courier-box">${order.shipping_courier.toUpperCase()}</div>` : ""}

    <div class="order-no">
      <strong>No. Order:</strong> ${order.order_number}<br>
      ${order.shipping_tracking_number ? `<strong>No. Resi:</strong> ${order.shipping_tracking_number}` : ""}
    </div>
  </div>
</body>
</html>`;
  };

  // ============================================
  // PRINT (menggunakan browser window.print)
  // ============================================

  const printInvoice = (order: Order): void => {
    const html = generateInvoiceHtml(order);
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) {
      console.error("Popup blocked — izinkan popup untuk mencetak invoice.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    // Delay untuk pastikan render selesai sebelum print dialog
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const printShippingLabel = (order: Order): void => {
    const html = generateShippingLabelHtml(order);
    const win = window.open("", "_blank", "width=400,height=500");
    if (!win) {
      console.error("Popup blocked — izinkan popup untuk mencetak label.");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  return {
    printInvoice,
    printShippingLabel,
  };
};
