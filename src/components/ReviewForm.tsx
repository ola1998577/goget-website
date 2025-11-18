import { useState } from "react";
import { Star, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmitted?: () => void;
}

export const ReviewForm = ({ productId, productName, onSubmitted }: ReviewFormProps) => {
  const { language, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يمكنك رفع 5 صور كحد أقصى' : 'You can upload maximum 5 images',
        variant: 'destructive',
      });
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required',
        description: language === 'ar' ? 'يجب تسجيل الدخول لكتابة مراجعة' : 'You need to login to write a review',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى تحديد التقييم' : 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend expects { productId, rating, review }
      const payload = {
        productId,
        rating,
        review: `${title}\n\n${comment}`,
      };

      const res = await (await import('@/lib/api')).reviewAPI.addReview(payload as any);

      toast({
        title: language === 'ar' ? 'شكراً لك!' : 'Thank you!',
        description: language === 'ar' ? 'تم إضافة مراجعتك بنجاح' : 'Your review has been submitted successfully',
      });

      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setImages([]);
      setImagePreviews([]);

      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      const message = err?.message || (err?.error) || 'Failed to submit review';
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">
            {language === 'ar' ? 'يجب تسجيل الدخول لكتابة مراجعة' : 'Please login to write a review'}
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            {t('login')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'ar' ? 'اكتب مراجعتك' : 'Write Your Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>{language === 'ar' ? 'التقييم' : 'Rating'} *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {language === 'ar' ? 'عنوان المراجعة' : 'Review Title'} *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: منتج رائع وعالي الجودة' : 'Example: Great product with high quality'}
              required
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              {language === 'ar' ? 'تعليقك' : 'Your Comment'} *
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={language === 'ar' 
                ? 'شارك تجربتك مع المنتج...' 
                : 'Share your experience with this product...'}
              required
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </p>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>
              {language === 'ar' ? 'إضافة صور (اختياري)' : 'Add Photos (Optional)'}
            </Label>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border">
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary">
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">
                      {language === 'ar' ? 'رفع' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' 
                  ? `يمكنك رفع حتى 5 صور (${images.length}/5)`
                  : `You can upload up to 5 images (${images.length}/5)`}
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full gradient-primary"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? '...' 
              : language === 'ar' ? 'نشر المراجعة' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
