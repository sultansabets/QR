import { useParams, useNavigate } from 'react-router-dom';
import { VerificationResults } from '@/components/VerificationResults';
import { historyService } from '@/services/historyService';

export function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = id ? historyService.getById(id) : null;

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Проверка не найдена.</p>
        <button
          type="button"
          onClick={() => navigate('/verify')}
          className="mt-4 btn-primary"
        >
          Проверить сертификат
        </button>
      </div>
    );
  }

  return (
    <VerificationResults
      instrumentData={item.instrumentData}
      result={item.details}
      onCheckAnother={() => navigate('/verify')}
      onGoToHistory={() => navigate('/history')}
    />
  );
}
