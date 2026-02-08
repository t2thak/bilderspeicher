/**
 * QR-Generator Widget ohne Tenant – nur webhook + branch_id
 * Ruft auf: {webhook}_qrcode, {webhook}_branches, {webhook}_qr_status
 *
 * EINBETTUNG (Softr / beliebige Seite):
 * window.QR_CONFIG = {
 *   webhook: "justai",              // Pflicht → justai_qrcode, justai_branches, justai_qr_status
 *   branch_id: "uuid-hier",         // Pflicht
 *   webhook_base: "https://n8nv2.flowrk.io/webhook/",  // Optional
 *   language: "de"                  // Optional: de, vi, en, cz
 * };
 * <script src="https://cdn.jsdelivr.net/gh/t2thak/bilderspeicher@main/qr-widget-no-tenant.js"></script>
 * <div id="qr-generator-container"></div>
 */
(function() {
  'use strict';

  const CONFIG = window.QR_CONFIG || {};
  const WEBHOOK_NAME = (CONFIG.webhook || "").trim();
  const BRANCH_ID = (CONFIG.branch_id || "").trim();
  const WEBHOOK_BASE_URL = (CONFIG.webhook_base || "https://n8nv2.flowrk.io/webhook/").replace(/\/?$/, "");
  const LANGUAGE = CONFIG.language || "vi";
  const CONTAINER_ID = CONFIG.container_id || "qr-generator-container";

  if (!WEBHOOK_NAME) {
    console.error("[QR-Widget] Fehler: webhook nicht konfiguriert in window.QR_CONFIG");
    return;
  }
  if (!BRANCH_ID) {
    console.error("[QR-Widget] Fehler: branch_id nicht konfiguriert in window.QR_CONFIG");
    return;
  }

  function buildWebhookUrl(suffix) {
    return WEBHOOK_BASE_URL + "/" + WEBHOOK_NAME + "_" + suffix;
  }

  const ENDPOINT = buildWebhookUrl("qrcode");
  const BRANCHES_ENDPOINT = buildWebhookUrl("branches");
  const STATUS_ENDPOINT = buildWebhookUrl("qr_status");
  const QR_API = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=";

  const TRANSLATIONS = {
    vi: { title: "Tạo mã xác thực", staff: "Nhân viên", points: "Điểm", note: "Ghi chú", notePlaceholder: "mầu/dịch vụ", validMinutes: "Thời gian hiệu lực (phút)", maxUses: "Số lần dùng tối đa", advancedOptions: "Tùy chọn nâng cao", generate: "Tạo", reset: "Đặt lại", generating: "Đang tạo…", complete: "Hoàn tất", failed: "Thất bại", qrPlaceholder: "Mã QR sẽ hiển thị ở đây", qrExpired: "Mã QR đã hết hạn", qrHint: "Mã QR này chứa liên kết sâu WhatsApp. Khách có thể quét và gửi mã.", customerInfo: "Thông tin khách", customerInfoHint: "Thông tin sẽ xuất hiện khi khách xác nhận mã.", name: "Tên", phone: "SĐT", currentPoints: "Điểm hiện có", visits: "Lượt ghé", lastVisit: "Lần cuối", recentVisits: "5 lần gần nhất", noData: "Không có dữ liệu", loadMore: "Xem thêm", bonusReached: "Khách đã đạt {threshold} điểm! 🎉", waitingConfirm: "Đang chờ khách xác nhận điểm...", customerConfirmed: "Khách đã xác nhận mã", pointsUpdated: "Điểm khách đã được cập nhật", pointsAwarded: "Điểm được cấp", today: "Hôm nay", daysAgo: "{days} ngày trước", staffLabel: "Nhân viên", optOutInfo: "Nếu khách hàng muốn rời khỏi chương trình, chỉ cần nhập: <code>/stop</code> trong cuộc trò chuyện WhatsApp.", loading: "Loading...", branchNotFound: "Branch nicht gefunden", loadError: "Fehler beim Laden", sessionExpired: "Phiên đã hết hạn" },
    de: { title: "Code generieren", staff: "Mitarbeiter", points: "Punkte", note: "Notiz", notePlaceholder: "Farbe/Service", validMinutes: "Gültigkeit (Minuten)", maxUses: "Max. Verwendungen", advancedOptions: "Erweiterte Optionen", generate: "Generieren", reset: "Zurücksetzen", generating: "Generiere…", complete: "Fertig", failed: "Fehlgeschlagen", qrPlaceholder: "QR-Code erscheint hier", qrExpired: "QR-Code abgelaufen", qrHint: "Dieser QR-Code enthält einen WhatsApp Deep-Link. Der Kunde scannt und sendet den Code.", customerInfo: "Kundeninformationen", customerInfoHint: "Info erscheint, wenn der Kunde den Code bestätigt.", name: "Name", phone: "Telefon", currentPoints: "Aktuelle Punkte", visits: "Besuche", lastVisit: "Letzter Besuch", recentVisits: "Letzte 5 Besuche", noData: "Keine Daten", loadMore: "Mehr laden", bonusReached: "Kunde hat {threshold} Punkte erreicht! 🎉", waitingConfirm: "Warte auf Bestätigung…", customerConfirmed: "Kunde hat Code bestätigt", pointsUpdated: "Kundenpunkte aktualisiert", pointsAwarded: "Vergebene Punkte", today: "Heute", daysAgo: "vor {days} Tagen", staffLabel: "Mitarbeiter", optOutInfo: "Kunden können das Programm jederzeit verlassen mit: <code>/stop</code> im WhatsApp-Chat.", loading: "Lädt...", branchNotFound: "Filiale nicht gefunden", loadError: "Ladefehler", sessionExpired: "Sitzung abgelaufen" },
    en: { title: "Generate Code", staff: "Staff", points: "Points", note: "Note", notePlaceholder: "color/service", validMinutes: "Valid for (minutes)", maxUses: "Max uses", advancedOptions: "Advanced options", generate: "Generate", reset: "Reset", generating: "Generating…", complete: "Complete", failed: "Failed", qrPlaceholder: "QR code will appear here", qrExpired: "QR code expired", qrHint: "This QR code contains a WhatsApp deep link. Customer scans and sends the code.", customerInfo: "Customer Info", customerInfoHint: "Info will appear when customer confirms the code.", name: "Name", phone: "Phone", currentPoints: "Current Points", visits: "Visits", lastVisit: "Last Visit", recentVisits: "Last 5 visits", noData: "No data", loadMore: "Load more", bonusReached: "Customer reached {threshold} points! 🎉", waitingConfirm: "Waiting for confirmation…", customerConfirmed: "Customer confirmed code", pointsUpdated: "Customer points updated", pointsAwarded: "Points awarded", today: "Today", daysAgo: "{days} days ago", staffLabel: "Staff", optOutInfo: "Customers can leave the program anytime by typing: <code>/stop</code> in WhatsApp chat.", loading: "Loading...", branchNotFound: "Branch not found", loadError: "Load error", sessionExpired: "Session expired" },
    cz: { title: "Vygenerovat kód", staff: "Zaměstnanec", points: "Body", note: "Poznámka", notePlaceholder: "barva/služba", validMinutes: "Platnost (minuty)", maxUses: "Max. použití", advancedOptions: "Rozšířené možnosti", generate: "Vygenerovat", reset: "Resetovat", generating: "Generuji…", complete: "Hotovo", failed: "Selhalo", qrPlaceholder: "QR kód se zobrazí zde", qrExpired: "QR kód vypršel", qrHint: "Tento QR kód obsahuje WhatsApp deep link. Zákazník naskenuje a odešle kód.", customerInfo: "Info o zákazníkovi", customerInfoHint: "Info se zobrazí po potvrzení kódu zákazníkem.", name: "Jméno", phone: "Telefon", currentPoints: "Aktuální body", visits: "Návštěvy", lastVisit: "Poslední návštěva", recentVisits: "Posledních 5 návštěv", noData: "Žádná data", loadMore: "Načíst více", bonusReached: "Zákazník dosáhl {threshold} bodů! 🎉", waitingConfirm: "Čekám na potvrzení…", customerConfirmed: "Zákazník potvrdil kód", pointsUpdated: "Body zákazníka aktualizovány", pointsAwarded: "Přidělené body", today: "Dnes", daysAgo: "před {days} dny", staffLabel: "Zaměstnanec", optOutInfo: "Zákazníci mohou opustit program kdykoliv zadáním: <code>/stop</code> v WhatsApp chatu.", loading: "Načítám...", branchNotFound: "Pobočka nenalezena", loadError: "Chyba načítání", sessionExpired: "Relace vypršela" }
  };

  const T = TRANSLATIONS[LANGUAGE] || TRANSLATIONS.vi;

  const CSS = `.qr-scope{--bg:#fff;--fg:#0a0a0a;--muted:#6b7280;--border:#e5e7eb;--accent:#111;--accent-pressed:#000;--ok:#1d9a6c;--err:#d70015;--radius:8px;--ring:#111;--ring-offset:#fff;color:var(--fg);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.6;font-size:14px}.qr-scope .wrap{max-width:880px;margin:0 auto;padding:0 10px}.qr-scope .card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:10px 20px 20px;box-shadow:0 4px 16px rgba(0,0,0,.05)}.qr-scope h1{margin:0 0 6px;font-size:20px;font-weight:700;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.qr-scope .branch-badge{background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb;font-size:12px;padding:2px 8px;border-radius:99px;font-weight:500}.qr-scope .version-card{font-size:10px;color:#9ca3af;opacity:.7;text-align:right;margin-top:8px}.qr-scope p.desc{margin:0 0 16px;color:var(--muted);font-size:13px}.qr-scope .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px 16px}.qr-scope label{display:block;font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:500}.qr-scope input,.qr-scope select,.qr-scope textarea{width:100%;height:44px;box-sizing:border-box;padding:10px 12px;border-radius:var(--radius);border:1px solid var(--border);background:#fff;color:var(--fg);outline:0;font-size:14px}.qr-scope input:focus-visible,.qr-scope select:focus-visible,.qr-scope textarea:focus-visible{border-color:var(--fg);box-shadow:0 0 0 2px var(--ring-offset),0 0 0 4px var(--ring)}.qr-scope .note-input{height:44px;min-height:44px;max-height:160px;resize:vertical;line-height:1.4;background:#fffef9;border-color:#f8f1d6}.qr-scope .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 8px}.qr-scope button{cursor:pointer;background:var(--accent);color:#fff;border:1px solid transparent;border-radius:var(--radius);padding:12px 24px;font-weight:600;height:44px;font-size:14px}.qr-scope button:hover{background:var(--accent-pressed)}.qr-scope button.secondary{background:#fff;color:var(--fg);border-color:var(--border)}.qr-scope button.ok{background:var(--ok);color:#fff}.qr-scope button.err{background:var(--err);color:#fff}.qr-scope .spacer{height:18px}.qr-scope .result{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}@media(max-width:800px){.qr-scope .result{grid-template-columns:1fr}}.qr-scope .panel{background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px}.qr-scope .info-panel.has-bonus{background:#fff8e6;border-color:#f7c948}.qr-scope .qr{display:grid;place-items:center;background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:12px;min-height:260px}.qr-scope .qr img{max-width:100%;height:auto;image-rendering:pixelated}.qr-scope .muted{color:var(--muted);font-size:13px}.qr-scope .hint{font-size:12px;color:var(--muted);margin-top:6px}.qr-scope .info-panel.hidden{display:none}.qr-scope .bonus-banner{margin-bottom:12px;padding:10px 14px;border-radius:var(--radius);color:#92400e;font-weight:600;font-size:13px;text-align:center}.qr-scope .bonus-banner.hidden{display:none}.qr-scope .visit-history{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:13px}.qr-scope .visit-history li{display:grid;grid-template-columns:minmax(120px,.65fr) 1fr;align-items:start;column-gap:12px;padding:8px 0;border-bottom:1px dashed var(--border)}.qr-scope .visit-history li:last-child{border-bottom:none}.qr-scope .visit-history .visit-date{color:var(--muted);font-weight:400;font-size:13px}.qr-scope .visit-history .visit-details,.qr-scope .visit-history .note{display:block;color:var(--muted);font-size:12px;margin-top:2px}.qr-scope .row .right{margin-left:auto}.qr-scope .kv{display:grid;grid-template-columns:minmax(120px,.65fr) 1fr;column-gap:12px;row-gap:10px;align-items:start}.qr-scope .label{color:var(--muted);font-size:12px;font-weight:600}.qr-scope .value{font-size:14px}@media(max-width:768px){.qr-scope .grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){.qr-scope .grid{grid-template-columns:1fr}}.qr-scope .advanced-fields{display:none}.qr-scope .advanced-fields.show{display:block}.qr-scope .toggle-advanced{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:2px;background:transparent;border:none;cursor:pointer;font-size:12px;color:#9ca3af;opacity:.6;padding:0}.qr-scope .toggle-advanced:hover{opacity:1;color:#6b7280}.qr-scope .toggle-advanced.active{color:var(--fg);opacity:1}.qr-scope .advanced-label{display:inline-block;margin-right:6px;font-size:11px;color:#9ca3af}.qr-scope .qr img:not([src]),.qr-scope .qr img[src=""]{display:none}.qr-scope .panel h2{display:flex;align-items:center;justify-content:space-between;gap:12px}.qr-scope .countdown-time{font-family:monospace;font-weight:600;font-size:16px;color:var(--fg)}.qr-scope .countdown-time.expired{color:var(--err)}.qr-scope .qr.expired{opacity:.3;pointer-events:none}.qr-scope .info-box{background:#f0f9ff;border:1px solid #bae6fd;border-radius:var(--radius);padding:12px 16px;margin-top:20px;display:flex;align-items:flex-start;gap:10px}.qr-scope .info-box .icon{flex-shrink:0;width:18px;height:18px;color:#0284c7;font-weight:600;font-size:14px}.qr-scope .info-box .text{font-size:13px;color:#0c4a6e;line-height:1.5}.qr-scope .info-box .text code{background:#e0f2fe;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;font-weight:600;color:#0369a1}`;

  const HTML = `<div class="qr-scope"><div class="wrap"><div class="card"><h1>${T.title} <span class="branch-badge" id="qrw-branchBadge">${T.loading}</span></h1><p class="desc"></p><form id="qrw-genForm"><div class="grid"><div><label for="qrw-generated_by">👤 ${T.staff} *</label><input id="qrw-generated_by" name="generated_by" placeholder="${T.staff}" required></div><div class="advanced-fields" id="qrw-validMinutesField"><label for="qrw-valid_minutes">${T.validMinutes}</label><input id="qrw-valid_minutes" name="valid_minutes" type="number" min="1" step="1" value="5"></div><div class="advanced-fields" id="qrw-maxUsesField"><label for="qrw-max_uses">${T.maxUses}</label><input id="qrw-max_uses" name="max_uses" type="number" min="1" step="1" value="1"></div><div><label for="qrw-points_override">🎯 ${T.points}</label><input id="qrw-points_override" name="points_override" type="number" step="1" placeholder="1"></div><div><label for="qrw-note">📝 ${T.note}</label><textarea id="qrw-note" name="note" class="note-input" placeholder="${T.notePlaceholder}" rows="1"></textarea></div></div><div class="spacer"></div><div style="display:flex;align-items:center;justify-content:flex-end;margin-right:8px"><span class="advanced-label">${T.advancedOptions}</span><button type="button" class="toggle-advanced" id="qrw-toggleBtn" title="${T.advancedOptions}">+</button></div><div style="height:12px"></div><div class="row"><button type="submit">${T.generate}</button><button class="secondary" type="button" id="qrw-resetBtn">${T.reset}</button><div class="right muted" id="qrw-statusText"></div></div><div class="version-card">v1.5-no-tenant</div></form></div><div class="spacer"></div><div class="result"><div class="panel"><h2 style="margin:0 0 10px;font-size:16px"><span id="qrw-pointsDisplay" style="display:none"></span><span class="countdown-time" id="qrw-countdownTime" style="display:none"></span></h2><div class="qr" id="qrw-qrContainer"><img id="qrw-qr_img" src="" alt="" style="display:none"><div id="qrw-qr_placeholder" style="color:var(--muted);font-size:13px">${T.qrPlaceholder}</div></div><div class="hint" id="qrw-qrHint" style="margin-top:10px">${T.qrHint}</div></div><div class="panel info-panel hidden" id="qrw-customerInfoPanel"><h2 style="margin:0 0 10px;font-size:16px">${T.customerInfo}</h2><div class="bonus-banner hidden" id="qrw-bonusBanner"></div><div class="kv"><div class="label">${T.name}</div><div class="value" id="qrw-customerName">—</div><div class="label">${T.phone}</div><div class="value" id="qrw-customerPhone">—</div><div class="label">${T.currentPoints}</div><div class="value" id="qrw-customerPoints">—</div><div class="label">${T.visits}</div><div class="value" id="qrw-customerVisits">—</div><div class="label">${T.lastVisit}</div><div class="value" id="qrw-lastVisitSummary">—</div><div class="label" style="grid-column:1/-1;margin-top:5px">${T.recentVisits}</div><div class="value" style="grid-column:1/-1"><ul class="visit-history" id="qrw-visitHistoryList"><li class="muted">${T.noData}</li></ul></div></div><div class="hint" id="qrw-customerInfoHint">${T.customerInfoHint}</div></div></div><div class="info-box"><div class="icon">ℹ️</div><div class="text">${T.optOutInfo}</div></div></div></div>`;

  function init() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
      console.error("[QR-Widget] Container #" + CONTAINER_ID + " nicht gefunden");
      return;
    }
    if (!document.getElementById('qr-widget-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'qr-widget-styles';
      styleEl.textContent = CSS;
      document.head.appendChild(styleEl);
    }
    container.innerHTML = HTML;
    loadExternalScripts().then(function() { initWidget(); });
  }

  function loadExternalScripts() {
    return new Promise(function(resolve) {
      if (typeof confetti === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.0/dist/confetti.browser.min.js';
        script.onload = resolve;
        script.onerror = resolve;
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  function initWidget() {
    const celebrationAudio = new Audio('https://raw.githubusercontent.com/t2thak/bilderspeicher/main/short-crowd-cheer-6713.mp3');
    const customerInfoAudio = new Audio('https://raw.githubusercontent.com/t2thak/bilderspeicher/main/new-notification-028-383966.mp3');
    celebrationAudio.crossOrigin = 'anonymous';
    customerInfoAudio.crossOrigin = 'anonymous';
    const form = document.getElementById('qrw-genForm');
    const resetBtn = document.getElementById('qrw-resetBtn');
    const statusText = document.getElementById('qrw-statusText');
    const qr_img = document.getElementById('qrw-qr_img');
    const qr_placeholder = document.getElementById('qrw-qr_placeholder');
    const qrContainer = document.getElementById('qrw-qrContainer');
    const qrHint = document.getElementById('qrw-qrHint');
    const toggleBtn = document.getElementById('qrw-toggleBtn');
    const advancedFields = document.querySelectorAll('.qr-scope .advanced-fields');
    const countdownTime = document.getElementById('qrw-countdownTime');
    const pointsDisplay = document.getElementById('qrw-pointsDisplay');
    const branchBadge = document.getElementById('qrw-branchBadge');
    const customerInfoPanel = document.getElementById('qrw-customerInfoPanel');
    const customerNameEl = document.getElementById('qrw-customerName');
    const customerPhoneEl = document.getElementById('qrw-customerPhone');
    const customerPointsEl = document.getElementById('qrw-customerPoints');
    const customerVisitsEl = document.getElementById('qrw-customerVisits');
    const lastVisitSummaryEl = document.getElementById('qrw-lastVisitSummary');
    const customerInfoHint = document.getElementById('qrw-customerInfoHint');
    const bonusBanner = document.getElementById('qrw-bonusBanner');
    const visitHistoryList = document.getElementById('qrw-visitHistoryList');
    let loyaltyThreshold = 10, advancedVisible = false, countdownInterval = null, expiryTime = null, statusPollTimeout = null, statusPollPayload = null, isPolling = false, pollStartTime = null;
    const CURRENT_BRANCH = { id: BRANCH_ID, code: "", name: "" };

    async function loadBranchInfo() {
      try {
        const res = await fetch(BRANCHES_ENDPOINT, { method: "GET", headers: { "Content-Type": "application/json" } });
        if (!res.ok) throw new Error("Failed: " + res.status);
        const json = await res.json();
        let branches = [];
        if (Array.isArray(json) && json.length > 0) {
          if (json[0].list_active_branches && json[0].list_active_branches.branches) branches = json[0].list_active_branches.branches;
          else if (json[0].branches) branches = json[0].branches;
        } else if (json.list_active_branches && json.list_active_branches.branches) branches = json.list_active_branches.branches;
        else if (json.branches) branches = json.branches;
        const branch = branches.find(function(b) { return b.id === CURRENT_BRANCH.id; });
        if (branch) {
          CURRENT_BRANCH.code = branch.branch_code || "";
          CURRENT_BRANCH.name = branch.branch_name || "";
          branchBadge.textContent = CURRENT_BRANCH.code + " - " + CURRENT_BRANCH.name;
        } else {
          branchBadge.textContent = T.branchNotFound;
        }
      } catch (err) {
        console.error("Error loading branch info:", err);
        branchBadge.textContent = T.loadError;
      }
    }
    loadBranchInfo();

    toggleBtn.addEventListener('click', function() {
      advancedVisible = !advancedVisible;
      advancedFields.forEach(function(f) { f.classList.toggle('show', advancedVisible); });
      toggleBtn.textContent = advancedVisible ? '−' : '+';
      toggleBtn.classList.toggle('active', advancedVisible);
    });

    function setStatus(msg, ok) { statusText.textContent = msg || ""; statusText.style.color = (ok !== false) ? "var(--ok)" : "var(--err)"; }
    function showError(msg) { setStatus(msg, false); }
    function maskPhone(phone) { var s = String(phone).replace(/[^\d+]/g, ""), t = s.slice(-4); return t ? "***" + t : "***"; }

    function hideCustomerInfo() {
      customerInfoPanel.classList.add("hidden");
      customerNameEl.textContent = "—";
      customerPhoneEl.textContent = "—";
      customerPointsEl.textContent = "—";
      customerVisitsEl.textContent = "—";
      lastVisitSummaryEl.textContent = "—";
      customerInfoHint.textContent = T.customerInfoHint;
      bonusBanner.classList.add("hidden");
      customerInfoPanel.classList.remove("has-bonus");
      visitHistoryList.innerHTML = "<li class=\"muted\">" + T.noData + "</li>";
    }

    function showCustomerInfo(customer, totalPoints, codeId, bonusInfo, recentVisits) {
      customer = customer || {};
      recentVisits = recentVisits || [];
      var name = (customer.name || "Customer").trim();
      var visits = Number.isFinite(customer.total_visits) ? customer.total_visits : 0;
      var points = Number.isFinite(totalPoints) ? totalPoints : (Number.isFinite(customer.total_points) ? customer.total_points : null);
      customerNameEl.textContent = name;
      customerPhoneEl.textContent = maskPhone(customer.phone_number);
      customerPointsEl.textContent = points !== null ? points : "—";
      customerVisitsEl.textContent = visits;
      customerInfoPanel.classList.remove("hidden");
      if (bonusInfo && bonusInfo.triggered) {
        bonusBanner.textContent = T.bonusReached.replace("{threshold}", loyaltyThreshold);
        bonusBanner.classList.remove("hidden");
        customerInfoPanel.classList.add("has-bonus");
        if (typeof confetti === "function") confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 } });
        celebrationAudio.currentTime = 0; celebrationAudio.play().catch(function() {});
      } else {
        bonusBanner.classList.add("hidden");
        customerInfoPanel.classList.remove("has-bonus");
      }
      var parsed = recentVisits.map(function(entry) {
        var d = entry && (entry.date || entry.validated_at || entry.created_at || entry);
        if (!d) return null;
        var dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return null;
        return { date: dateObj, note: entry.note, staff: entry.staff || entry.generated_by };
      }).filter(Boolean).sort(function(a, b) { return b.date - a.date; });
      var history = parsed.slice(0, 5);
      var formatter = new Intl.DateTimeFormat(LANGUAGE === 'vi' ? 'vi-VN' : LANGUAGE, { day: "2-digit", month: "2-digit", year: "numeric" });
      visitHistoryList.innerHTML = history.map(function(item) {
        var dateStr = formatter.format(item.date);
        var details = [item.staff ? T.staffLabel + ": " + item.staff : "", item.note || ""].filter(Boolean).join(" ") || "—";
        return "<li><span class=\"visit-date\">" + dateStr + "</span><span class=\"visit-details\">" + details + "</span></li>";
      }).join("");
      if (history[0]) {
        var diffDays = Math.max(0, Math.floor((Date.now() - history[0].date.getTime()) / (1000 * 60 * 60 * 24)));
        lastVisitSummaryEl.textContent = diffDays === 0 ? T.today : T.daysAgo.replace("{days}", diffDays);
      } else {
        lastVisitSummaryEl.textContent = "—";
      }
      document.getElementById('qrw-generated_by').value = "";
      document.getElementById('qrw-note').value = "";
      document.getElementById('qrw-points_override').value = "";
      document.getElementById('qrw-valid_minutes').value = "5";
      document.getElementById('qrw-max_uses').value = "1";
      customerInfoAudio.currentTime = 0; customerInfoAudio.play().catch(function() {});
      qr_img.style.display = "none";
      qr_placeholder.style.display = "none";
      qrContainer.style.display = "none";
      qrHint.style.display = "none";
    }

    function startCountdown(validMinutes) {
      if (countdownInterval) clearInterval(countdownInterval);
      expiryTime = Date.now() + validMinutes * 60 * 1000;
      countdownTime.style.display = "inline";
      countdownTime.classList.remove("expired");
      qrContainer.classList.remove("expired");
      function update() {
        if (!expiryTime) return;
        var rem = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
        if (rem === 0) {
          countdownTime.textContent = "00:00";
          countdownTime.classList.add("expired");
          qrContainer.classList.add("expired");
          clearInterval(countdownInterval);
          countdownInterval = null;
          stopPollingRedemption();
          hideCustomerInfo();
          pointsDisplay.style.display = "none";
          qr_img.src = "";
          qr_placeholder.textContent = T.qrExpired;
          qr_placeholder.style.color = "var(--err)";
          setStatus(T.sessionExpired, false);
          qrContainer.style.display = "block";
          qrHint.style.display = "block";
          qr_placeholder.style.display = "block";
        } else {
          countdownTime.textContent = String(Math.floor(rem / 60)).padStart(2, '0') + ":" + String(rem % 60).padStart(2, '0');
        }
      }
      update();
      countdownInterval = setInterval(update, 1000);
    }

    function stopCountdown() {
      if (countdownInterval) clearInterval(countdownInterval);
      countdownTime.style.display = "none";
      expiryTime = null;
    }

    function stopPollingRedemption() {
      isPolling = false;
      pollStartTime = null;
      if (statusPollTimeout) { clearTimeout(statusPollTimeout); statusPollTimeout = null; }
      statusPollPayload = null;
    }

    function startPollingRedemption(codeId, codeValue) {
      if (!codeId && !codeValue) return;
      stopPollingRedemption();
      isPolling = true;
      pollStartTime = Date.now();
      statusPollPayload = { code_id: codeId, code: codeValue };
      var pollCount = 0;
      var MAX_POLLS = 30;
      var POLL_INTERVAL = 8000;
      function poll() {
        if (!isPolling || !statusPollPayload) return;
        pollCount++;
        if (pollCount > MAX_POLLS) { stopPollingRedemption(); return; }
        fetch(STATUS_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(statusPollPayload) })
          .then(function(r) { return r.ok ? r.json() : Promise.reject(new Error("Status " + r.status)); })
          .then(function(data) {
            if (data && data.redeemed) {
              if (Number.isFinite(data.loyalty_bonus_threshold)) loyaltyThreshold = data.loyalty_bonus_threshold;
              showCustomerInfo(data.customer, data.points_after, data.code_id, { triggered: Boolean(data.bonus_triggered) }, data.recent_visits || []);
              setStatus(data.bonus_triggered ? T.bonusReached.replace("{threshold}", loyaltyThreshold) : T.pointsUpdated, true);
              stopCountdown();
              stopPollingRedemption();
            }
          })
          .catch(function(err) { console.warn("Status polling failed:", err); });
        if (isPolling && statusPollPayload) statusPollTimeout = setTimeout(poll, POLL_INTERVAL);
      }
      statusPollTimeout = setTimeout(poll, 10000);
    }

    function extractQrUrl(result) {
      if (result && result.deep_link) return QR_API + encodeURIComponent(result.deep_link);
      return (result && result.qr_url) || "";
    }

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      setStatus(T.generating, true);
      hideCustomerInfo();
      stopPollingRedemption();
      qrContainer.style.display = "block";
      qrHint.style.display = "block";
      qr_placeholder.style.display = "block";
      qr_placeholder.textContent = T.qrPlaceholder;
      var generated_by = document.getElementById("qrw-generated_by").value || "staff:unknown";
      var valid_minutes = Number(document.getElementById("qrw-valid_minutes").value || 5);
      var max_uses = Number(document.getElementById("qrw-max_uses").value || 1);
      var points_override_raw = document.getElementById("qrw-points_override").value;
      var points_override = points_override_raw === "" ? null : Number(points_override_raw);
      var note = document.getElementById("qrw-note").value || null;
      var payload = { branch_id: CURRENT_BRANCH.id, generated_by: generated_by, valid_minutes: valid_minutes, max_uses: max_uses, points_override: points_override, note: note };
      fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function(r) { return r.ok ? r.json() : Promise.reject(new Error("Server " + r.status)); })
        .then(function(json) {
          var result = (Array.isArray(json) && json[0] && json[0].generate_staff_code) ? json[0].generate_staff_code : (json && json.generate_staff_code) ? json.generate_staff_code : json;
          var qrUrl = extractQrUrl(result);
          qr_img.src = qrUrl;
          var points = points_override !== null ? points_override : (result.points || 1);
          pointsDisplay.textContent = T.pointsAwarded + ": " + points;
          pointsDisplay.style.display = "inline";
          if (qrUrl) {
            qr_img.style.display = "block";
            qr_placeholder.style.display = "none";
            startCountdown(valid_minutes);
          }
          var codeId = result.code_id || result.validation_id || null;
          var codeValue = result.code || result.generated_code || null;
          if (codeId || codeValue) {
            setStatus(T.waitingConfirm, true);
            startPollingRedemption(codeId, codeValue);
          } else {
            setStatus(T.complete, true);
          }
        })
        .catch(function(err) {
          console.error(err);
          showError(err.message || T.failed);
          hideCustomerInfo();
          stopCountdown();
        });
    });

    resetBtn.addEventListener("click", function() {
      qr_img.src = "";
      qr_img.style.display = "none";
      qr_placeholder.style.display = "block";
      qr_placeholder.textContent = T.qrPlaceholder;
      qr_placeholder.style.color = "var(--muted)";
      setStatus("");
      stopCountdown();
      pointsDisplay.style.display = "none";
      hideCustomerInfo();
      document.getElementById('qrw-generated_by').value = "";
      document.getElementById('qrw-note').value = "";
      document.getElementById('qrw-points_override').value = "";
      document.getElementById('qrw-valid_minutes').value = "5";
      document.getElementById('qrw-max_uses').value = "1";
      advancedVisible = false;
      advancedFields.forEach(function(f) { f.classList.remove("show"); });
      toggleBtn.textContent = "+";
    });

    hideCustomerInfo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
