const steps = document.querySelectorAll(".step");
let currentStep = 0;

const areaInput = document.getElementById("area");
const qualitySelect = document.getElementById("quality");
const finishSelect = document.getElementById("finish");
const result = document.getElementById("result");

function showStep(stepIndex) {
  steps.forEach((step, index) => {
    if (index === stepIndex) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });
  updateDots();
}

// Update progress dots when step changes
const dots = document.querySelectorAll(".dot");

function updateDots() {
  if (dots.length) {
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentStep);
    });
  }
}


function nextStep() {
  if (currentStep === 0 && !areaInput.value) return alert("Enter your project area");
  if (currentStep === 1 && !qualitySelect.value) return alert("Select construction quality");
  if (currentStep === 2 && !finishSelect.value) return alert("Select finishing type");

  currentStep++;
  if (currentStep >= steps.length) currentStep = steps.length - 1;

  if (currentStep === 3) calculateCost();
  showStep(currentStep);
  updateDots();
}

function prevStep() {
  currentStep--;
  if (currentStep < 0) currentStep = 0;
  showStep(currentStep);
  updateDots();
}

function calculateCost() {
  const area = parseFloat(areaInput.value);
  const qualityRates = { basic: 1200, standard: 1800, premium: 2500 };
  const finishRates = { standard: 100, luxury: 200 };

  const qualityRate = qualityRates[qualitySelect.value];
  const finishRate = finishRates[finishSelect.value];
  const totalCost = area * (qualityRate + finishRate);

  result.innerHTML = `
    <strong>Area:</strong> ${area} sq.ft<br>
    <strong>Quality:</strong> ${qualitySelect.value.toUpperCase()}<br>
    <strong>Finish:</strong> ${finishSelect.value.toUpperCase()}<br><br>
    💰 <strong>Estimated Total:</strong> ₹${totalCost.toLocaleString('en-IN')}
  `;

  suggestContractors(qualitySelect.value);
}

function suggestContractors(category) {
  const suggestionDiv = document.getElementById("suggestions");
  suggestionDiv.innerHTML = `<h4>Recommended Contractors for You</h4>`;

  fetch("contractors.json")
    .then(res => res.json())
    .then(data => {
      let matches = [];

      if (category === "premium") {
        matches = data.filter(c => c.rating >= 4.5);
      } else if (category === "standard") {
        matches = data.filter(c => c.rating >= 4.0 && c.rating < 4.5);
      } else {
        matches = data;
      }

      if (matches.length === 0) {
        suggestionDiv.innerHTML += `<p style="margin-top:10px;">No matching contractors found for this quality type.</p>`;
        return;
      }

      matches.forEach(c => {
        const card = document.createElement("div");
        card.classList.add("contractor-card");
        card.innerHTML = `
          <h4>${c.name}</h4>
          <p><strong>Location:</strong> ${c.location}</p>
          <p><strong>Expertise:</strong> ${c.specialization}</p>
          <p><strong>Rating:</strong> ⭐ ${c.rating}</p>
          <p><strong>Price Range:</strong> ${c.priceRange}</p>
        `;
        suggestionDiv.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error loading contractor data:", err);
      suggestionDiv.innerHTML += `<p style="margin-top:10px;">Unable to load contractor details right now.</p>`;
    });
}


document.querySelectorAll(".nextBtn").forEach(btn => btn.addEventListener("click", nextStep));
document.querySelectorAll(".prevBtn").forEach(btn => btn.addEventListener("click", prevStep));

showStep(currentStep);
