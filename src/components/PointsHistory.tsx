import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function PointsHistory({ history, language }) {
  const reasonLabels = {
    en: {
      order: 'Order Purchase',
      review: 'Product Review',
      referral: 'Friend Referral',
      profile: 'Profile Completion'
    },
    ar: {
      order: 'شراء الطلب',
      review: 'تقييم المنتج',
      referral: 'إحالة صديق',
      profile: 'إكمال الملف الشخصي'
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 border-l-4 border-amber-500 bg-amber-50 rounded">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-amber-600" size={20} />
                <div>
                  <p className="font-semibold text-gray-900">
                    {reasonLabels[language as keyof typeof reasonLabels][entry.reason] || entry.reason}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="font-bold text-amber-600 text-lg">+{entry.points}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
