/**
 * QR-Generator Widget v1.5
 * 
 * Ein selbständiges Widget, das in jede Tenant-Website eingebettet werden kann.
 * 
 * EINBETTUNG:
 * -----------
 * <script>
 *   window.QR_CONFIG = {
 *     tenant: "perfect-nails",           // Pflicht: Tenant-Key
 *     branch_id: "uuid-hier",             // Pflicht: Branch-ID
 *     webhook_base: "https://n8nv2.flowrk.io",  // Optional: n8n-Instanz (Standard: https://n8nv2.flowrk.io)
 *     language: "de"                      // Optional: Sprache (de, vi, cz, en)
 *   };
 * </script>
 * <script src="https://dein-server.de/qr-generator-widget.js"></script>
 * <div id="qr-generator-container"></div>
 */

(function() {
    'use strict';

    // =================================================================
    // KONFIGURATION AUS window.QR_CONFIG LESEN
    // =================================================================
    const CONFIG = window.QR_CONFIG || {};
    
    const TENANT_KEY = CONFIG.tenant || CONFIG.tenant_key || "";
    const BRANCH_ID = CONFIG.branch_id || "";
    const WEBHOOK_BASE_URL = CONFIG.webhook_base || "https://n8nv2.flowrk.io";
    const LANGUAGE = CONFIG.language || "vi"; // Default: Vietnamesisch (wie Original)
    const CONTAINER_ID = CONFIG.container_id || "qr-generator-container";

    // Validierung
    if (!TENANT_KEY) {
        console.error("[QR-Widget] Fehler: tenant nicht konfiguriert in window.QR_CONFIG");
        return;
    }
    if (!BRANCH_ID) {
        console.error("[QR-Widget] Fehler: branch_id nicht konfiguriert in window.QR_CONFIG");
        return;
    }

    // =================================================================
    // SPRACHPAKETE
    // =================================================================
    const TRANSLATIONS = {
        vi: {
            title: "Tạo mã xác thực",
            staff: "Nhân viên",
            points: "Điểm",
            note: "Ghi chú",
            notePlaceholder: "mầu/dịch vụ",
            validMinutes: "Thời gian hiệu lực (phút)",
            maxUses: "Số lần dùng tối đa",
            advancedOptions: "Tùy chọn nâng cao",
            generate: "Tạo",
            reset: "Đặt lại",
            generating: "Đang tạo…",
            complete: "Hoàn tất",
            failed: "Thất bại",
            qrPlaceholder: "Mã QR sẽ hiển thị ở đây",
            qrExpired: "Mã QR đã hết hạn",
            qrHint: "Mã QR này chứa liên kết sâu WhatsApp. Khách có thể quét và gửi mã.",
            customerInfo: "Thông tin khách",
            customerInfoHint: "Thông tin sẽ xuất hiện khi khách xác nhận mã.",
            name: "Tên",
            phone: "SĐT",
            currentPoints: "Điểm hiện có",
            visits: "Lượt ghé",
            lastVisit: "Lần cuối",
            recentVisits: "5 lần gần nhất",
            noData: "Không có dữ liệu",
            loadMore: "Xem thêm",
            bonusReached: "Khách đã đạt {threshold} điểm! 🎉",
            waitingConfirm: "Đang chờ khách xác nhận điểm...",
            customerConfirmed: "Khách đã xác nhận mã",
            pointsUpdated: "Điểm khách đã được cập nhật",
            pointsAwarded: "Điểm được cấp",
            today: "Hôm nay",
            daysAgo: "{days} ngày trước",
            staffLabel: "Nhân viên",
            optOutInfo: "Nếu khách hàng muốn rời khỏi chương trình, chỉ cần nhập: <code>/stop</code> trong cuộc trò chuyện WhatsApp.",
            loading: "Loading...",
            branchNotFound: "Branch nicht gefunden",
            loadError: "Fehler beim Laden",
            sessionExpired: "Phiên đã hết hạn"
        },
        de: {
            title: "Code generieren",
            staff: "Mitarbeiter",
            points: "Punkte",
            note: "Notiz",
            notePlaceholder: "Farbe/Service",
            validMinutes: "Gültigkeit (Minuten)",
            maxUses: "Max. Verwendungen",
            advancedOptions: "Erweiterte Optionen",
            generate: "Generieren",
            reset: "Zurücksetzen",
            generating: "Generiere…",
            complete: "Fertig",
            failed: "Fehlgeschlagen",
            qrPlaceholder: "QR-Code erscheint hier",
            qrExpired: "QR-Code abgelaufen",
            qrHint: "Dieser QR-Code enthält einen WhatsApp Deep-Link. Der Kunde scannt und sendet den Code.",
            customerInfo: "Kundeninformationen",
            customerInfoHint: "Info erscheint, wenn der Kunde den Code bestätigt.",
            name: "Name",
            phone: "Telefon",
            currentPoints: "Aktuelle Punkte",
            visits: "Besuche",
            lastVisit: "Letzter Besuch",
            recentVisits: "Letzte 5 Besuche",
            noData: "Keine Daten",
            loadMore: "Mehr laden",
            bonusReached: "Kunde hat {threshold} Punkte erreicht! 🎉",
            waitingConfirm: "Warte auf Bestätigung…",
            customerConfirmed: "Kunde hat Code bestätigt",
            pointsUpdated: "Kundenpunkte aktualisiert",
            pointsAwarded: "Vergebene Punkte",
            today: "Heute",
            daysAgo: "vor {days} Tagen",
            staffLabel: "Mitarbeiter",
            optOutInfo: "Kunden können das Programm jederzeit verlassen mit: <code>/stop</code> im WhatsApp-Chat.",
            loading: "Lädt...",
            branchNotFound: "Filiale nicht gefunden",
            loadError: "Ladefehler",
            sessionExpired: "Sitzung abgelaufen"
        },
        en: {
            title: "Generate Code",
            staff: "Staff",
            points: "Points",
            note: "Note",
            notePlaceholder: "color/service",
            validMinutes: "Valid for (minutes)",
            maxUses: "Max uses",
            advancedOptions: "Advanced options",
            generate: "Generate",
            reset: "Reset",
            generating: "Generating…",
            complete: "Complete",
            failed: "Failed",
            qrPlaceholder: "QR code will appear here",
            qrExpired: "QR code expired",
            qrHint: "This QR code contains a WhatsApp deep link. Customer scans and sends the code.",
            customerInfo: "Customer Info",
            customerInfoHint: "Info will appear when customer confirms the code.",
            name: "Name",
            phone: "Phone",
            currentPoints: "Current Points",
            visits: "Visits",
            lastVisit: "Last Visit",
            recentVisits: "Last 5 visits",
            noData: "No data",
            loadMore: "Load more",
            bonusReached: "Customer reached {threshold} points! 🎉",
            waitingConfirm: "Waiting for confirmation…",
            customerConfirmed: "Customer confirmed code",
            pointsUpdated: "Customer points updated",
            pointsAwarded: "Points awarded",
            today: "Today",
            daysAgo: "{days} days ago",
            staffLabel: "Staff",
            optOutInfo: "Customers can leave the program anytime by typing: <code>/stop</code> in WhatsApp chat.",
            loading: "Loading...",
            branchNotFound: "Branch not found",
            loadError: "Load error",
            sessionExpired: "Session expired"
        },
        cz: {
            title: "Vygenerovat kód",
            staff: "Zaměstnanec",
            points: "Body",
            note: "Poznámka",
            notePlaceholder: "barva/služba",
            validMinutes: "Platnost (minuty)",
            maxUses: "Max. použití",
            advancedOptions: "Rozšířené možnosti",
            generate: "Vygenerovat",
            reset: "Resetovat",
            generating: "Generuji…",
            complete: "Hotovo",
            failed: "Selhalo",
            qrPlaceholder: "QR kód se zobrazí zde",
            qrExpired: "QR kód vypršel",
            qrHint: "Tento QR kód obsahuje WhatsApp deep link. Zákazník naskenuje a odešle kód.",
            customerInfo: "Info o zákazníkovi",
            customerInfoHint: "Info se zobrazí po potvrzení kódu zákazníkem.",
            name: "Jméno",
            phone: "Telefon",
            currentPoints: "Aktuální body",
            visits: "Návštěvy",
            lastVisit: "Poslední návštěva",
            recentVisits: "Posledních 5 návštěv",
            noData: "Žádná data",
            loadMore: "Načíst více",
            bonusReached: "Zákazník dosáhl {threshold} bodů! 🎉",
            waitingConfirm: "Čekám na potvrzení…",
            customerConfirmed: "Zákazník potvrdil kód",
            pointsUpdated: "Body zákazníka aktualizovány",
            pointsAwarded: "Přidělené body",
            today: "Dnes",
            daysAgo: "před {days} dny",
            staffLabel: "Zaměstnanec",
            optOutInfo: "Zákazníci mohou opustit program kdykoliv zadáním: <code>/stop</code> v WhatsApp chatu.",
            loading: "Načítám...",
            branchNotFound: "Pobočka nenalezena",
            loadError: "Chyba načítání",
            sessionExpired: "Relace vypršela"
        }
    };

    const T = TRANSLATIONS[LANGUAGE] || TRANSLATIONS.vi;

    // =================================================================
    // HELPER FUNCTIONS
    // =================================================================
    function buildWebhookUrl(path) {
        const base = WEBHOOK_BASE_URL.replace(/\/$/, "");
        const url = new URL(`${base}/webhook/${path}`);
        if (TENANT_KEY) {
            url.searchParams.set("tenant", TENANT_KEY);
        }
        return url.toString();
    }

    const ENDPOINT = buildWebhookUrl("unified_qrcode");
    const BRANCHES_ENDPOINT = buildWebhookUrl("unified_branches");
    const STATUS_ENDPOINT = buildWebhookUrl("unified_qr_status");
    const QR_API = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=";

    // =================================================================
    // CSS STYLES (injiziert in das Dokument)
    // =================================================================
    const CSS = `
        .qr-scope {
            --bg: #ffffff;
            --fg: #0a0a0a;
            --muted: #6b7280;
            --border: #e5e7eb;
            --accent: #111111;
            --accent-pressed: #000000;
            --ok: #1d9a6c;
            --err: #d70015;
            --radius: 8px;
            --ring: #111111;
            --ring-offset: #ffffff;
            color: var(--fg);
            background: var(--bg);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            font-size: 14px;
        }
        .qr-scope .wrap { max-width: 880px; margin: 0 auto; padding: 0 10px; }
        .qr-scope .card {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 10px 20px 20px 20px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05), 0 1px 4px rgba(0, 0, 0, 0.06);
        }
        .qr-scope h1 {
            margin: 0 0 6px;
            font-size: 20px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .qr-scope .branch-badge {
            background-color: #f3f4f6;
            color: #6b7280;
            border: 1px solid #e5e7eb;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 99px;
            font-weight: 500;
        }
        .qr-scope .version-card {
            font-size: 10px;
            color: #9ca3af;
            opacity: 0.7;
            text-align: right;
            margin-top: 8px;
        }
        .qr-scope p.desc { margin: 0 0 16px; color: var(--muted); font-size: 13px; }
        .qr-scope .grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px 16px;
        }
        .qr-scope label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 4px; font-weight: 500; }
        .qr-scope input, .qr-scope select, .qr-scope textarea {
            width: 100%;
            height: 44px;
            box-sizing: border-box;
            padding: 10px 12px;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            background: #fff;
            color: var(--fg);
            outline: none;
            font-size: 14px;
            transition: box-shadow .15s ease, border-color .15s ease;
        }
        .qr-scope input:focus-visible, .qr-scope select:focus-visible, .qr-scope textarea:focus-visible {
            border-color: var(--fg);
            box-shadow: 0 0 0 2px var(--ring-offset), 0 0 0 4px var(--ring);
        }
        .qr-scope .note-input {
            height: 44px; min-height: 44px; max-height: 160px;
            resize: vertical; line-height: 1.4;
            background: #fffef9; border-color: #f8f1d6;
        }
        .qr-scope .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 0 8px; }
        .qr-scope button {
            cursor: pointer;
            background: var(--accent);
            color: #fff;
            border: 1px solid transparent;
            border-radius: var(--radius);
            padding: 12px 24px;
            font-weight: 600;
            height: 44px;
            font-size: 14px;
            transition: background .15s ease;
        }
        .qr-scope button:hover { background: var(--accent-pressed); }
        .qr-scope button.secondary { background: #fff; color: var(--fg); border-color: var(--border); }
        .qr-scope button.ok { background: var(--ok); color: #fff; }
        .qr-scope button.err { background: var(--err); color: #fff; }
        .qr-scope .spacer { height: 18px; }
        .qr-scope .result { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; }
        @media (max-width: 800px) { .qr-scope .result { grid-template-columns: 1fr; } }
        .qr-scope .panel {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 16px 20px;
        }
        .qr-scope .info-panel.has-bonus { background: #fff8e6; border-color: #f7c948; }
        .qr-scope .field { margin-bottom: 10px; font-size: 14px; }
        .qr-scope .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            word-break: break-all;
            font-size: 13px;
            background: #fafafa;
            border: 1px dashed var(--border);
            border-radius: var(--radius);
            padding: 8px;
        }
        .qr-scope .qr {
            display: grid;
            place-items: center;
            background: #fff;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 12px;
            min-height: 260px;
        }
        .qr-scope .qr img { max-width: 100%; height: auto; image-rendering: pixelated; }
        .qr-scope .muted { color: var(--muted); font-size: 13px; }
        .qr-scope .hint { font-size: 12px; color: var(--muted); margin-top: 6px; }
        .qr-scope .info-panel.hidden { display: none; }
        .qr-scope .bonus-banner {
            margin-bottom: 12px;
            padding: 10px 14px;
            border-radius: var(--radius);
            color: #92400e;
            font-weight: 600;
            font-size: 13px;
            text-align: center;
        }
        .qr-scope .bonus-banner.hidden { display: none; }
        .qr-scope .visit-history {
            list-style: none; margin: 0; padding: 0;
            display: flex; flex-direction: column; gap: 4px; font-size: 13px;
        }
        .qr-scope .visit-history li {
            display: grid;
            grid-template-columns: minmax(120px, 0.65fr) 1fr;
            align-items: start;
            column-gap: 12px;
            padding: 8px 0;
            border-bottom: 1px dashed var(--border);
        }
        .qr-scope .visit-history li:last-child { border-bottom: none; }
        .qr-scope .visit-history .visit-date { color: var(--muted); font-weight: 400; font-size: 13px; }
        .qr-scope .visit-history .visit-details { display: flex; flex-direction: column; gap: 2px; }
        .qr-scope .visit-history .note { display: block; color: var(--muted); font-size: 12px; margin-top: 2px; }
        .qr-scope .errors {
            color: #7f1d1d; background: #fee2e2; border: 1px solid #fecaca;
            padding: 10px; border-radius: var(--radius); font-size: 13px;
        }
        .qr-scope .row .right { margin-left: auto; }
        .qr-scope .kv {
            display: grid;
            grid-template-columns: minmax(120px, 0.65fr) 1fr;
            column-gap: 12px; row-gap: 10px; align-items: start;
        }
        .qr-scope .label { color: var(--muted); font-size: 12px; font-weight: 600; }
        .qr-scope .value { font-size: 14px; }
        .qr-scope .actions { display: flex; gap: 12px; margin-top: 6px; flex-wrap: wrap; }
        @media (max-width: 768px) { .qr-scope .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 480px) { .qr-scope .grid { grid-template-columns: 1fr; } }
        .qr-scope .advanced-fields { display: none; }
        .qr-scope .advanced-fields.show { display: block; }
        .qr-scope .toggle-advanced {
            display: inline-flex; align-items: center; justify-content: center;
            width: 16px; height: 16px; border-radius: 2px;
            background: transparent; border: none; cursor: pointer;
            font-size: 12px; color: #9ca3af; opacity: 0.6; padding: 0;
        }
        .qr-scope .toggle-advanced:hover { opacity: 1; color: #6b7280; }
        .qr-scope .toggle-advanced.active { color: var(--fg); opacity: 1; }
        .qr-scope .advanced-label { display: inline-block; margin-right: 6px; font-size: 11px; color: #9ca3af; }
        .qr-scope .load-more {
            width: 100%; margin-top: 6px; padding: 4px 0;
            background: transparent; border: none; color: #9ca3af;
            font-size: 11px; cursor: pointer; text-align: left;
        }
        .qr-scope .load-more:hover { color: #6b7280; text-decoration: underline; }
        .qr-scope .load-more.hidden { display: none; }
        .qr-scope .qr img:not([src]), .qr-scope .qr img[src=""] { display: none; }
        .qr-scope .panel h2 { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .qr-scope .countdown-time { font-family: monospace; font-weight: 600; font-size: 16px; color: var(--fg); }
        .qr-scope .countdown-time.expired { color: var(--err); }
        .qr-scope .qr.expired { opacity: 0.3; pointer-events: none; }
        .qr-scope .info-box {
            background: #f0f9ff; border: 1px solid #bae6fd; border-radius: var(--radius);
            padding: 12px 16px; margin-top: 20px; display: flex; align-items: flex-start; gap: 10px;
        }
        .qr-scope .info-box .icon { flex-shrink: 0; width: 18px; height: 18px; color: #0284c7; font-weight: 600; font-size: 14px; }
        .qr-scope .info-box .text { font-size: 13px; color: #0c4a6e; line-height: 1.5; }
        .qr-scope .info-box .text code {
            background: #e0f2fe; padding: 2px 6px; border-radius: 4px;
            font-family: monospace; font-size: 12px; font-weight: 600; color: #0369a1;
        }
    `;

    // =================================================================
    // HTML TEMPLATE
    // =================================================================
    const HTML = `
        <div class="qr-scope">
            <div class="wrap">
                <div class="card">
                    <h1>
                        ${T.title}
                        <span class="branch-badge" id="qrw-branchBadge">${T.loading}</span>
                    </h1>
                    <p class="desc"></p>

                    <form id="qrw-genForm">
                        <div class="grid">
                            <div>
                                <label for="qrw-generated_by">👤 ${T.staff} *</label>
                                <input id="qrw-generated_by" name="generated_by" placeholder="${T.staff}" required />
                            </div>
                            <div class="advanced-fields" id="qrw-validMinutesField">
                                <label for="qrw-valid_minutes">${T.validMinutes}</label>
                                <input id="qrw-valid_minutes" name="valid_minutes" type="number" min="1" step="1" value="5" />
                            </div>
                            <div class="advanced-fields" id="qrw-maxUsesField">
                                <label for="qrw-max_uses">${T.maxUses}</label>
                                <input id="qrw-max_uses" name="max_uses" type="number" min="1" step="1" value="1" />
                            </div>
                            <div>
                                <label for="qrw-points_override">🎯 ${T.points}</label>
                                <input id="qrw-points_override" name="points_override" type="number" step="1" placeholder="1" />
                            </div>
                            <div>
                                <label for="qrw-note">📝 ${T.note}</label>
                                <textarea id="qrw-note" name="note" class="note-input" placeholder="${T.notePlaceholder}" rows="1"></textarea>
                            </div>
                        </div>
                        <div class="spacer"></div>
                        <div style="display: flex; align-items: center; justify-content: flex-end; margin-right: 8px;">
                            <span class="advanced-label">${T.advancedOptions}</span>
                            <button type="button" class="toggle-advanced" id="qrw-toggleBtn" title="${T.advancedOptions}">+</button>
                        </div>
                        <div style="height: 12px;"></div>
                        <div class="row">
                            <button type="submit">${T.generate}</button>
                            <button class="secondary" type="button" id="qrw-resetBtn">${T.reset}</button>
                            <div class="right muted" id="qrw-statusText"></div>
                        </div>
                        <div class="version-card">v1.5-widget</div>
                    </form>
                </div>
                <div class="spacer"></div>
                <div class="result">
                    <div class="panel">
                        <h2 style="margin:0 0 10px;font-size:16px;">
                            <span id="qrw-pointsDisplay" style="display: none;"></span>
                            <span class="countdown-time" id="qrw-countdownTime" style="display: none;"></span>
                        </h2>
                        <div class="qr" id="qrw-qrContainer">
                            <img id="qrw-qr_img" src="" alt="" style="display: none;" />
                            <div id="qrw-qr_placeholder" style="color: var(--muted); font-size: 13px;">${T.qrPlaceholder}</div>
                        </div>
                        <div class="hint" id="qrw-qrHint" style="margin-top:10px;">${T.qrHint}</div>
                    </div>
                    <div class="panel info-panel hidden" id="qrw-customerInfoPanel">
                        <h2 style="margin:0 0 10px;font-size:16px;">${T.customerInfo}</h2>
                        <div class="bonus-banner hidden" id="qrw-bonusBanner"></div>
                        <div class="kv">
                            <div class="label">${T.name}</div>
                            <div class="value" id="qrw-customerName">—</div>
                            <div class="label">${T.phone}</div>
                            <div class="value" id="qrw-customerPhone">—</div>
                            <div class="label">${T.currentPoints}</div>
                            <div class="value" id="qrw-customerPoints">—</div>
                            <div class="label">${T.visits}</div>
                            <div class="value" id="qrw-customerVisits">—</div>
                            <div class="label">${T.lastVisit}</div>
                            <div class="value" id="qrw-lastVisitSummary">—</div>
                            <div class="label" style="grid-column: 1 / -1; margin-top: 5px;">${T.recentVisits}</div>
                            <div class="value" style="grid-column: 1 / -1;">
                                <ul class="visit-history" id="qrw-visitHistoryList">
                                    <li class="muted">${T.noData}</li>
                                </ul>
                                <button type="button" class="load-more hidden" id="qrw-loadMoreVisitsBtn">${T.loadMore}</button>
                            </div>
                        </div>
                        <div class="hint" id="qrw-customerInfoHint">${T.customerInfoHint}</div>
                    </div>
                </div>
                <div class="info-box">
                    <div class="icon">ℹ️</div>
                    <div class="text">${T.optOutInfo}</div>
                </div>
            </div>
        </div>
    `;

    // =================================================================
    // INITIALISIERUNG
    // =================================================================
    function init() {
        // Container finden
        const container = document.getElementById(CONTAINER_ID);
        if (!container) {
            console.error(`[QR-Widget] Container #${CONTAINER_ID} nicht gefunden`);
            return;
        }

        // CSS injizieren (nur einmal)
        if (!document.getElementById('qr-widget-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'qr-widget-styles';
            styleEl.textContent = CSS;
            document.head.appendChild(styleEl);
        }

        // HTML einfügen
        container.innerHTML = HTML;

        // Externe Scripts laden
        loadExternalScripts().then(() => {
            initWidget();
        });
    }

    function loadExternalScripts() {
        return new Promise((resolve) => {
            // Confetti laden
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
        // Audio-Elemente erstellen
        const celebrationAudio = new Audio('https://raw.githubusercontent.com/t2thak/bilderspeicher/main/short-crowd-cheer-6713.mp3');
        const customerInfoAudio = new Audio('https://raw.githubusercontent.com/t2thak/bilderspeicher/main/new-notification-028-383966.mp3');
        celebrationAudio.crossOrigin = 'anonymous';
        customerInfoAudio.crossOrigin = 'anonymous';

        // DOM-Elemente
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
        const noteInput = document.getElementById('qrw-note');

        let loyaltyThreshold = 10;
        let advancedVisible = false;
        let countdownInterval = null;
        let expiryTime = null;
        let statusPollTimeout = null;
        let statusPollPayload = null;
        let lastCelebratedCodeId = null;
        let cleanupTimeout = null;

        const CURRENT_BRANCH = {
            id: BRANCH_ID,
            code: "",
            name: ""
        };

        // Branch-Info laden
        loadBranchInfo();

        async function loadBranchInfo() {
            try {
                const res = await fetch(BRANCHES_ENDPOINT, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (!res.ok) throw new Error(`Failed: ${res.status}`);
                const json = await res.json();
                
                let branches = [];
                if (Array.isArray(json) && json.length > 0) {
                    if (json[0].list_active_branches?.branches) {
                        branches = json[0].list_active_branches.branches;
                    } else if (json[0].branches) {
                        branches = json[0].branches;
                    }
                } else if (json.list_active_branches?.branches) {
                    branches = json.list_active_branches.branches;
                } else if (json.branches) {
                    branches = json.branches;
                }

                const branch = branches.find(b => b.id === CURRENT_BRANCH.id);
                if (branch) {
                    CURRENT_BRANCH.code = branch.branch_code || "";
                    CURRENT_BRANCH.name = branch.branch_name || "";
                    branchBadge.textContent = `${CURRENT_BRANCH.code} - ${CURRENT_BRANCH.name}`;
                } else {
                    branchBadge.textContent = T.branchNotFound;
                }
            } catch (err) {
                console.error("Error loading branch info:", err);
                branchBadge.textContent = T.loadError;
            }
        }

        // Toggle Advanced
        toggleBtn.addEventListener('click', function() {
            advancedVisible = !advancedVisible;
            advancedFields.forEach(f => f.classList.toggle('show', advancedVisible));
            toggleBtn.textContent = advancedVisible ? '−' : '+';
            toggleBtn.classList.toggle('active', advancedVisible);
        });

        // Status Helper
        function setStatus(msg, ok = true) {
            statusText.textContent = msg || "";
            statusText.style.color = ok ? "var(--ok)" : "var(--err)";
        }

        function showError(msg) { setStatus(msg, false); }

        // Mask Phone
        function maskPhone(phone = "") {
            const sanitized = String(phone).replace(/[^\d+]/g, "");
            const tail = sanitized.slice(-4);
            return tail ? `***${tail}` : "***";
        }

        // Customer Info
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
            visitHistoryList.innerHTML = `<li class="muted">${T.noData}</li>`;
        }

        function showCustomerInfo(customer = {}, totalPoints = null, codeId = null, bonusInfo = null, recentVisits = []) {
            const name = (customer?.name || "Customer").trim();
            const visits = Number.isFinite(customer?.total_visits) ? customer.total_visits : 0;
            const points = Number.isFinite(totalPoints) ? totalPoints : 
                          Number.isFinite(customer?.total_points) ? customer.total_points : null;

            customerNameEl.textContent = name;
            customerPhoneEl.textContent = maskPhone(customer?.phone_number);
            customerPointsEl.textContent = points !== null ? points : "—";
            customerVisitsEl.textContent = visits;
            customerInfoPanel.classList.remove("hidden");

            if (bonusInfo?.triggered) {
                bonusBanner.textContent = T.bonusReached.replace('{threshold}', loyaltyThreshold);
                bonusBanner.classList.remove("hidden");
                customerInfoPanel.classList.add("has-bonus");
                triggerConfettiBurst();
                playCelebrationSound();
            } else {
                bonusBanner.classList.add("hidden");
                customerInfoPanel.classList.remove("has-bonus");
            }

            renderVisitHistory(recentVisits);
            resetFormFields();
            playCustomerInfoSound();
            hideQrSection();
        }

        function renderVisitHistory(visits = [], showAll = false) {
            if (!Array.isArray(visits) || visits.length === 0) {
                visitHistoryList.innerHTML = `<li class="muted">${T.noData}</li>`;
                lastVisitSummaryEl.textContent = "—";
                return;
            }

            const parsed = visits.map(entry => {
                const dateValue = entry?.date || entry?.validated_at || entry?.created_at || entry;
                const note = entry?.note;
                const staff = entry?.staff || entry?.generated_by;
                const dateObj = dateValue ? new Date(dateValue) : null;
                if (!dateObj || Number.isNaN(dateObj.getTime())) return null;
                return { date: dateObj, note, staff };
            }).filter(Boolean).sort((a, b) => b.date.getTime() - a.date.getTime());

            if (!parsed.length) {
                visitHistoryList.innerHTML = `<li class="muted">${T.noData}</li>`;
                return;
            }

            const history = showAll ? parsed : parsed.slice(0, 5);
            const formatter = new Intl.DateTimeFormat(LANGUAGE === 'vi' ? 'vi-VN' : LANGUAGE, { day: "2-digit", month: "2-digit", year: "numeric" });

            visitHistoryList.innerHTML = history.map(item => {
                const dateStr = formatter.format(item.date);
                const noteStr = item.note ? `<span class="note">${item.note}</span>` : "";
                const staffStr = item.staff ? `<span class="note">${T.staffLabel}: ${item.staff}</span>` : "";
                const details = [staffStr, noteStr].filter(Boolean).join("") || `<span class="note muted">—</span>`;
                return `<li><span class="visit-date">${dateStr}</span><span class="visit-details">${details}</span></li>`;
            }).join("");

            const referenceDate = history[0]?.date;
            if (referenceDate) {
                const diffDays = Math.max(0, Math.floor((Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)));
                lastVisitSummaryEl.textContent = diffDays === 0 ? T.today : T.daysAgo.replace('{days}', diffDays);
            }
        }

        // Countdown
        function startCountdown(validMinutes) {
            if (countdownInterval) clearInterval(countdownInterval);
            expiryTime = Date.now() + (validMinutes * 60 * 1000);
            countdownTime.style.display = "inline";
            countdownTime.classList.remove("expired");
            qrContainer.classList.remove("expired");
            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
        }

        function updateCountdown() {
            if (!expiryTime) return;
            const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
            if (remaining === 0) {
                countdownTime.textContent = "00:00";
                countdownTime.classList.add("expired");
                qrContainer.classList.add("expired");
                clearInterval(countdownInterval);
                expireSession(true);
            } else {
                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                countdownTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
        }

        function stopCountdown() {
            if (countdownInterval) clearInterval(countdownInterval);
            countdownTime.style.display = "none";
            expiryTime = null;
        }

        // Polling
        function startPollingRedemption(codeId, codeValue) {
            if (!codeId && !codeValue) return;
            stopPollingRedemption();
            statusPollPayload = { code_id: codeId, code: codeValue };

            const poll = async () => {
                if (!statusPollPayload) return;
                try {
                    const res = await fetch(STATUS_ENDPOINT, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(statusPollPayload)
                    });
                    if (!res.ok) throw new Error(`Status ${res.status}`);
                    const data = await res.json();

                    if (data?.redeemed) {
                        if (Number.isFinite(data.loyalty_bonus_threshold)) loyaltyThreshold = data.loyalty_bonus_threshold;
                        const bonusInfo = { triggered: Boolean(data.bonus_triggered) };
                        showCustomerInfo(data.customer, data.points_after, data.code_id, bonusInfo, data.recent_visits || []);
                        setStatus(bonusInfo.triggered ? T.bonusReached.replace('{threshold}', loyaltyThreshold) : T.pointsUpdated, true);
                        stopCountdown();
                        stopPollingRedemption();
                        return;
                    }
                } catch (err) {
                    console.warn("Status polling failed:", err);
                }
                statusPollTimeout = setTimeout(poll, 4000);
            };
            poll();
        }

        function stopPollingRedemption() {
            if (statusPollTimeout) clearTimeout(statusPollTimeout);
            statusPollPayload = null;
        }

        // QR Generation
        async function generateCode(payload) {
            const res = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Server ${res.status}`);
            const json = await res.json();
            if (Array.isArray(json) && json[0]?.generate_staff_code) return json[0].generate_staff_code;
            if (json?.generate_staff_code) return json.generate_staff_code;
            return json;
        }

        function extractQrUrl(result) {
            if (result?.deep_link) {
                return QR_API + encodeURIComponent(result.deep_link);
            }
            return result?.qr_url || "";
        }

        // UI Helpers
        function resetFormFields() {
            document.getElementById('qrw-generated_by').value = "";
            document.getElementById('qrw-note').value = "";
            document.getElementById('qrw-points_override').value = "";
            document.getElementById('qrw-valid_minutes').value = "5";
            document.getElementById('qrw-max_uses').value = "1";
        }

        function hideQrSection() {
            qr_img.style.display = "none";
            qr_placeholder.style.display = "none";
            qrContainer.style.display = "none";
            qrHint.style.display = "none";
        }

        function showQrSection() {
            qrContainer.style.display = "block";
            qrHint.style.display = "block";
            if (!qr_img.src) {
                qr_placeholder.style.display = "block";
                qr_placeholder.textContent = T.qrPlaceholder;
            }
        }

        function expireSession(reload = false) {
            stopPollingRedemption();
            hideCustomerInfo();
            resetFormFields();
            pointsDisplay.style.display = "none";
            qr_img.src = "";
            qr_placeholder.textContent = T.qrExpired;
            qr_placeholder.style.color = "var(--err)";
            setStatus(T.sessionExpired, false);
            if (reload) window.location.reload();
            showQrSection();
        }

        function showPoints(points) {
            if (points !== null && points !== undefined) {
                pointsDisplay.textContent = `${T.pointsAwarded}: ${points}`;
                pointsDisplay.style.display = "inline";
            } else {
                pointsDisplay.style.display = "none";
            }
        }

        // Celebration
        function triggerConfettiBurst() {
            if (typeof confetti !== "function") return;
            confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 } });
        }

        async function playCelebrationSound() {
            try {
                celebrationAudio.currentTime = 0;
                await celebrationAudio.play();
            } catch (err) { console.warn("Audio failed:", err); }
        }

        async function playCustomerInfoSound() {
            try {
                customerInfoAudio.currentTime = 0;
                await customerInfoAudio.play();
            } catch (err) { console.warn("Audio failed:", err); }
        }

        // Form Submit
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            setStatus(T.generating, true);
            hideCustomerInfo();
            stopPollingRedemption();
            showQrSection();

            const generated_by = document.getElementById("qrw-generated_by").value || "staff:unknown";
            const valid_minutes = Number(document.getElementById("qrw-valid_minutes").value || 5);
            const max_uses = Number(document.getElementById("qrw-max_uses").value || 1);
            const points_override_raw = document.getElementById("qrw-points_override").value;
            const points_override = points_override_raw === "" ? null : Number(points_override_raw);
            const note = document.getElementById("qrw-note").value || null;

            const payload = {
                branch_id: CURRENT_BRANCH.id,
                generated_by,
                valid_minutes,
                max_uses,
                points_override,
                note,
            };

            try {
                const result = await generateCode(payload);
                const qrUrl = extractQrUrl(result);
                qr_img.src = qrUrl;

                const points = points_override !== null ? points_override : (result.points || 1);
                showPoints(points);

                if (qrUrl) {
                    qr_img.style.display = "block";
                    qr_placeholder.style.display = "none";
                    startCountdown(valid_minutes);
                }

                const codeId = result.code_id || result.validation_id || null;
                const codeValue = result.code || result.generated_code || null;

                if (codeId || codeValue) {
                    setStatus(T.waitingConfirm, true);
                    startPollingRedemption(codeId, codeValue);
                } else {
                    setStatus(T.complete, true);
                }
            } catch (err) {
                console.error(err);
                showError(err.message || T.failed);
                hideCustomerInfo();
                stopCountdown();
            }
        });

        // Reset Button
        resetBtn.addEventListener("click", () => {
            qr_img.src = "";
            qr_img.style.display = "none";
            qr_placeholder.style.display = "block";
            qr_placeholder.textContent = T.qrPlaceholder;
            qr_placeholder.style.color = "var(--muted)";
            setStatus("");
            stopCountdown();
            pointsDisplay.style.display = "none";
            hideCustomerInfo();
            resetFormFields();
            advancedVisible = false;
            advancedFields.forEach(f => f.classList.remove("show"));
            toggleBtn.textContent = "+";
        });

        // Initial State
        hideCustomerInfo();
    }

    // Starten, wenn DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
