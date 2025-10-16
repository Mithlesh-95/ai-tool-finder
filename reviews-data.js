// Reviews Data Structure for AllAITool.tech
// This file contains sample review data and structure for the user reviews system

const reviewsData = {
    // ChatGPT Reviews
    "chatgpt": {
        averageRating: 4.6,
        totalReviews: 1247,
        ratingDistribution: {
            5: 756,
            4: 321,
            3: 98,
            2: 45,
            1: 27
        },
        reviews: [
            {
                id: "rev_001",
                userId: "user_001",
                userName: "Sarah Johnson",
                userRole: "Content Writer",
                rating: 5,
                title: "Game changer for content creation",
                review: "ChatGPT has revolutionized my workflow. I use it daily for brainstorming, writing assistance, and research. The quality of responses is consistently impressive.",
                pros: ["Excellent writing assistance", "Great for brainstorming", "Fast responses", "Versatile use cases"],
                cons: ["Can be verbose sometimes", "Occasional factual errors"],
                useCase: "Content Writing",
                dateCreated: "2025-10-10",
                helpful: 23,
                verified: true,
                toolVersion: "GPT-4"
            },
            {
                id: "rev_002",
                userId: "user_002",
                userName: "Mike Chen",
                userRole: "Software Developer",
                rating: 4,
                title: "Great coding assistant with limitations",
                review: "Excellent for explaining code concepts and helping with debugging. Sometimes struggles with complex algorithms but overall very helpful.",
                pros: ["Good code explanations", "Helpful for debugging", "Learns context well"],
                cons: ["Complex algorithms can be challenging", "No real-time web access"],
                useCase: "Programming",
                dateCreated: "2025-10-08",
                helpful: 18,
                verified: true,
                toolVersion: "GPT-4"
            },
            {
                id: "rev_003",
                userId: "user_003",
                userName: "Emily Rodriguez",
                userRole: "Marketing Manager",
                rating: 5,
                title: "Perfect for marketing campaigns",
                review: "I use ChatGPT for creating social media content, email campaigns, and ad copy. It understands brand voice really well when given proper context.",
                pros: ["Great for marketing copy", "Understands brand voice", "Quick turnaround"],
                cons: ["Needs clear instructions", "Sometimes too creative"],
                useCase: "Marketing",
                dateCreated: "2025-10-05",
                helpful: 31,
                verified: true,
                toolVersion: "GPT-4"
            }
        ]
    },

    // Canva AI Reviews
    "canva": {
        averageRating: 4.4,
        totalReviews: 892,
        ratingDistribution: {
            5: 456,
            4: 267,
            3: 98,
            2: 45,
            1: 26
        },
        reviews: [
            {
                id: "rev_004",
                userId: "user_004",
                userName: "Alex Thompson",
                userRole: "Social Media Manager",
                rating: 5,
                title: "AI features are incredible",
                review: "Magic Design and Background Remover have saved me hours of work. The AI suggestions are spot-on for my brand style.",
                pros: ["Magic Design is fantastic", "Easy background removal", "Great templates", "AI understands brand style"],
                cons: ["Premium features can be expensive", "Sometimes AI suggestions are off-brand"],
                useCase: "Social Media Design",
                dateCreated: "2025-10-12",
                helpful: 15,
                verified: true,
                toolVersion: "Canva Pro"
            },
            {
                id: "rev_005",
                userId: "user_005",
                userName: "Jessica Park",
                userRole: "Small Business Owner",
                rating: 4,
                title: "Great for non-designers",
                review: "As someone with no design background, Canva's AI features help me create professional-looking graphics. The learning curve is minimal.",
                pros: ["User-friendly interface", "Professional results", "AI suggestions helpful", "Affordable pricing"],
                cons: ["Limited customization options", "Can look template-y"],
                useCase: "Business Graphics",
                dateCreated: "2025-10-09",
                helpful: 22,
                verified: true,
                toolVersion: "Canva Pro"
            }
        ]
    },

    // Jasper AI Reviews
    "jasper": {
        averageRating: 4.3,
        totalReviews: 534,
        ratingDistribution: {
            5: 245,
            4: 178,
            3: 67,
            2: 28,
            1: 16
        },
        reviews: [
            {
                id: "rev_006",
                userId: "user_006",
                userName: "David Kumar",
                userRole: "Content Marketer",
                rating: 4,
                title: "Solid tool for content at scale",
                review: "Jasper excels at maintaining brand voice across large content volumes. Templates are helpful but can feel restrictive for creative projects.",
                pros: ["Excellent brand voice consistency", "Great templates", "Good for scaling content", "SEO features"],
                cons: ["Can be expensive", "Templates feel restrictive", "Learning curve for advanced features"],
                useCase: "Content Marketing",
                dateCreated: "2025-10-07",
                helpful: 19,
                verified: true,
                toolVersion: "Jasper Pro"
            }
        ]
    },

    // Midjourney Reviews
    "midjourney": {
        averageRating: 4.7,
        totalReviews: 1156,
        ratingDistribution: {
            5: 834,
            4: 231,
            3: 56,
            2: 23,
            1: 12
        },
        reviews: [
            {
                id: "rev_007",
                userId: "user_007",
                userName: "Lisa Wang",
                userRole: "Graphic Designer",
                rating: 5,
                title: "Unmatched artistic quality",
                review: "The artistic quality is simply stunning. Perfect for creative projects and concept art. The community aspect adds great value.",
                pros: ["Exceptional artistic quality", "Great community", "Constant improvements", "Unique artistic styles"],
                cons: ["Discord-only interface", "Can be slow during peak times", "No direct editing"],
                useCase: "Concept Art",
                dateCreated: "2025-10-11",
                helpful: 45,
                verified: true,
                toolVersion: "Midjourney V6"
            }
        ]
    }
};

// Review Categories for filtering
const reviewCategories = {
    "all": "All Reviews",
    "content-writing": "Content Writing",
    "programming": "Programming",
    "marketing": "Marketing",
    "design": "Design",
    "business": "Business",
    "education": "Education",
    "research": "Research"
};

// Review Sorting Options
const sortOptions = {
    "newest": "Newest First",
    "oldest": "Oldest First",
    "highest-rating": "Highest Rating",
    "lowest-rating": "Lowest Rating",
    "most-helpful": "Most Helpful"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { reviewsData, reviewCategories, sortOptions };
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.reviewsData = reviewsData;
    window.reviewCategories = reviewCategories;
    window.sortOptions = sortOptions;
}
