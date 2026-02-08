/**
 * QR-App Embed – eine .js auf GitHub, in Softr nur Webhook + Branch setzen.
 *
 * SOFTR – Variante 1 (Konfig oben):
 *   <script>window.QR_EMBED = { webhook: "justai", branch: "DEINE-BRANCH-ID" };</script>
 *   <script src="https://t2thak.github.io/bilderspeicher/embed.js"></script>
 *
 * SOFTR – Variante 2 (alles in einer Zeile):
 *   <script src="https://t2thak.github.io/bilderspeicher/embed.js" data-webhook="justai" data-branch="DEINE-BRANCH-ID"></script>
 *
 * Optionale Felder: appUrl (App-URL), base (n8n Webhook-Basis)
 */
(function() {
  var webhook, branch, appUrl, base;
  var cfg = window.QR_EMBED || {};

  var scripts = document.getElementsByTagName("script");
  var me = null;
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf("embed.js") !== -1) {
      me = scripts[i];
      break;
    }
  }

  if (me) {
    var getAttr = function(name, fallback) {
      var v = me.getAttribute("data-" + name);
      return (v && v.trim()) ? v.trim() : (fallback || "");
    };
    webhook = cfg.webhook || getAttr("webhook", "justai");
    branch = cfg.branch || getAttr("branch", "");
    appUrl = cfg.appUrl || getAttr("src", "");
    base = cfg.base || getAttr("base", "https://n8nv2.flowrk.io/webhook/");
    if (!appUrl && me.src) {
      try {
        appUrl = new URL(me.src).origin + new URL(me.src).pathname.replace(/embed\.js.*$/, "");
      } catch (e) {}
    }
  } else {
    webhook = cfg.webhook || "justai";
    branch = cfg.branch || "";
    appUrl = cfg.appUrl || "https://t2thak.github.io/bilderspeicher/";
    base = cfg.base || "https://n8nv2.flowrk.io/webhook/";
  }

  appUrl = (appUrl || "https://t2thak.github.io/bilderspeicher/").replace(/\/?$/, "/");

  if (!branch) {
    document.write('<p style="padding:20px;color:#999;">Webhook/Branch fehlt. In Softr setzen: window.QR_EMBED = { webhook: "justai", branch: "DEINE-BRANCH-ID" }; oder data-webhook / data-branch am Script-Tag.</p>');
    return;
  }

  var url = appUrl +
    "?webhook=" + encodeURIComponent(webhook) +
    "&branch=" + encodeURIComponent(branch) +
    "&base=" + encodeURIComponent(base);

  var iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.cssText = "width:100%;height:900px;border:0;display:block;";
  iframe.title = "QR Code Generator";
  (me && me.parentNode ? me.parentNode : document.body).appendChild(iframe);
})();
