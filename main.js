console.log("ProCrafted Homes Loaded");
// Populate contractors
const container = document.getElementById("contractorContainer");
const searchInput = document.getElementById("searchBar");
const cityFilter = document.getElementById("filterCity");

// Populate city filter
if (cityFilter) {
  const uniqueCities = [...new Set(contractors.map(c => c.city))];
  uniqueCities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });
}

function renderContractors(list) {
  if (!container) return;
  container.innerHTML = "";
  
  list.forEach(contractor => {
    const card = document.createElement("div");
    card.style = `
      border:1px solid #eee;
      padding:20px;
      margin-bottom:15px;
      border-radius:8px;
      cursor:pointer;
      transition:var(--transition);
    `;
    
    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:20px;">
        <img src="${contractor.image}" style="width:80px; height:80px; border-radius:50%;">
        <div>
          <h3 style="margin-bottom:6px; font-family:'Playfair Display';">${contractor.name}</h3>
          <p>${contractor.city} • ⭐ ${contractor.rating}</p>
          <p style="font-size:0.9rem; opacity:0.8;">${contractor.specialties.join(", ")}</p>
        </div>
      </div>
      
      <div class="expand" style="display:none; margin-top:15px;">
        <p><strong>Experience:</strong> ${contractor.experience}</p>
        <p><strong>Contact:</strong> ${contractor.contact}</p>
        <button class="btn" style="margin-top:10px;">Get Quote</button>
      </div>
    `;
    
    card.onclick = () => {
      const details = card.querySelector(".expand");
      details.style.display = details.style.display === "none" ? "block" : "none";
    };
    
    container.appendChild(card);
  });
}

function filterContractors() {
  const query = searchInput?.value.toLowerCase() || "";
  const city = cityFilter?.value || "";

  const filtered = contractors.filter(c =>
    (c.name.toLowerCase().includes(query) ||
     c.city.toLowerCase().includes(query) ||
     c.specialties.some(s => s.toLowerCase().includes(query))) &&
    (city === "" || c.city === city)
  );

  renderContractors(filtered);
}

searchInput?.addEventListener("input", filterContractors);
cityFilter?.addEventListener("change", filterContractors);

renderContractors(contractors);



