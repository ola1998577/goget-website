import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

export default function RewardsList({ rewards, language, profile }) {
  const [claiming, setClaiming] = useState<string | null>(null);

  const handleClaimReward = async (rewardId: string) => {
    try {
      setClaiming(rewardId);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/loyalty/claim-reward`,
        { rewardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh page or update state
      window.location.reload();
    } catch (error) {
      console.error('Failed to claim reward:', error);
      setClaiming(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rewards.map((reward) => (
        <Card key={reward.id} className="border-amber-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="text-amber-500" size={20} />
              {reward.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {language === 'ar' ? 'النقاط المطلوبة' : 'Points Required'}:
                </span>
                <span className="font-bold text-amber-600">{reward.pointsRequired}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {language === 'ar' ? 'الخصم' : 'Discount'}:
                </span>
                <span className="font-bold text-green-600">{reward.discountAmount} S.Y.P</span>
              </div>
              <Button
                onClick={() => handleClaimReward(reward.id)}
                disabled={!reward.available || claiming === reward.id}
                className={`w-full ${
                  reward.available
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {claiming === reward.id
                  ? (language === 'ar' ? 'جاري...' : 'Claiming...')
                  : reward.available
                  ? (language === 'ar' ? 'المطالبة بالمكافأة' : 'Claim Reward')
                  : (language === 'ar' ? 'نقاط غير كافية' : 'Not Enough Points')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
