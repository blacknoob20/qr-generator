import type { QRConfig, EncodingMode } from '../types/qr.types';
import type { QRMetadata } from '../types/validation.types';

const QR_CAPACITY_TABLE: Record<number, Record<EncodingMode, { bits: number; modules: number }>> = {
  1: { numeric: { bits: 7089, modules: 21 }, alphanumeric: { bits: 4296, modules: 21 }, byte: { bits: 2953, modules: 21 }, kanji: { bits: 1817, modules: 21 } },
  2: { numeric: { bits: 4296, modules: 25 }, alphanumeric: { bits: 2612, modules: 25 }, byte: { bits: 1796, modules: 25 }, kanji: { bits: 1103, modules: 25 } },
  3: { numeric: { bits: 7089, modules: 29 }, alphanumeric: { bits: 4296, modules: 29 }, byte: { bits: 2953, modules: 29 }, kanji: { bits: 1817, modules: 29 } },
  4: { numeric: { bits: 14132, modules: 33 }, alphanumeric: { bits: 8592, modules: 33 }, byte: { bits: 5914, modules: 33 }, kanji: { bits: 3639, modules: 33 } },
  5: { numeric: { bits: 23330, modules: 37 }, alphanumeric: { bits: 14168, modules: 37 }, byte: { bits: 9753, modules: 37 }, kanji: { bits: 5999, modules: 37 } },
  6: { numeric: { bits: 31130, modules: 41 }, alphanumeric: { bits: 18917, modules: 41 }, byte: { bits: 13012, modules: 41 }, kanji: { bits: 8005, modules: 41 } },
  7: { numeric: { bits: 43369, modules: 45 }, alphanumeric: { bits: 26350, modules: 45 }, byte: { bits: 18124, modules: 45 }, kanji: { bits: 11149, modules: 45 } },
  8: { numeric: { bits: 55913, modules: 49 }, alphanumeric: { bits: 33976, modules: 49 }, byte: { bits: 23364, modules: 49 }, kanji: { bits: 14374, modules: 49 } },
  9: { numeric: { bits: 69936, modules: 53 }, alphanumeric: { bits: 42499, modules: 53 }, byte: { bits: 29229, modules: 53 }, kanji: { bits: 17974, modules: 53 } },
  10: { numeric: { bits: 85880, modules: 57 }, alphanumeric: { bits: 52196, modules: 57 }, byte: { bits: 35903, modules: 57 }, kanji: { bits: 22083, modules: 57 } },
  11: { numeric: { bits: 103864, modules: 61 }, alphanumeric: { bits: 63139, modules: 61 }, byte: { bits: 43429, modules: 61 }, kanji: { bits: 26716, modules: 61 } },
  12: { numeric: { bits: 124364, modules: 65 }, alphanumeric: { bits: 75599, modules: 65 }, byte: { bits: 52003, modules: 65 }, kanji: { bits: 31990, modules: 65 } },
  13: { numeric: { bits: 146452, modules: 69 }, alphanumeric: { bits: 88982, modules: 69 }, byte: { bits: 61211, modules: 69 }, kanji: { bits: 37658, modules: 69 } },
  14: { numeric: { bits: 170162, modules: 73 }, alphanumeric: { bits: 103412, modules: 73 }, byte: { bits: 71135, modules: 73 }, kanji: { bits: 43760, modules: 73 } },
  15: { numeric: { bits: 195728, modules: 77 }, alphanumeric: { bits: 118942, modules: 77 }, byte: { bits: 81829, modules: 77 }, kanji: { bits: 50342, modules: 77 } },
  16: { numeric: { bits: 223492, modules: 81 }, alphanumeric: { bits: 135837, modules: 81 }, byte: { bits: 93459, modules: 81 }, kanji: { bits: 57507, modules: 81 } },
  17: { numeric: { bits: 253664, modules: 85 }, alphanumeric: { bits: 154159, modules: 85 }, byte: { bits: 106087, modules: 85 }, kanji: { bits: 65257, modules: 85 } },
  18: { numeric: { bits: 285584, modules: 89 }, alphanumeric: { bits: 173618, modules: 89 }, byte: { bits: 119436, modules: 89 }, kanji: { bits: 73471, modules: 89 } },
  19: { numeric: { bits: 319560, modules: 93 }, alphanumeric: { bits: 194260, modules: 93 }, byte: { bits: 133634, modules: 93 }, kanji: { bits: 82198, modules: 93 } },
  20: { numeric: { bits: 355816, modules: 97 }, alphanumeric: { bits: 216292, modules: 97 }, byte: { bits: 148758, modules: 97 }, kanji: { bits: 91532, modules: 97 } },
  21: { numeric: { bits: 394628, modules: 101 }, alphanumeric: { bits: 239872, modules: 101 }, byte: { bits: 165001, modules: 101 }, kanji: { bits: 101503, modules: 101 } },
  22: { numeric: { bits: 436616, modules: 105 }, alphanumeric: { bits: 265312, modules: 105 }, byte: { bits: 182480, modules: 105 }, kanji: { bits: 112264, modules: 105 } },
  23: { numeric: { bits: 481608, modules: 109 }, alphanumeric: { bits: 292776, modules: 109 }, byte: { bits: 201374, modules: 109 }, kanji: { bits: 123867, modules: 109 } },
  24: { numeric: { bits: 530176, modules: 113 }, alphanumeric: { bits: 322308, modules: 113 }, byte: { bits: 221725, modules: 113 }, kanji: { bits: 136385, modules: 113 } },
  25: { numeric: { bits: 582596, modules: 117 }, alphanumeric: { bits: 354008, modules: 117 }, byte: { bits: 243454, modules: 117 }, kanji: { bits: 149785, modules: 117 } },
  26: { numeric: { bits: 638656, modules: 121 }, alphanumeric: { bits: 387960, modules: 121 }, byte: { bits: 266852, modules: 121 }, kanji: { bits: 164171, modules: 121 } },
  27: { numeric: { bits: 698336, modules: 125 }, alphanumeric: { bits: 424560, modules: 125 }, byte: { bits: 292012, modules: 125 }, kanji: { bits: 179649, modules: 125 } },
  28: { numeric: { bits: 762336, modules: 129 }, alphanumeric: { bits: 463360, modules: 129 }, byte: { bits: 318720, modules: 129 }, kanji: { bits: 196094, modules: 129 } },
  29: { numeric: { bits: 829892, modules: 133 }, alphanumeric: { bits: 504508, modules: 133 }, byte: { bits: 347026, modules: 133 }, kanji: { bits: 213510, modules: 133 } },
  30: { numeric: { bits: 901120, modules: 137 }, alphanumeric: { bits: 547696, modules: 137 }, byte: { bits: 376787, modules: 137 }, kanji: { bits: 231781, modules: 137 } },
  31: { numeric: { bits: 976048, modules: 141 }, alphanumeric: { bits: 593212, modules: 141 }, byte: { bits: 408050, modules: 141 }, kanji: { bits: 251003, modules: 141 } },
  32: { numeric: { bits: 1055504, modules: 145 }, alphanumeric: { bits: 641428, modules: 145 }, byte: { bits: 441216, modules: 145 }, kanji: { bits: 271377, modules: 145 } },
  33: { numeric: { bits: 1138864, modules: 149 }, alphanumeric: { bits: 692556, modules: 149 }, byte: { bits: 476448, modules: 149 }, kanji: { bits: 293068, modules: 149 } },
  34: { numeric: { bits: 1226212, modules: 153 }, alphanumeric: { bits: 745848, modules: 153 }, byte: { bits: 513000, modules: 153 }, kanji: { bits: 315593, modules: 153 } },
  35: { numeric: { bits: 1317636, modules: 157 }, alphanumeric: { bits: 800760, modules: 157 }, byte: { bits: 550958, modules: 157 }, kanji: { bits: 338965, modules: 157 } },
  36: { numeric: { bits: 1413248, modules: 161 }, alphanumeric: { bits: 858808, modules: 161 }, byte: { bits: 590712, modules: 161 }, kanji: { bits: 363359, modules: 161 } },
  37: { numeric: { bits: 1513132, modules: 165 }, alphanumeric: { bits: 919440, modules: 165 }, byte: { bits: 632404, modules: 165 }, kanji: { bits: 389017, modules: 165 } },
  38: { numeric: { bits: 1617632, modules: 169 }, alphanumeric: { bits: 983288, modules: 169 }, byte: { bits: 676329, modules: 169 }, kanji: { bits: 416115, modules: 169 } },
  39: { numeric: { bits: 1726844, modules: 173 }, alphanumeric: { bits: 1049928, modules: 173 }, byte: { bits: 722772, modules: 173 }, kanji: { bits: 444567, modules: 173 } },
  40: { numeric: { bits: 1840964, modules: 177 }, alphanumeric: { bits: 1119160, modules: 177 }, byte: { bits: 770112, modules: 177 }, kanji: { bits: 473767, modules: 177 } },
};

const ECL_FACTORS: Record<string, number> = {
  'L': 1,
  'M': 0.8,
  'Q': 0.64,
  'H': 0.5,
};

function getRequiredBits(content: string): number {
  const newBytes = new TextEncoder().encode(content);
  return newBytes.length * 8;
}

function findMinimumVersion(content: string, encoding: EncodingMode, ecl: string): number {
  const requiredBits = getRequiredBits(content);
  const factor = ECL_FACTORS[ecl] || 0.8;

  for (let version = 1; version <= 40; version++) {
    const capacityData = QR_CAPACITY_TABLE[version]?.[encoding];
    if (!capacityData) continue;

    const effectiveBits = Math.floor(capacityData.bits * factor);
    if (effectiveBits >= requiredBits) {
      return version;
    }
  }
  return 40;
}

export function detectEncoding(content: string): EncodingMode {
  if (/^\d*$/.test(content)) return 'numeric';
  if (/^[A-Z0-9 $%*+\-./:]*$/i.test(content)) return 'alphanumeric';
  if (/^[一-龯]*$/.test(content)) return 'kanji';
  return 'byte';
}

export function calculateContrast(fg: string, bg: string): number {
  const fgLum = getLuminance(fg);
  const bgLum = getLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function calculateQRMetadata(config: QRConfig): QRMetadata {
  const content = config.content || '';
  const encoding = config.encoding;
  const ecl = config.advanced.errorCorrectionLevel;

  if (!content) {
    return {
      version: 1,
      capacity: 0,
      used: 0,
      modules: 21,
      encoding
    };
  }

  const used = Math.ceil(getRequiredBits(content) / 8);
  const version = config.advanced.version === 'auto'
    ? findMinimumVersion(content, encoding, ecl)
    : (config.advanced.version as number);

  const capacityData = QR_CAPACITY_TABLE[version]?.[encoding];
  const modules = capacityData?.modules || 21;
  const rawCapacity = capacityData?.bits || 0;
  const capacity = Math.floor(rawCapacity * ECL_FACTORS[ecl]) / 8;

  return {
    version,
    capacity: Math.floor(capacity),
    used,
    modules,
    encoding
  };
}