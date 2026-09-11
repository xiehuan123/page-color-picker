import { formatHex, formatHsl, formatRgb, type RgbaColor } from '../domain/color';

export type ColorFormat = 'HEX' | 'RGB' | 'HSL';
export type StatusTone = 'neutral' | 'success' | 'error';

export interface ResultPanelHandlers {
  onClose(): void;
  onCopy(format: ColorFormat, text: string): void;
  onConvert(input: string): void;
}

export interface ResultPanelView {
  element: HTMLElement;
  updateColor(color: RgbaColor): void;
  setStatus(message: string, tone?: StatusTone): void;
}

function valuesFor(color: RgbaColor): Record<ColorFormat, string> {
  return { HEX: formatHex(color), RGB: formatRgb(color), HSL: formatHsl(color) };
}

export function createResultPanel(initialColor: RgbaColor, handlers: ResultPanelHandlers): ResultPanelView {
  let currentColor = initialColor;
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = `
    <div class="panel-head">
      <div class="swatch"></div>
      <div class="panel-title"><h2>网页颜色</h2><p class="sub">点击任一格式即可复制</p></div>
      <button class="icon-button close-button" type="button" aria-label="关闭取色面板">×</button>
    </div>
    <div class="values" aria-label="颜色格式">
      ${(['HEX', 'RGB', 'HSL'] as ColorFormat[]).map((format) => `<button class="value-button" type="button" data-copy="${format}"><span class="label">${format}</span><code data-value="${format}"></code><span class="copy-label">复制</span></button>`).join('')}
    </div>
    <form class="convert-form">
      <label for="page-color-picker-input">转换已有颜色</label>
      <div class="input-row"><input id="page-color-picker-input" name="color" autocomplete="off" spellcheck="false" placeholder="#0EA5E9、rgb(...)、hsl(...) 或颜色名"><button class="convert-button" type="submit">转换</button></div>
    </form>
    <p class="status" role="status" aria-live="polite"></p>
  `;

  const swatch = panel.querySelector<HTMLElement>('.swatch');
  const status = panel.querySelector<HTMLElement>('.status');
  const input = panel.querySelector<HTMLInputElement>('input[name="color"]');
  const closeButton = panel.querySelector<HTMLButtonElement>('.close-button');
  if (!swatch || !status || !input || !closeButton) throw new Error('结果面板初始化失败');

  const view: ResultPanelView = {
    element: panel,
    updateColor(color: RgbaColor): void {
      currentColor = color;
      const values = valuesFor(color);
      const hex = values.HEX;
      panel.setAttribute('aria-label', `当前颜色 ${hex}`);
      swatch.style.setProperty('--picked', hex);
      for (const format of ['HEX', 'RGB', 'HSL'] as ColorFormat[]) {
        const valueNode = panel.querySelector<HTMLElement>(`[data-value="${format}"]`);
        const button = panel.querySelector<HTMLButtonElement>(`[data-copy="${format}"]`);
        if (valueNode) valueNode.textContent = values[format];
        button?.setAttribute('aria-label', `复制 ${format} ${values[format]}`);
      }
    },
    setStatus(message: string, tone: StatusTone = 'neutral'): void {
      status.textContent = message;
      status.dataset.tone = tone;
    },
  };

  for (const button of panel.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    button.addEventListener('click', () => {
      const format = button.dataset.copy as ColorFormat;
      handlers.onCopy(format, valuesFor(currentColor)[format]);
    });
  }
  panel.querySelector('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    handlers.onConvert(input.value);
  });
  closeButton.addEventListener('click', handlers.onClose);
  view.updateColor(initialColor);
  return view;
}
