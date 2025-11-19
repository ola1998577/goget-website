import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

export default function LoyaltyPointsCard({ profile, language }) {
  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-orange-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="text-amber-600" />
          {language === 'ar' ? 'نقاطك الحالية' : 'Your Points'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-amber-600 mb-2">
          {profile.currentPoints.toLocaleString()}
        </div>
        <p className="text-sm text-gray-600">
          {language === 'ar' 
            ? `${Math.ceil((50 - (profile.currentPoints % 50)) || 50)} نقطة إضافية للحصول على مكافأة`
            : `${Math.ceil((50 - (profile.currentPoints % 50)) || 50)} more points to earn a reward`
          }
        </p>
      </CardContent>
    </Card>
  );
}
