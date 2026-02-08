/**
 * QR-Frontend (qr frontend.html) als eine JS-Datei – wie qr-widget.js einbettbar.
 * Konfig: webhook, branch (oder branch_id), base (optional). URL-Parameter oder data-Attribute oder QR_CONFIG.
 *
 * Einbindung (Softr/GitHub):
 * <script src="https://cdn.jsdelivr.net/gh/t2thak/bilderspeicher@main/qr-frontend.js" data-webhook="justai" data-branch="DEINE-BRANCH-ID" data-base="https://n8nv2.flowrk.io/webhook/"></script>
 * <div id="qr-generator-container"></div>
 */
(function() {
  'use strict';

  var webhook = '', branch = '', base = 'https://n8nv2.flowrk.io/webhook/';
  var scriptEl = document.currentScript || (function() {
    var s = document.getElementsByTagName('script');
    for (var i = s.length - 1; i >= 0; i--) {
      if (s[i].src && s[i].src.indexOf('qr-frontend') !== -1) return s[i];
    }
    return null;
  })();
  try {
    var p = new URLSearchParams(window.location.search);
    if (p.get('webhook')) webhook = (p.get('webhook') || '').trim();
    if (p.get('branch')) branch = (p.get('branch') || '').trim();
    if (p.get('branch_id')) branch = (p.get('branch_id') || '').trim();
    if (p.get('base')) base = decodeURIComponent((p.get('base') || '').trim()) || base;
    if (p.get('webhook_base')) base = decodeURIComponent((p.get('webhook_base') || '').trim()) || base;
  } catch (e) {}
  if (scriptEl) {
    var g = function(n) { var v = scriptEl.getAttribute('data-' + n); return (v && v.trim()) ? v.trim() : ''; };
    if (!webhook) webhook = g('webhook');
    if (!branch) branch = g('branch') || g('branch-id') || g('branch_id');
    if (!base) base = g('base') || g('webhook-base') || g('webhook_base') || base;
  }
  var cfg = window.QR_CONFIG || window.QR_EMBED || {};
  if (cfg.webhook) webhook = (cfg.webhook || '').trim();
  if (cfg.branch_id || cfg.branch) branch = (cfg.branch_id || cfg.branch || '').trim();
  if (cfg.webhook_base || cfg.base) base = (cfg.webhook_base || cfg.base || base).replace(/\/?$/, '') + '/';

  base = (base || 'https://n8nv2.flowrk.io/webhook/').replace(/\/?$/, '') + '/';
  var CONTAINER_ID = (cfg.container_id || 'qr-generator-container');

  function init() {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) {
      console.error('[QR-Frontend] Container #' + CONTAINER_ID + ' nicht gefunden');
      return;
    }
    if (!webhook || !branch) {
      container.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif;max-width:400px;margin:0 auto;"><p style="font-size:18px;margin:0 0 12px;">App bitte über Softr öffnen oder Parameter setzen.</p><p style="color:#666;font-size:14px;">URL: <code>?webhook=justai&branch=DEINE-BRANCH-ID</code> oder data-webhook / data-branch am Script-Tag.</p></div>';
      return;
    }

    var CONFIG = { webhookName: webhook, webhookBaseUrl: base, branchId: branch };
    var ENDPOINT = base + webhook + '_qrcode';
    var BRANCHES_ENDPOINT = base + webhook + '_branches';
    var STATUS_ENDPOINT = base + webhook + '_qr_status';
    var QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=';
    var DISPLAY_QR_MINUTES = 2;

    var CSS = '.qr-scope{--bg:#fff;--fg:#0a0a0a;--muted:#6b7280;--border:#e5e7eb;--accent:#111;--accent-pressed:#000;--ok:#1d9a6c;--err:#d70015;--radius:8px;--ring:#111;--ring-offset:#fff;color:var(--fg);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.6;font-size:14px}.qr-scope .wrap{max-width:880px;margin:0 auto;padding:0 10px}.qr-scope .card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:10px 20px 20px;box-shadow:0 4px 16px rgba(0,0,0,.05)}.qr-scope h1{margin:0 0 6px;font-size:20px;font-weight:700;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.qr-scope .branch-badge{background:#f3f4f6;color:#6b7280;border:1px solid #e5e7eb;font-size:12px;padding:2px 8px;border-radius:99px;font-weight:500;margin-left:8px}.qr-scope .version-card{font-size:10px;color:#9ca3af;opacity:.7;text-align:right;margin-top:8px}.qr-scope p.desc{margin:0 0 16px;color:var(--muted);font-size:13px}.qr-scope .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px 16px}.qr-scope label{display:block;font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:500}.qr-scope input,.qr-scope select,.qr-scope textarea{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:var(--radius);border:1px solid var(--border);background:#fff;color:var(--fg);outline:0;font-size:14px}.qr-scope .note-input{height:44px;min-height:44px;max-height:160px;resize:vertical;line-height:1.4;background:#fffef9;border-color:#f8f1d6}.qr-scope .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 8px}.qr-scope button{cursor:pointer;background:var(--accent);color:#fff;border:1px solid transparent;border-radius:var(--radius);padding:12px 24px;font-weight:600;height:44px;font-size:14px}.qr-scope button:hover{background:var(--accent-pressed)}.qr-scope button.secondary{background:#fff;color:var(--fg);border-color:var(--border)}.qr-scope .spacer{height:18px}.qr-scope .result{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}@media(max-width:800px){.qr-scope .result{grid-template-columns:1fr}}.qr-scope .panel{background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px}.qr-scope .info-panel.has-bonus{background:#fff8e6;border-color:#f7c948}.qr-scope .qr{display:grid;place-items:center;background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:12px;min-height:260px}.qr-scope .qr img{max-width:100%;height:auto;image-rendering:pixelated}.qr-scope .muted{color:var(--muted);font-size:13px}.qr-scope .hint{font-size:12px;color:var(--muted);margin-top:6px}.qr-scope .info-panel.hidden{display:none}.qr-scope .bonus-banner{margin-bottom:12px;padding:10px 14px;border-radius:var(--radius);color:#92400e;font-weight:600;font-size:13px;text-align:center}.qr-scope .bonus-banner.hidden{display:none}.qr-scope .visit-history{list-style:none;margin:0;padding:0;font-size:13px}.qr-scope .visit-history li{padding:4px 0;border-bottom:1px dashed var(--border)}.qr-scope .visit-history li:last-child{border-bottom:none}.qr-scope .row .right{margin-left:auto}.qr-scope .kv{display:grid;grid-template-columns:140px 1fr;column-gap:12px;row-gap:8px;align-items:start}.qr-scope .label{color:var(--muted);font-size:12px;font-weight:600}.qr-scope .value{font-size:14px}@media(max-width:768px){.qr-scope .grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.qr-scope .grid{grid-template-columns:1fr}.qr-scope .kv{grid-template-columns:1fr}}.qr-scope .advanced-fields{display:none}.qr-scope .advanced-fields.show{display:block}.qr-scope .toggle-advanced{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:2px;background:transparent;border:none;cursor:pointer;font-size:12px;color:#9ca3af;opacity:.6;padding:0}.qr-scope .toggle-advanced:hover{opacity:1}.qr-scope .toggle-advanced.active{color:var(--fg);opacity:1}.qr-scope .advanced-label{display:inline-block;margin-right:6px;font-size:11px;color:#9ca3af}.qr-scope .qr img:not([src]),.qr-scope .qr img[src=""]{display:none}.qr-scope .panel h2{display:flex;align-items:center;justify-content:space-between;gap:12px}.qr-scope .countdown-time{font-family:monospace;font-weight:600;font-size:16px;color:var(--fg)}.qr-scope .countdown-time.expired{color:var(--err)}.qr-scope .qr.expired{opacity:.3;pointer-events:none}.qr-scope .info-box{background:#f0f9ff;border:1px solid #bae6fd;border-radius:var(--radius);padding:12px 16px;margin-top:20px;display:flex;align-items:flex-start;gap:10px}.qr-scope .info-box .text{font-size:13px;color:#0c4a6e;line-height:1.5}.qr-scope .info-box .text code{background:#e0f2fe;padding:2px 6px;border-radius:4px;font-size:12px;font-weight:600;color:#0369a1}';

    var HTML = '<div class="qr-scope"><div class="wrap"><div class="card"><h1>Tạo mã xác thực <span class="branch-badge" id="qrf-branchBadge">Loading...</span></h1><p class="desc">Tạo mã xác thực cho nhân viên, lấy liên kết sâu WhatsApp và hiển thị mã QR để khách quét.</p><form id="qrf-genForm"><div class="grid"><div><label for="qrf-generated_by">👤 Nhân viên *</label><input id="qrf-generated_by" name="generated_by" placeholder="Tên" required></div><div class="advanced-fields" id="qrf-validMinutesField"><label for="qrf-valid_minutes">Thời gian hiệu lực (phút)</label><input id="qrf-valid_minutes" name="valid_minutes" type="number" min="1" step="1" value="1440"></div><div class="advanced-fields" id="qrf-maxUsesField"><label for="qrf-max_uses">Số lần dùng tối đa</label><input id="qrf-max_uses" name="max_uses" type="number" min="1" step="1" value="1"></div><div><label for="qrf-points_override">🎯 Điểm</label><input id="qrf-points_override" name="points_override" type="number" step="1" placeholder="1"></div><div><label for="qrf-note">📝 Ghi chú</label><textarea id="qrf-note" name="note" class="note-input" placeholder="mầu/dịch vụ" rows="1"></textarea></div></div><div class="spacer"></div><div style="display:flex;align-items:center;justify-content:flex-end;margin-right:8px"><span class="advanced-label">Tùy chọn nâng cao</span><button type="button" class="toggle-advanced" id="qrf-toggleBtn" title="Tùy chọn nâng cao">+</button></div><div style="height:12px"></div><div class="row"><button type="submit">Tạo</button><button class="secondary" type="button" id="qrf-resetBtn">Đặt lại</button><div class="right muted" id="qrf-statusText"></div></div><div class="version-card">v1.4</div></form></div><div class="spacer"></div><div class="result"><div class="panel"><h2 style="margin:0 0 10px;font-size:16px"><span id="qrf-pointsDisplay" style="display:none"></span><span class="countdown-time" id="qrf-countdownTime" style="display:none"></span></h2><div class="qr" id="qrf-qrContainer"><img id="qrf-qr_img" src="" alt="" style="display:none"><div id="qrf-qr_placeholder" style="color:var(--muted);font-size:13px">Mã QR sẽ hiển thị ở đây</div></div><div class="hint" style="margin-top:10px">Mã QR này chứa liên kết sâu WhatsApp. Khách có thể quét và gửi mã.</div></div><div class="panel info-panel hidden" id="qrf-customerInfoPanel"><h2 style="margin:0 0 10px;font-size:16px">Thông tin khách</h2><div class="bonus-banner hidden" id="qrf-bonusBanner">Khách đã đạt 10 điểm! 🎉</div><div class="kv"><div class="label">Tên</div><div class="value" id="qrf-customerName">—</div><div class="label">SĐT</div><div class="value" id="qrf-customerPhone">—</div><div class="label">Điểm hiện có</div><div class="value" id="qrf-customerPoints">—</div><div class="label">Lượt ghé</div><div class="value" id="qrf-customerVisits">—</div><div class="label">Lần cuối</div><div class="value" id="qrf-lastVisitSummary">—</div><div class="label">5 lần gần nhất</div><div class="value"><ul class="visit-history" id="qrf-visitHistoryList"><li class="muted">Không có dữ liệu</li></ul></div></div><div class="hint" id="qrf-customerInfoHint">Thông tin sẽ xuất hiện khi khách xác nhận mã.</div></div></div><div class="info-box"><div class="icon">ℹ️</div><div class="text">Nếu khách hàng muốn rời khỏi chương trình, chỉ cần nhập: <code>/stop</code> trong cuộc trò chuyện WhatsApp.</div></div></div></div>';
    HTML += '<audio id="qrf-celebrationAudio" preload="auto" src="https://raw.githubusercontent.com/t2thak/bilderspeicher/main/short-crowd-cheer-6713.mp3"></audio><audio id="qrf-notificationAudio" preload="auto" src="https://raw.githubusercontent.com/t2thak/bilderspeicher/main/new-notification-028-383966.mp3"></audio>';

    if (!document.getElementById('qr-frontend-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'qr-frontend-styles';
      styleEl.textContent = CSS;
      document.head.appendChild(styleEl);
    }
    container.innerHTML = HTML;

    function loadConfetti() {
      return new Promise(function(resolve) {
        if (typeof confetti === 'function') { resolve(); return; }
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.0/dist/confetti.browser.min.js';
        s.onload = resolve;
        s.onerror = resolve;
        document.head.appendChild(s);
      });
    }

    loadConfetti().then(function() { runApp(); });

    function runApp() {
      var CURRENT_BRANCH = { id: CONFIG.branchId, code: '', name: '' };
      var celebrationAudio = document.getElementById('qrf-celebrationAudio');
      var notificationAudio = document.getElementById('qrf-notificationAudio');
      if (celebrationAudio) { celebrationAudio.crossOrigin = 'anonymous'; celebrationAudio.volume = 1; celebrationAudio.muted = true; }
      if (notificationAudio) { notificationAudio.crossOrigin = 'anonymous'; notificationAudio.volume = 1; notificationAudio.muted = true; }

      var form = document.getElementById('qrf-genForm');
      var resetBtn = document.getElementById('qrf-resetBtn');
      var statusText = document.getElementById('qrf-statusText');
      var qr_img = document.getElementById('qrf-qr_img');
      var qr_placeholder = document.getElementById('qrf-qr_placeholder');
      var qrContainer = document.getElementById('qrf-qrContainer');
      var toggleBtn = document.getElementById('qrf-toggleBtn');
      var advancedFields = document.querySelectorAll('.qr-scope .advanced-fields');
      var countdownTime = document.getElementById('qrf-countdownTime');
      var pointsDisplay = document.getElementById('qrf-pointsDisplay');
      var branchBadge = document.getElementById('qrf-branchBadge');
      var customerInfoPanel = document.getElementById('qrf-customerInfoPanel');
      var customerNameEl = document.getElementById('qrf-customerName');
      var customerPhoneEl = document.getElementById('qrf-customerPhone');
      var customerPointsEl = document.getElementById('qrf-customerPoints');
      var customerVisitsEl = document.getElementById('qrf-customerVisits');
      var lastVisitSummaryEl = document.getElementById('qrf-lastVisitSummary');
      var customerInfoHint = document.getElementById('qrf-customerInfoHint');
      var bonusBanner = document.getElementById('qrf-bonusBanner');
      var visitHistoryList = document.getElementById('qrf-visitHistoryList');
      var noteInput = document.getElementById('qrf-note');

      var loyaltyThreshold = 10, advancedVisible = false, countdownInterval = null, expiryTime = null, statusPollTimeout = null, statusPollPayload = null, lastCelebratedCodeId = null, cleanupTimeout = null, celebrationUnlocked = false;

      async function loadBranchInfo() {
        try {
          var res = await fetch(BRANCHES_ENDPOINT, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
          if (!res.ok) throw new Error('Failed ' + res.status);
          var json = await res.json();
          var branches = [];
          if (Array.isArray(json) && json.length > 0) {
            if (json[0].list_active_branches && json[0].list_active_branches.branches) branches = json[0].list_active_branches.branches;
            else if (json[0].branches) branches = json[0].branches;
          } else if (json.list_active_branches && json.list_active_branches.branches) branches = json.list_active_branches.branches;
          else if (json.branches) branches = json.branches;
          var b = branches.find(function(x) { return x.id === CURRENT_BRANCH.id; });
          if (b) {
            CURRENT_BRANCH.code = b.branch_code || '';
            CURRENT_BRANCH.name = b.branch_name || '';
            branchBadge.textContent = CURRENT_BRANCH.code + ' - ' + CURRENT_BRANCH.name;
          } else {
            branchBadge.textContent = 'Branch nicht gefunden';
          }
        } catch (err) {
          console.error(err);
          branchBadge.textContent = 'Fehler beim Laden';
        }
      }
      loadBranchInfo();

      function setStatus(msg, ok) { statusText.textContent = msg || ''; statusText.style.color = (ok !== false) ? 'var(--ok)' : 'var(--err)'; }
      function showError(msg) { setStatus(msg, false); }
      function hideError() { setStatus(''); }

      function hideCustomerInfo() {
        customerInfoPanel.classList.add('hidden');
        customerNameEl.textContent = '—';
        customerPhoneEl.textContent = '—';
        customerPointsEl.textContent = '—';
        customerVisitsEl.textContent = '—';
        lastVisitSummaryEl.textContent = '—';
        customerInfoHint.textContent = 'Thông tin sẽ xuất hiện khi khách xác nhận mã.';
        bonusBanner.classList.add('hidden');
        customerInfoPanel.classList.remove('has-bonus');
        visitHistoryList.innerHTML = '<li class="muted">Không có dữ liệu</li>';
      }

      function maskPhone(phone) { var s = String(phone || '').replace(/[^\d+]/g, ''), t = s.slice(-4); return t ? '***' + t : 'ẩn'; }

      function showCustomerInfo(customer, totalPoints, codeId, bonusInfo, recentVisits) {
        customer = customer || {};
        recentVisits = recentVisits || [];
        var name = (customer.name || 'Khách').trim();
        var visits = Number.isFinite(customer.total_visits) ? customer.total_visits : 0;
        var points = Number.isFinite(totalPoints) ? totalPoints : (Number.isFinite(customer.total_points) ? customer.total_points : null);
        customerNameEl.textContent = name || 'Khách';
        customerPhoneEl.textContent = maskPhone(customer.phone_number);
        customerPointsEl.textContent = points !== null ? points : '—';
        customerVisitsEl.textContent = visits;
        customerInfoPanel.classList.remove('hidden');
        if (bonusInfo && bonusInfo.triggered) {
          bonusBanner.textContent = 'Khách đã đạt ' + loyaltyThreshold + ' điểm! 🎉';
          bonusBanner.classList.remove('hidden');
          customerInfoPanel.classList.add('has-bonus');
          if (typeof confetti === 'function') confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 } });
          if (celebrationAudio) { celebrationAudio.muted = false; celebrationAudio.currentTime = 0; celebrationAudio.play().catch(function() {}); }
        } else {
          bonusBanner.classList.add('hidden');
          customerInfoPanel.classList.remove('has-bonus');
        }
        if (notificationAudio) { notificationAudio.muted = false; notificationAudio.currentTime = 0; notificationAudio.play().catch(function() {}); }
        var parsed = (recentVisits || []).map(function(entry) {
          var d = entry && (entry.date || entry.validated_at || entry);
          if (!d) return null;
          var dateObj = new Date(d);
          return isNaN(dateObj.getTime()) ? null : { date: dateObj, note: entry.note };
        }).filter(Boolean).sort(function(a, b) { return b.date - a.date; });
        var history = parsed.slice(0, 5);
        var formatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        visitHistoryList.innerHTML = history.length ? history.map(function(item) {
          return '<li>' + formatter.format(item.date) + (item.note ? '<span class="note">' + item.note + '</span>' : '') + '</li>';
        }).join('') : '<li class="muted">Không có dữ liệu</li>';
        if (history[0]) {
          var diffDays = Math.max(0, Math.floor((Date.now() - history[0].date.getTime()) / 86400000));
          lastVisitSummaryEl.textContent = diffDays === 0 ? 'Hôm nay' : diffDays + ' ngày trước';
        } else {
          lastVisitSummaryEl.textContent = '—';
        }
      }

      function extractQrUrl(result) {
        if (result && result.deep_link) return QR_API + encodeURIComponent(result.deep_link);
        return (result && result.qr_url) || '';
      }

      function formatTime(sec) { return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); }

      function updateCountdown() {
        if (!expiryTime) return;
        var rem = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
        if (rem === 0) {
          countdownTime.textContent = '00:00';
          countdownTime.classList.add('expired');
          qrContainer.classList.add('expired');
          if (countdownInterval) clearInterval(countdownInterval);
          countdownInterval = null;
          stopPollingRedemption();
          hideCustomerInfo();
          pointsDisplay.style.display = 'none';
          qr_img.src = '';
          qr_placeholder.style.display = 'block';
          qr_placeholder.textContent = 'Mã QR đã hết hạn';
          qr_placeholder.style.color = 'var(--err)';
          setStatus('Phiên đã hết hạn', false);
          advancedVisible = false;
          advancedFields.forEach(function(f) { f.classList.remove('show'); });
          toggleBtn.textContent = '+';
          toggleBtn.classList.remove('active');
        } else {
          countdownTime.textContent = formatTime(rem);
        }
      }

      function startCountdown(validMinutes) {
        if (countdownInterval) clearInterval(countdownInterval);
        expiryTime = Date.now() + validMinutes * 60 * 1000;
        countdownTime.style.display = 'inline';
        countdownTime.classList.remove('expired');
        qrContainer.classList.remove('expired');
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
      }

      function stopCountdown() {
        if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
        statusPollTimeout && clearTimeout(statusPollTimeout);
        statusPollPayload = null;
        countdownTime.style.display = 'none';
        expiryTime = null;
      }

      function stopPollingRedemption() {
        if (statusPollTimeout) { clearTimeout(statusPollTimeout); statusPollTimeout = null; }
        statusPollPayload = null;
      }

      function startPollingRedemption(codeId, codeValue) {
        if (!codeId && !codeValue) return;
        stopPollingRedemption();
        statusPollPayload = { code_id: codeId, code: codeValue };
        function poll() {
          if (!statusPollPayload) return;
          fetch(STATUS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(statusPollPayload) })
            .then(function(r) { return r.ok ? r.json() : Promise.reject(new Error(r.status)); })
            .then(function(data) {
              if (data && data.redeemed) {
                if (Number.isFinite(data.loyalty_bonus_threshold)) loyaltyThreshold = data.loyalty_bonus_threshold;
                showCustomerInfo(data.customer, data.points_after, data.code_id, { triggered: Boolean(data.bonus_triggered) }, data.recent_visits || []);
                setStatus(data.bonus_triggered ? 'Khách đã đạt ' + loyaltyThreshold + ' điểm! 🎉' : 'Điểm khách đã được cập nhật', true);
                stopCountdown();
                stopPollingRedemption();
              }
            })
            .catch(function() {});
          if (statusPollPayload) statusPollTimeout = setTimeout(poll, 4000);
        }
        poll();
      }

      toggleBtn.addEventListener('click', function() {
        advancedVisible = !advancedVisible;
        advancedFields.forEach(function(f) { f.classList.toggle('show', advancedVisible); });
        toggleBtn.textContent = advancedVisible ? '−' : '+';
        toggleBtn.classList.toggle('active', advancedVisible);
      });

      hideCustomerInfo();

      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideError();
        setStatus('Đang tạo…', true);
        hideCustomerInfo();
        stopPollingRedemption();
        var generated_by = document.getElementById('qrf-generated_by').value || 'staff:unknown';
        var valid_minutes = Number(document.getElementById('qrf-valid_minutes').value || 1440);
        var max_uses = Number(document.getElementById('qrf-max_uses').value || 1);
        var points_override_raw = document.getElementById('qrf-points_override').value;
        var points_override = points_override_raw === '' ? null : Number(points_override_raw);
        var note = document.getElementById('qrf-note').value || null;
        var payload = { branch_id: CURRENT_BRANCH.id, generated_by: generated_by, valid_minutes: valid_minutes, max_uses: max_uses, points_override: points_override, note: note };
        try {
          var res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error('Máy chủ ' + res.status);
          var json = await res.json();
          var result = (Array.isArray(json) && json[0] && json[0].generate_staff_code) ? json[0].generate_staff_code : (json && json.generate_staff_code) ? json.generate_staff_code : json;
          var qrUrl = extractQrUrl(result);
          qr_img.src = qrUrl || '';
          var points = points_override !== null ? points_override : (result.points || result.points_override || 1);
          pointsDisplay.textContent = 'Điểm được cấp: ' + points;
          pointsDisplay.style.display = 'inline';
          if (qrUrl) {
            qr_img.style.display = 'block';
            qr_placeholder.style.display = 'none';
            startCountdown(DISPLAY_QR_MINUTES);
          }
          var codeId = result.code_id || result.validation_id || null;
          var codeValue = result.code || result.generated_code || null;
          if (codeId || codeValue) {
            setStatus('Đang chờ khách xác nhận điểm...', true);
            startPollingRedemption(codeId, codeValue);
          } else {
            setStatus('Hoàn tất', true);
          }
        } catch (err) {
          console.error(err);
          showError(err.message || 'Tạo mã không thành công');
          hideCustomerInfo();
          stopCountdown();
        }
      });

      resetBtn.addEventListener('click', function() {
        qr_img.src = '';
        qr_img.style.display = 'none';
        qr_placeholder.style.display = 'block';
        qr_placeholder.textContent = 'Mã QR sẽ hiển thị ở đây';
        qr_placeholder.style.color = 'var(--muted)';
        setStatus('');
        stopCountdown();
        pointsDisplay.style.display = 'none';
        hideCustomerInfo();
        advancedVisible = false;
        advancedFields.forEach(function(f) { f.classList.remove('show'); });
        toggleBtn.textContent = '+';
        toggleBtn.classList.remove('active');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
