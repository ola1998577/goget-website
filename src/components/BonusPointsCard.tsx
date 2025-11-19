import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Users, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BonusPointTask {
  id: string;
  type: 'review' | 'referral' | 'profile' | 'notification';
  title: string;
  description: string;
  points: number;
  completed: boolean;
  icon: any;
}

export default function BonusPointsCard({ language, onPointsEarned }: { language: string; onPointsEarned?: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const translations = {
    en: {
      bonusPoints: 'Earn Bonus Points',
      completeTasksToEarn: 'Complete tasks to earn extra points',
      reviewProduct: 'Review a Product',
      leaveProductReview: 'Leave a review on any product',
      inviteFriend: 'Invite a Friend',
      shareLoyaltyCode: 'Share your loyalty code with friends',
      completeProfile: 'Complete Your Profile',
      fillAllProfileFields: 'Fill in all your profile information',
      enableNotifications: 'Enable Notifications',
      getAlertsAboutOffers: 'Receive alerts about special offers',
      claimed: 'Claimed',
      claim: 'Claim',
      points: 'points',
      claimed_tooltip: 'You already earned these points',
    },
    ar: {
      bonusPoints: 'اكسب نقاطاً إضافية',
      completeTasksToEarn: 'أكمل المهام لكسب نقاط إضافية',
      reviewProduct: 'تقييم منتج',
      leaveProductReview: 'اترك تقييماً على أي منتج',
      inviteFriend: 'دعوة صديق',
      shareLoyaltyCode: 'شارك كود الولاء مع أصدقائك',
      completeProfile: 'أكمل ملفك الشخصي',
      fillAllProfileFields: 'ملأ جميع معلومات ملفك الشخصي',
      enableNotifications: 'تفعيل الإشعارات',
      getAlertsAboutOffers: 'احصل على تنبيهات حول العروض الخاصة',
      claimed: 'تم المطالبة',
      claim: 'المطالبة',
      points: 'نقاط',
      claimed_tooltip: 'لقد حصلت على هذه النقاط بالفعل',
    }
  };

  const t = translations[language as keyof typeof translations];
  const icons = { review: Star, referral: Users, profile: FileText, notification: MessageSquare };

  const bonusTasks: BonusPointTask[] = [
    {
      id: 'review',
      type: 'review',
      title: t.reviewProduct,
      description: t.leaveProductReview,
      points: 10,
      completed: false,
      icon: icons.review,
    },
    {
      id: 'referral',
      type: 'referral',
      title: t.inviteFriend,
      description: t.shareLoyaltyCode,
      points: 25,
      completed: false,
      icon: icons.referral,
    },
    {
      id: 'profile',
      type: 'profile',
      title: t.completeProfile,
      description: t.fillAllProfileFields,
      points: 15,
      completed: false,
      icon: icons.profile,
    },
    {
      id: 'notification',
      type: 'notification',
      title: t.enableNotifications,
      description: t.getAlertsAboutOffers,
      points: 5,
      completed: false,
      icon: icons.notification,
    },
  ];

  const handleClaimBonus = async (taskId: string, points: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // This would call a backend endpoint to record bonus points
      // For now, we'll show success
      toast({
        title: "Success",
        description: `+${points} points earned!`,
        duration: 3000,
      });

      if (onPointsEarned) {
        onPointsEarned();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to claim bonus points",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-blue-900">{t.bonusPoints}</CardTitle>
        <p className="text-sm text-gray-600 mt-1">{t.completeTasksToEarn}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bonusTasks.map((task) => {
            const IconComponent = task.icon;
            return (
              <div key={task.id} className="p-3 bg-white rounded-lg border border-blue-100 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{task.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className="bg-blue-500 text-xs">+{task.points} {t.points}</Badge>
                      <Button 
                        size="xs" 
                        disabled={task.completed || loading}
                        onClick={() => handleClaimBonus(task.id, task.points)}
                        className="text-xs h-6"
                        variant={task.completed ? "outline" : "default"}
                      >
                        {task.completed ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {t.claimed}
                          </span>
                        ) : (
                          t.claim
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
