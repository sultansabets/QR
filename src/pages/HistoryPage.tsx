import { useState, useEffect } from 'react';
import { HistoryList } from '@/components/HistoryList';
import { historyService } from '@/services/historyService';

export function HistoryPage() {
  const [items, setItems] = useState(historyService.getAll());

  useEffect(() => {
    setItems(historyService.getAll());
  }, []);

  const handleClear = () => {
    historyService.clear();
    setItems([]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <HistoryList items={items} onClear={handleClear} />
    </div>
  );
}
