import { Smartphone, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AppDownload = () => {
  const handleDownloadAndroid = () => {
    // Replace with actual Android app download link
    window.open("#", "_blank");
  };

  const handleDownloadIOS = () => {
    // Replace with actual iOS app download link
    window.open("#", "_blank");
  };

  return (
    <section className="container mx-auto px-4 mb-16">
      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg backdrop-blur-sm border border-primary/20">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  حمّل التطبيق الآن
                </h2>
              </div>
              <p className="text-lg mb-6 text-muted-foreground">
                استمتع بتجربة تسوق أفضل وأسرع مع تطبيق GoGet على هاتفك المحمول. 
                تصفح آلاف المنتجات، احصل على إشعارات فورية للعروض الحصرية، وتتبع طلباتك بسهولة.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleDownloadAndroid}
                  size="lg"
                  className="bg-primary hover:bg-primary-dark font-semibold shadow-lg"
                >
                  <Download className="ml-2 h-5 w-5" />
                  تحميل للأندرويد
                </Button>
                <Button
                  onClick={handleDownloadIOS}
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary/30 hover:bg-primary/10 font-semibold"
                >
                  <Download className="ml-2 h-5 w-5" />
                  تحميل للآيفون
                </Button>
              </div>

              <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">مجاني بالكامل</p>
                  <p>بدون إعلانات</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">سريع وآمن</p>
                  <p>معاملات مشفرة</p>
                </div>
              </div>
            </div>

            {/* App Preview Image */}
            <div className="relative h-full min-h-[400px] bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm flex items-center justify-center p-8">
              <div className="relative">
                {/* Phone mockup */}
                <div className="w-64 h-[500px] bg-card/50 backdrop-blur-md rounded-[3rem] border-8 border-border/50 shadow-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Smartphone className="h-24 w-24 mx-auto text-primary" />
                    <div className="space-y-2">
                      <p className="font-semibold text-xl text-foreground">GoGet App</p>
                      <p className="text-sm text-muted-foreground">تجربة تسوق متكاملة</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
