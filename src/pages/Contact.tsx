import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "تم إرسال الرسالة!",
        description: "سنتواصل معك في أقرب وقت ممكن.",
      });
      setName("");
      setEmail("");
      setMessage("");
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "البريد الإلكتروني",
      value: "info@goget.sy",
      link: "mailto:info@goget.sy",
    },
    {
      icon: Phone,
      label: "الهاتف",
      value: "+963 11 123 4567",
      link: "tel:+963111234567",
    },
    {
      icon: MessageSquare,
      label: "واتساب",
      value: "+963 987 654 321",
      link: "https://wa.me/963987654321",
    },
    {
      icon: MapPin,
      label: "العنوان",
      value: "دمشق، سوريا",
      link: null,
    },
  ];

  const faqs = [
    {
      question: "كيف يمكنني إنشاء حساب؟",
      answer: "يمكنك إنشاء حساب بالنقر على زر 'التسجيل' في أعلى الصفحة، ثم ملء النموذج بمعلوماتك الشخصية. ستحتاج إلى تأكيد بريدك الإلكتروني لإكمال عملية التسجيل."
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقبل الدفع عند الاستلام، البطاقات الائتمانية (Visa, MasterCard)، والمحافظ الإلكترونية. جميع المعاملات آمنة ومشفرة."
    },
    {
      question: "كم من الوقت يستغرق التوصيل؟",
      answer: "عادة ما يستغرق التوصيل من 2-5 أيام عمل حسب موقعك. يمكنك تتبع طلبك في أي وقت من خلال صفحة 'طلباتي'."
    },
    {
      question: "هل يمكنني إرجاع أو استبدال المنتجات؟",
      answer: "نعم، لديك 14 يوماً من تاريخ الاستلام لإرجاع أو استبدال المنتجات. يجب أن تكون المنتجات في حالتها الأصلية مع العبوة الكاملة."
    },
    {
      question: "كيف أحصل على نقاط المكافآت؟",
      answer: "تحصل على نقاط مكافآت مع كل عملية شراء. يمكنك استخدام هذه النقاط للحصول على خصومات على مشترياتك المستقبلية. كل 100 نقطة = 1000 ليرة سورية."
    },
    {
      question: "هل هناك رسوم توصيل؟",
      answer: "رسوم التوصيل تختلف حسب الموقع والطلب. الطلبات فوق 50,000 ليرة سورية تحصل على توصيل مجاني في معظم المناطق."
    },
    {
      question: "كيف يمكنني تتبع طلبي؟",
      answer: "بعد تأكيد الطلب، ستتلقى رقم تتبع عبر البريد الإلكتروني والرسائل القصيرة. يمكنك استخدام هذا الرقم في صفحة 'طلباتي' لمتابعة حالة طلبك."
    },
    {
      question: "ماذا أفعل إذا استلمت منتجاً تالفاً؟",
      answer: "إذا استلمت منتجاً تالفاً أو معيباً، يرجى الاتصال بخدمة العملاء خلال 48 ساعة من الاستلام. سنقوم باستبدال المنتج أو إرجاع المبلغ كاملاً."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("contactUs")}</h1>
          <p className="text-lg text-muted-foreground">
            هل لديك سؤال؟ نحن هنا للمساعدة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسمك"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">الرسالة</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">معلومات الاتصال</h2>
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <Card key={info.label} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{info.label}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">{info.value}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Working Hours */}
            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-3">ساعات العمل</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>السبت - الخميس:</span>
                    <span className="font-semibold">9:00 ص - 8:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجمعة:</span>
                    <span className="font-semibold">مغلق</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">الأسئلة الشائعة</h2>
            <p className="text-muted-foreground">
              إجابات على الأسئلة الأكثر شيوعاً
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-right hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-right">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Still have questions CTA */}
          <div className="mt-8 text-center">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">لم تجد إجابة لسؤالك؟</h3>
                <p className="text-muted-foreground mb-4">
                  فريق الدعم لدينا جاهز لمساعدتك
                </p>
                <Button className="gradient-primary" size="lg">
                  تواصل مع الدعم
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
