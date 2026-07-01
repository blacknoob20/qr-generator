import { useState } from 'preact/hooks';
import type { QRStyle, DotShape, CornerShape, GradientConfig } from '../../../types/qr.types';

interface StyleConfigProps {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
}

export function StyleConfig({ style, onChange }: StyleConfigProps) {
  const [activeColorTab, setActiveColorTab] = useState<'solid' | 'gradient'>('solid');

  const handleForegroundColorChange = (color: string) => {
    onChange({
      ...style,
      color: {
        ...style.color,
        foreground: color,
      },
    });
  };

  const handleGradientChange = (type: 'linear' | 'radial', colors: string[], angle?: number) => {
    const gradient: GradientConfig = {
      type,
      colors: colors as [string, string],
    };
    if (type === 'linear' && angle !== undefined) {
      gradient.angle = angle;
    }
    onChange({
      ...style,
      color: {
        ...style.color,
        foreground: gradient,
      },
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    onChange({
      ...style,
      color: {
        ...style.color,
        background: color,
      },
    });
  };

  const handleDotShapeChange = (shape: DotShape) => {
    onChange({
      ...style,
      dotStyle: {
        shape,
        radius: style.dotStyle?.radius,
      },
    });
  };

  const handleCornerShapeChange = (shape: CornerShape) => {
    onChange({
      ...style,
      cornerStyle: {
        shape,
        radius: style.cornerStyle?.radius,
      },
    });
  };

  const handleLogoUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      onChange({
        ...style,
        logo: {
          src,
          size: style.logo?.size || 15,
          hideBackground: style.logo?.hideBackground || false,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLogoSizeChange = (size: number) => {
    if (!style.logo) return;
    onChange({
      ...style,
      logo: {
        ...style.logo,
        size,
      },
    });
  };

  const handleLogoHideBackgroundChange = (hideBackground: boolean) => {
    if (!style.logo) return;
    onChange({
      ...style,
      logo: {
        ...style.logo,
        hideBackground,
      },
    });
  };

  const handleRemoveLogo = () => {
    const { logo, ...rest } = style;
    onChange(rest as QRStyle);
  };

  const dotShapes: { value: DotShape; label: string }[] = [
    { value: 'square', label: '■' },
    { value: 'rounded', label: '●' },
    { value: 'dots', label: '⬤' },
    { value: 'classy', label: '✦' },
    { value: 'classy-rounded', label: '✧' },
    { value: 'extra-rounded', label: '◉' },
  ];

  const cornerShapes: { value: CornerShape; label: string }[] = [
    { value: 'square', label: '■' },
    { value: 'dot', label: '●' },
    { value: 'extra-rounded', label: '◉' },
    { value: 'rounded', label: '◐' },
  ];

  const isGradient = typeof style.color.foreground !== 'string';

  return (
    <div class="style-config">
      <div class="style-config__section">
        <h3 class="style-config__title">Color Primer Plano</h3>
        <div class="style-config__tabs">
          <button
            class={`style-config__tab ${activeColorTab === 'solid' ? 'style-config__tab--active' : ''}`}
            onClick={() => setActiveColorTab('solid')}
          >
            Sólido
          </button>
          <button
            class={`style-config__tab ${activeColorTab === 'gradient' ? 'style-config__tab--active' : ''}`}
            onClick={() => setActiveColorTab('gradient')}
          >
            Degradado
          </button>
        </div>

        {activeColorTab === 'solid' ? (
          <div class="style-config__field">
            <input
              type="color"
              class="style-config__color-input"
              value={isGradient ? '#000000' : style.color.foreground as string}
              onChange={(e) => handleForegroundColorChange((e.target as HTMLInputElement).value)}
            />
            <span class="style-config__color-value">
              {isGradient ? 'Degradado activo' : style.color.foreground as string}
            </span>
          </div>
        ) : (
          <div class="style-config__gradient">
            <div class="style-config__field">
              <label>Tipo:</label>
              <select
                class="style-config__select"
                onChange={(e) => {
                  const type = (e.target as HTMLSelectElement).value as 'linear' | 'radial';
                  const colors = isGradient
                    ? (style.color.foreground as GradientConfig).colors
                    : ['#000000', '#ffffff'];
                  handleGradientChange(type, colors);
                }}
              >
                <option value="linear">Lineal</option>
                <option value="radial">Radial</option>
              </select>
            </div>
            <div class="style-config__field">
              <label>Color inicio:</label>
              <input
                type="color"
                class="style-config__color-input"
                value={isGradient ? (style.color.foreground as GradientConfig).colors[0] : '#000000'}
                onChange={(e) => {
                  const colors = isGradient
                    ? [(e.target as HTMLInputElement).value, (style.color.foreground as GradientConfig).colors[1]]
                    : [(e.target as HTMLInputElement).value, '#ffffff'];
                  handleGradientChange('linear', colors, 45);
                }}
              />
            </div>
            <div class="style-config__field">
              <label>Color fin:</label>
              <input
                type="color"
                class="style-config__color-input"
                value={isGradient ? (style.color.foreground as GradientConfig).colors[1] : '#ffffff'}
                onChange={(e) => {
                  const colors = isGradient
                    ? [(style.color.foreground as GradientConfig).colors[0], (e.target as HTMLInputElement).value]
                    : ['#000000', (e.target as HTMLInputElement).value];
                  handleGradientChange('linear', colors, 45);
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div class="style-config__section">
        <h3 class="style-config__title">Color de Fondo</h3>
        <div class="style-config__field">
          <input
            type="color"
            class="style-config__color-input"
            value={style.color.background}
            onChange={(e) => handleBackgroundColorChange((e.target as HTMLInputElement).value)}
          />
          <span class="style-config__color-value">{style.color.background}</span>
        </div>
      </div>

      <div class="style-config__section">
        <h3 class="style-config__title">Forma de Módulos</h3>
        <div class="style-config__shapes">
          {dotShapes.map((shape) => (
            <button
              key={shape.value}
              class={`style-config__shape ${style.dotStyle?.shape === shape.value ? 'style-config__shape--active' : ''}`}
              onClick={() => handleDotShapeChange(shape.value)}
              title={shape.value}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      <div class="style-config__section">
        <h3 class="style-config__title">Forma de Esquinas</h3>
        <div class="style-config__shapes">
          {cornerShapes.map((shape) => (
            <button
              key={shape.value}
              class={`style-config__shape ${style.cornerStyle?.shape === shape.value ? 'style-config__shape--active' : ''}`}
              onClick={() => handleCornerShapeChange(shape.value)}
              title={shape.value}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      <div class="style-config__section">
        <h3 class="style-config__title">Logo (opcional)</h3>
        {style.logo ? (
          <div class="style-config__logo">
            <div class="style-config__logo-preview">
              <img src={style.logo.src} alt="Logo" />
              <button class="style-config__logo-remove" onClick={handleRemoveLogo}>
                ✕
              </button>
            </div>
            <div class="style-config__field">
              <label>Tamaño: {style.logo.size}%</label>
              <input
                type="range"
                min="5"
                max="20"
                value={style.logo.size}
                onChange={(e) => handleLogoSizeChange(parseInt((e.target as HTMLInputElement).value))}
              />
            </div>
            <div class="style-config__field">
              <label>
                <input
                  type="checkbox"
                  checked={style.logo.hideBackground}
                  onChange={(e) => handleLogoHideBackgroundChange((e.target as HTMLInputElement).checked)}
                />
                Ocultar fondo del logo
              </label>
            </div>
          </div>
        ) : (
          <div class="style-config__upload">
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
              class="style-config__file-input"
              id="logo-upload"
            />
            <label for="logo-upload" class="style-config__upload-label">
              Subir logo (máx. 20%)
            </label>
          </div>
        )}
      </div>
    </div>
  );
}