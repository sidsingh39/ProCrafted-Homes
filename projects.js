const projects = [
  {
    title: "Lakeview Villa",
    category: "villa",
    image: "images/projects/villa1.jpg",
    desc: "Luxury waterfront villa built with premium materials."
  },
  {
    title: "Urban Loft Interior",
    category: "interior",
    image: "images/projects/interior1.jpg",
    desc: "Modern loft design with industrial aesthetics."
  },
  {
    title: "Downtown Office Renovation",
    category: "commercial",
    image: "images/projects/commercial1.jpg",
    desc: "Complete corporate workspace transformation."
  },
  {
    title: "Corporate Tower Upgrade",
    category: "commercial",
    image: "images/projects/commercial2.jpg",
    desc: "Redesigned workspace interiors to enhance functionality and brand appeal."
  },
  {
    title: "Classic Home Renovation",
    category: "renovation",
    image: "images/projects/reno1.jpg",
    desc: "Restored colonial home with contemporary interiors."
  },
  {
    title: "Modern Kitchen Renovation",
    category: "renovation",
    image: "images/projects/reno2.jpg",
    desc:"Redefined kitchen spaces crafted with precision and poise.",
  },
  {
    title: "Luxury Penthouse",
    category: "villa",
    image: "images/projects/villa2.jpg",
    desc: "High-end penthouse with panoramic city view."
  },
  {
    title: "Artisan Kitchen Design",
    category: "interior",
    image: "images/projects/interior2.jpg",
    desc: "Elegant modular kitchen with minimalist design."
  }
];

const grid = document.getElementById("projectGrid");
const buttons = document.querySelectorAll(".filter-btn");

function displayProjects(filter) {
  grid.innerHTML = "";
  const filtered = filter === "all" ? projects : projects.filter(p => p.category === filter);
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <div class="project-overlay">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    displayProjects(btn.dataset.category);
  });
});

displayProjects("all");
// Lightbox functionality
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDesc = document.getElementById("lightbox-desc");
const lightboxClose = document.querySelector(".lightbox-close");

// Open lightbox when an image is clicked
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".project-card");
  if (!card) return;

  const img = card.querySelector("img");
  const title = card.querySelector(".project-overlay h3").innerText;
  const desc = card.querySelector(".project-overlay p").innerText;

  lightboxImg.src = img.src;
  lightboxTitle.textContent = title;
  lightboxDesc.textContent = desc;
  lightbox.classList.add("active");
});

// Close on click of ×
lightboxClose.addEventListener("click", () => {
  lightbox.classList.remove("active");
});

// Close when clicking outside the image
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove("active");
  }
});

// Close with ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lightbox.classList.remove("active");
  }
});

