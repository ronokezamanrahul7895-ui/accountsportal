import { auth, signOut } from "./firebase-config.js";

const NAV = [
  ["classes.html", "শিক্ষাবর্ষ ও ক্লাস"],
  ["admission.html", "নতুন ভর্তি"],
  ["enrollment.html", "ক্লাসে স্টুডেন্ট যোগ"],
  ["billing.html", "বিলিং"]
];

export function renderLayout(active, user) {
  const ini = (user.name || "A").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  document.getElementById("header-root").innerHTML = `
    <header class="app-header">
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="menu-toggle" id="menuToggleBtn" aria-label="Menu">&#9776;</button>
        <div class="brand"><div class="logo">AP</div><span class="full-name">Accounts Portal</span></div>
      </div>
      <div class="user"><div class="avatar">${ini}</div>
        <div><div>${user.name || ""}</div><a href="#" class="logout-link" id="logoutBtn">Logout</a></div></div>
    </header>`;
  document.getElementById("sidebar-backdrop-root").innerHTML = `<div class="sidebar-backdrop" id="sidebarBackdrop"></div>`;
  document.getElementById("sidebar-root").innerHTML = `<nav class="sidebar" id="sidebarNav"><ul>${
    NAV.map(([h, l]) => `<li><a class="nav-link${h === active ? " active" : ""}" href="${h}">${l}</a></li>`).join("")}</ul></nav>`;
  const sb = document.getElementById("sidebarNav"), bd = document.getElementById("sidebarBackdrop");
  document.getElementById("menuToggleBtn").onclick = () => { sb.classList.toggle("open"); bd.classList.toggle("open"); };
  bd.onclick = () => { sb.classList.remove("open"); bd.classList.remove("open"); };
  document.getElementById("logoutBtn").onclick = async (e) => { e.preventDefault(); await signOut(auth); location.href = "login.html"; };
}
