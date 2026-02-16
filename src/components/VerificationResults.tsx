import type { InstrumentData, VerificationResult } from '@/types';
import { reportService } from '@/services/reportService';

export function VerificationResults({
  instrumentData,
  result,
  onCheckAnother,
  onGoToHistory,
}: {
  instrumentData: InstrumentData;
  result: VerificationResult;
  onCheckAnother: () => void;
  onGoToHistory: () => void;
}) {
  const { success, registryCheck, accreditationCheck } = result;

  const downloadReport = () => {
    reportService.generateReport(instrumentData, result);
  };

  return (
    <div className="results-page max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="result-header">
        {success ? (
          <div className="success-banner">
            <span className="icon" aria-hidden>✓</span>
            <h2>Проверка успешно завершена</h2>
            <p>Сертификат соответствует всем требованиям</p>
          </div>
        ) : (
          <div className="error-banner">
            <span className="icon" aria-hidden>✗</span>
            <h2>Обнаружены ошибки</h2>
            <p>Сертификат содержит несоответствия</p>
          </div>
        )}
      </div>

      <div className="instrument-card bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Данные средства измерения
        </h3>
        <table className="w-full text-left text-gray-700">
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-2 pr-4 font-medium">Наименование и тип:</td>
              <td className="py-2"><strong>{instrumentData.name}</strong></td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">Диапазон измерений:</td>
              <td className="py-2">
                {instrumentData.range.min} — {instrumentData.range.max}{' '}
                {instrumentData.range.unit}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">Класс точности:</td>
              <td className="py-2">{instrumentData.accuracyClass}%</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">Год выпуска:</td>
              <td className="py-2">{instrumentData.yearOfManufacture}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">Изготовитель:</td>
              <td className="py-2">{instrumentData.manufacturer ?? '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="check-section">
        <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
          <span className="check-icon">
            {registryCheck.found ? '✓' : '✗'}
          </span>
          Проверка в реестре ГСИ РК
        </h3>
        {registryCheck.found ? (
          <div className="check-success">
            <div className="info-grid">
              <div className="info-item">
                <label>Статус:</label>
                <span className="badge success">Тип СИ найден в реестре</span>
              </div>
              <div className="info-item">
                <label>Регистрационный номер:</label>
                <span>{registryCheck.regNumber}</span>
              </div>
              <div className="info-item">
                <label>Срок действия сертификата типа:</label>
                <span>до {registryCheck.validUntil}</span>
              </div>
              <div className="info-item">
                <label>Совпадение характеристик:</label>
                <div className="match-percentage">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${registryCheck.matchPercentage ?? 0}%` }}
                    />
                  </div>
                  <span>{registryCheck.matchPercentage ?? 0}%</span>
                </div>
              </div>
            </div>
            {registryCheck.warnings && registryCheck.warnings.length > 0 && (
              <div className="warnings mt-4">
                <h4 className="font-medium text-warning mb-2">Предупреждения:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {registryCheck.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            {registryCheck.errors && registryCheck.errors.length > 0 && (
              <div className="warnings mt-4">
                <h4 className="font-medium text-error mb-2">Ошибки:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {registryCheck.errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="check-error">
            <p className="error-message font-medium text-error">
              Данный тип СИ отсутствует в реестре ГСИ РК
            </p>
            <p className="error-description text-gray-600 mt-2">
              Средство измерения данного типа не зарегистрировано в государственном
              реестре или срок действия сертификата об утверждении типа истёк.
            </p>
          </div>
        )}
      </div>

      <div className="check-section">
        <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
          <span className="check-icon">
            {accreditationCheck.inScope ? '✓' : '✗'}
          </span>
          Проверка области аккредитации
        </h3>
        {accreditationCheck.inScope ? (
          <div className="check-success">
            <div className="info-grid">
              <div className="info-item">
                <label>Статус:</label>
                <span className="badge success">СИ входит в область аккредитации</span>
              </div>
              <div className="info-item">
                <label>Группа СИ в ОА:</label>
                <span>{accreditationCheck.group}</span>
              </div>
              <div className="info-item">
                <label>Диапазон в ОА:</label>
                <span>{accreditationCheck.rangeInOA}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="check-error">
            <p className="error-message font-medium text-error">
              Данное наименование типа СИ не соответствует наименованию группы СИ в ОА
            </p>
            <p className="error-description text-gray-600 mt-2">
              Средство измерения выходит за пределы области аккредитации лаборатории
              по диапазону измерений или классу точности.
            </p>
            {accreditationCheck.errors && accreditationCheck.errors.length > 0 && (
              <ul className="error-list list-disc list-inside mt-2 text-gray-700">
                {accreditationCheck.errors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="action-buttons flex flex-wrap gap-3">
        <button type="button" onClick={downloadReport} className="btn-primary">
          Скачать отчёт (PDF)
        </button>
        <button type="button" onClick={onCheckAnother} className="btn-secondary">
          Проверить ещё один сертификат
        </button>
        <button type="button" onClick={onGoToHistory} className="btn-outline">
          История проверок
        </button>
      </div>
    </div>
  );
}
