import { useEffect } from 'preact/hooks';
import { ConfigPanel } from './components/ConfigPanel';
import { QRPreview } from './components/QRPreview';
import {
  contentSignal,
  encodingSignal,
  styleSignal,
  advancedSignal,
  themeSignal,
  configSignal,
  validationSignal,
  drawerOpenSignal,
  setContent,
  setEncoding,
  setStyle,
  setAdvanced,
  setTheme,
  resetConfig,
  initTheme,
  toggleDrawer,
  closeDrawer,
} from './state/qr-store';
import type { QRConfig } from './types/qr.types';

export function App() {
  useEffect(() => {
    initTheme();
  }, []);

  const handleConfigChange = (newConfig: QRConfig) => {
    if (newConfig.content !== contentSignal.value) {
      setContent(newConfig.content);
    }
    if (newConfig.encoding !== encodingSignal.value) {
      setEncoding(newConfig.encoding);
    }
    if (newConfig.style !== styleSignal.value) {
      setStyle(newConfig.style);
    }
    if (newConfig.advanced !== advancedSignal.value) {
      setAdvanced(newConfig.advanced);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = themeSignal.value === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleReset = () => {
    resetConfig();
  };

  return (
    <div class="app">
      <header class="header">
        <div class="header__logo">
          <span class="header__icon">◈</span>
          <div class="header__brand">
            <span class="header__title">QR Studio</span>
            <span class="header__subtitle">Generador profesional</span>
          </div>
        </div>
        <div class="header__actions">
          <button class="header__theme-toggle" onClick={handleThemeToggle} title="Cambiar tema">
            {themeSignal.value === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main class="studio">
        <aside class="studio__sidebar">
          <div class="studio__sidebar-scroll">
            <ConfigPanel
              config={configSignal.value}
              onChange={handleConfigChange}
              validationResult={validationSignal.value}
              flat
            />
            <div class="studio__sidebar-footer">
              <button class="config-reset" onClick={handleReset}>
                ↺ Restaurar valores por defecto
              </button>
            </div>
          </div>
        </aside>

        <section class="studio__preview">
          <QRPreview
            content={contentSignal.value}
            config={configSignal.value}
            size={420}
            validationResult={validationSignal.value}
          />
        </section>
      </main>

      <button
        class="studio__fab"
        onClick={toggleDrawer}
        aria-label="Abrir configuración"
      >
        ⚙ Configurar
      </button>

      {drawerOpenSignal.value && (
        <div class="studio__drawer-overlay" onClick={closeDrawer}>
          <div class="studio__drawer" onClick={(e) => e.stopPropagation()}>
            <div class="studio__drawer-handle" />
            <div class="studio__drawer-scroll">
              <ConfigPanel
                config={configSignal.value}
                onChange={handleConfigChange}
                validationResult={validationSignal.value}
              />
              <button class="config-reset" onClick={handleReset}>
                ↺ Restaurar valores por defecto
              </button>
              <button class="studio__drawer-apply" onClick={closeDrawer}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
