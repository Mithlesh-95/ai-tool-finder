import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
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

// Add tool on submit
document.getElementById("toolForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("desc").value;
  const tags = document.getElementById("tags").value.split(',').map(tag => tag.trim()).filter(Boolean);
  const price = document.getElementById("price").value;
  const link = document.getElementById("link").value;

  const tool = { name, category, desc, tags, price, link };

  try {
    await addDoc(collection(db, "tools"), tool);
    document.getElementById("msg").classList.remove("hidden");
    e.target.reset();
  } catch (error) {
    alert("Error adding tool: " + error.message);
  }
});
