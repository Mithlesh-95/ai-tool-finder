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
        window.toolsData = toolsData; // Make accessible to global functions

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

        // Render Bento Grid (if function exists)
        if (typeof renderBentoGrid === 'function') {
            renderBentoGrid();
        }
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
            <div class="flex items-center gap-3">
                <div class="relative group/check">
                    <input type="checkbox" 
                           onchange="toggleCompare('${tool.name}', this)" 
                           class="peer w-5 h-5 cursor-pointer appearance-none rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 checked:bg-blue-600 checked:border-blue-600 transition-all"
                           aria-label="Compare ${tool.name}">
                    <svg class="absolute top-1 left-1 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/check:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Compare</span>
                </div>
                <h3 class="tool-title text-xl font-bold text-gray-800 dark:text-white">${tool.name}</h3>
            </div>
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


/* ==========================================
   AI SOLUTION FINDER WIZARD LOGIC
   ========================================== */

const wizardConfig = {
    'student': {
        goals: [
            { id: 'essay', label: 'Write an Essay/Paper 📝', category: 'content-writing' },
            { id: 'study', label: 'Study & Research 📚', category: 'ai-companion' },
            { id: 'resume', label: 'Build a Resume 📄', category: 'resume' },
            { id: 'presentation', label: 'Create Slides 📊', category: 'design' }
        ]
    },
    'developer': {
        goals: [
            { id: 'code', label: 'Generate/Debug Code 💻', category: 'coding' },
            { id: 'docs', label: 'Write Documentation 📘', category: 'content-writing' },
            { id: 'terminal', label: 'Terminal Help ⌨️', category: 'coding' }
        ]
    },
    'content-creator': {
        goals: [
            { id: 'video', label: 'Edit Videos 🎬', category: 'video-editing' },
            { id: 'blog', label: 'Write Blog Posts ✍️', category: 'content-writing' },
            { id: 'social', label: 'Social Media Captions 📱', category: 'content-writing' },
            { id: 'image', label: 'Generate Images 🎨', category: 'design' }
        ]
    },
    'business': {
        goals: [
            { id: 'marketing', label: 'Marketing Copy 📢', category: 'content-writing' },
            { id: 'meeting', label: 'Meeting Notes/Summaries 📝', category: 'productivity' },
            { id: 'logo', label: 'Create Logo/Brand 🏢', category: 'design' },
            { id: 'email', label: 'Email Automation 📧', category: 'productivity' }
        ]
    }
};

window.selectWizardRole = function (role) {
    // Hide Step 1, Show Step 2
    document.getElementById('step-role').classList.add('hidden');
    const stepGoal = document.getElementById('step-goal');
    stepGoal.classList.remove('hidden');
    stepGoal.classList.add('animate-fadeInUp');

    // Populate Goals
    const goalContainer = document.getElementById('goal-options');
    goalContainer.innerHTML = '';

    // Safety check
    if (!wizardConfig[role]) {
        console.error('Role not found:', role);
        return;
    }

    wizardConfig[role].goals.forEach(goal => {
        const btn = document.createElement('button');
        btn.className = 'wizard-btn bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-6 py-3 font-medium transition-all hover:scale-105 text-white';
        btn.innerText = goal.label;
        btn.onclick = () => selectWizardGoal(goal.category, goal.label);
        goalContainer.appendChild(btn);
    });
};

window.selectWizardGoal = function (category, label) {
    // Hide Step 2, Show Step 3
    document.getElementById('step-goal').classList.add('hidden');
    const stepResult = document.getElementById('step-result');
    stepResult.classList.remove('hidden');
    stepResult.classList.add('animate-fadeInUp');

    // Filter Tools
    // Note: toolsData is populated by fetchTools() in the main app logic.
    // We will simple filter by category for now, or match keywords if we had them.
    let matches = toolsData.filter(t => {
        // Normalize categories for comparison
        const toolCat = t.category.toLowerCase().replace(/\s+/g, '-');
        const searchCat = category.toLowerCase();
        return toolCat.includes(searchCat) || searchCat.includes(toolCat);
    });

    // If no exact category match, fall back to simple search
    if (matches.length === 0) {
        matches = toolsData.filter(t => t.tags && t.tags.some(tag => tag.toLowerCase().includes(category)));
    }

    // Limit to 4 results
    const topMatches = matches.slice(0, 4);

    const resultsContainer = document.getElementById('wizard-results');
    resultsContainer.innerHTML = '';

    if (topMatches.length === 0) {
        resultsContainer.innerHTML = '<p class="text-white text-center col-span-2">No specific tools found for this category yet. Try browsing all tools!</p>';
    } else {
        topMatches.forEach(tool => {
            const card = document.createElement('div');
            // Changed from white background to a glassmorphism dark style to contrast with the "whitish" text/container
            card.className = 'group relative bg-gray-900/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-gray-900/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-purple-500/50';

            card.innerHTML = `
                <div class="flex items-start justify-between mb-2">
                    <h4 class="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">${tool.name}</h4>
                    <span class="text-xs font-medium bg-white/10 text-white/80 px-2 py-1 rounded-full border border-white/5">${tool.price || 'Free'}</span>
                </div>
                <p class="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">${tool.desc}</p>
                <a href="${tool.link}" target="_blank" class="block w-full text-center bg-white/10 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 border border-white/10 group-hover:border-purple-500/50 flex items-center justify-center gap-2">
                    Try Tool <span class="text-xs group-hover:translate-x-1 transition-transform">→</span>
                </a>
            `;
            resultsContainer.appendChild(card);
        });
    }
};

window.resetWizard = function () {
    document.getElementById('step-result').classList.add('hidden');
    document.getElementById('step-goal').classList.add('hidden');
    document.getElementById('step-role').classList.remove('hidden');
    document.getElementById('step-role').classList.add('animate-fadeInUp');
};


/* ==========================================
   BENTO GRID LOGIC
   ========================================== */
function renderBentoGrid() {
    const gridContainer = document.getElementById('bentoGrid');
    if (!gridContainer || !window.toolsData || !window.toolsData.length) return;

    // Simulate "Trending" by picking tools with 'Popular' tag or random high-quality ones
    // In a real app, this would be based on analytics
    const popularTools = window.toolsData.filter(t => t.tags && (t.tags.includes('Popular') || t.tags.includes('Trending')));

    // Mix popular + random to fill 6 slots if needed
    let gridTools = [...popularTools];
    if (gridTools.length < 6) {
        const others = window.toolsData.filter(t => !gridTools.includes(t)).sort(() => 0.5 - Math.random());
        gridTools = [...gridTools, ...others].slice(0, 6);
    } else {
        gridTools = gridTools.slice(0, 6);
    }

    gridContainer.innerHTML = '';

    gridTools.forEach((tool, index) => {
        const card = document.createElement('div');

        // Define grid classes
        let gridClass = 'bento-card';
        if (index === 0) gridClass += ' bento-item-large bg-gradient-to-br from-indigo-600 to-purple-700 !text-white !bg-opacity-100 border-none';
        else if (index === 3) gridClass += ' bento-item-tall';

        // Custom content for the large featured card
        if (index === 0) {
            card.className = gridClass;
            card.innerHTML = `
                <div class="z-10 h-full flex flex-col justify-end relative">
                    <span class="bento-tag trending">#1 Trending</span>
                    <h3 class="text-3xl md:text-4xl font-bold mb-3">${tool.name}</h3>
                    <p class="text-white/90 text-lg line-clamp-2 mb-6">${tool.desc}</p>
                    <a href="${tool.link}" target="_blank" class="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors w-max">
                        Try It Now <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </a>
                </div>
                <!-- Abstract bg shape -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            `;
        } else {
            // Standard Bento Cards
            card.className = gridClass;
            // Add gradient overlay for tall card
            const tallOverlay = index === 3 ? '<div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none"></div>' : '';

            const isHot = index === 3;
            const isNew = index === 1;

            card.innerHTML = `
                ${tallOverlay}
                <div class="flex justify-between items-start mb-4">
                    <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        <span class="text-2xl">${index === 3 ? '🔥' : (index === 1 ? '✨' : '🤖')}</span>
                    </div>
                     ${isNew ? '<span class="bento-tag new">New</span>' : ''}
                     ${isHot ? '<span class="bento-tag popular">Hot</span>' : ''}
                </div>
                <div class="relative z-10">
                     <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${tool.name}</h3>
                     <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">${tool.desc}</p>
                     <a href="${tool.link}" target="_blank" class="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline flex items-center gap-1 group/link">
                        View Details <span class="group-hover/link:translate-x-1 transition-transform">→</span>
                     </a>
                </div>
            `;
        }
        gridContainer.appendChild(card);
    });
}


/* ==========================================
   COMPARISON TOOL LOGIC
   ========================================== */
window.compareList = [];

window.toggleCompare = function (toolName, checkbox) {
    if (checkbox.checked) {
        if (window.compareList.length >= 2) {
            checkbox.checked = false;
            alert("You can only compare 2 tools at a time! Uncheck one to add this.");
            return;
        }
        // Find tool data
        const tool = window.toolsData.find(t => t.name === toolName);
        if (tool) window.compareList.push(tool);
    } else {
        window.compareList = window.compareList.filter(t => t.name !== toolName);
    }
    renderCompareBar();
};

window.renderCompareBar = function () {
    const bar = document.getElementById('compareBar');
    const countEl = document.getElementById('compareCount');

    if (window.compareList.length > 0) {
        bar.classList.remove('hidden');
        bar.classList.add('flex');
        countEl.innerText = `Comparing ${window.compareList.length}/2 tools`;
    } else {
        bar.classList.add('hidden');
        bar.classList.remove('flex');
    }

    // Update checkboxes state (in case we cleared from bar)
    document.querySelectorAll('input[type="checkbox"][aria-label^="Compare"]').forEach(cb => {
        const name = cb.getAttribute('aria-label').replace('Compare ', '');
        cb.checked = window.compareList.some(t => t.name === name);
    });
};

window.openCompareModal = function () {
    if (window.compareList.length < 2) {
        alert("Please select 2 tools to compare!");
        window.openCompareModalTest(); // hidden test feature
        return;
    }

    const [tool1, tool2] = window.compareList;
    renderCompareModalContent(tool1, tool2);
};

// Helper to render content (separated for cleaner code)
function renderCompareModalContent(tool1, tool2) {
    const content = document.getElementById('compareContent');
    const modal = document.getElementById('compareModal');

    content.innerHTML = `
        <!-- Tool 1 -->
        <div class="p-6 text-center">
            <div class="mb-6">
                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">${tool1.category}</span>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">${tool1.name}</h3>
                <p class="text-sm text-gray-500 mt-1">${tool1.price}</p>
            </div>
            
            <div class="space-y-6 text-left">
                <div>
                    <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                    <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">${tool1.desc}</p>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tags</h4>
                    <div class="flex flex-wrap gap-1">
                        ${tool1.tags.map(t => `<span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">${t}</span>`).join('')}
                    </div>
                </div>
                 <div class="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                    <a href="${tool1.link}" target="_blank" class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                        Visit Site ↗
                    </a>
                </div>
            </div>
        </div>

        <!-- Tool 2 -->
        <div class="p-6 text-center bg-gray-50 dark:bg-white/5">
             <div class="mb-6">
                <span class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-2">${tool2.category}</span>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">${tool2.name}</h3>
                <p class="text-sm text-gray-500 mt-1">${tool2.price}</p>
            </div>
             <div class="space-y-6 text-left">
                <div>
                    <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                    <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">${tool2.desc}</p>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tags</h4>
                    <div class="flex flex-wrap gap-1">
                        ${tool2.tags.map(t => `<span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">${t}</span>`).join('')}
                    </div>
                </div>
                <div class="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                    <a href="${tool2.link}" target="_blank" class="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">
                        Visit Site ↗
                    </a>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

window.closeCompareModal = function () {
    document.getElementById('compareModal').classList.add('hidden');
};

window.clearCompare = function () {
    window.compareList = [];
    renderCompareBar();
};




