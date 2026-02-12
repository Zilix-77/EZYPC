import React, { useMemo } from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewsSectionProps {
    reviews: Review[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
    const averageRating = useMemo(() => {
        if (!reviews || reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return parseFloat((total / reviews.length).toFixed(1));
    }, [reviews]);
    
    if (!reviews || reviews.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface mb-6">Reviews & Ratings</h2>
                <div className="text-center bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 rounded-xl p-8">
                    <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">No reviews available for this product yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface mb-6">Reviews & Ratings</h2>
            <div className="bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 rounded-xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-center">
                    <p className="text-5xl font-bold text-primary">{averageRating.toFixed(1)}</p>
                    <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">out of 5</p>
                </div>
                <div className="sm:ml-4">
                    <StarRating rating={averageRating} className="h-8 w-8" />
                    <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">Based on {reviews.length} reviews</p>
                </div>
            </div>
            <div className="space-y-4">
                {reviews.map((review, index) => (
                    <div key={index} className="bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <p className="font-bold text-on-surface dark:text-dark-on-surface">{review.author}</p>
                                <span className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full">{review.source}</span>
                            </div>
                            <StarRating rating={review.rating} />
                        </div>
                        <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">{review.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default ReviewsSection;