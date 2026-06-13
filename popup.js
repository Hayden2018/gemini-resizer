const DEFAULT_WIDTH = 1080;
const BUBBLE_RATIO = 2 / 3;
const DEFAULT_ALIGN_INPUT = false;

const slider = document.getElementById('widthSlider');
const widthValue = document.getElementById('widthValue');
const bubbleValue = document.getElementById('bubbleValue');
const inputWidthValue = document.getElementById('inputWidthValue');
const alignInputToggle = document.getElementById('alignInputToggle');
const resetBtn = document.getElementById('resetBtn');

function updateBubbleDisplay(width) {
    bubbleValue.textContent = Math.round(width * BUBBLE_RATIO) + 'px';
}

function updateInputWidthDisplay(isAligned) {
    inputWidthValue.textContent = isAligned ? 'Aligned' : 'Default';
}

async function sendToTabs(width, alignInputWidth) {
    const tabs = await chrome.tabs.query({ url: 'https://gemini.google.com/*' });
    for (const tab of tabs) {
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { message: 'update-width', width, alignInputWidth });
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const cfg = await chrome.storage.local.get(['chatWidth', 'alignInputWidth']);
    const currentWidth = cfg.chatWidth ?? DEFAULT_WIDTH;
    const alignInputWidth = cfg.alignInputWidth ?? DEFAULT_ALIGN_INPUT;

    slider.value = currentWidth;
    widthValue.textContent = currentWidth;
    updateBubbleDisplay(currentWidth);
    alignInputToggle.checked = alignInputWidth;
    updateInputWidthDisplay(alignInputWidth);

    slider.addEventListener('input', async () => {
        const width = parseInt(slider.value, 10);
        widthValue.textContent = width;
        updateBubbleDisplay(width);
        await sendToTabs(width, alignInputToggle.checked);
    });

    slider.addEventListener('change', async () => {
        const width = parseInt(slider.value, 10);
        await chrome.storage.local.set({ chatWidth: width });
    });

    alignInputToggle.addEventListener('change', async () => {
        const isAligned = alignInputToggle.checked;
        updateInputWidthDisplay(isAligned);
        const width = parseInt(slider.value, 10);
        await chrome.storage.local.set({ alignInputWidth: isAligned });
        await sendToTabs(width, isAligned);
    });

    resetBtn.addEventListener('click', async () => {
        slider.value = DEFAULT_WIDTH;
        widthValue.textContent = DEFAULT_WIDTH;
        updateBubbleDisplay(DEFAULT_WIDTH);
        alignInputToggle.checked = DEFAULT_ALIGN_INPUT;
        updateInputWidthDisplay(DEFAULT_ALIGN_INPUT);
        await chrome.storage.local.set({
            chatWidth: DEFAULT_WIDTH,
            alignInputWidth: DEFAULT_ALIGN_INPUT
        });
        await sendToTabs(DEFAULT_WIDTH, DEFAULT_ALIGN_INPUT);
    });
});
