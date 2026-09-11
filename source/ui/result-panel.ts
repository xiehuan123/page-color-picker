import { formatHex, formatHsl, formatRgb, type RgbaColor } from '../domain/color';
import { recentColorKey } from '../domain/history';

export type ColorFormat = 'HEX' | 'RGB' | 'HSL';
export type StatusTone = 'neutral' | 'success' | 'error';
export const COLOR_FORMATS: readonly ColorFormat[] = ['HEX', 'RGB', 'HSL'];

export interface ResultPanelHandlers {
  onClose(): void;
  onCopy(format: ColorFormat, text: string): void;
  onConvert(input: string): void;
  onHistorySelect(color: RgbaColor): void;
  onHistoryDelete(color: RgbaColor): void;
  onHistoryClear(): void;
}

export interface ResultPanelView {
  element: HTMLElement;
  updateColor(color: RgbaColor): void;
  renderHistory(colors: readonly RgbaColor[]): void;
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
      ${COLOR_FORMATS.map((format) => `<button class="value-button" type="button" data-copy="${format}"><span class="label">${format}</span><code data-value="${format}"></code><span class="copy-label">复制</span></button>`).join('')}
    </div>
    <form class="convert-form">
      <label for="page-color-picker-input">转换已有颜色</label>
      <div class="input-row"><input id="page-color-picker-input" name="color" autocomplete="off" spellcheck="false" placeholder="#0EA5E9、rgb(...)、hsl(...) 或颜色名"><button class="convert-button" type="submit">转换</button></div>
    </form>
    <section class="history" aria-labelledby="page-color-picker-history-title">
      <div class="history-head"><h3 id="page-color-picker-history-title">近期颜色</h3><button class="clear-history" type="button">清空</button></div>
      <div class="history-list"></div>
    </section>
    <p class="status" role="status" aria-live="polite"></p>
  `;

  const swatch = panel.querySelector<HTMLElement>('.swatch');
  const status = panel.querySelector<HTMLElement>('.status');
  const input = panel.querySelector<HTMLInputElement>('input[name="color"]');
  const closeButton = panel.querySelector<HTMLButtonElement>('.close-button');
  const historyList = panel.querySelector<HTMLElement>('.history-list');
  const clearHistoryButton = panel.querySelector<HTMLButtonElement>('.clear-history');
  if (!swatch || !status || !input || !closeButton || !historyList || !clearHistoryButton) throw new Error('结果面板初始化失败');

  const view: ResultPanelView = {
    element: panel,
    updateColor(color: RgbaColor): void {
      currentColor = color;
      const values = valuesFor(color);
      const hex = values.HEX;
      panel.setAttribute('aria-label', `当前颜色 ${hex}`);
      swatch.style.setProperty('--picked', hex);
      for (const format of COLOR_FORMATS) {
        const valueNode = panel.querySelector<HTMLElement>(`[data-value="${format}"]`);
        const button = panel.querySelector<HTMLButtonElement>(`[data-copy="${format}"]`);
        if (valueNode) valueNode.textContent = values[format];
        button?.setAttribute('aria-label', `复制 ${format} ${values[format]}`);
      }
    },
    renderHistory(colors: readonly RgbaColor[]): void {
      historyList.replaceChildren();
      clearHistoryButton.hidden = colors.length === 0;
      if (colors.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'history-empty';
        empty.textContent = '还没有近期颜色';
        historyList.append(empty);
        return;
      }
      for (const color of colors) {
        const hex = formatHex(color);
        const row = document.createElement('div');
        row.className = 'history-item';
        row.dataset.colorKey = recentColorKey(color);
        const select = document.createElement('button');
        select.className = 'history-select';
        select.type = 'button';
        select.setAttribute('aria-label', `使用近期颜色 ${hex}`);
        const dot = document.createElement('span');
        dot.className = 'history-dot';
        dot.style.setProperty('--history-color', hex);
        const value = document.createElement('code');
        value.textContent = hex;
        select.append(dot, value);
        select.addEventListener('click', () => handlers.onHistorySelect(color));
        const remove = document.createElement('button');
        remove.className = 'history-remove';
        remove.type = 'button';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `删除近期颜色 ${hex}`);
        remove.addEventListener('click', () => handlers.onHistoryDelete(color));
        row.append(select, remove);
        historyList.append(row);
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
  clearHistoryButton.addEventListener('click', handlers.onHistoryClear);
  view.updateColor(initialColor);
  view.renderHistory([]);
  return view;
}
