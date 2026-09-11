import { formatHex, formatHsl, formatRgb, type RgbaColor } from '../domain/color';
import { mapViewportPoint } from '../domain/pixel';
import { copyText } from '../adapters/clipboard';
import { parseCssColor } from '../adapters/css-color';
import { loadRecentColors, saveRecentColors } from '../adapters/recent-colors-storage';
import { addRecentColor, clearRecentColors, removeRecentColor } from '../domain/history';
import { PICKER_STYLES } from '../ui/picker-styles';
import { createResultPanel, type ColorFormat, type ResultPanelView } from '../ui/result-panel';

interface StartMessage {
  type: 'PAGE_COLOR_PICKER_START';
  screenshot: string;
}

interface PickerController {
  start(screenshot: string): Promise<void>;
  dismiss(): void;
}

declare global {
  // eslint-disable-next-line no-var
  var __PAGE_COLOR_PICKER_CONTROLLER__: PickerController | undefined;
}

declare const chrome: {
  runtime: {
    onMessage: {
      addListener(listener: (
        message: unknown,
        sender: unknown,
        sendResponse: (response: unknown) => void,
      ) => boolean): void;
    };
  };
};

function isStartMessage(value: unknown): value is StartMessage {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as Partial<StartMessage>;
  return message.type === 'PAGE_COLOR_PICKER_START'
    && typeof message.screenshot === 'string'
    && message.screenshot.startsWith('data:image/png;base64,');
}

function loadScreenshot(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error('页面快照无法读取')), { once: true });
    image.src = source;
  });
}

async function waitForCleanFrame(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function samplePixel(context: CanvasRenderingContext2D, screenshot: HTMLCanvasElement, clientX: number, clientY: number): { color: RgbaColor; bitmapX: number; bitmapY: number } {
  const mapped = mapViewportPoint(
    { x: clientX, y: clientY },
    { width: window.innerWidth, height: window.innerHeight },
    { width: screenshot.width, height: screenshot.height },
  );
  const bitmapX = mapped.x;
  const bitmapY = mapped.y;
  const pixel = context.getImageData(bitmapX, bitmapY, 1, 1).data;
  return {
    color: { r: pixel[0]!, g: pixel[1]!, b: pixel[2]!, a: pixel[3]! / 255 },
    bitmapX,
    bitmapY,
  };
}

function makeController(): PickerController {
  let cleanupActiveSession: (() => void) | undefined;

  return {
    dismiss(): void {
      cleanupActiveSession?.();
    },
    async start(screenshotSource: string): Promise<void> {
      cleanupActiveSession?.();
      const image = await loadScreenshot(screenshotSource);
      const screenshot = document.createElement('canvas');
      screenshot.width = image.naturalWidth;
      screenshot.height = image.naturalHeight;
      const context = screenshot.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('浏览器无法建立像素取样画布');
      context.drawImage(image, 0, 0);

      const host = document.createElement('div');
      host.dataset.pageColorPickerHost = 'true';
      host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
      const shadow = host.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = PICKER_STYLES;
      shadow.append(style);
      document.documentElement.append(host);

      const stage = document.createElement('div');
      stage.className = 'stage';
      stage.setAttribute('role', 'application');
      stage.setAttribute('aria-label', '网页取色中，移动鼠标预览，点击选色，按 Esc 取消');
      stage.innerHTML = '<div class="hint">移动鼠标预览 · 点击选色 · Esc 取消</div><div class="lens" role="status" aria-live="polite"><canvas width="116" height="84"></canvas><div class="lens-row"><span class="dot"></span><span class="hex">#000000</span></div></div>';
      shadow.append(stage);

      const lens = stage.querySelector<HTMLElement>('.lens');
      const lensCanvas = stage.querySelector<HTMLCanvasElement>('canvas');
      const hexNode = stage.querySelector<HTMLElement>('.hex');
      const dot = stage.querySelector<HTMLElement>('.dot');
      const lensContext = lensCanvas?.getContext('2d');
      if (!lens || !lensCanvas || !hexNode || !dot || !lensContext) {
        host.remove();
        throw new Error('取色界面初始化失败');
      }
      lensContext.imageSmoothingEnabled = false;
      let isPicking = true;

      const stopEvent = (event: Event): void => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      };

      const updatePreview = (clientX: number, clientY: number): RgbaColor => {
        const { color, bitmapX, bitmapY } = samplePixel(context, screenshot, clientX, clientY);
        const hex = formatHex(color);
        hexNode.textContent = hex;
        dot.style.setProperty('--picked', hex);
        lens.style.left = `${Math.max(8, Math.min(window.innerWidth - 140, clientX + 18))}px`;
        lens.style.top = `${Math.max(8, Math.min(window.innerHeight - 118, clientY + 18))}px`;
        const sourceWidth = Math.max(1, Math.round(13 * screenshot.width / window.innerWidth));
        const sourceHeight = Math.max(1, Math.round(9 * screenshot.height / window.innerHeight));
        lensContext.clearRect(0, 0, lensCanvas.width, lensCanvas.height);
        lensContext.drawImage(screenshot, Math.max(0, bitmapX - Math.floor(sourceWidth / 2)), Math.max(0, bitmapY - Math.floor(sourceHeight / 2)), sourceWidth, sourceHeight, 0, 0, lensCanvas.width, lensCanvas.height);
        lensContext.strokeStyle = '#FFFFFF';
        lensContext.lineWidth = 3;
        lensContext.strokeRect(52, 36, 12, 12);
        lensContext.strokeStyle = '#101828';
        lensContext.lineWidth = 1;
        lensContext.strokeRect(53.5, 37.5, 9, 9);
        return color;
      };

      const onMove = (event: PointerEvent): void => {
        updatePreview(event.clientX, event.clientY);
        stopEvent(event);
      };

      const removeCaptureListeners = (): void => {
        stage.removeEventListener('pointermove', onMove, true);
        stage.removeEventListener('click', onClick, true);
        stage.removeEventListener('pointerdown', stopEvent, true);
        stage.removeEventListener('pointerup', stopEvent, true);
        stage.removeEventListener('wheel', stopEvent, true);
      };

      const showResult = (color: RgbaColor): void => {
        stage.remove();
        let view: ResultPanelView;
        let history: RgbaColor[] = [];
        let historyLoaded = false;
        let historyQueue = Promise.resolve();
        const updateHistory = (transform: (current: RgbaColor[]) => RgbaColor[], message?: string): void => {
          historyQueue = historyQueue.then(async () => {
            if (!historyLoaded) {
              try {
                history = await loadRecentColors();
              } catch {
                history = [];
              }
              historyLoaded = true;
            }
            history = transform(history);
            view.renderHistory(history);
            try {
              await saveRecentColors(history);
              if (message) view.setStatus(message, 'success');
            } catch {
              view.setStatus('近期颜色暂时无法保存', 'error');
            }
          });
        };
        const remember = (nextColor: RgbaColor, message?: string): void => {
          updateHistory((current) => addRecentColor(current, nextColor), message);
        };
        const handleCopy = async (format: ColorFormat, text: string): Promise<void> => {
          try {
            const method = await copyText(text);
            view.element.dataset.lastClipboardMethod = method;
            view.setStatus(`已复制 ${format}`, 'success');
          } catch {
            view.element.dataset.lastClipboardMethod = 'failed';
            view.setStatus('复制失败，请重试', 'error');
          }
        };
        view = createResultPanel(color, {
          onClose: () => cleanupActiveSession?.(),
          onCopy: (format, text) => { void handleCopy(format, text); },
          onConvert: (input) => {
            const parsed = parseCssColor(input);
            if (!parsed) {
              view.setStatus('无法识别这个颜色，请检查输入', 'error');
              return;
            }
            view.updateColor(parsed);
            remember(parsed, '已转换并保存到近期颜色');
          },
          onHistorySelect: (selected) => {
            view.updateColor(selected);
            remember(selected, '已切换到近期颜色');
          },
          onHistoryDelete: (selected) => updateHistory((current) => removeRecentColor(current, selected), '已删除近期颜色'),
          onHistoryClear: () => updateHistory(() => clearRecentColors(), '已清空近期颜色'),
        });
        shadow.append(view.element);
        view.element.querySelector<HTMLButtonElement>('[data-copy="HEX"]')?.focus();
        remember(color);
      };

      const onClick = (event: MouseEvent): void => {
        const color = updatePreview(event.clientX, event.clientY);
        stopEvent(event);
        isPicking = false;
        removeCaptureListeners();
        screenshot.width = 1;
        screenshot.height = 1;
        image.src = '';
        showResult(color);
      };

      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
          stopEvent(event);
          cleanupActiveSession?.();
          return;
        }
        if (isPicking && [' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
          stopEvent(event);
        }
      };

      cleanupActiveSession = () => {
        removeCaptureListeners();
        window.removeEventListener('keydown', onKeyDown, true);
        host.remove();
        cleanupActiveSession = undefined;
      };

      stage.addEventListener('pointermove', onMove, true);
      stage.addEventListener('click', onClick, true);
      stage.addEventListener('pointerdown', stopEvent, true);
      stage.addEventListener('pointerup', stopEvent, true);
      stage.addEventListener('wheel', stopEvent, { capture: true, passive: false });
      window.addEventListener('keydown', onKeyDown, true);
      updatePreview(Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2));
    },
  };
}

export default defineUnlistedScript(() => {
  if (!globalThis.__PAGE_COLOR_PICKER_CONTROLLER__) {
    globalThis.__PAGE_COLOR_PICKER_CONTROLLER__ = makeController();
    chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
      if (typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'PAGE_COLOR_PICKER_PREPARE_CAPTURE') {
        globalThis.__PAGE_COLOR_PICKER_CONTROLLER__?.dismiss();
        (async () => {
          await waitForCleanFrame();
          sendResponse({ ok: true });
        })();
        return true;
      }
      if (!isStartMessage(message)) return false;
      (async () => {
        try {
          await globalThis.__PAGE_COLOR_PICKER_CONTROLLER__?.start(message.screenshot);
          sendResponse({ ok: true });
        } catch (error) {
          sendResponse({ ok: false, error: error instanceof Error ? error.message : '未知错误' });
        }
      })();
      return true;
    });
  }
});
