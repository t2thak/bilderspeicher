/**
 * QR-App Embed – auf GitHub hosten (z.B. bilderspeicher/embed.js)
 * In Softr: <script src="https://t2thak.github.io/bilderspeicher/embed.js" data-webhook="justai" data-branch="DEINE-BRANCH-ID"></script>
 * Optionale Attribute: data-src (App-URL), data-base (n8n Webhook-Basis)
 */
(function() {
  var scripts = document.getElementsByTagName("script");
  var me = null;
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf("embed.js") !== -1) {
      me = scripts[i];
      break;
    }
  }
  if (!me) return;

  var getAttr = function(name, fallback) {
    var v = me.getAttribute("data-" + name);
    return (v && v.trim()) ? v.trim() : (fallback || "");
  };

  var baseUrl = getAttr("src");
  if (!baseUrl) {
    try {
      baseUrl = new URL(me.src).origin + new URL(me.src).pathname.replace(/embed\.js.*$/, "");
    } catch (e) {
      baseUrl = "https://t2thak.github.io/bilderspeicher/";
    }
  }

  var webhook = getAttr("webhook", "justai");
  var branch = getAttr("branch", "");
  var base = getAttr("base", "https://n8nv2.flowrk.io/webhook/");

  if (!branch) {
    document.write('<p style="padding:20px;color:#999;">data-branch fehlt. Beispiel: data-branch="5b37520c-bdec-44f9-89c9-360abe006637"</p>');
    return;
  }

  baseUrl = baseUrl.replace(/\/?$/, "/");
  var url = baseUrl +
    "?webhook=" + encodeURIComponent(webhook) +
    "&branch=" + encodeURIComponent(branch) +
    "&base=" + encodeURIComponent(base);

  var iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.cssText = "width:100%;height:900px;border:0;display:block;";
  iframe.title = "QR Code Generator";
  document.currentScript.parentNode.appendChild(iframe);
})();
