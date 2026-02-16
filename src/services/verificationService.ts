import type { InstrumentData, VerificationResult } from '@/types';
import gsiRegistry from '@/mock-data/gsi-registry.json';
import accreditationScope from '@/mock-data/accreditation-scope.json';
import { certificateParser } from './pdfParserService';

export class VerificationService {
  private parser = certificateParser;
  private gsiRegistry = gsiRegistry as {
    instruments: Array<{
      id: string;
      name: string;
      type: string;
      ranges: Array<{ min: number; max: number; unit: string }>;
      accuracyClasses: string[];
      validFrom: string;
      validUntil: string;
    }>;
  };
  private accreditationScope = accreditationScope as {
    scope: Array<{
      group: string;
      types: string[];
      ranges: Array<{ min: number; max: number; unit: string }>;
      accuracyClasses: string[];
    }>;
  };

  async verifyFromText(certificateText: string): Promise<VerificationResult> {
    const parsed = this.parser.parseCertificate(certificateText);
    if (!parsed) {
      throw new Error('Не удалось извлечь данные из сертификата');
    }
    if (!parsed.range) {
      console.warn('Диапазон измерений не найден в сертификате');
    }
    if (!parsed.accuracyClass) {
      console.warn('Класс точности не найден в сертификате');
    }
    return this.verify(this.parser.toInstrumentData(parsed));
  }

  async verifyFromQR(qrCode: string): Promise<VerificationResult> {
    const parsed = this.parser.parseQRData(qrCode);
    if (!parsed) {
      throw new Error('Не удалось распознать QR-код');
    }
    return this.verify(this.parser.toInstrumentData(parsed));
  }

  async verify(data: InstrumentData): Promise<VerificationResult> {
    const registryCheck = this.checkInRegistry(data);
    const accreditationCheck = this.checkAccreditation(data);
    const success =
      registryCheck.found &&
      accreditationCheck.inScope &&
      (!registryCheck.errors || registryCheck.errors.length === 0) &&
      (!accreditationCheck.errors || accreditationCheck.errors.length === 0);

    return {
      success,
      timestamp: new Date().toISOString(),
      registryCheck,
      accreditationCheck,
    };
  }

  private checkInRegistry(data: InstrumentData): VerificationResult['registryCheck'] {
    const instruments = this.gsiRegistry.instruments;
    const nameFirstWord = data.name.split(' ')[0] || data.name;
    const instrument = instruments.find(
      (item: { type: string; name: string }) =>
        item.type === data.type && item.name.includes(nameFirstWord)
    );

    if (!instrument) {
      return {
        found: false,
        errors: ['Данный тип СИ отсутствует в реестре ГСИ РК'],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    const rangeMatch = instrument.ranges.some(
      (r: { min: number; max: number; unit: string }) =>
        r.min <= data.range.min && r.max >= data.range.max && r.unit === data.range.unit
    );
    if (!rangeMatch) {
      errors.push(
        `Диапазон измерений ${data.range.min}-${data.range.max} ${data.range.unit} не соответствует зарегистрированному`
      );
    }

    const accuracyMatch = instrument.accuracyClasses.includes(data.accuracyClass);
    if (!accuracyMatch) {
      errors.push(
        `Класс точности ${data.accuracyClass} не соответствует зарегистрированному`
      );
    }

    const validFrom = new Date(instrument.validFrom);
    const validUntil = new Date(instrument.validUntil);
    const manufactureYear = new Date(data.yearOfManufacture, 0, 1);
    if (manufactureYear < validFrom || manufactureYear > validUntil) {
      warnings.push(
        `Год выпуска ${data.yearOfManufacture} находится вне периода действия сертификата типа`
      );
    }

    let matchScore = 100;
    if (!rangeMatch) matchScore -= 30;
    if (!accuracyMatch) matchScore -= 30;
    if (warnings.length > 0) matchScore -= 10;

    return {
      found: true,
      regNumber: instrument.id,
      validUntil: instrument.validUntil,
      matchPercentage: Math.max(matchScore, 0),
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  private checkAccreditation(data: InstrumentData): VerificationResult['accreditationCheck'] {
    const scope = this.accreditationScope.scope;
    const group = scope.find((g: { types: string[] }) => g.types.includes(data.type));

    if (!group) {
      return {
        inScope: false,
        errors: [
          'Данное наименование типа СИ не соответствует наименованию группы СИ в области аккредитации',
        ],
      };
    }

    const errors: string[] = [];

    const rangeInScope = group.ranges.some(
      (r: { min: number; max: number; unit: string }) =>
        r.min <= data.range.min && r.max >= data.range.max && r.unit === data.range.unit
    );
    if (!rangeInScope) {
      const maxRange = Math.max(...group.ranges.map((r: { max: number }) => r.max));
      const unit = group.ranges[0]?.unit || data.range.unit;
      errors.push(
        `Диапазон измерений ${data.range.min}-${data.range.max} ${data.range.unit} выходит за пределы области аккредитации (макс. ${maxRange} ${unit})`
      );
    }

    const accuracyInScope = group.accuracyClasses.includes(data.accuracyClass);
    if (!accuracyInScope) {
      errors.push(
        `Класс точности ${data.accuracyClass} не входит в область аккредитации`
      );
    }

    const rangeStr =
      group.ranges[0] != null
        ? `${group.ranges[0].min} - ${group.ranges[0].max} ${group.ranges[0].unit}`
        : '—';

    return {
      inScope: errors.length === 0,
      group: group.group,
      rangeInOA: rangeStr,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export const verificationService = new VerificationService();
