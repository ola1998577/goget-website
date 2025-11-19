import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LoyaltyPointsCard from '@/components/LoyaltyPointsCard';
import LoyaltyTiers from '@/components/LoyaltyTiers';
import RewardsList from '@/components/RewardsList';
import PointsHistory from '@/components/PointsHistory';
import BonusPointsCard from '../components/BonusPointsCard';

interface LoyaltyProfile {
  currentPoints: number;
  currentTier: {
    name: string;
    monthlyOrders: number;
  };
  rewards: any[];
  earnedRewards: any[];
  pointHistory: any[];
}

export default function Loyalty() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const translations = {
    en: {
      title: 'Loyalty Program',
      subtitle: 'Earn points with every purchase and unlock exclusive rewards',
      points: 'Your Points',
      currentTier: 'Current Tier',
      monthlyOrders: 'Monthly Orders',
      availableRewards: 'Available Rewards',
      claimReward: 'Claim Reward',
      pointsRequired: 'Points Required',
      earnedRewards: 'Your Rewards',
      pointsHistory: 'Points History',
      noRewards: 'No rewards available',
      noHistory: 'No points history',
    },
    ar: {
      title: 'برنامج الولاء',
      subtitle: 'اكسب نقاط مع كل عملية شراء وافتح مكافآت حصرية',
      points: 'نقاطك',
      currentTier: 'المستوى الحالي',
      monthlyOrders: 'الطلبات الشهرية',
      availableRewards: 'المكافآت المتاحة',
      claimReward: 'المطالبة بالمكافأة',
      pointsRequired: 'النقاط المطلوبة',
      earnedRewards: 'مكافآتك',
      pointsHistory: 'سجل النقاط',
      noRewards: 'لا توجد مكافآت متاحة',
      noHistory: 'لا يوجد سجل نقاط',
    }
  };

  const t = translations[language as keyof typeof translations];

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [profileRes, tiersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/loyalty/profile?lang=${language}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/loyalty/tiers?lang=${language}`)
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.profile);
      }

      if (tiersRes.data.success) {
        setTiers(tiersRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch loyalty data:', err);
      setError('Failed to load loyalty program data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, [language, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{error || 'Error'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Failed to load loyalty profile'}</p>
            <Button onClick={() => navigate('/login')} className="mt-4">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <LoyaltyPointsCard profile={profile} language={language} />
          <Card className="border-2 border-amber-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t.currentTier}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base px-3 py-1">
                    {profile.currentTier.name}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{t.monthlyOrders}: <span className="font-bold text-gray-900">{profile.currentTier.monthlyOrders}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bonus Points Card */}
        <div className="mb-8">
          <BonusPointsCard language={language} onPointsEarned={() => setRefreshKey(k => k + 1)} />
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border-b">
            <TabsTrigger value="rewards">{t.availableRewards}</TabsTrigger>
            <TabsTrigger value="earned">{t.earnedRewards}</TabsTrigger>
            <TabsTrigger value="history">{t.pointsHistory}</TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-4">
            {profile.rewards && profile.rewards.length > 0 ? (
              <RewardsList rewards={profile.rewards} language={language} profile={profile} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  {t.noRewards}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="earned" className="space-y-4">
            {profile.earnedRewards && profile.earnedRewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.earnedRewards.map((reward) => (
                  <Card key={reward.id} className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <Badge className={`w-fit ${reward.status === 'used' ? 'bg-green-500' : 'bg-blue-500'}`}>
                        {reward.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {reward.status === 'used' && reward.usedAt && (
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'استخدم في' : 'Used at'}: {new Date(reward.usedAt).toLocaleDateString()}
                        </p>
                      )}
                      {reward.expiresAt && (
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'ينتهي في' : 'Expires'}: {new Date(reward.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  {t.noRewards}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {profile.pointHistory && profile.pointHistory.length > 0 ? (
              <PointsHistory history={profile.pointHistory} language={language} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  {t.noHistory}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Tiers Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'ar' ? 'مستويات الولاء' : 'Loyalty Tiers'}
          </h2>
          <LoyaltyTiers tiers={tiers} language={language} />
        </div>
      </div>
    </div>
  );
}
