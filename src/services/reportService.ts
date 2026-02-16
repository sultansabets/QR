import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InstrumentData, VerificationResult } from '@/types';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

export class ReportService {
  generateReport(instrumentData: InstrumentData, result: VerificationResult): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Отчёт о проверке сертификата', 20, 20);
    doc.setFontSize(10);
    doc.text(
      `Дата проверки: ${new Date(result.timestamp).toLocaleString('ru-RU')}`,
      20,
      30
    );

    doc.setFontSize(14);
    const resultText = result.success
      ? '✓ ПРОВЕРКА УСПЕШНА'
      : '✗ ОБНАРУЖЕНЫ ОШИБКИ';
    doc.setTextColor(result.success ? 0 : 255, result.success ? 128 : 0, 0);
    doc.text(resultText, 20, 40);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(12);
    doc.text('Данные средства измерения:', 20, 55);
    const instrumentTable = [
      ['Наименование и тип', instrumentData.name],
      [
        'Диапазон измерений',
        `${instrumentData.range.min} - ${instrumentData.range.max} ${instrumentData.range.unit}`,
      ],
      ['Класс точности', instrumentData.accuracyClass],
      ['Год выпуска', instrumentData.yearOfManufacture.toString()],
      ['Изготовитель', instrumentData.manufacturer ?? 'Не указан'],
      ['Методика поверки', instrumentData.methodology ?? 'Не указана'],
    ];
    autoTable(doc, {
      startY: 60,
      head: [['Параметр', 'Значение']],
      body: instrumentTable,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
    });

    let currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      ?.finalY
      ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
      : 70;

    doc.setFontSize(12);
    doc.text('Проверка в реестре ГСИ РК:', 20, currentY);
    currentY += 5;
    const registryData: [string, string][] = [];
    if (result.registryCheck.found) {
      registryData.push(
        ['Статус', '✓ Тип СИ найден в реестре'],
        ['Рег. номер', result.registryCheck.regNumber ?? ''],
        ['Срок действия', `до ${result.registryCheck.validUntil ?? ''}`],
        ['Совпадение', `${result.registryCheck.matchPercentage ?? 0}%`]
      );
      result.registryCheck.errors?.forEach((error) => {
        registryData.push(['Ошибка', error]);
      });
    } else {
      registryData.push(['Статус', '✗ Тип СИ не найден в реестре']);
      result.registryCheck.errors?.forEach((error) => {
        registryData.push(['Ошибка', error]);
      });
    }
    autoTable(doc, {
      startY: currentY,
      body: registryData,
      theme: 'striped',
    });

    currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      ?.finalY
      ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
      : currentY + 30;

    doc.text('Проверка области аккредитации:', 20, currentY);
    currentY += 5;
    const accreditationData: [string, string][] = [];
    if (result.accreditationCheck.inScope) {
      accreditationData.push(
        ['Статус', '✓ СИ входит в область аккредитации'],
        ['Группа СИ', result.accreditationCheck.group ?? ''],
        ['Диапазон в ОА', result.accreditationCheck.rangeInOA ?? '']
      );
    } else {
      accreditationData.push([
        'Статус',
        '✗ СИ не входит в область аккредитации',
      ]);
      result.accreditationCheck.errors?.forEach((error) => {
        accreditationData.push(['Ошибка', error]);
      });
    }
    autoTable(doc, {
      startY: currentY,
      body: accreditationData,
      theme: 'striped',
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Страница ${i} из ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const filename = `Отчёт_${instrumentData.type}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }
}

export const reportService = new ReportService();
