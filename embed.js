/**
 * QR-App Embed – eine .js auf GitHub, in Softr nur Webhook + Branch setzen.
 *
 * SOFTR (jsDelivr – funktioniert auch ohne GitHub Pages):
 *   <script>window.QR_EMBED = { webhook: "justai", branch: "DEINE-BRANCH-ID" };</script>
 *   <script src="https://cdn.jsdelivr.net/gh/t2thak/bilderspeicher@main/embed.js"></script>
 *
 * Optionale Felder: appUrl (z.B. GitHub Pages der App), base (n8n Webhook-Basis)
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
    if (!appUrl && me.src && me.src.indexOf("github.io") !== -1) {
      try {
        appUrl = new URL(me.src).origin + new URL(me.src).pathname.replace(/embed\.js.*$/, "");
      } catch (e) {}
    }
  } else {
    webhook = cfg.webhook || "justai";
    branch = cfg.branch || "";
    appUrl = cfg.appUrl || "";
    base = cfg.base || "https://n8nv2.flowrk.io/webhook/";
  }

  appUrl = (appUrl || "https://t2thak.github.io/bilderspeicher/").replace(/\/?$/, "/");

  if (!branch) {
    var msg = document.createElement("p");
    msg.style.cssText = "padding:20px;color:#c00;font-family:sans-serif;";
    msg.textContent = "QR_EMBED: branch fehlt. Setze window.QR_EMBED = { webhook: 'justai', branch: 'DEINE-BRANCH-ID' };";
    document.body.appendChild(msg);
    return;
  }

  var url = appUrl +
    "?webhook=" + encodeURIComponent(webhook) +
    "&branch=" + encodeURIComponent(branch) +
    "&base=" + encodeURIComponent(base);

  var wrapper = document.createElement("div");
  wrapper.id = "qr-embed-wrapper";
  wrapper.style.cssText = "width:100%;min-height:400px;margin:0;padding:0;";

  var iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.cssText = "width:100%;height:900px;border:0;display:block;";
  iframe.title = "QR Code Generator";

  wrapper.appendChild(iframe);

  var appended = false;
  if (me && me.parentNode && me.parentNode.appendChild) {
    try {
      me.parentNode.appendChild(wrapper);
      appended = true;
    } catch (e) {}
  }
  if (!appended && document.body) {
    document.body.appendChild(wrapper);
  }
})();
