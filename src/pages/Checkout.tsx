import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { userAPI, orderAPI, productAPI, shippingAPI, marketAPI, areaAPI, loyaltyAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X, Gift } from 'lucide-react';

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard'|'express'>('standard');
  const [newAddress, setNewAddress] = useState({ governateId: '', areaId: '', description: '', title: '', type: 'home' });
  const [governates, setGovernates] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string } | null>(null);
  const [orderResultOpen, setOrderResultOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loyaltyLoadingDone, setLoyaltyLoadingDone] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ title: 'Please login', description: 'You need to login to checkout' });
      navigate('/login');
      return;
    }
    const load = async () => {
      try {
        const addrRes = await userAPI.getAddresses();
        if (addrRes && addrRes.addresses) setAddresses(addrRes.addresses);
        const shipRes = await shippingAPI.getShippingOptions();
        if (shipRes && shipRes.shippingOptions) setShippingOptions(shipRes.shippingOptions);
        try {
          const govRes = await marketAPI.getMarkets({ lang: language });
          const g = (govRes && (govRes.data || govRes)) || [];
          setGovernates(Array.isArray(g) ? g : []);
        } catch (e) {
          console.error("[v0] Market fetch error:", e);
          setGovernates([]);
        }
        
        try {
          const loyaltyRes = await loyaltyAPI.getProfile(language);
          if (loyaltyRes && loyaltyRes.profile) {
            setUserPoints(loyaltyRes.profile.currentPoints || 0);
          } else if (loyaltyRes && loyaltyRes.currentPoints) {
            setUserPoints(loyaltyRes.currentPoints);
          }
        } catch (e) {
          console.error("[v0] Loyalty load error:", e);
          setUserPoints(0);
        }
        
        setLoyaltyLoadingDone(true);
      } catch (err) {
        console.error("[v0] Checkout load error:", err);
        setLoyaltyLoadingDone(true);
      }
    };
    load();
  }, [isAuthenticated, navigate, language]);

  const handleAddAddress = async () => {
    if (!newAddress.governateId || !newAddress.description || !newAddress.type) {
      toast({ title: 'Missing fields', description: 'Please fill governate, type and description', variant: 'destructive' });
      return;
    }
    try {
      const res = await userAPI.addAddress({
        governateId: newAddress.governateId,
        areaId: newAddress.areaId,
        description: newAddress.description,
        title: newAddress.title,
        type: newAddress.type,
      });
      if (res && res.address) {
        const gov = governates.find(g => String(g.id) === String(newAddress.governateId));
        const area = areas.find(a => String(a.id) === String(newAddress.areaId));
        const enriched = { ...res.address, governateName: gov?.name || gov?.title || '', areaName: area ? (area?.title || area?.name || '') : '' };
        setAddresses(prev => [enriched, ...prev]);
        setNewAddress({ governateId: '', areaId: '', description: '', title: '', type: 'home' });
        toast({ title: 'Address added' });
      }
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message || 'Could not add address', variant: 'destructive' });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await userAPI.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      if (selectedAddress === id) setSelectedAddress(null);
      toast({ title: 'Address deleted' });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message || 'Could not delete address', variant: 'destructive' });
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingPrice = shippingOptions.find(o => o.id === selectedShippingOption)?.price || 0;
    const discount = useLoyaltyPoints ? loyaltyDiscount : 0;
    return Math.max(0, subtotal + shippingPrice - discount);
  };

  const handleToggleLoyaltyPoints = (enabled: boolean) => {
    if (enabled && userPoints > 0) {
      const maxDiscount = (userPoints / 50) * 2500;
      const subtotal = calculateSubtotal();
      const actualDiscount = Math.min(maxDiscount, subtotal);
      setLoyaltyDiscount(actualDiscount);
      setUseLoyaltyPoints(true);
    } else {
      setUseLoyaltyPoints(false);
      setLoyaltyDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!selectedAddress) { toast({ title: 'Select address', variant: 'destructive' }); return; }
    if (!selectedShippingOption) { toast({ title: 'Select shipping option', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const productsPayload: any[] = [];
      for (const item of items) {
        const prodRes = await productAPI.getProductById(item.id);
        const prod = prodRes.success ? prodRes.data : null;
        let colorId = null;
        let sizeId = null;
        if (prod) {
          if (item.color) {
            const found = (prod.colors || []).find((c: any) => c.name === item.color || c.nameAr === item.color || c.hex === item.color);
            if (found) colorId = found.id;
          }
          if (item.size) {
            const foundS = (prod.sizes || []).find((s: any) => s.name === item.size || s.nameAr === item.size);
            if (foundS) sizeId = foundS.id;
          }
        }
        productsPayload.push({ productId: item.id, quantity: item.quantity, colorId, sizeId, price: item.price });
      }

      const storeId = items[0].storeId;
      const orderRequest = {
        storeId,
        locationId: selectedAddress,
        paymentMethod: 'cash',
        shippingMethod: shippingMethod,
        shippingOptionId: selectedShippingOption,
        type: 'delivery',
        loyaltyPointsUsed: useLoyaltyPoints ? Math.ceil((loyaltyDiscount / 2500) * 50) : 0,
        products: productsPayload,
      };

      const res = await orderAPI.createOrder(orderRequest as any);
      if (res && res.success) {
        clearCart();
        setOrderResult({ success: true, message: language === 'ar' ? 'تم تقديم طلبك بنجاح!' : 'Order placed successfully!' });
        setOrderResultOpen(true);
        
        setTimeout(() => {
          setOrderResultOpen(false);
          navigate('/');
        }, 3000);
      } else {
        throw new Error(res.message || 'Failed to create order');
      }
    } catch (err: any) {
      setOrderResult({ success: false, message: err.message || 'Failed to place order. Please try again.' });
      setOrderResultOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">{language === 'ar' ? 'إتمام الطلب' : 'Checkout'}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{language === 'ar' ? 'اختر عنوان التسليم' : 'Select Delivery Address'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{language === 'ar' ? 'لم يتم العثور على عناوين. أضف واحداً أدناه.' : 'No addresses found. Add one below.'}</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map(a => (
                    <div key={a.id} className={`p-4 border rounded-lg transition-all ${selectedAddress === a.id ? 'border-primary bg-primary/5 shadow-md' : 'hover:border-primary/50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{a.title || 'Address'}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{a.governateName} {a.areaName ? `- ${a.areaName}` : ''}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Button 
                            variant={selectedAddress === a.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedAddress(a.id)}
                          >
                            {selectedAddress === a.id ? 'Selected' : 'Select'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAddress(a.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="mb-2 block">{language === 'ar' ? 'المحافظة' : 'Governorate'}</Label>
                  <select 
                    value={newAddress.governateId} 
                    onChange={async (e) => {
                      const govId = e.target.value;
                      setNewAddress({...newAddress, governateId: govId, areaId: ''});
                      if (govId) {
                        try {
                          const areasRes = await areaAPI.getAreas(govId, language);
                          const list = (areasRes?.data) || [];
                          setAreas(Array.isArray(list) ? list : []);
                        } catch (err) {
                          console.error("[v0] Area fetch error:", err);
                          setAreas([]);
                        }
                      } else {
                        setAreas([]);
                      }
                    }} 
                    className="w-full border rounded-md p-2 bg-background"
                  >
                    <option value="">{language === 'ar' ? 'اختر محافظة' : 'Select Governorate'}</option>
                    {governates.map(g => (
                      <option key={g.id} value={g.id}>{g.name || g.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="mb-2 block">{language === 'ar' ? 'المنطقة' : 'Area'}</Label>
                  <select 
                    value={newAddress.areaId} 
                    onChange={(e)=>setNewAddress({...newAddress, areaId: e.target.value})} 
                    disabled={areas.length === 0}
                    className="w-full border rounded-md p-2 bg-background disabled:opacity-50"
                  >
                    <option value="">{language === 'ar' ? 'اختر منطقة (اختياري)' : 'Select Area (Optional)'}</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.name || a.title || a.nameAr}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label className="mb-2 block">{language === 'ar' ? 'نوع العنوان' : 'Address Type'}</Label>
                  <select value={newAddress.type} onChange={(e)=>setNewAddress({...newAddress, type: e.target.value})} className="w-full border rounded-md p-2 bg-background">
                    <option value="home">{language === 'ar' ? 'منزل' : 'Home'}</option>
                    <option value="hotel">{language === 'ar' ? 'فندق' : 'Hotel'}</option>
                    <option value="restaurant">{language === 'ar' ? 'مطعم' : 'Restaurant'}</option>
                    <option value="work">{language === 'ar' ? 'عمل' : 'Work'}</option>
                  </select>
                </div>

                <Input 
                  placeholder={language === 'ar' ? 'العنوان (اختياري)' : 'Title (Optional)'} 
                  value={newAddress.title} 
                  onChange={(e)=>setNewAddress({...newAddress, title: e.target.value})} 
                />
                <Input 
                  placeholder={language === 'ar' ? 'الوصف' : 'Description'} 
                  value={newAddress.description} 
                  onChange={(e)=>setNewAddress({...newAddress, description: e.target.value})} 
                />
                <Button onClick={handleAddAddress} className="w-full">{language === 'ar' ? 'إضافة عنوان' : 'Add Address'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الملخص' : 'Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loyaltyLoadingDone && userPoints > 0 && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <p className="font-semibold text-sm">{language === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{language === 'ar' ? 'لديك' : 'You have'} <span className="font-bold text-amber-700">{userPoints}</span> pts</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useLoyaltyPoints}
                      onChange={(e) => handleToggleLoyaltyPoints(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-xs">{language === 'ar' ? 'استخدم النقاط (-2500 ل.س)' : 'Use points (-2500 S.Y.P)'}</span>
                  </label>
                </div>
              )}

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{calculateSubtotal().toFixed(2)} S.Y.P</span>
                </div>
                {useLoyaltyPoints && loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{language === 'ar' ? 'خصم الولاء' : 'Loyalty Discount'}</span>
                    <span>-{loyaltyDiscount.toFixed(2)} S.Y.P</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">{language === 'ar' ? 'خيارات الشحن' : 'Shipping Options'}</Label>
                {shippingOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'لا توجد خيارات شحن متاحة' : 'No shipping options available'}</p>
                ) : (
                  <div className="space-y-2">
                    {shippingOptions.map((opt:any)=> (
                      <div key={opt.id} className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedShippingOption === opt.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`} onClick={() => setSelectedShippingOption(opt.id)}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{opt.name}</p>
                            <p className="text-sm text-muted-foreground">{opt.price} {opt.currency}</p>
                          </div>
                          <input type="radio" name="shipping" checked={selectedShippingOption === opt.id} readOnly />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">{language === 'ar' ? 'نوع التسليم' : 'Delivery Type'}</Label>
                <div className="space-y-2">
                  <label className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center ${shippingMethod === 'standard' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                    <input type="radio" name="method" checked={shippingMethod === 'standard'} onChange={()=>setShippingMethod('standard')} className="mr-3" /> 
                    <span>{language === 'ar' ? 'عادي' : 'Standard'}</span>
                  </label>
                  <label className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center ${shippingMethod === 'express' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                    <input type="radio" name="method" checked={shippingMethod === 'express'} onChange={()=>setShippingMethod('express')} className="mr-3" /> 
                    <span>{language === 'ar' ? 'سريع' : 'Express'}</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span>{calculateTotal().toFixed(2)} S.Y.P</span>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-base" 
                onClick={handlePlaceOrder} 
                disabled={loading || items.length === 0}
              >
                {loading ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (language === 'ar' ? 'إتمام الطلب' : 'Place Order')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={orderResultOpen} onOpenChange={setOrderResultOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className={`p-8 text-center ${orderResult?.success ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${orderResult?.success ? 'bg-green-100' : 'bg-red-100'}`}>
              {orderResult?.success ? (
                <Check className="w-8 h-8 text-green-600" />
              ) : (
                <X className="w-8 h-8 text-red-600" />
              )}
            </div>
            <DialogTitle className={`text-2xl font-bold mb-2 ${orderResult?.success ? 'text-green-900' : 'text-red-900'}`}>
              {orderResult?.success ? (language === 'ar' ? 'تم بنجاح!' : 'Success!') : (language === 'ar' ? 'خطأ' : 'Error')}
            </DialogTitle>
            <DialogDescription className={orderResult?.success ? 'text-green-700' : 'text-red-700'}>
              {orderResult?.message}
            </DialogDescription>
            {!orderResult?.success && (
              <Button 
                onClick={() => setOrderResultOpen(false)}
                className="mt-4 w-full"
              >
                {language === 'ar' ? 'حسناً' : 'OK'}
              </Button>
            )}
            {orderResult?.success && (
              <p className="text-sm text-muted-foreground mt-4">
                {language === 'ar' ? 'سيتم إعادة التوجيه قريباً...' : 'Redirecting shortly...'}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
