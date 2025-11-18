import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { userAPI, orderAPI, productAPI, shippingAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

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
  const [newAddress, setNewAddress] = useState({ governateId: '', areaId: '', description: '', title: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ title: 'Please login', description: 'You need to login to checkout' });
      navigate('/login');
      return;
    }
    // load addresses and shipping options
    const load = async () => {
      try {
        const addrRes = await userAPI.getAddresses();
        if (addrRes && addrRes.addresses) setAddresses(addrRes.addresses);
        const shipRes = await shippingAPI.getShippingOptions();
        if (shipRes && shipRes.shippingOptions) setShippingOptions(shipRes.shippingOptions);
      } catch (err) {
        // ignore
      }
    };
    load();
  }, [isAuthenticated, navigate]);

  const handleAddAddress = async () => {
    if (!newAddress.governateId || !newAddress.areaId || !newAddress.description) {
      toast({ title: 'Missing fields', description: 'Please fill governate, area and description', variant: 'destructive' });
      return;
    }
    try {
      const res = await userAPI.addAddress({
        governateId: newAddress.governateId,
        areaId: newAddress.areaId,
        description: newAddress.description,
        title: newAddress.title,
      });
      if (res && res.address) {
        setAddresses(prev => [res.address, ...prev]);
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
        clearCart();
        toast({ title: 'Order placed', description: `Order ID: ${res.order?.orderId || res.order?.id || ''}` });
        navigate('/orders');
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
                <Input placeholder="Governate ID" value={newAddress.governateId} onChange={(e)=>setNewAddress({...newAddress, governateId: e.target.value})} />
                <Input placeholder="Area ID" value={newAddress.areaId} onChange={(e)=>setNewAddress({...newAddress, areaId: e.target.value})} />
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
                <Button className="w-full" onClick={handlePlaceOrder} disabled={loading}>{loading ? 'Processing...' : 'Place Order'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
