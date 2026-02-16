import { Link } from 'react-router-dom';
import { historyService } from '@/services/historyService';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const [stats, setStats] = useState(historyService.getStats());

  useEffect(() => {
    setStats(historyService.getStats());
  }, []);

  const { today } = stats;

  return (
    <div className="dashboard max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Система проверки сертификатов
      </h1>
      <div className="stats-today bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Статистика сегодня:
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <p className="text-gray-700">
            <span className="font-medium">Проверено:</span>{' '}
            <span className="text-primary font-semibold">{today.total}</span>
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Ошибок:</span>{' '}
            <span className="text-error font-semibold">{today.errors}</span>
          </p>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Всего проверок: {stats.total} (успешно: {stats.successful}, успешность:{' '}
          {stats.successRate}%)
        </p>
      </div>
      <Link
        to="/verify"
        className="primary-btn inline-block bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        Проверить сертификат
      </Link>
    </div>
  );
}
