import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap } from 'lucide-react';

export default function LoyaltyTiers({ tiers, language }) {
  const tierIcons = {
    'Silver': '🥈',
    'Gold': '🥇',
    'Platinum': '👑'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <Card key={tier.id} className="border-2 hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{tierIcons[tier.name] || '⭐'}</span>
              {tier.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p>
                  {language === 'ar' ? 'الحد الأدنى من الطلبات' : 'Minimum Orders'}:{' '}
                  <span className="font-bold text-gray-900">{tier.minOrders}</span>
                </p>
              </div>
              <p className="text-sm text-gray-600">{tier.description}</p>
              {tier.benefits && tier.benefits.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold text-sm">
                    {language === 'ar' ? 'الفوائد' : 'Benefits'}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tier.benefits.map((benefit, idx) => (
                      <Badge key={idx} variant="outline">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
