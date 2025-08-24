// Firebase imports and config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCY2x1-lLF2DOeeoWSBQpK1QO3CXaaGENo",
    authDomain: "ai-tool-finder-990c5.firebaseapp.com",
    projectId: "ai-tool-finder-990c5",
    storageBucket: "ai-tool-finder-990c5.appspot.com",
    messagingSenderId: "908525506856",
    appId: "1:908525506856:web:93e6e3172f4df51d63401d",
    measurementId: "G-7GS3B1Q357"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Category filter and search setup
let toolsData = [];
let currentPage = 1;
const MOBILE_TOOLS_PER_PAGE = 5;
const DESKTOP_TOOLS_PER_PAGE = 9;

// Wait for DOM to be fully loaded
function initializeAppComponents() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('searchInput');

    if (!categoryButtons.length || !searchInput) {
        // Retry if elements not found
        setTimeout(initializeAppComponents, 100);
        return;
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const selectedCategory = button.getAttribute('data-category');
            currentPage = 1; // Reset pagination when category changes
            renderTools(selectedCategory, searchInput.value.toLowerCase());
        });
    });

    searchInput.addEventListener('input', (e) => {
        const activeBtn = document.querySelector('.category-btn.active');
        const category = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
        currentPage = 1; // Reset pagination when search changes
        renderTools(category, e.target.value.toLowerCase());
    });

    // Initialize data fetching
    fetchTools();
}

// Fetch data from Firebase and initialize rendering
async function fetchTools() {
    try {
        const querySnapshot = await getDocs(collection(db, "tools"));
        toolsData = querySnapshot.docs.map(doc => doc.data());

        // Show a summary of tools per category
        const categoryCounts = {};
        toolsData.forEach(tool => {
            if (categoryCounts[tool.category]) {
                categoryCounts[tool.category]++;
            } else {
                categoryCounts[tool.category] = 1;
            }
        });

        // Initial render
        renderTools('all', '');
    } catch (error) {
        // Show error message to user
        const toolsGrid = document.getElementById("toolsGrid");
        if (toolsGrid) {
            toolsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-500 text-lg mb-4">⚠️ Unable to load AI tools</div>
                    <div class="text-gray-400">Please refresh the page or try again later.</div>
                </div>
            `;
        }
    }
}

function renderTools(category, searchTerm) {
    const toolsGrid = document.getElementById("toolsGrid");
    const paginationEl = document.getElementById("paginationControls");
    if (!toolsGrid) return;

    const filtered = toolsData.filter(tool => {
        let matchesCategory = category === 'all';
        if (!matchesCategory && tool.category) {
            matchesCategory = tool.category === category;
            if (!matchesCategory) {
                matchesCategory = tool.category.toLowerCase() === category.toLowerCase();
            }
            if (!matchesCategory) {
                const categoryWithDashes = tool.category.toLowerCase().replace(/\s+/g, '-');
                const categoryWithSpaces = tool.category.toLowerCase().replace(/-/g, ' ');
                const filterWithDashes = category.toLowerCase().replace(/\s+/g, '-');
                const filterWithSpaces = category.toLowerCase().replace(/-/g, ' ');
                matchesCategory = categoryWithDashes === filterWithDashes ||
                    categoryWithSpaces === filterWithSpaces ||
                    categoryWithDashes === category.toLowerCase() ||
                    categoryWithSpaces === category.toLowerCase();
            }
        }
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm) || tool.desc.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    const isMobile = window.innerWidth < 768;
    const toolsPerPage = isMobile ? MOBILE_TOOLS_PER_PAGE : DESKTOP_TOOLS_PER_PAGE;
    const totalPages = Math.ceil(filtered.length / toolsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages; // Clamp
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * toolsPerPage;
    const endIndex = startIndex + toolsPerPage;
    const toolsToShow = filtered.slice(startIndex, endIndex);

    toolsGrid.innerHTML = '';
    if (!toolsToShow.length) {
        toolsGrid.innerHTML = `<div class="col-span-full text-center text-gray-500">No tools found.</div>`;
    } else {
        toolsToShow.forEach(tool => toolsGrid.innerHTML += renderToolCard(tool));

        // Add staggered animation to tool cards
        setTimeout(() => {
            const toolCards = document.querySelectorAll('.tool-card.animate-in');
            toolCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }, 50);
    }

    if (paginationEl) {
        if (totalPages <= 1) {
            paginationEl.innerHTML = '';
        } else {
            paginationEl.innerHTML = buildPagination(totalPages, category, searchTerm);
            // Attach listeners
            paginationEl.querySelectorAll('button[data-page]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = btn.getAttribute('data-page');
                    if (target === 'prev') {
                        if (currentPage > 1) currentPage--;
                    } else if (target === 'next') {
                        if (currentPage < totalPages) currentPage++;
                    } else {
                        currentPage = parseInt(target, 10);
                    }
                    renderTools(category, searchTerm);
                    // Explicit smooth scroll with offset (account for fixed navbar ~80px)
                    requestAnimationFrame(() => {
                        const nav = document.querySelector('.navbar');
                        const offset = nav ? nav.offsetHeight + 20 : 100; // extra spacing
                        const top = toolsGrid.getBoundingClientRect().top + window.pageYOffset - offset;
                        window.scrollTo({ top, behavior: 'smooth' });
                    });
                });
            });
        }
    }
}

function buildPagination(totalPages, category, searchTerm) {
    const buttons = [];
    // Previous
    buttons.push(pageButton('Prev', 'prev', currentPage === 1));

    const pagesToRender = calculatePageNumbers(totalPages, currentPage);
    pagesToRender.forEach(p => {
        if (p === 'ellipsis') {
            buttons.push(`<span class="px-3 py-2 text-gray-400">...</span>`);
        } else {
            buttons.push(pageButton(p, p, false, p === currentPage));
        }
    });

    // Next
    buttons.push(pageButton('Next', 'next', currentPage === totalPages));
    return buttons.join('');
}

function calculatePageNumbers(totalPages, currentPage) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (currentPage <= 4) {
        pages.push(2, 3, 4, 5, 'ellipsis', totalPages);
    } else if (currentPage >= totalPages - 3) {
        pages.push('ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
        pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    }
    return pages;
}

function pageButton(label, pageValue, disabled = false, active = false) {
    const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300';
    const activeClasses = 'bg-purple-600 text-white shadow';
    const inactiveClasses = 'bg-white border border-gray-300 text-gray-700 hover:bg-purple-50';
    const disabledClasses = 'opacity-40 cursor-not-allowed hover:bg-white';
    const classes = [baseClasses, active ? activeClasses : inactiveClasses, disabled ? disabledClasses : ''].join(' ');
    return `<button ${disabled ? 'disabled' : ''} data-page="${pageValue}" class="${classes}">${label}</button>`;
}

function renderToolCard(tool) {
    const isPopular = Math.random() < 0.3; // 30% chance for popular
    const isFeatured = isPopular || Math.random() < 0.2; // Featured styling

    return `
    <div class="tool-card ${isFeatured ? 'featured' : ''} bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 animate-in" data-category="${tool.category}">
        <div class="flex items-center justify-between mb-4">
            <h3 class="tool-title text-xl font-bold text-gray-800 dark:text-white">${tool.name}</h3>
            <div class="flex items-center space-x-2">
                ${isPopular ? '<span class="tool-tag bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Popular</span>' : ''}
                <span class="tool-price bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">${tool.price}</span>
            </div>
        </div>
        <p class="tool-description text-gray-600 dark:text-gray-300 mb-4">${tool.desc}</p>
        <div class="flex flex-wrap gap-2 mb-6">
            ${tool.tags.map(tag => `<span class="tool-tag bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">${tag}</span>`).join("")}
        </div>
        <a href="${tool.link}" target="_blank">
            <button class="try-now-btn w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all relative overflow-hidden">
                <span class="relative z-10">Try Now</span>
            </button>
        </a>
    </div>`;
}

// Handle window resize to switch between mobile and desktop views
window.addEventListener('resize', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const activeBtn = document.querySelector('.category-btn.active');
        const category = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
        currentPage = 1; // Reset pagination on resize
        renderTools(category, searchInput.value.toLowerCase());
    }
});

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppComponents);
} else {
    // DOM is already loaded
    initializeAppComponents();
}

// Make renderTools and currentPage globally accessible for mobile category filtering
window.renderTools = renderTools;
Object.defineProperty(window, 'currentPage', {
    get: () => currentPage,
    set: (value) => { currentPage = value; }
});
