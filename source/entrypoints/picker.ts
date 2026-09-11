import { formatHex, formatHsl, formatRgb, type RgbaColor } from '../domain/color';

interface StartMessage {
  type: 'PAGE_COLOR_PICKER_START';
  screenshot: string;
}

interface PickerController {
  start(screenshot: string): Promise<void>;
}

declare global {
  // eslint-disable-next-line no-var
  var __PAGE_COLOR_PICKER_CONTROLLER__: PickerController | undefined;
}

const HOST_ID = 'page-color-picker-host';

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

function createStyles(): string {
  return `
    :host { all: initial; color-scheme: light; }
    * { box-sizing: border-box; }
    .stage { position: fixed; inset: 0; z-index: 2147483647; cursor: crosshair; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; pointer-events: auto; }
    .hint { position: fixed; top: 18px; left: 50%; transform: translateX(-50%); padding: 10px 14px; border: 1px solid rgba(255,255,255,.28); border-radius: 999px; background: rgba(17,24,39,.92); color: #fff; box-shadow: 0 10px 28px rgba(0,0,0,.24); font-size: 13px; font-weight: 650; pointer-events: none; }
    .lens { position: fixed; width: 132px; padding: 8px; border: 1px solid #D0D5DD; border-radius: 14px; background: #fff; box-shadow: 0 14px 32px rgba(16,24,40,.22); pointer-events: none; }
    .lens canvas { display: block; width: 116px; height: 84px; border-radius: 8px; border: 1px solid #EAECF0; image-rendering: pixelated; }
    .lens-row { display: flex; align-items: center; gap: 7px; margin-top: 7px; color: #101828; font: 700 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; }
    .dot { width: 14px; height: 14px; border: 1px solid rgba(16,24,40,.18); border-radius: 50%; background: var(--picked); }
    .panel { position: fixed; z-index: 2147483647; top: 18px; right: 18px; width: min(336px, calc(100vw - 36px)); padding: 16px; border: 1px solid #D0D5DD; border-radius: 18px; background: #fff; color: #101828; box-shadow: 0 18px 44px rgba(16,24,40,.24); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; pointer-events: auto; }
    .panel-head { display: flex; align-items: center; gap: 12px; }
    .swatch { width: 52px; height: 52px; flex: 0 0 auto; border: 1px solid rgba(16,24,40,.15); border-radius: 14px; background: var(--picked); }
    h2 { margin: 0; color: #101828; font-size: 16px; line-height: 1.35; }
    .sub { margin: 4px 0 0; color: #667085; font-size: 12px; }
    .values { display: grid; gap: 8px; margin: 14px 0; }
    .value { display: grid; grid-template-columns: 44px 1fr; gap: 8px; align-items: center; min-height: 36px; padding: 8px 10px; border-radius: 10px; background: #F2F4F7; }
    .label { color: #667085; font-size: 11px; font-weight: 750; letter-spacing: .04em; }
    code { overflow: hidden; color: #101828; font: 650 12px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace; text-overflow: ellipsis; white-space: nowrap; }
    .actions { display: flex; justify-content: flex-end; }
    button { min-height: 36px; padding: 0 14px; border: 1px solid #D0D5DD; border-radius: 10px; background: #fff; color: #344054; font: 650 13px/1 sans-serif; cursor: pointer; }
    button:hover { background: #F9FAFB; }
    button:focus-visible { outline: 3px solid rgba(37,99,235,.28); outline-offset: 2px; }
  `;
}

function samplePixel(context: CanvasRenderingContext2D, screenshot: HTMLCanvasElement, clientX: number, clientY: number): { color: RgbaColor; bitmapX: number; bitmapY: number } {
  const scaleX = screenshot.width / window.innerWidth;
  const scaleY = screenshot.height / window.innerHeight;
  const bitmapX = Math.max(0, Math.min(screenshot.width - 1, Math.floor(clientX * scaleX)));
  const bitmapY = Math.max(0, Math.min(screenshot.height - 1, Math.floor(clientY * scaleY)));
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
    async start(screenshotSource: string): Promise<void> {
      cleanupActiveSession?.();
      document.getElementById(HOST_ID)?.remove();
      const image = await loadScreenshot(screenshotSource);
      const screenshot = document.createElement('canvas');
      screenshot.width = image.naturalWidth;
      screenshot.height = image.naturalHeight;
      const context = screenshot.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('浏览器无法建立像素取样画布');
      context.drawImage(image, 0, 0);

      const host = document.createElement('div');
      host.id = HOST_ID;
      host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
      const shadow = host.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = createStyles();
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
        removeCaptureListeners();
        showResult(color);
      };

      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== 'Escape') return;
        stopEvent(event);
        cleanupActiveSession?.();
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
    browser.runtime.onMessage.addListener(async (message: unknown) => {
      if (!isStartMessage(message)) return undefined;
      try {
        await globalThis.__PAGE_COLOR_PICKER_CONTROLLER__?.start(message.screenshot);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : '未知错误' };
      }
    });
  }
});
