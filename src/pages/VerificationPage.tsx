import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '@/components/QRScanner';
import { PDFUploader } from '@/components/PDFUploader';
import { ManualInput } from '@/components/ManualInput';
import { DataPreview } from '@/components/DataPreview';
import { verificationService } from '@/services/verificationService';
import { historyService } from '@/services/historyService';
import { certificateParser } from '@/services/pdfParserService';
import { generateTestQR } from '@/utils/qrGenerator';
import sampleCertificates from '@/mock-data/sample-certificates.json';
import type { InstrumentData } from '@/types';

type Mode = 'qr' | 'pdf' | 'manual';

export function VerificationPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('manual');
  const [instrumentData, setInstrumentData] = useState<InstrumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testQRUrl, setTestQRUrl] = useState<string | null>(null);
  const [qrError, setQRError] = useState<string | null>(null);

  useEffect(() => {
    const cert = (sampleCertificates as { certificates: Array<{ instrument: InstrumentData; id: string; certificateNumber: string; verificationDate: string }> }).certificates.find(
      (c) => c.instrument && c.id?.includes('001')
    );
    if (cert) {
      generateTestQR({
        id: cert.id,
        certificateNumber: cert.certificateNumber,
        instrument: cert.instrument,
        verificationDate: cert.verificationDate ?? new Date().toISOString().slice(0, 10),
      }).then(setTestQRUrl).catch(() => {});
    }
  }, []);

  const startVerification = async () => {
    if (!instrumentData) return;
    setLoading(true);
    try {
      const result = await verificationService.verify(instrumentData);
      const item = historyService.addFromVerification(instrumentData, result);
      navigate(`/result/${item.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (rawText: string) => {
    setQRError(null);
    const parsed = certificateParser.parseQRData(rawText);
    if (!parsed) {
      setQRError('Не удалось распознать данные сертификата из QR-кода');
      return;
    }
    setInstrumentData(certificateParser.toInstrumentData(parsed));
  };

  const handlePDFExtract = (data: InstrumentData) => {
    setInstrumentData(data);
  };

  const handleManualSubmit = async (data: InstrumentData) => {
    setInstrumentData(data);
    setLoading(true);
    try {
      const result = await verificationService.verify(data);
      const item = historyService.addFromVerification(data, result);
      navigate(`/result/${item.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-page max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Проверка сертификата
      </h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setMode('qr')}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            mode === 'qr' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          QR-код
        </button>
        <button
          type="button"
          onClick={() => setMode('pdf')}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            mode === 'pdf' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          PDF
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
            mode === 'manual' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Вручную
        </button>
      </div>

      {mode === 'qr' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Сканировать QR-код сертификата
          </h2>
          <QRScanner onScan={handleQRScan} disabled={loading} />
          {qrError && (
            <p className="text-sm text-error font-medium">{qrError}</p>
          )}
          {testQRUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Тестовый QR для проверки</h3>
              <img src={testQRUrl} alt="Тестовый QR" className="mx-auto w-40 h-40" />
              <p className="text-xs text-gray-500 mt-2">Отсканируйте этот код камерой для теста</p>
            </div>
          )}
          {instrumentData && (
            <>
              <div className="data-preview">
                <h3 className="font-medium text-gray-800 mb-2">Извлечённые данные:</h3>
                <DataPreview data={instrumentData} />
              </div>
              <button
                type="button"
                onClick={startVerification}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Проверка…' : 'Начать проверку'}
              </button>
            </>
          )}
        </div>
      )}

      {mode === 'pdf' && (
        <div className="upload-section space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Загрузить PDF сертификата
          </h2>
          <PDFUploader onExtract={handlePDFExtract} disabled={loading} />
          {instrumentData && (
            <>
              <div className="extracted-data">
                <h3 className="font-medium text-gray-800 mb-2">Данные из документа:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-48">
                  {JSON.stringify(instrumentData, null, 2)}
                </pre>
              </div>
              <button
                type="button"
                onClick={startVerification}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Проверка…' : 'Начать проверку'}
              </button>
            </>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <ManualInput onSubmit={handleManualSubmit} disabled={loading} />
      )}
    </div>
  );
}
