import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  const navClass = (path: string) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      location.pathname === path
        ? 'bg-primary text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Link to="/" className="text-xl font-bold text-gray-900">
          Система проверки сертификатов
        </Link>
        <div className="flex gap-2">
          <Link to="/" className={navClass('/')}>
            Главная
          </Link>
          <Link to="/verify" className={navClass('/verify')}>
            Проверить сертификат
          </Link>
          <Link to="/history" className={navClass('/history')}>
            История проверок
          </Link>
        </div>
      </div>
    </nav>
  );
}
