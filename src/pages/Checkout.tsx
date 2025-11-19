import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { userAPI, orderAPI, productAPI, shippingAPI, marketAPI, areaAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ title: 'Please login', description: 'You need to login to checkout' });
      navigate('/login');
      return;
    }
    // load addresses, shipping options and governates
    const load = async () => {
      try {
        const addrRes = await userAPI.getAddresses();
        if (addrRes && addrRes.addresses) setAddresses(addrRes.addresses);
        const shipRes = await shippingAPI.getShippingOptions();
        if (shipRes && shipRes.shippingOptions) setShippingOptions(shipRes.shippingOptions);
        // load governates (markets)
        try {
          const govRes = await marketAPI.getMarkets({ lang: 'en' });
          // marketAPI returns { success: true, data: [...] }
          const g = (govRes && (govRes.data || govRes)) || [];
          setGovernates(Array.isArray(g) ? g : []);
        } catch (e) {
          setGovernates([]);
        }
      } catch (err) {
        // ignore
      }
    };
    load();
  }, [isAuthenticated, navigate]);

  const handleAddAddress = async () => {
    // Area can be optional. Require governate, description and type.
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
        // attach selected names so UI can show them immediately
        const gov = governates.find(g => String(g.id) === String(newAddress.governateId));
        const area = areas.find(a => String(a.id) === String(newAddress.areaId));
        const enriched = { ...res.address, governateName: gov?.name || gov?.title || '', areaName: area ? (area?.title || area?.name || '') : '' };
        setAddresses(prev => [enriched, ...prev]);
        setNewAddress({ governateId: '', areaId: '', description: '', title: '' });
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

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!selectedAddress) { toast({ title: 'Select address', variant: 'destructive' }); return; }
    if (!selectedShippingOption) { toast({ title: 'Select shipping option', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      // resolve color/size ids by fetching product details when needed
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
        products: productsPayload,
      };

      const res = await orderAPI.createOrder(orderRequest as any);
      if (res && res.success) {
        // clear cart immediately
        clearCart();
        // show a localized success dialog with celebratory icon, then redirect home
        setOrderSuccessOpen(true);
        setTimeout(() => {
          setOrderSuccessOpen(false);
          navigate('/');
        }, 2200);
      } else {
        throw new Error(res.message || 'Failed to create order');
      }
    } catch (err: any) {
      toast({ title: 'Checkout failed', description: err.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent>
              <h2 className="font-semibold mb-3">Select Delivery Address</h2>
              {addresses.length === 0 && <p className="text-muted-foreground">No addresses found. Add one below.</p>}
              <div className="space-y-2">
                {addresses.map(a => (
                  <div key={a.id} className={`p-3 border rounded ${selectedAddress === a.id ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{a.title || 'Address'}</div>
                        <div className="text-sm text-muted-foreground">{a.description}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => setSelectedAddress(a.id)} className="text-primary">Select</button>
                        <button onClick={() => handleDeleteAddress(a.id)} className="text-destructive">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-semibold mb-3">Add New Address</h2>
              <div className="grid grid-cols-1 gap-2">
                <select value={newAddress.governateId} onChange={async (e) => {
                  const govId = e.target.value;
                  setNewAddress({...newAddress, governateId: govId, areaId: ''});
                  // fetch areas (categories) for this governate
                  if (govId) {
                    try {
                      // prefer dedicated areas endpoint
                      const areasRes = await areaAPI.getAreas(govId, 'en');
                      const list = (areasRes && (areasRes.data || areasRes)) || [];
                      setAreas(Array.isArray(list) ? list : []);
                    } catch (err) {
                      setAreas([]);
                    }
                  } else {
                    setAreas([]);
                  }
                }} className="border p-2 rounded bg-white text-black">
                  <option value="">Select Governate</option>
                  {governates.map(g => (
                    <option key={g.id} value={g.id} className="text-black">{g.name || g.title}</option>
                  ))}
                </select>

                <select value={newAddress.areaId} onChange={(e)=>setNewAddress({...newAddress, areaId: e.target.value})} className="border p-2 rounded bg-white text-black">
                  <option value="">Select Area</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id} className="text-black">{a.title || a.name || a.nameAr}</option>
                  ))}
                </select>
                
                <select value={newAddress.type} onChange={(e)=>setNewAddress({...newAddress, type: e.target.value})} className="border p-2 rounded bg-white text-black">
                  <option value="home">Home</option>
                  <option value="hotel">Hotel</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="work">Work</option>
                </select>
                <Input placeholder="Title (optional)" value={newAddress.title} onChange={(e)=>setNewAddress({...newAddress, title: e.target.value})} />
                <Input placeholder="Description" value={newAddress.description} onChange={(e)=>setNewAddress({...newAddress, description: e.target.value})} />
                <div className="flex gap-2">
                  <Button onClick={handleAddAddress}>Add Address</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent>
              <h2 className="font-semibold mb-3">Shipping</h2>
              <div className="space-y-2 mb-4">
                {shippingOptions.map((opt:any)=> (
                  <div key={opt.id} className={`p-2 border rounded ${selectedShippingOption === opt.id ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{opt.name}</div>
                        <div className="text-sm text-muted-foreground">{opt.price} {opt.currency}</div>
                      </div>
                      <div>
                        <input type="radio" name="shipping" checked={selectedShippingOption === opt.id} onChange={()=>setSelectedShippingOption(opt.id)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold mb-2">Delivery Type</h3>
              <div className="flex flex-col gap-2 mb-4">
                <label className={`p-2 border rounded ${shippingMethod === 'standard' ? 'border-primary bg-primary/5' : ''}`}>
                  <input type="radio" name="method" checked={shippingMethod === 'standard'} onChange={()=>setShippingMethod('standard')} /> Standard
                </label>
                <label className={`p-2 border rounded ${shippingMethod === 'express' ? 'border-primary bg-primary/5' : ''}`}>
                  <input type="radio" name="method" checked={shippingMethod === 'express'} onChange={()=>setShippingMethod('express')} /> Express
                </label>
              </div>

              <div className="border-t pt-4">
                <Button className="w-full" onClick={handlePlaceOrder} disabled={loading}>{loading ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (language === 'ar' ? 'إتمام الطلب' : 'Place Order')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Order success dialog */}
      <Dialog open={orderSuccessOpen} onOpenChange={setOrderSuccessOpen}>
        <DialogContent className="sm:max-w-md p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl">{language === 'ar' ? '🎉 تم إرسال الطلب' : '🎉 Order Placed'}</DialogTitle>
            <DialogDescription className="mt-2">
              {language === 'ar'
                ? 'تم استلام طلبك بنجاح. سنقوم بمعالجته قريباً.'
                : 'Your order was received successfully. We will process it shortly.'}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
