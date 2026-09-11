export type ClipboardMethod = 'clipboard-api' | 'exec-command';

export async function copyText(text: string): Promise<ClipboardMethod> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'clipboard-api';
    }
  } catch {
    // Continue to the synchronous fallback below.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.documentElement.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('浏览器拒绝了剪贴板写入');
  return 'exec-command';
}
