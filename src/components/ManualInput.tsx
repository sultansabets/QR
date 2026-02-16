import { useState, useMemo } from 'react';
import { certificateParser } from '@/services/pdfParserService';
import type { InstrumentData } from '@/types';

export function ManualInput({
  onSubmit,
  disabled,
}: {
  onSubmit: (data: InstrumentData) => void;
  disabled?: boolean;
}) {
  const [name, setName] = useState('');
  const [rangeText, setRangeText] = useState('');
  const [accuracyText, setAccuracyText] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [manufacturer, setManufacturer] = useState('');
  const [methodology, setMethodology] = useState('');

  const parsedRange = useMemo(
    () => (rangeText.trim() ? certificateParser.parseRange(rangeText) : null),
    [rangeText]
  );
  const parsedAccuracy = useMemo(
    () => (accuracyText.trim() ? certificateParser.parseAccuracy(accuracyText) : null),
    [accuracyText]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(year, 10) || new Date().getFullYear();
    const range = parsedRange ?? { min: 0, max: 0, unit: 'неизвестно' };
    const max = range.max === Infinity ? 1e9 : range.max;
    const accuracyClass = parsedAccuracy ?? (accuracyText.trim() ? '0' : '0');

    onSubmit({
      name: name.trim() || 'СИ',
      type: name.trim().split(' ').slice(-1)[0] || name.trim() || 'СИ',
      manufacturer: manufacturer.trim() || undefined,
      range: { min: range.min, max, unit: range.unit },
      accuracyClass,
      yearOfManufacture: y,
      methodology: methodology.trim() || undefined,
    });
  };

  return (
    <form className="manual-input-form space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-gray-800">
        Ввести данные вручную
      </h2>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Наименование и тип СИ:
        </label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Манометр МП2-У или Контроллер измерительный FloBoss 107"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Диапазон измерений:
        </label>
        <div className="input-hint text-xs text-gray-500 mb-1">
          Примеры: &quot;от 4 до 20 мА&quot;, &quot;0-25 МПа&quot;, &quot;0...100 °C&quot;
        </div>
        <input
          name="rangeText"
          value={rangeText}
          onChange={(e) => setRangeText(e.target.value)}
          placeholder="от 4 до 20 мА"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
        />
        {parsedRange && (
          <div className="parsed-preview mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            ✓ Распознано: {parsedRange.min} – {parsedRange.max === Infinity ? '∞' : parsedRange.max} {parsedRange.unit}
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Класс точности (погрешность):
        </label>
        <div className="input-hint text-xs text-gray-500 mb-1">
          Примеры: &quot;± 0,1 %&quot;, &quot;1.5&quot;, &quot;класс точности 2.5&quot;
        </div>
        <input
          name="accuracyText"
          value={accuracyText}
          onChange={(e) => setAccuracyText(e.target.value)}
          placeholder="± 0,1 %"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
        />
        {parsedAccuracy && (
          <div className="parsed-preview mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            ✓ Класс точности: {parsedAccuracy}%
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Год выпуска:
        </label>
        <input
          name="year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="2025"
          min={1990}
          max={2030}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Изготовитель:
        </label>
        <input
          name="manufacturer"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
          placeholder="Например: ОАО Манотомь, Fromex S.A. de C.V."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Методика поверки:
        </label>
        <input
          name="methodology"
          value={methodology}
          onChange={(e) => setMethodology(e.target.value)}
          placeholder="Например: МИ 2124-90, МП 118-221-2013"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="submit-btn btn-primary"
        disabled={disabled}
      >
        Проверить
      </button>
    </form>
  );
}
