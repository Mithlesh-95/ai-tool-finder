// Reviews System JavaScript for AllAITool.tech
// Handles review display, submission, and interaction

class ReviewsSystem {
    constructor() {
        this.currentToolId = null;
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadReviews();
    }

    bindEvents() {
        // Write review button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('write-review-btn')) {
                this.openReviewForm(e.target.dataset.toolId);
            }

            // Close review form
            if (e.target.classList.contains('form-close-btn') || e.target.classList.contains('review-form-overlay')) {
                if (e.target === e.currentTarget) {
                    this.closeReviewForm();
                }
            }

            // Helpful buttons
            if (e.target.classList.contains('helpful-btn')) {
                this.toggleHelpful(e.target);
            }

            // Rating stars in form
            if (e.target.classList.contains('rating-star')) {
                this.setRating(e.target);
            }
        });

        // Filter and sort changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('review-filter')) {
                this.currentFilter = e.target.value;
                this.filterReviews();
            }

            if (e.target.classList.contains('review-sort')) {
                this.currentSort = e.target.value;
                this.sortReviews();
            }
        });

        // Form submission
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('review-submission-form')) {
                e.preventDefault();
                this.submitReview(e.target);
            }
        });
    }

    loadReviews() {
        // Load reviews for current page/tool
        const toolId = this.getToolIdFromPage();
        if (toolId && window.reviewsData && window.reviewsData[toolId]) {
            this.currentToolId = toolId;
            this.renderReviewsSection(window.reviewsData[toolId]);
        }
    }

    getToolIdFromPage() {
        // Extract tool ID from page URL or data attributes
        const path = window.location.pathname;
        if (path.includes('chatgpt')) return 'chatgpt';
        if (path.includes('canva')) return 'canva';
        if (path.includes('jasper')) return 'jasper';
        if (path.includes('midjourney')) return 'midjourney';
        return null;
    }

    renderReviewsSection(reviewData) {
        const container = document.getElementById('reviews-container') || this.createReviewsContainer();

        container.innerHTML = `
            <div class="reviews-section">
                <div class="reviews-header">
                    <div class="reviews-summary">
                        <div class="rating-overview">
                            <div class="rating-score">${reviewData.averageRating}</div>
                            <div class="rating-stars">
                                ${this.renderStars(reviewData.averageRating)}
                            </div>
                            <div class="rating-count">${reviewData.totalReviews} reviews</div>
                        </div>
                        <div class="rating-distribution">
                            ${this.renderRatingDistribution(reviewData.ratingDistribution, reviewData.totalReviews)}
                        </div>
                    </div>
                    <div class="review-actions">
                        <button class="write-review-btn" data-tool-id="${this.currentToolId}">
                            ✍️ Write a Review
                        </button>
                    </div>
                </div>
                
                <div class="review-filters">
                    <select class="filter-select review-filter">
                        <option value="all">All Reviews</option>
                        <option value="verified">Verified Only</option>
                        <option value="recent">Recent (30 days)</option>
                    </select>
                    <select class="filter-select review-sort">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest-rating">Highest Rating</option>
                        <option value="lowest-rating">Lowest Rating</option>
                        <option value="most-helpful">Most Helpful</option>
                    </select>
                </div>
                
                <div class="reviews-list" id="reviews-list">
                    ${this.renderReviewsList(reviewData.reviews)}
                </div>
            </div>
        `;
    }

    createReviewsContainer() {
        const container = document.createElement('div');
        container.id = 'reviews-container';

        // Find a good place to insert reviews (after tool description)
        const toolContent = document.querySelector('.tool-content, .blog-article, .main-content');
        if (toolContent) {
            toolContent.appendChild(container);
        } else {
            document.body.appendChild(container);
        }

        return container;
    }

    renderStars(rating, interactive = false, size = 'normal') {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += `<span class="star ${interactive ? 'rating-star' : ''}" data-rating="${i + 1}">★</span>`;
        }

        // Half star
        if (hasHalfStar) {
            stars += `<span class="star half">★</span>`;
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += `<span class="star empty ${interactive ? 'rating-star' : ''}" data-rating="${fullStars + (hasHalfStar ? 1 : 0) + i + 1}">★</span>`;
        }

        return stars;
    }

    renderRatingDistribution(distribution, total) {
        let html = '';
        for (let rating = 5; rating >= 1; rating--) {
            const count = distribution[rating] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;

            html += `
                <div class="rating-bar">
                    <div class="rating-label">
                        <span>${rating}</span>
                        <span class="star">★</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="rating-bar-count">${count}</div>
                </div>
            `;
        }
        return html;
    }

    renderReviewsList(reviews) {
        if (!reviews || reviews.length === 0) {
            return '<div class="no-reviews">No reviews yet. Be the first to review this tool!</div>';
        }

        return reviews.map(review => this.renderReviewCard(review)).join('');
    }

    renderReviewCard(review) {
        const reviewDate = new Date(review.dateCreated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="review-card" data-review-id="${review.id}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            ${review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div class="reviewer-details">
                            <h4>${review.userName}</h4>
                            <p class="reviewer-role">${review.userRole}</p>
                            ${review.verified ? '<div class="verified-badge">✓ Verified User</div>' : ''}
                        </div>
                    </div>
                    <div class="review-meta">
                        <div>${reviewDate}</div>
                        ${review.toolVersion ? `<div>Using ${review.toolVersion}</div>` : ''}
                    </div>
                </div>
                
                <div class="review-rating">
                    ${this.renderStars(review.rating)}
                    <span class="rating-text">${review.rating}/5</span>
                </div>
                
                <h3 class="review-title">${review.title}</h3>
                <p class="review-content">${review.review}</p>
                
                ${review.pros && review.cons ? this.renderProsAndCons(review.pros, review.cons) : ''}
                
                <div class="review-tags">
                    <span class="review-tag">${review.useCase}</span>
                    ${review.toolVersion ? `<span class="review-tag">${review.toolVersion}</span>` : ''}
                </div>
                
                <div class="review-footer">
                    <div class="helpful-actions">
                        <button class="helpful-btn" data-review-id="${review.id}" data-action="helpful">
                            👍 Helpful (${review.helpful || 0})
                        </button>
                        <button class="helpful-btn" data-review-id="${review.id}" data-action="report">
                            🚩 Report
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderProsAndCons(pros, cons) {
        return `
            <div class="review-pros-cons">
                <div class="pros-list">
                    <div class="pros-cons-title pros">✅ Pros</div>
                    <ul class="pros-cons-list pros">
                        ${pros.map(pro => `<li>${pro}</li>`).join('')}
                    </ul>
                </div>
                <div class="cons-list">
                    <div class="pros-cons-title cons">❌ Cons</div>
                    <ul class="pros-cons-list cons">
                        ${cons.map(con => `<li>${con}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    openReviewForm(toolId) {
        const formHTML = `
            <div class="review-form-overlay">
                <div class="review-form">
                    <button class="form-close-btn">&times;</button>
                    <h2>Write a Review</h2>
                    <form class="review-submission-form" data-tool-id="${toolId}">
                        <div class="form-group">
                            <label class="form-label">Your Rating *</label>
                            <div class="rating-input">
                                ${this.renderStars(0, true)}
                            </div>
                            <input type="hidden" name="rating" id="form-rating" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="review-title">Review Title *</label>
                            <input type="text" class="form-input" id="review-title" name="title" required placeholder="Summarize your experience">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="review-content">Your Review *</label>
                            <textarea class="form-textarea" id="review-content" name="content" required placeholder="Share your detailed experience with this tool"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="user-name">Your Name *</label>
                            <input type="text" class="form-input" id="user-name" name="userName" required placeholder="Your full name">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="user-role">Your Role</label>
                            <select class="form-select" id="user-role" name="userRole">
                                <option value="">Select your role</option>
                                <option value="Student">Student</option>
                                <option value="Content Writer">Content Writer</option>
                                <option value="Marketing Manager">Marketing Manager</option>
                                <option value="Software Developer">Software Developer</option>
                                <option value="Designer">Designer</option>
                                <option value="Business Owner">Business Owner</option>
                                <option value="Freelancer">Freelancer</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="use-case">Primary Use Case</label>
                            <input type="text" class="form-input" id="use-case" name="useCase" placeholder="e.g., Content Writing, Marketing, Design">
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="form-btn secondary form-close-btn">Cancel</button>
                            <button type="submit" class="form-btn primary">Submit Review</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHTML);
        document.body.style.overflow = 'hidden';
    }

    closeReviewForm() {
        const overlay = document.querySelector('.review-form-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    }

    setRating(starElement) {
        const rating = parseInt(starElement.dataset.rating);
        const ratingContainer = starElement.parentElement;
        const stars = ratingContainer.querySelectorAll('.rating-star');
        const hiddenInput = document.getElementById('form-rating');

        // Update visual stars
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.classList.remove('empty');
            } else {
                star.classList.remove('active');
                star.classList.add('empty');
            }
        });

        // Update hidden input
        if (hiddenInput) {
            hiddenInput.value = rating;
        }
    }

    async submitReview(form) {
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const reviewData = {
                toolId: form.dataset.toolId,
                rating: parseInt(formData.get('rating')),
                title: formData.get('title'),
                content: formData.get('content'),
                userName: formData.get('userName'),
                userRole: formData.get('userRole') || 'User',
                useCase: formData.get('useCase') || 'General',
                dateCreated: new Date().toISOString().split('T')[0]
            };

            // Simulate API call (replace with actual endpoint)
            await this.saveReview(reviewData);

            // Show success message
            this.showNotification('Review submitted successfully! Thank you for your feedback.', 'success');
            this.closeReviewForm();

            // Optionally refresh reviews
            this.loadReviews();

        } catch (error) {
            console.error('Error submitting review:', error);
            this.showNotification('Failed to submit review. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async saveReview(reviewData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real implementation, this would send data to your backend
        console.log('Review data to save:', reviewData);

        // For demo purposes, store in localStorage
        const existingReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
        existingReviews.push({
            ...reviewData,
            id: 'rev_' + Date.now(),
            helpful: 0,
            verified: false
        });
        localStorage.setItem('userReviews', JSON.stringify(existingReviews));
    }

    toggleHelpful(button) {
        const action = button.dataset.action;
        const reviewId = button.dataset.reviewId;

        if (action === 'helpful') {
            button.classList.toggle('active');
            // Update helpful count (simulate)
            const countMatch = button.textContent.match(/\((\d+)\)/);
            if (countMatch) {
                const currentCount = parseInt(countMatch[1]);
                const newCount = button.classList.contains('active') ? currentCount + 1 : currentCount - 1;
                button.textContent = button.textContent.replace(/\(\d+\)/, `(${newCount})`);
            }
        } else if (action === 'report') {
            this.showNotification('Review reported. Thank you for helping maintain quality.', 'info');
        }
    }

    filterReviews() {
        // Implementation for filtering reviews
        console.log('Filtering reviews by:', this.currentFilter);
    }

    sortReviews() {
        // Implementation for sorting reviews
        console.log('Sorting reviews by:', this.currentSort);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10001;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize reviews system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reviewsSystem = new ReviewsSystem();
});

// Make available globally
if (typeof window !== 'undefined') {
    window.ReviewsSystem = ReviewsSystem;
}
