import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Package, Award, Users, Target, Heart, Shield, Zap } from "lucide-react";
import { AppDownload } from "@/components/AppDownload";

const About = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Store, label: "Markets", value: "50+", color: "text-primary" },
    { icon: Users, label: "Stores", value: "500+", color: "text-accent" },
    { icon: Package, label: "Products", value: "10,000+", color: "text-success" },
    { icon: Award, label: "Happy Customers", value: "50,000+", color: "text-warning" },
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To revolutionize e-commerce in Syria by connecting local markets with customers nationwide",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "We prioritize your satisfaction with exceptional service and quality products",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Secure transactions and verified sellers for your peace of mind",
      color: "bg-success/10 text-success"
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "Quick delivery and efficient service across all Syrian markets",
      color: "bg-warning/10 text-warning"
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="gradient-hero text-primary-foreground py-20 mb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("aboutUs")}</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
            منصة التجارة الإلكترونية الرائدة في سوريا - نربط المتسوقين بآلاف المنتجات من الأسواق في جميع أنحاء البلاد
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Icon className={`h-12 w-12 mx-auto mb-4 ${stat.color}`} />
                  <p className="text-3xl font-bold mb-2 text-gradient">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">قصتنا</h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              في GoGet، نؤمن بقوة التجارة المحلية والابتكار الرقمي. بدأنا رحلتنا بهدف واحد: 
              جعل التسوق عبر الإنترنت سهلاً وآمناً وممتعاً لكل سوري.
            </p>
            <p>
              نحن نجمع أفضل الأسواق والمتاجر والمنتجات من جميع أنحاء سوريا في منصة واحدة موحدة، 
              مما يوفر لك الوقت والجهد ويضمن لك الحصول على أفضل العروض والمنتجات عالية الجودة.
            </p>
            <p>
              مع ميزات مثل البحث المتقدم، المعاملات الآمنة، برنامج الولاء، والتوصيات الشخصية، 
              نجعل تجربة التسوق الخاصة بك سلسة قدر الإمكان.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">قيمنا الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-lg mb-4 ${value.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* App Download Section */}
        <div className="mb-16">
          <AppDownload />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                انضم إلى عائلة GoGet اليوم
              </h2>
              <p className="text-lg mb-6 opacity-90">
                اكتشف آلاف المنتجات واحصل على عروض حصرية ونقاط مكافآت
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/register" 
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
                >
                  ابدأ التسوق الآن
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                >
                  اتصل بنا
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
