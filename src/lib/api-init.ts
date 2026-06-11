/*
 * Side effect 專屬模組：頂層執行語句都集中在這裡。
 *
 * 凡是會被 bundler 視為 side effect 的程式碼（console.log、register、
 * polyfill、metric init…）都放在這個檔案。任何模組只要不 import 這個檔，
 * 就完全不會把這些 side effect 拉進 bundle。
 *
 * 真實世界用法：通常由 app entry（main.tsx）顯式 import 一次來觸發初始化，
 * 或在開發模式才條件 import。負責「使用 API」的 component 永遠只 import
 * 純宣告檔 (./api)，不碰這個檔。
 */
import { use, unuse } from './api';

console.log('[api] module loaded', { use, unuse });
