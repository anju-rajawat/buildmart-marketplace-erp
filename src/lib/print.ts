import type { Order } from '@/types'
import { formatCurrency, formatDate, humanize } from './utils'

/**
 * Opens a clean, print-ready GST invoice in a new window and triggers the
 * browser print dialog (the user can "Save as PDF" from there).
 */
export function printInvoice(order: Order, buyerName: string): void {
  const win = window.open('', '_blank', 'width=820,height=920')
  if (!win) {
    alert('Please allow pop-ups to print the invoice.')
    return
  }

  const rows = order.items
    .map(
      (it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.name}<div class="muted">${it.brand}</div></td>
        <td class="r">${it.quantity} ${it.unit}</td>
        <td class="r">${formatCurrency(it.price)}</td>
        <td class="r">${formatCurrency(it.price * it.quantity)}</td>
      </tr>`,
    )
    .join('')

  const a = order.address

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
  <title>Invoice ${order.code}</title>
  <style>
    *{box-sizing:border-box;font-family:Arial,Helvetica,sans-serif}
    body{margin:0;padding:32px;color:#0f172a}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #f59e0b;padding-bottom:16px}
    .brand{font-size:26px;font-weight:800}
    .brand span{color:#f59e0b}
    .muted{color:#64748b;font-size:12px}
    h1{font-size:18px;margin:0}
    .meta{text-align:right;font-size:13px;color:#334155}
    .cols{display:flex;justify-content:space-between;margin:24px 0;gap:24px}
    .box{font-size:13px;line-height:1.5}
    .box h3{font-size:11px;text-transform:uppercase;color:#94a3b8;letter-spacing:.04em;margin:0 0 4px}
    table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}
    th{background:#f8fafc;text-align:left;padding:10px;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;color:#64748b}
    td{padding:10px;border-bottom:1px solid #f1f5f9;vertical-align:top}
    .r{text-align:right}
    .totals{margin-left:auto;width:280px;margin-top:16px;font-size:13px}
    .totals div{display:flex;justify-content:space-between;padding:6px 0}
    .totals .grand{border-top:2px solid #0f172a;margin-top:6px;padding-top:10px;font-size:16px;font-weight:800}
    .pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;background:#dcfce7;color:#166534}
    .foot{margin-top:40px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:11px;color:#94a3b8;text-align:center}
    @media print{body{padding:0}}
  </style></head><body>
    <div class="top">
      <div>
        <div class="brand">Build<span>Mart</span></div>
        <div class="muted">Construction Materials Marketplace + ERP<br/>GSTIN: 06AABCB0000A1Z5 · support@buildmart.in</div>
      </div>
      <div class="meta">
        <h1>TAX INVOICE</h1>
        <div><b>${order.code}</b></div>
        <div>Date: ${formatDate(order.createdAt, true)}</div>
        <div>Payment: ${humanize(order.payment.method)} · <span class="pill">${humanize(order.payment.status)}</span></div>
      </div>
    </div>

    <div class="cols">
      <div class="box">
        <h3>Bill To</h3>
        <b>${buyerName}</b><br/>
        ${a.label}<br/>${a.line1}${a.line2 ? ', ' + a.line2 : ''}<br/>
        ${a.city}, ${a.state} – ${a.pincode}
      </div>
      <div class="box" style="text-align:right">
        <h3>Delivery</h3>
        Expected by<br/><b>${formatDate(order.expectedDelivery)}</b>
      </div>
    </div>

    <table>
      <thead><tr><th>#</th><th>Item</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div>
      ${order.discount > 0 ? `<div><span>Discount ${order.couponCode ? '(' + order.couponCode + ')' : ''}</span><span>− ${formatCurrency(order.discount)}</span></div>` : ''}
      <div><span>GST (18%)</span><span>${formatCurrency(order.gst)}</span></div>
      <div><span>Shipping</span><span>${order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}</span></div>
      <div class="grand"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
    </div>

    <div class="foot">This is a computer-generated invoice. Thank you for shopping with BuildMart.</div>
  </body></html>`)

  win.document.close()
  win.focus()
  // give the new window a tick to render before printing
  setTimeout(() => win.print(), 350)
}

import type { Quotation } from '@/types'

/**
 * Opens a clean, print-ready QUOTATION / ESTIMATE in a new window and triggers
 * the print dialog (the user can "Save as PDF" from there).
 */
export function printQuotation(q: Quotation, buyerName: string, sellerName: string): void {
  const win = window.open('', '_blank', 'width=820,height=920')
  if (!win) {
    alert('Please allow pop-ups to print the quotation.')
    return
  }

  const rows = q.items
    .map(
      (it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.name}</td>
        <td class="r">${it.quantity}</td>
        <td class="r">${it.unit}</td>
      </tr>`,
    )
    .join('')

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
  <title>Quotation ${q.code}</title>
  <style>
    *{box-sizing:border-box;font-family:Arial,Helvetica,sans-serif}
    body{margin:0;padding:32px;color:#0f172a}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #f59e0b;padding-bottom:16px}
    .brand{font-size:26px;font-weight:800}
    .brand span{color:#f59e0b}
    .muted{color:#64748b;font-size:12px}
    h1{font-size:18px;margin:0}
    .meta{text-align:right;font-size:13px;color:#334155}
    .title-box{margin:22px 0 0;border:2px solid #0f172a;border-radius:6px;padding:8px;text-align:center;font-weight:800;letter-spacing:1px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    .info td{border:1px solid #e2e8f0;padding:8px}
    .info b{font-size:11px;text-transform:uppercase;color:#64748b;display:block}
    .items{margin-top:18px}
    .items th{background:#f8fafc;text-align:left;padding:10px;border:1px solid #e2e8f0;font-size:11px;text-transform:uppercase;color:#64748b}
    .items td{padding:10px;border:1px solid #f1f5f9}
    .r{text-align:right}
    .price{margin:18px 0 0;width:300px;margin-left:auto;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;font-size:13px}
    .price div{display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #f1f5f9}
    .price .grand{background:#fff7ed;font-weight:800;font-size:15px;border-bottom:none}
    .note{margin-top:18px;font-size:13px;color:#334155}
    .note i{color:#64748b}
    .pill{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;background:#fef3c7;color:#92400e}
    .sign{display:flex;justify-content:space-between;margin-top:50px;font-size:12px}
    .sign div{border-top:1px solid #94a3b8;padding-top:6px;width:200px}
    .foot{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:10px;font-size:11px;color:#94a3b8;text-align:center}
    @media print{body{padding:0}}
  </style></head><body>
    <div class="top">
      <div>
        <div class="brand">Build<span>Mart</span></div>
        <div class="muted">Construction Materials Marketplace + ERP<br/>GSTIN: 06AABCB0000A1Z5 · support@buildmart.in</div>
      </div>
      <div class="meta">
        <h1>QUOTATION</h1>
        <div><b>${q.code}</b></div>
        <div>Date: ${formatDate(q.createdAt, true)}</div>
        <div>Status: <span class="pill">${humanize(q.status)}</span></div>
      </div>
    </div>

    <div class="title-box">QUOTATION / PRICE ESTIMATE</div>

    <table class="info" style="margin-top:18px">
      <tr>
        <td style="width:50%"><b>Customer</b>${buyerName}</td>
        <td><b>Prepared By</b>${sellerName}</td>
      </tr>
      <tr>
        <td><b>Quotation No</b>${q.code}</td>
        <td><b>Date</b>${formatDate(q.createdAt)}</td>
      </tr>
    </table>

    <table class="items">
      <thead><tr><th>#</th><th>Item</th><th class="r">Qty</th><th class="r">Unit</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    ${
      q.quotedPrice
        ? `<div class="price">
             <div><span>Quoted Total</span><span>${formatCurrency(q.quotedPrice)}</span></div>
             <div class="grand"><span>Grand Total</span><span>${formatCurrency(q.quotedPrice)}</span></div>
           </div>`
        : `<div class="note"><b>Awaiting seller quote.</b></div>`
    }

    ${q.note ? `<div class="note"><b>Note / Requirement:</b> <i>“${q.note}”</i></div>` : ''}

    <div class="sign">
      <div>Customer Acceptance</div>
      <div style="text-align:right">Authorized Signatory<br/>${sellerName}</div>
    </div>

    <div class="foot">This is a computer-generated quotation. Prices are indicative and subject to confirmation.</div>
  </body></html>`)

  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 350)
}
