// ============================================================
// SuperPOS — vanilla HTML/CSS/JS version (converted from React)
// ============================================================

// ---- Demo data (same as original) ----
const initialProducts = [
  { id: 1, barcode: "8901234567890", name: "Coca Cola 500ml", category: "Drinks",  price: 60,  stock: 42 },
  { id: 2, barcode: "8901234567891", name: "Lays Classic",    category: "Snacks",  price: 50,  stock: 18 },
  { id: 3, barcode: "8901234567892", name: "Milk 1L",         category: "Dairy",   price: 95,  stock: 7  },
  { id: 4, barcode: "8901234567893", name: "Basmati Rice 5kg",category: "Grocery", price: 850, stock: 25 },
  { id: 5, barcode: "8901234567894", name: "Noodles",         category: "Grocery", price: 45,  stock: 63 },
  { id: 6, barcode: "8901234567895", name: "Chocolate Bar",   category: "Snacks",  price: 80,  stock: 4  },
];

const money = n => "Rs. " + Number(n).toLocaleString("en-IN");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

const NAV = [
  { name: "Dashboard",      icon: "layout-dashboard" },
  { name: "Point of Sale",  icon: "shopping-cart" },
  { name: "Inventory",      icon: "package" },
  { name: "Sales",          icon: "receipt-text" },
  { name: "Reports",        icon: "bar-chart-3" },
  { name: "Settings",       icon: "settings" },
];

// ---- App state ----
const state = {
  page: "Dashboard",
  dark: true,
  sidebarOpen: false,
  products: initialProducts.map(p => ({ ...p })),
  cart: [],       // { id, name, price, stock, qty }
  search: "",     // top search bar -> filters POS product grid
  barcode: "",    // scan input value
};

// ---- Small helpers ----
const icon = (name, size = 18) => `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`;
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }

function filteredForPOS() {
  const s = state.search.trim().toLowerCase();
  if (!s) return state.products;
  return state.products.filter(p =>
    [p.name, p.category, p.barcode].some(v => String(v).toLowerCase().includes(s))
  );
}

// ============================================================
// Shared small components
// ============================================================
function headHtml(eyebrow, title, sub, actionsHtml = "") {
  return `<div class="pageHead">
    <div><small>${esc(eyebrow)}</small><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>
    ${actionsHtml}
  </div>`;
}

function statHtml(title, value, change, iconName) {
  return `<div class="stat">
    <div class="statIcon">${icon(iconName, 19)}</div>
    <p>${esc(title)}</p>
    <h2>${esc(value)}</h2>
    <span>${icon("arrow-up-right", 13)}${esc(change)}</span>
  </div>`;
}

const RECENT_TX = [
  ["#INV-00842", "Admin",   "4 items", "Rs. 1,240"],
  ["#INV-00841", "Cashier", "2 items", "Rs. 560"],
  ["#INV-00840", "Admin",   "7 items", "Rs. 2,890"],
  ["#INV-00839", "Cashier", "3 items", "Rs. 740"],
];

function tableHtml() {
  return `<div class="tableWrap"><table>
    <thead><tr><th>INVOICE</th><th>CASHIER</th><th>ITEMS</th><th>TOTAL</th><th>STATUS</th></tr></thead>
    <tbody>${RECENT_TX.map(r => `<tr>
      <td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>
      <td><span class="status">Completed</span></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

// ============================================================
// Pages
// ============================================================
function renderDashboard() {
  const low = state.products.filter(p => p.stock <= 7);
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();

  return `
  ${headHtml(dateLabel, "Good morning, Admin 👋", "Here's what's happening with your store today.",
    `<button class="primary" id="dashOpenPos">${icon("shopping-cart", 16)} Open POS</button>`)}

  <div class="stats">
    ${statHtml("Today's Sales", "Rs. 12,450", "+12.5%", "receipt-text")}
    ${statHtml("Orders", "128", "+8.2%", "shopping-cart")}
    ${statHtml("Products", String(state.products.length), "+3 new", "package")}
    ${statHtml("Today's Profit", "Rs. 3,240", "+9.8%", "trending-up")}
  </div>

  <div class="two">
    <div class="panel">
      <div class="panelHead"><div><h2>Sales Overview</h2><p>Revenue performance this week</p></div><span class="muted">This week</span></div>
      <div class="chart">${[38,55,42,70,62,88,76,96,80,92,72,86].map((h,i) => `
        <div class="barWrap"><div class="bar" style="height:${h}%"></div><span>${["M","T","W","T","F","S"][i%6]}</span></div>
      `).join("")}</div>
    </div>
    <div class="panel">
      <div class="panelHead"><div><h2>Low Stock</h2><p>Products needing attention</p></div><button class="link" id="dashViewInventory">View all</button></div>
      ${low.map(p => `
        <div class="stock">
          <div class="mini">${esc(p.name[0])}</div>
          <div><b>${esc(p.name)}</b><span>${esc(p.category)}</span></div>
          <strong class="${p.stock <= 4 ? "danger" : "warn"}">${p.stock} left</strong>
        </div>
      `).join("")}
    </div>
  </div>

  <div class="panel tablePanel">
    <div class="panelHead"><div><h2>Recent Transactions</h2><p>Your latest sales activity</p></div><button class="link" id="dashViewSales">View all</button></div>
    ${tableHtml()}
  </div>`;
}

function posProductsGridHtml() {
  const products = filteredForPOS();
  return products.map(p => `
    <button class="product" data-id="${p.id}">
      <div class="productImg">${esc(p.name[0])}</div>
      <b>${esc(p.name)}</b>
      <span>${esc(p.category)}</span>
      <strong>${money(p.price)}</strong>
      <small>${p.stock} in stock</small>
      ${icon("plus", 17)}
    </button>
  `).join("");
}

function cartPanelInnerHtml() {
  const cart = state.cart;
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = Math.round(total * 0.13);

  const itemsHtml = !cart.length
    ? `<div class="empty">${icon("shopping-cart", 40)}<b>Your cart is empty</b><span>Scan or select a product to begin.</span></div>`
    : cart.map(x => `
      <div class="cartItem" data-id="${x.id}">
        <div class="mini">${esc(x.name[0])}</div>
        <div class="cartInfo">
          <b>${esc(x.name)}</b><span>${money(x.price)}</span>
          <div class="qty">
            <button class="qtyDown" data-id="${x.id}">${icon("minus", 12)}</button>
            <b>${x.qty}</b>
            <button class="qtyUp" data-id="${x.id}">${icon("plus", 12)}</button>
          </div>
        </div>
        <strong>${money(x.price * x.qty)}</strong>
        <button class="remove" data-id="${x.id}">${icon("trash-2", 14)}</button>
      </div>
    `).join("");

  return `
    <div class="panelHead">
      <div><h2>Current Order</h2><p>${cart.reduce((s,x)=>s+x.qty,0)} items</p></div>
      <button class="clear" id="cartClearBtn">Clear</button>
    </div>
    <div class="cartItems">${itemsHtml}</div>
    <div class="checkout">
      <div><span>Subtotal</span><b>${money(total)}</b></div>
      <div><span>Tax</span><b>${money(tax)}</b></div>
      <div class="grand"><span>Total</span><strong>${money(total + tax)}</strong></div>
      <button class="checkoutBtn" id="checkoutBtn" ${!cart.length ? "disabled" : ""}>Complete Sale ${icon("arrow-up-right", 17)}</button>
    </div>`;
}

function renderPOS() {
  return `
  ${headHtml("POINT OF SALE", "New Sale", "Scan a barcode or select a product.")}
  <div class="pos">
    <div class="panel">
      <div class="scan">
        ${icon("barcode", 20)}
        <input id="barcodeInput" autofocus placeholder="Scan barcode here..." value="${esc(state.barcode)}"/>
        <kbd>ENTER</kbd>
        <button class="camBtn" id="cameraScanBtn" title="Scan with camera">${icon("camera", 17)}</button>
      </div>
      <div class="search">${icon("search", 16)}<input placeholder="Search product name or category..."/></div>
      <div class="products" id="posProductsGrid">${posProductsGridHtml()}</div>
    </div>
    <div class="panel cart" id="cartPanel">${cartPanelInnerHtml()}</div>
  </div>`;
}

function renderInventory() {
  const products = state.products;
  return `
  ${headHtml("INVENTORY", "Products", "Manage your supermarket inventory.",
    `<button class="primary" id="invAddBtn">${icon("plus", 16)} Add Product</button>`)}
  <div class="panel tablePanel">
    <div class="panelHead"><div><h2>Product Inventory</h2><p>${products.length} products</p></div></div>
    <div class="tableWrap"><table>
      <thead><tr><th>PRODUCT</th><th>BARCODE</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>STATUS</th></tr></thead>
      <tbody>${products.map(p => `
        <tr>
          <td><div class="productCell"><div class="mini">${esc(p.name[0])}</div><b>${esc(p.name)}</b></div></td>
          <td class="mono">${esc(p.barcode)}</td>
          <td>${esc(p.category)}</td>
          <td>${money(p.price)}</td>
          <td>${p.stock}</td>
          <td><span class="status ${p.stock <= 7 ? "warningStatus" : ""}">${p.stock <= 7 ? "Low stock" : "In stock"}</span></td>
        </tr>
      `).join("")}</tbody>
    </table></div>
  </div>`;
}

function renderSalesSimple(title, sub) {
  return `
  ${headHtml("SALES", title, sub)}
  <div class="panel tablePanel">
    <div class="panelHead"><div><h2>Transactions</h2><p>Latest completed sales</p></div></div>
    ${tableHtml()}
  </div>`;
}

function renderReports() {
  return `
  ${headHtml("ANALYTICS", "Reports", "Understand your store performance.")}
  <div class="stats">
    ${statHtml("Monthly Revenue", "Rs. 384,200", "+14.2%", "bar-chart-3")}
    ${statHtml("Gross Profit", "Rs. 92,340", "+11.4%", "trending-up")}
    ${statHtml("Orders", "2,842", "+9.1%", "shopping-cart")}
    ${statHtml("Avg. Order", "Rs. 135", "+4.3%", "receipt-text")}
  </div>
  <div class="panel">
    <div class="panelHead"><div><h2>Monthly Performance</h2><p>Revenue trend</p></div></div>
    <div class="bigChart">${[35,42,38,60,52,70,65,82,74,90,78,96].map((h,i) => `
      <div class="barWrap"><div class="bar" style="height:${h}%"></div><span>${i+1}</span></div>
    `).join("")}</div>
  </div>`;
}

function renderSettings() {
  return `
  ${headHtml("SYSTEM", "Settings", "Configure your POS and store preferences.")}
  <div class="settings">
    <div class="panel setting">
      ${icon("shield-check", 22)}
      <h2>Security</h2>
      <p>Use Firebase Authentication and Firestore Security Rules for production data.</p>
      <button>Configure security</button>
    </div>
    <div class="panel setting">
      ${icon("barcode", 22)}
      <h2>Barcode</h2>
      <p>USB scanners work as keyboard input. Camera scanning is available from the Point of Sale screen.</p>
      <button>Barcode settings</button>
    </div>
    <div class="panel setting">
      ${icon("user-round", 22)}
      <h2>Users</h2>
      <p>Manage administrators and cashiers through Firebase Authentication.</p>
      <button>Manage users</button>
    </div>
  </div>`;
}

// ============================================================
// Render orchestration
// ============================================================
function renderPage() {
  const content = $("#content");
  switch (state.page) {
    case "Dashboard":     content.innerHTML = renderDashboard(); break;
    case "Point of Sale": content.innerHTML = renderPOS(); break;
    case "Inventory":     content.innerHTML = renderInventory(); break;
    case "Sales":         content.innerHTML = renderSalesSimple("Sales History", "Track completed transactions."); break;
    case "Reports":       content.innerHTML = renderReports(); break;
    case "Settings":      content.innerHTML = renderSettings(); break;
  }
  attachContentListeners();
  refreshIcons();
}

function renderNav() {
  const nav = $("#navList");
  nav.innerHTML = NAV.map(n => `
    <button class="nav ${state.page === n.name ? "active" : ""}" data-page="${n.name}">
      ${icon(n.icon, 18)} ${n.name}
    </button>
  `).join("");
  nav.querySelectorAll(".nav").forEach(btn =>
    btn.addEventListener("click", () => setPage(btn.dataset.page))
  );
  refreshIcons();
}

function setPage(name) {
  state.page = name;
  state.sidebarOpen = false;
  $("#sidebar").classList.remove("open");
  renderNav();
  renderPage();
}

function renderPOSGridOnly() {
  const grid = $("#posProductsGrid");
  if (!grid) return;
  grid.innerHTML = posProductsGridHtml();
  attachProductGridListeners();
  refreshIcons();
}

function renderCartPanelOnly() {
  const panel = $("#cartPanel");
  if (!panel) return;
  panel.innerHTML = cartPanelInnerHtml();
  attachCartListeners();
  refreshIcons();
}

// ============================================================
// Event wiring
// ============================================================
function attachContentListeners() {
  // Dashboard
  const openPos = $("#dashOpenPos"); if (openPos) openPos.addEventListener("click", () => setPage("Point of Sale"));
  const viewInv = $("#dashViewInventory"); if (viewInv) viewInv.addEventListener("click", () => setPage("Inventory"));
  const viewSales = $("#dashViewSales"); if (viewSales) viewSales.addEventListener("click", () => setPage("Sales"));

  // POS page
  if (state.page === "Point of Sale") {
    attachProductGridListeners();
    attachCartListeners();

    const barcodeInput = $("#barcodeInput");
    if (barcodeInput) {
      // Update the value silently — no re-render, so focus & fast keystrokes
      // (from USB/keyboard-emulating scanners) are never interrupted.
      barcodeInput.addEventListener("input", e => { state.barcode = e.target.value; });
      barcodeInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          scanBarcode(state.barcode);
          state.barcode = "";
          barcodeInput.value = "";
        }
      });
    }

    const camBtn = $("#cameraScanBtn");
    if (camBtn) camBtn.addEventListener("click", openCameraScanner);
  }

  // Inventory page
  if (state.page === "Inventory") {
    const addBtn = $("#invAddBtn");
    if (addBtn) addBtn.addEventListener("click", () => {
      const name = prompt("Product name");
      if (!name) return;
      const price = Number(prompt("Selling price", "100")) || 0;
      const stock = Number(prompt("Stock", "10")) || 0;
      state.products.push({ id: Date.now(), barcode: String(Date.now()), name, category: "General", price, stock });
      renderPage();
    });
  }
}

function attachProductGridListeners() {
  $$(".products .product").forEach(btn =>
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)))
  );
}

function attachCartListeners() {
  $$(".qtyUp").forEach(b => b.addEventListener("click", () => adjustQty(Number(b.dataset.id), 1)));
  $$(".qtyDown").forEach(b => b.addEventListener("click", () => adjustQty(Number(b.dataset.id), -1)));
  $$(".cartItem .remove").forEach(b => b.addEventListener("click", () => removeFromCart(Number(b.dataset.id))));
  const clearBtn = $("#cartClearBtn"); if (clearBtn) clearBtn.addEventListener("click", clearCart);
  const checkoutBtn = $("#checkoutBtn"); if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);
}

// ============================================================
// Cart / sale logic (same behaviour as the original React app)
// ============================================================
function addToCart(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const existing = state.cart.find(c => c.id === id);
  if (existing) {
    if (existing.qty < p.stock) existing.qty += 1;
  } else {
    state.cart.push({ id: p.id, name: p.name, price: p.price, stock: p.stock, qty: 1 });
  }
  renderCartPanelOnly();
}

function adjustQty(id, delta) {
  state.cart = state.cart.flatMap(x => {
    if (x.id !== id) return [x];
    const newQty = x.qty + delta;
    return newQty > 0 ? [{ ...x, qty: newQty }] : [];
  });
  renderCartPanelOnly();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(x => x.id !== id);
  renderCartPanelOnly();
}

function clearCart() {
  state.cart = [];
  renderCartPanelOnly();
}

function scanBarcode(code) {
  const trimmed = (code || "").trim();
  if (!trimmed) return;
  const p = state.products.find(x => x.barcode === trimmed);
  if (p) addToCart(p.id);
}

function checkout() {
  if (!state.cart.length) return;
  state.products = state.products.map(p => {
    const x = state.cart.find(c => c.id === p.id);
    return x ? { ...p, stock: p.stock - x.qty } : p;
  });
  state.cart = [];
  renderPage(); // stock changed -> refresh product grid too
  alert("Sale completed successfully.");
}

// ============================================================
// Theme + sidebar
// ============================================================
function toggleTheme() {
  state.dark = !state.dark;
  $("#appRoot").className = state.dark ? "app dark" : "app";
  $("#themeToggleBtn").innerHTML = icon(state.dark ? "sun" : "moon", 18);
  refreshIcons();
}

function openSidebar() { state.sidebarOpen = true; $("#sidebar").classList.add("open"); }
function closeSidebar() { state.sidebarOpen = false; $("#sidebar").classList.remove("open"); }

// ============================================================
// Camera barcode scanner (this is the part that was missing)
// ============================================================
let zxingReader = null;
let scanControls = null;

function openCameraScanner() {
  const modal = $("#scanModal");
  const statusEl = $("#scanStatus");
  const retryBtn = $("#scanRetryBtn");
  statusEl.className = "scanStatus";
  statusEl.textContent = "Requesting camera access…";
  retryBtn.classList.remove("show");
  modal.classList.add("open");
  startCameraScan();
}

function closeCameraScanner() {
  stopCameraScan();
  $("#scanModal").classList.remove("open");
}

async function startCameraScan() {
  const statusEl = $("#scanStatus");
  const retryBtn = $("#scanRetryBtn");
  const videoEl = $("#scanVideo");

  // Camera access requires a secure context (HTTPS or localhost).
  // This is almost always why "the camera won't open" on a hosted site.
  if (!window.isSecureContext) {
    statusEl.className = "scanStatus err";
    statusEl.textContent = "Camera blocked: this page isn't served over HTTPS. Browsers only allow camera access on secure (https://) pages or localhost. Ask your host to enable HTTPS, or use a service like Netlify/Vercel/GitHub Pages/Firebase Hosting, which provide HTTPS automatically.";
    retryBtn.classList.add("show");
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    statusEl.className = "scanStatus err";
    statusEl.textContent = "This browser doesn't support camera access. Try the latest Chrome, Safari, Edge, or Firefox.";
    retryBtn.classList.add("show");
    return;
  }

  if (!window.ZXing) {
    statusEl.className = "scanStatus err";
    statusEl.textContent = "Barcode scanning library failed to load (check your internet connection) and try again.";
    retryBtn.classList.add("show");
    return;
  }

  try {
    if (!zxingReader) zxingReader = new ZXing.BrowserMultiFormatReader();
    // Prefer the rear/back camera on phones, since that's what you scan products with.
    const constraints = { video: { facingMode: { ideal: "environment" } } };

    scanControls = await zxingReader.decodeFromConstraints(constraints, videoEl, (result, err) => {
      if (result) {
        const text = result.getText();
        statusEl.className = "scanStatus ok";
        statusEl.textContent = `Scanned: ${text}`;
        scanBarcode(text);
        setTimeout(closeCameraScanner, 400);
      }
      // NotFoundException fires continuously while no barcode is in frame — that's normal, ignore it.
    });

    statusEl.className = "scanStatus";
    statusEl.textContent = "Point the camera at a barcode…";
  } catch (e) {
    console.error("Camera scan error:", e);
    statusEl.className = "scanStatus err";
    if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
      statusEl.textContent = "Camera permission was denied. Allow camera access for this site in your browser's address-bar/site settings, then try again.";
    } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
      statusEl.textContent = "No camera was found on this device.";
    } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
      statusEl.textContent = "Camera is already in use by another app or browser tab. Close it and try again.";
    } else if (e.name === "OverconstrainedError") {
      statusEl.textContent = "No camera on this device matches the requested settings.";
    } else {
      statusEl.textContent = "Could not access the camera: " + (e.message || e.name || "unknown error");
    }
    retryBtn.classList.add("show");
  }
}

function stopCameraScan() {
  try {
    if (scanControls) { scanControls.stop(); scanControls = null; }
    else if (zxingReader) { zxingReader.reset(); }
  } catch (e) { /* no-op */ }
  const videoEl = $("#scanVideo");
  if (videoEl && videoEl.srcObject) {
    videoEl.srcObject.getTracks().forEach(t => t.stop());
    videoEl.srcObject = null;
  }
}

// ============================================================
// Init
// ============================================================
function init() {
  renderNav();
  renderPage();

  $("#mobileMenuBtn").addEventListener("click", openSidebar);
  $("#mobileCloseBtn").addEventListener("click", closeSidebar);
  $("#themeToggleBtn").addEventListener("click", toggleTheme);

  $("#topSearchInput").addEventListener("input", e => {
    state.search = e.target.value;
    if (state.page === "Point of Sale") renderPOSGridOnly();
  });

  $("#scanCancelBtn").addEventListener("click", closeCameraScanner);
  $("#scanRetryBtn").addEventListener("click", () => {
    $("#scanRetryBtn").classList.remove("show");
    startCameraScan();
  });

  refreshIcons();
}

document.addEventListener("DOMContentLoaded", init);
