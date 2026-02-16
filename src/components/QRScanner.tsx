import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function QRScanner({
  onScan,
  disabled,
}: {
  /** Raw decoded QR text (JSON or plain certificate text). */
  onScan: (rawText: string) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader';

  const startScanner = useCallback(async () => {
    if (scannerRef.current || disabled) return;
    setError(null);
    try {
      const scanner = new Html5Qrcode(containerId);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 5, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          scannerRef.current = null;
          onScan(decodedText);
        },
        () => {}
      );
      scannerRef.current = scanner;
      setHasPermission(true);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Не удалось запустить камеру';
      setError(msg);
      setHasPermission(false);
    }
  }, [onScan, disabled]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        id={containerId}
        className="max-w-sm mx-auto rounded-lg overflow-hidden border border-gray-300 bg-gray-900"
        style={{ display: hasPermission === false ? 'none' : 'block' }}
      />
      {hasPermission === null && !scannerRef.current && (
        <button
          type="button"
          onClick={startScanner}
          disabled={disabled}
          className="btn-primary"
        >
          Включить камеру для сканирования
        </button>
      )}
      {error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}
    </div>
  );
}
