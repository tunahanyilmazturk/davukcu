import { defineConfig } from 'vite';
import { version } from './package.json' with { type: 'json' };

export default defineConfig({
  base: './', // build çıktısı file:// ile de açılabilsin
  define: { __APP_VERSION__: JSON.stringify('v' + version) },
});
