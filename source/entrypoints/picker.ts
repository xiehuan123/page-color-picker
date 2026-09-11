import { formatHex, formatHsl, formatRgb, type RgbaColor } from '../domain/color';
import { mapViewportPoint } from '../domain/pixel';
import { PICKER_STYLES } from '../ui/picker-styles';

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
        const hex = formatHex(color);
        stage.remove();
        const panel = document.createElement('section');
        panel.className = 'panel';
        panel.setAttribute('aria-label', `已选颜色 ${hex}`);
        panel.innerHTML = `<div class="panel-head"><div class="swatch"></div><div><h2>已取得网页颜色</h2><p class="sub">来自当前可见网页的真实像素</p></div></div><div class="values"><div class="value"><span class="label">HEX</span><code>${hex}</code></div><div class="value"><span class="label">RGB</span><code>${formatRgb(color)}</code></div><div class="value"><span class="label">HSL</span><code>${formatHsl(color)}</code></div></div><div class="actions"><button type="button">关闭</button></div>`;
        panel.querySelector<HTMLElement>('.swatch')?.style.setProperty('--picked', hex);
        panel.querySelector('button')?.addEventListener('click', () => cleanupActiveSession?.());
        shadow.append(panel);
        panel.querySelector('button')?.focus();
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
