import type { InstrumentData } from '@/types';

export function DataPreview({ data }: { data: InstrumentData }) {
  return (
    <div className="data-preview bg-gray-50 rounded-lg p-4 text-sm">
      <p><strong>Наименование:</strong> {data.name}</p>
      <p><strong>Тип:</strong> {data.type}</p>
      <p>
        <strong>Диапазон:</strong> {data.range.min} – {data.range.max} {data.range.unit}
      </p>
      <p><strong>Класс точности:</strong> {data.accuracyClass}</p>
      <p><strong>Год выпуска:</strong> {data.yearOfManufacture}</p>
      {data.manufacturer && (
        <p><strong>Изготовитель:</strong> {data.manufacturer}</p>
      )}
    </div>
  );
}
