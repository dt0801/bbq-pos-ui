// ─── billHTML.js — Generate HTML in bill, dùng chung cho print thật & preview ──
// settings prefix: bill_ | tamtinh_ | kitchen_

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n * 1000) + "đ";

function buildCfg(settings, type) {
  const P = { bill: "bill_", tamtinh: "tamtinh_", kitchen: "kitchen_" }[type] || "bill_";
  const get = (k) => settings[P + k] || "";
  return {
    store_name:      settings.store_name    || "",
    store_address:   settings.store_address || "",
    store_phone:     settings.store_phone   || "",
    extra_header:    get("extra_header"),
    extra_footer:    get("extra_footer"),
    footer:          get("footer"),
    font_size:       get("font_size")      || "13",
    font_style:      get("font_style")     || "normal",
    header_align:    get("header_align")   || "center",
    show_qty:        settings[P + "show_qty"],
    show_unit_price: settings[P + "show_unit_price"],
  };
}

export function generateBillHTML({ settings, type, tableNum, items, total, billId, createdAt, isReprint = false }) {
  const cfg      = buildCfg(settings, type);
  const fs       = Number(cfg.font_size);
  const align    = cfg.header_align;
  const fw       = cfg.font_style === "bold"   ? "bold"   : "normal";
  const fi       = cfg.font_style === "italic" ? "italic" : "normal";
  const dateStr  = createdAt
    ? new Date(createdAt).toLocaleString("vi-VN")
    : new Date().toLocaleString("vi-VN");
  const timeStr  = new Date().toLocaleTimeString("vi-VN");

  const baseStyle = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:monospace;font-size:${fs}px;font-weight:${fw};font-style:${fi};
         width:100%;max-width:320px;margin:0 auto;padding:16px;color:#000;background:#fff;line-height:1.6}
    .hr{border-top:1px dashed #999;margin:5px 0}
    .center{text-align:center}
    .right{text-align:right}
    .bold{font-weight:bold}
    .sub{font-size:${fs-1}px;color:#555}
    .muted{font-size:${fs-2}px;color:#888}
    .row{display:flex;justify-content:space-between}
    table{width:100%;border-collapse:collapse}
    th,td{padding:3px 2px;font-size:${fs}px}
    @media print{@page{size:80mm auto;margin:4mm}body{max-width:100%}}
  `;

  const headerHTML = `
    <div style="text-align:${align};margin-bottom:8px">
      <div style="font-size:${fs+2}px;font-weight:bold">${cfg.store_name || "TIỆM NƯỚNG ĐÀ LẠT VÀ EM"}</div>
      ${cfg.store_address ? `<div class="sub">${cfg.store_address}</div>` : ""}
      ${cfg.store_phone   ? `<div class="sub">ĐT: ${cfg.store_phone}</div>` : ""}
      ${cfg.extra_header  ? `<div class="sub" style="margin-top:2px">${cfg.extra_header}</div>` : ""}
    </div>
  `;

  const footerHTML = cfg.footer
    ? `<div class="hr"></div><div class="center sub" style="font-style:italic">${cfg.footer}</div>`
    : "";
  const extraFooterHTML = cfg.extra_footer
    ? `<div class="center muted" style="margin-top:2px">${cfg.extra_footer}</div>`
    : "";

  let bodyHTML = "";

  // ── PHIẾU BẾP ──────────────────────────────────────────────────────────────
  if (type === "kitchen") {
    bodyHTML = `
      <div class="center bold" style="font-size:${fs+3}px;margin-bottom:4px">🍳 PHIẾU BẾP</div>
      <div class="center sub" style="margin-bottom:8px">Bàn <b>${tableNum}</b> | ${timeStr}</div>
      <div class="hr"></div>
      ${items.map(i => `
        <div style="margin-bottom:6px">
          <div class="row" style="font-size:${fs+1}px">
            <span>${i.name}</span>
            <span class="bold" style="font-size:${fs+3}px">x${i.qty}</span>
          </div>
          ${i.note ? `<div style="font-size:${fs-2}px;color:#c00;margin-left:12px">📝 ${i.note}</div>` : ""}
        </div>
      `).join("")}
      <div class="hr"></div>
      ${cfg.footer ? `<div class="center sub" style="font-style:italic">${cfg.footer}</div>` : ""}
    `;
    return wrapHTML(baseStyle, bodyHTML, `Phiếu Bếp - Bàn ${tableNum}`);
  }

  // ── TẠM TÍNH ───────────────────────────────────────────────────────────────
  if (type === "tamtinh") {
    bodyHTML = `
      ${headerHTML}
      <div class="hr"></div>
      <div class="sub" style="overflow:hidden">
        <span>Bàn: <b>${tableNum}</b></span>
        <span style="float:right">${dateStr}</span>
      </div>
      <div class="hr"></div>
      <div class="center bold" style="font-size:${fs+1}px;margin-bottom:6px">** TẠM TÍNH **</div>
      ${items.map(i => `
        <div class="row" style="margin-bottom:3px">
          <span>${i.name} x${i.qty}</span>
          <span>${fmt(i.price * i.qty)}</span>
        </div>
      `).join("")}
      <div class="hr"></div>
      <div class="row bold" style="font-size:${fs+1}px">
        <span>TẠM TÍNH</span><span>${fmt(total)}</span>
      </div>
      <div class="center muted" style="margin-top:4px;font-style:italic">(Chưa thanh toán chính thức)</div>
      ${footerHTML}${extraFooterHTML}
    `;
    return wrapHTML(baseStyle, bodyHTML, `Tạm Tính - Bàn ${tableNum}`);
  }

  // ── BILL THANH TOÁN ─────────────────────────────────────────────────────────
  const showQty       = cfg.show_qty       !== "false";
  const showUnitPrice = cfg.show_unit_price !== "false";
  bodyHTML = `
    ${headerHTML}
    <div class="hr"></div>
    <div class="sub" style="overflow:hidden">
      <span>Bàn: <b>${tableNum}</b>${billId ? ` · HD#${billId}` : ""}</span>
      <span style="float:right">${dateStr}</span>
    </div>
    <div class="hr"></div>
    <table>
      <thead>
        <tr style="border-bottom:1px dashed #999">
          <th style="text-align:left;padding-bottom:3px">Tên món</th>
          ${showQty       ? `<th style="text-align:center;width:28px">SL</th>`           : ""}
          ${showUnitPrice ? `<th style="text-align:right;width:60px">Đơn</th>`           : ""}
          <th style="text-align:right;width:70px">T.Tiền</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((i, idx) => `
          <tr>
            <td style="padding-top:3px">${idx+1}. ${i.name}</td>
            ${showQty       ? `<td style="text-align:center">${i.qty}</td>`                        : ""}
            ${showUnitPrice ? `<td style="text-align:right;color:#555">${fmt(i.price)}</td>`       : ""}
            <td style="text-align:right">${fmt(i.price * i.qty)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <div class="hr"></div>
    <div class="row bold" style="font-size:${fs+1}px">
      <span>THÀNH TIỀN</span><span>${fmt(total)}</span>
    </div>
    ${isReprint ? `<div class="center muted" style="margin-top:4px">*** IN LẠI ***</div>` : ""}
    ${footerHTML}${extraFooterHTML}
  `;
  return wrapHTML(baseStyle, bodyHTML, `Hóa Đơn - Bàn ${tableNum}`);
}

function wrapHTML(style, body, title) {
  return `<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <style>${style}</style>
  </head><body>${body}</body></html>`;
}