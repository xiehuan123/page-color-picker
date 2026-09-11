const PICKER_SCRIPT = '/picker.js' as const;

async function showActionError(message: string): Promise<void> {
  await browser.action.setBadgeBackgroundColor({ color: '#B42318' });
  await browser.action.setBadgeText({ text: '!' });
  await browser.action.setTitle({ title: `网页取色：${message}` });
}

async function clearActionError(): Promise<void> {
  await browser.action.setBadgeText({ text: '' });
  await browser.action.setTitle({ title: '进入网页取色' });
}

export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id == null || tab.windowId == null) {
      await showActionError('当前标签页不可用，请切换到普通网页后重试');
      return;
    }

    try {
      const screenshot = await browser.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: [PICKER_SCRIPT],
      });
      const response = (await browser.tabs.sendMessage(tab.id, {
        type: 'PAGE_COLOR_PICKER_START',
        screenshot,
      })) as { ok?: boolean; error?: string } | undefined;
      if (!response?.ok) throw new Error(response?.error || '取色界面未能启动');
      await clearActionError();
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      console.error('[page-color-picker] start failed', message);
      await showActionError('此页面暂不支持，请切换到普通网页后重试');
    }
  });
});
