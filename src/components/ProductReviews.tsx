import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, CheckCircle, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { Review } from "@/data/products";

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export const ProductReviews = ({ reviews, averageRating, totalReviews }: ProductReviewsProps) => {
  const { language } = useLanguage();
  const [votedReviews, setVotedReviews] = useState<Record<string, 'helpful' | 'not-helpful'>>({});
  const [expandedImages, setExpandedImages] = useState<string | null>(null);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const handleVote = (reviewId: string, type: 'helpful' | 'not-helpful') => {
    if (votedReviews[reviewId]) return;
    setVotedReviews(prev => ({ ...prev, [reviewId]: type }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SY' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {language === 'ar' ? 'التقييمات والمراجعات' : 'Reviews & Ratings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= averageRating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'بناءً على' : 'Based on'} {totalReviews} {language === 'ar' ? 'مراجعة' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  </div>
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={review.userImage} />
                  <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  {/* User Info & Rating */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.userName}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {language === 'ar' ? 'مشتري موثق' : 'Verified Purchase'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Title */}
                  <h4 className="font-semibold text-lg">
                    {language === 'ar' ? review.titleAr : review.title}
                  </h4>

                  {/* Review Comment */}
                  <p className="text-muted-foreground">
                    {language === 'ar' ? review.commentAr : review.comment}
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.images.map((image, idx) => (
                        <button
                          key={idx}
                          onClick={() => setExpandedImages(image)}
                          className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors group"
                        >
                          <img
                            src={image}
                            alt={`Review ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Helpful Votes */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'هل كانت هذه المراجعة مفيدة؟' : 'Was this review helpful?'}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={votedReviews[review.id] === 'helpful' ? 'default' : 'outline'}
                        onClick={() => handleVote(review.id, 'helpful')}
                        disabled={!!votedReviews[review.id]}
                        className="gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.helpful + (votedReviews[review.id] === 'helpful' ? 1 : 0)}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={votedReviews[review.id] === 'not-helpful' ? 'default' : 'outline'}
                        onClick={() => handleVote(review.id, 'not-helpful')}
                        disabled={!!votedReviews[review.id]}
                        className="gap-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{review.notHelpful + (votedReviews[review.id] === 'not-helpful' ? 1 : 0)}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expanded Image Modal */}
      {expandedImages && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpandedImages(null)}
        >
          <img
            src={expandedImages}
            alt="Expanded review"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};
