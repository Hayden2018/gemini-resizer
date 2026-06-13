const DEFAULT_WIDTH = 1080;
const BUBBLE_RATIO = 2 / 3;
const DEFAULT_ALIGN_INPUT = false;

const chatStyle = document.createElement('style');
chatStyle.id = 'gemini-resizer-style';
document.body.appendChild(chatStyle);

function computeBubbleWidth(containerWidth) {
    return Math.round(containerWidth * BUBBLE_RATIO);
}

function applyWidth(width, alignInputWidth) {
    const bubbleWidth = computeBubbleWidth(width);
    let css = `
        .conversation-container {
            max-width: ${width}px !important;
        }
        user-query {
            max-width: ${width}px !important;
        }
        .user-query-bubble-with-background {
            max-width: ${bubbleWidth}px !important;
        }
        .table-block {
            max-width: none !important;
        }
    `;

    if (alignInputWidth) {
        css += `
        input-area-v2 {
            max-width: none !important;
            width: 100% !important;
        }
        fieldset {
            max-width: ${width}px !important;
        }
        `;
    }

    chatStyle.textContent = css;
}

async function initialize() {
    const cfg = await chrome.storage.local.get(['chatWidth', 'alignInputWidth']);
    const width = cfg.chatWidth ?? DEFAULT_WIDTH;
    const alignInputWidth = cfg.alignInputWidth ?? DEFAULT_ALIGN_INPUT;
    applyWidth(width, alignInputWidth);
    if (cfg.chatWidth === undefined || cfg.alignInputWidth === undefined) {
        await chrome.storage.local.set({
            chatWidth: width,
            alignInputWidth
        });
    }
}

initialize();

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.message === 'update-width') {
        const width = request.width ?? DEFAULT_WIDTH;
        const alignInputWidth = request.alignInputWidth ?? DEFAULT_ALIGN_INPUT;
        applyWidth(width, alignInputWidth);
        sendResponse({ response: 'ok' });
    }
});
