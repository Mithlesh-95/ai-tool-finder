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
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.getElementById('searchInput');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const selectedCategory = button.getAttribute('data-category');
        console.log("Category button clicked:", selectedCategory);
        renderTools(selectedCategory, searchInput.value.toLowerCase());
    });
});

searchInput.addEventListener('input', (e) => {
    const activeBtn = document.querySelector('.category-btn.active');
    const category = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
    renderTools(category, e.target.value.toLowerCase());
});

// Fetch data from Firebase and initialize rendering
async function fetchTools() {
    const querySnapshot = await getDocs(collection(db, "tools"));
    toolsData = querySnapshot.docs.map(doc => doc.data());
    console.log("Fetched tools data:", toolsData);
    console.log("Available categories:", [...new Set(toolsData.map(tool => tool.category))]);

    // Show a summary of tools per category
    const categoryCounts = {};
    toolsData.forEach(tool => {
        if (categoryCounts[tool.category]) {
            categoryCounts[tool.category]++;
        } else {
            categoryCounts[tool.category] = 1;
        }
    });
    console.log("Tools per category:", categoryCounts);

    renderTools('all', '');
}

function renderTools(category, searchTerm) {
    const toolsGrid = document.getElementById("toolsGrid");
    toolsGrid.innerHTML = '';

    console.log("Filtering by category:", category);
    console.log("Search term:", searchTerm);

    const filtered = toolsData.filter(tool => {
        // Make category comparison more flexible
        let matchesCategory = category === 'all';
        if (!matchesCategory && tool.category) {
            // Try exact match first
            matchesCategory = tool.category === category;

            // If no exact match, try case-insensitive comparison
            if (!matchesCategory) {
                matchesCategory = tool.category.toLowerCase() === category.toLowerCase();
            }

            // Try with spaces converted to dashes and vice versa
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
        console.log(`Tool: ${tool.name}, Category: ${tool.category}, Matches category: ${matchesCategory}, Matches search: ${matchesSearch}`);
        return matchesCategory && matchesSearch;
    });

    console.log("Filtered tools:", filtered);
    filtered.forEach(tool => toolsGrid.innerHTML += renderToolCard(tool));
}

function renderToolCard(tool) {
    return `
    <div class="tool-card bg-white rounded-xl shadow-lg p-6 border border-gray-100" data-category="${tool.category}">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800">${tool.name}</h3>
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">${tool.price}</span>
        </div>
        <p class="text-gray-600 mb-4">${tool.desc}</p>
        <div class="flex flex-wrap gap-2 mb-6">
            ${tool.tags.map(tag => `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">${tag}</span>`).join("")}
        </div>
        <a href="${tool.link}" target="_blank">
            <button class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
                Try Now
            </button>
        </a>
    </div>`;
}

fetchTools();
