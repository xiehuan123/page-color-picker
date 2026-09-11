export const PICKER_STYLES = `
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
