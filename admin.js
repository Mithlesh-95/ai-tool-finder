import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const auth = getAuth(app);

// Handle Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    const adminRef = doc(db, "admins", uid);
    const snap = await getDoc(adminRef);

    if (snap.exists() && snap.data().role === "admin") {
      document.getElementById("loginPanel").style.display = "none";
      document.getElementById("uploaderPanel").classList.remove("hidden");
    } else {
      document.getElementById("loginError").classList.remove("hidden");
    }
  } catch (error) {
    console.error(error.message);
    document.getElementById("loginError").classList.remove("hidden");
  }
});

// Add tool
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

// adding bulk tools using json upload
document.getElementById("bulkUploadBtn").addEventListener("click", async () => {
  const bulkText = document.getElementById("bulkJson").value;
  let tools = [];

  try {
    tools = JSON.parse(bulkText);

    if (!Array.isArray(tools)) {
      alert("JSON must be an array of tool objects.");
      return;
    }

    for (const tool of tools) {
      // Sanitize tags
      if (typeof tool.tags === "string") {
        tool.tags = tool.tags.split(',').map(t => t.trim());
      }

      await addDoc(collection(db, "tools"), tool);
    }

    document.getElementById("bulkMsg").classList.remove("hidden");
    document.getElementById("bulkJson").value = "";
  } catch (err) {
    alert("Invalid JSON or error adding tools: " + err.message);
  }
});
