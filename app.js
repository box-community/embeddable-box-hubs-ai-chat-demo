// SETUP:
// Copy the embed code from the Box Hub page (Embed → Hub AI Chat).
// - For the widget iframe, copy values from the iframe src (hubId, sharedLink, domain).
// - For the chat button, copy the script src and the data-* attributes.
// Then paste the values into the constants below:
const HUB_ID = "<YOUR_HUB_ID>"; // e.g. "123456789"
const SHARED_LINK = "<YOUR_SHARED_LINK>"; // e.g. "a7f2k9x3q0m5c1w8e6r4dphjbtsvzu"
const BASE_URL = "https://<YOUR_DOMAIN>.box.com/ai-chat"; // e.g. "https://acme.box.com/ai-chat"

// NOTE:
// This demo includes a sample script URL (below) for convenience.
// In the real world, always copy the <script src="..."> value
// from the Box UI (Embed → Hub AI Chat → Chat button), since
// the versioned URL may change over time.
const CHAT_BUTTON_SCRIPT =
    "https://cdn01.boxcdn.net/embeddable-ai-chat-script/2.8.0/box_integrations_ai_chat_button.js";

// Example iframe src (copied from Box UI):
// https://example.box.com/ai-chat?hubId=123456789&showCloseButton=false&sharedLink=a7f2k9x3q0m5c1w8e6r4dphjbtsvzu

const els = {
    mode: document.getElementById("mode"),
    w: document.getElementById("w"),
    h: document.getElementById("h"),
    wVal: document.getElementById("wVal"),
    hVal: document.getElementById("hVal"),
    closeBtn: document.getElementById("closeBtn"),
    includeSharedLink: document.getElementById("includeSharedLink"),
    buttonText: document.getElementById("buttonText"),
    widgetControls: document.getElementById("widgetControls"),
    buttonControls: document.getElementById("buttonControls"),
    frame: document.getElementById("chatFrame"),
    previewPanel: document.getElementById("previewPanel"),
    log: document.getElementById("log"),
    clearLog: document.getElementById("clearLog"),
    buttonMount: document.getElementById("buttonMount"),
};

function appendLog(msg, obj) {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    els.log.textContent += line + (obj ? `\n${JSON.stringify(obj, null, 2)}\n` : "\n");
    els.log.scrollTop = els.log.scrollHeight;
}

function buildWidgetSrc() {
    const showCloseButton = els.closeBtn.value;
    const includeSharedLink = els.includeSharedLink.value === "true";

    const url = new URL(BASE_URL);
    url.searchParams.set("hubId", HUB_ID);
    url.searchParams.set("showCloseButton", showCloseButton);

    if (includeSharedLink) url.searchParams.set("sharedLink", SHARED_LINK);

    return url.toString();
}

function renderWidget() {
    els.buttonMount.innerHTML = "";
    els.frame.classList.remove("hidden");

    const w = Number(els.w.value);
    const h = Number(els.h.value);

    els.frame.width = String(w);
    els.frame.height = String(h);
    els.wVal.textContent = String(w);
    els.hVal.textContent = String(h);

    els.frame.src = buildWidgetSrc();
    appendLog("Rendered chat widget", { src: els.frame.src, width: w, height: h });
}

function renderButton() {
    els.frame.classList.add("hidden");
    els.frame.src = "about:blank";
    els.buttonMount.innerHTML = "";

    const script = document.createElement("script");
    script.src = CHAT_BUTTON_SCRIPT;
    script.setAttribute("data-hub-id", HUB_ID);
    script.setAttribute("data-shared-link", SHARED_LINK);
    script.setAttribute("data-button-text", els.buttonText.value);

    els.buttonMount.appendChild(script);

    appendLog("Rendered chat button", {
        hubId: HUB_ID,
        sharedLink: SHARED_LINK,
        buttonText: els.buttonText.value,
    });
}

function syncMode() {
    const isWidget = els.mode.value === "widget";

    els.widgetControls.classList.toggle("hidden", !isWidget);
    els.buttonControls.classList.toggle("hidden", isWidget);

    els.previewPanel.classList.toggle("hidden", !isWidget);

    if (isWidget) renderWidget();
    else renderButton();
}

window.addEventListener("message", (event) => {
    const data = event?.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "BOX_AI_CHAT_CLOSE") {
        appendLog("Received BOX_AI_CHAT_CLOSE");
        els.frame.classList.add("hidden");
    }
});

els.mode.addEventListener("change", syncMode);
els.w.addEventListener("input", renderWidget);
els.h.addEventListener("input", renderWidget);
els.closeBtn.addEventListener("change", renderWidget);
els.includeSharedLink.addEventListener("change", renderWidget);
els.buttonText.addEventListener("change", () => els.mode.value === "button" && renderButton());
els.clearLog.addEventListener("click", () => (els.log.textContent = ""));

syncMode();
