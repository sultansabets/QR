import { useCallback, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { certificateParser } from '@/services/pdfParserService';
import type { InstrumentData } from '@/types';

// Worker for pdf.js (Vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();


export function PDFUploader({
  onExtract,
  disabled,
}: {
  onExtract: (data: InstrumentData) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractText = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');

      const parsed = certificateParser.parseCertificate(text);
      if (!parsed) {
        setError('Не удалось извлечь данные из документа. Проверьте, что это сертификат поверки.');
        return;
      }
      onExtract(certificateParser.toInstrumentData(parsed));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Не удалось прочитать PDF'
      );
    } finally {
      setLoading(false);
    }
  }, [onExtract]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') extractText(file);
      else setError('Выберите файл PDF');
    },
    [extractText]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) extractText(file);
      e.target.value = '';
    },
    [extractText]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`dropzone border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragging ? 'border-primary bg-blue-50' : 'border-gray-300 bg-gray-50'
        } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={onFileChange}
          disabled={disabled}
          className="hidden"
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload" className="cursor-pointer block">
          <p className="text-gray-600 mb-2">
            Перетащите PDF файл сюда или нажмите для выбора
          </p>
          {loading && (
            <p className="text-primary font-medium">Загрузка и извлечение данных…</p>
          )}
        </label>
      </div>
      {error && <p className="text-sm text-error font-medium">{error}</p>}
    </div>
  );
}

