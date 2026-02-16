/**
 * Certificate text/QR parser for various real-world formats.
 * Handles: "от 4 до 20 мА", "± 0,1 %, рабочего СИ", etc.
 */

export interface ParsedInstrument {
  name: string;
  type: string;
  serialNumber?: string;
  range: { min: number; max: number; unit: string } | null;
  accuracyClass: string | null;
  manufacturer?: string;
  yearOfManufacture?: number;
  methodology?: string;
}

const UNIT_PATTERN = '[а-яА-ЯёЁ°a-zA-Z%]+';

export class CertificateParser {
  /**
   * Parse measurement range from various text formats.
   * Examples:
   * - "от 4 до 20 мА" → {min: 4, max: 20, unit: "мА"}
   * - "0-25 МПа" → {min: 0, max: 25, unit: "МПа"}
   * - "от 0 до 100 °C" → {min: 0, max: 100, unit: "°C"}
   * - "0...150 мм" → {min: 0, max: 150, unit: "мм"}
   */
  parseRange(rangeText: string): { min: number; max: number; unit: string } | null {
    if (!rangeText) return null;
    const text = rangeText.trim();

    // Pattern 1: "от X до Y единица"
    let match = text.match(
      new RegExp(`от\\s+([+-]?\\d+(?:[.,]\\d+)?)\\s+до\\s+([+-]?\\d+(?:[.,]\\d+)?)\\s*(${UNIT_PATTERN})`, 'i')
    );
    if (match) {
      return {
        min: parseFloat(match[1].replace(',', '.')),
        max: parseFloat(match[2].replace(',', '.')),
        unit: match[3].trim(),
      };
    }

    // Pattern 2: "X-Y единица" or "X - Y единица"
    match = text.match(
      new RegExp(`([+-]?\\d+(?:[.,]\\d+)?)\\s*[-–—]\\s*([+-]?\\d+(?:[.,]\\d+)?)\\s*(${UNIT_PATTERN})`, 'i')
    );
    if (match) {
      return {
        min: parseFloat(match[1].replace(',', '.')),
        max: parseFloat(match[2].replace(',', '.')),
        unit: match[3].trim(),
      };
    }

    // Pattern 3: "X...Y единица"
    match = text.match(
      new RegExp(`([+-]?\\d+(?:[.,]\\d+)?)\\s*\\.{2,}\\s*([+-]?\\d+(?:[.,]\\d+)?)\\s*(${UNIT_PATTERN})`, 'i')
    );
    if (match) {
      return {
        min: parseFloat(match[1].replace(',', '.')),
        max: parseFloat(match[2].replace(',', '.')),
        unit: match[3].trim(),
      };
    }

    // Pattern 4: "от X единица" (only min)
    match = text.match(new RegExp(`от\\s+([+-]?\\d+(?:[.,]\\d+)?)\\s*(${UNIT_PATTERN})`, 'i'));
    if (match) {
      return {
        min: parseFloat(match[1].replace(',', '.')),
        max: Infinity,
        unit: match[2].trim(),
      };
    }

    // Pattern 5: "до X единица" (only max)
    match = text.match(new RegExp(`до\\s+([+-]?\\d+(?:[.,]\\d+)?)\\s*(${UNIT_PATTERN})`, 'i'));
    if (match) {
      return {
        min: 0,
        max: parseFloat(match[1].replace(',', '.')),
        unit: match[2].trim(),
      };
    }

    console.warn('Unable to parse range:', rangeText);
    return null;
  }

  /**
   * Parse accuracy class from various formats.
   * Examples:
   * - "± 0,1 %, рабочего СИ" → "0.1"
   * - "1.5" → "1.5"
   * - "0,5%" → "0.5"
   * - "класс точности 2.5" → "2.5"
   * - "погрешность ±0.05%" → "0.05"
   */
  parseAccuracy(accuracyText: string): string | null {
    if (!accuracyText) return null;
    const text = accuracyText.trim();

    // Pattern 1: "± X %" or "± X%" or "±X%"
    let match = text.match(/[±+]\s*(\d+(?:[.,]\d+)?)\s*%/);
    if (match) return match[1].replace(',', '.');

    // Pattern 2: Just a number with optional comma
    match = text.match(/^(\d+(?:[.,]\d+)?)\s*%?$/);
    if (match) return match[1].replace(',', '.');

    // Pattern 3: "класс точности X" or "класс X"
    match = text.match(/класс(?:\s+точности)?\s+(\d+(?:[.,]\d+)?)/i);
    if (match) return match[1].replace(',', '.');

    // Pattern 4: "погрешность ±X%"
    match = text.match(/погрешность\s*[±+]?\s*(\d+(?:[.,]\d+)?)\s*%/i);
    if (match) return match[1].replace(',', '.');

    // Pattern 5: "0,5%" etc.
    match = text.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (match) return match[1].replace(',', '.');

    // Pattern 6: Any number in text
    match = text.match(/(\d+(?:[.,]\d+)?)/);
    if (match) return match[1].replace(',', '.');

    console.warn('Unable to parse accuracy:', accuracyText);
    return null;
  }

  /**
   * Parse full certificate data from text.
   */
  parseCertificate(text: string): ParsedInstrument | null {
    try {
      let name = '';
      const nameMatch = text.match(
        /(?:наименование средства измерений|Наименование СИ|наименование)[:\s]*([^\n]+)/i
      );
      if (nameMatch) name = nameMatch[1].trim();

      let type = '';
      const typeMatch = text.match(/(?:Тип|Type)[:\s]*([^\n]+)/i);
      if (typeMatch) type = typeMatch[1].trim();

      let serialNumber: string | undefined;
      const serialMatch = text.match(
        /(?:заводской номер|серийный номер|serial)[:\s]*([^\n]+)/i
      );
      if (serialMatch) serialNumber = serialMatch[1].trim();

      let range: { min: number; max: number; unit: string } | null = null;
      const rangeMatch = text.match(
        /(?:диапазон измерений|диапазон|range)[:\s]*([^\n]+)/i
      );
      if (rangeMatch) range = this.parseRange(rangeMatch[1]);
      if (!range && text.match(/от\s+\d+.*до\s+\d+/i)) {
        const fallback = text.match(/(от\s+[^\n]+?(?=\s+[а-яА-ЯёЁ°]|$))/i);
        if (fallback) range = this.parseRange(fallback[1]);
      }
      if (!range) {
        const anyRange = text.match(/([+-]?\d+(?:[.,]\d+)?\s*[-–—.]+\s*[+-]?\d+(?:[.,]\d+)?\s*[а-яА-ЯёЁ°a-zA-Z%]+)/i);
        if (anyRange) range = this.parseRange(anyRange[1]);
      }

      let accuracyClass: string | null = null;
      const accuracyMatch = text.match(
        /(?:класс точности|точность|accuracy|погрешность)[:\s]*([^\n]+)/i
      );
      if (accuracyMatch) accuracyClass = this.parseAccuracy(accuracyMatch[1]);
      if (!accuracyClass && text.match(/[±+]\s*\d+/)) {
        const anyAcc = text.match(/[±+]?\s*(\d+(?:[.,]\d+)?)\s*%/);
        if (anyAcc) accuracyClass = this.parseAccuracy(anyAcc[0]);
      }

      let manufacturer: string | undefined;
      const mfgMatch = text.match(/(?:Изготовитель|Manufacturer)[:\s]*([^\n]+)/i);
      if (mfgMatch) manufacturer = mfgMatch[1].trim();

      let yearOfManufacture: number | undefined;
      const yearMatch = text.match(/(?:Дата изготовления|год выпуска|Year|год)[:\s]*(\d{4})/i);
      if (yearMatch) yearOfManufacture = parseInt(yearMatch[1], 10);
      if (!yearOfManufacture) {
        const anyYear = text.match(/\b(19\d{2}|20\d{2})\b/);
        if (anyYear) yearOfManufacture = parseInt(anyYear[1], 10);
      }

      let methodology: string | undefined;
      const methodMatch = text.match(
        /(?:методика поверки|Methodology|методика)[:\s]*([^\n]+)/i
      );
      if (methodMatch) methodology = methodMatch[1].trim();

      return {
        name: name || (type ? `СИ ${type}` : 'СИ'),
        type: type || name.split(' ').slice(-1)[0] || 'СИ',
        serialNumber,
        range,
        accuracyClass,
        manufacturer,
        yearOfManufacture,
        methodology,
      };
    } catch (error) {
      console.error('Error parsing certificate:', error);
      return null;
    }
  }

  /**
   * Parse QR code data (JSON or text format).
   */
  parseQRData(qrText: string): ParsedInstrument | null {
    try {
      const data = JSON.parse(qrText);

      let range: { min: number; max: number; unit: string } | null = null;
      if (data.range) {
        if (typeof data.range === 'string') {
          range = this.parseRange(data.range);
        } else if (
          typeof data.range === 'object' &&
          data.range.min != null &&
          data.range.max != null
        ) {
          range = data.range;
        }
      } else if (data.диапазон) {
        range = this.parseRange(data.диапазон);
      } else if (data.instrument?.range) {
        const r = data.instrument.range;
        if (typeof r === 'string') range = this.parseRange(r);
        else if (r.min != null && r.max != null) range = r;
      }

      let accuracyClass: string | null = null;
      const accSrc =
        data.accuracy ??
        data.accuracyClass ??
        data['класс точности'] ??
        data.точность ??
        data.instrument?.accuracyClass;
      if (accSrc != null) {
        accuracyClass =
          typeof accSrc === 'string'
            ? this.parseAccuracy(accSrc)
            : String(accSrc);
      }

      const name =
        data.name ??
        data.наименование ??
        data.instrument?.name ??
        '';
      const type =
        data.type ?? data.тип ?? data.instrument?.type ?? name.split(' ').slice(-1)[0] ?? '';

      return {
        name: name || 'СИ',
        type: type || 'СИ',
        serialNumber:
          data.serial ??
          data.serialNumber ??
          data['заводской номер'] ??
          data.instrument?.serialNumber,
        range,
        accuracyClass,
        manufacturer:
          data.manufacturer ?? data.изготовитель ?? data.instrument?.manufacturer,
        yearOfManufacture:
          data.year ??
          data.yearOfManufacture ??
          data['год выпуска'] ??
          data.instrument?.yearOfManufacture,
        methodology:
          data.methodology ?? data.методика ?? data.instrument?.methodology,
      };
    } catch {
      return this.parseCertificate(qrText);
    }
  }

  /** Convert ParsedInstrument to InstrumentData with fallbacks for verification. */
  toInstrumentData(parsed: ParsedInstrument): {
    name: string;
    type: string;
    manufacturer?: string;
    range: { min: number; max: number; unit: string };
    accuracyClass: string;
    yearOfManufacture: number;
    methodology?: string;
  } {
    const range = parsed.range ?? { min: 0, max: 0, unit: 'неизвестно' };
    const max = range.max === Infinity ? 1e9 : range.max;
    return {
      name: parsed.name || 'СИ',
      type: parsed.type || 'СИ',
      manufacturer: parsed.manufacturer,
      range: { min: range.min, max, unit: range.unit },
      accuracyClass: parsed.accuracyClass ?? 'неизвестно',
      yearOfManufacture: parsed.yearOfManufacture ?? new Date().getFullYear(),
      methodology: parsed.methodology,
    };
  }
}

export const certificateParser = new CertificateParser();
