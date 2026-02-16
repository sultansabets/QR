import { Link } from 'react-router-dom';
import type { VerificationHistoryItem } from '@/types';

export function HistoryList({
  items,
  onClear,
}: {
  items: VerificationHistoryItem[];
  onClear: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>История проверок пуста.</p>
        <Link to="/verify" className="text-primary font-medium mt-2 inline-block">
          Проверить сертификат
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">История проверок</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-gray-600 hover:text-error font-medium"
        >
          Очистить историю
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li key={item.id} className="py-4">
            <Link
              to={`/result/${item.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-medium text-gray-900">{item.instrumentName}</p>
                  <p className="text-sm text-gray-500">
                    {item.instrumentType} •{' '}
                    {new Date(item.timestamp).toLocaleString('ru-RU')}
                  </p>
                </div>
                <span
                  className={`badge shrink-0 ${
                    item.result === 'success' ? 'success' : 'error'
                  }`}
                >
                  {item.result === 'success' ? 'Успешно' : 'Ошибка'}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
