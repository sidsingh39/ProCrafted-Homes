// costestimator.js — fixed and hardened for the multi-step estimator
document.addEventListener("DOMContentLoaded", () => {
  const steps = Array.from(document.querySelectorAll(".step"));
  let currentStep = 0;

  const areaInput = document.getElementById("area");
  const qualitySelect = document.getElementById("quality");
  const finishSelect = document.getElementById("finish");
  const result = document.getElementById("result");

  // progress dots
  const dots = Array.from(document.querySelectorAll(".dot"));

  // show a specific step (handles inline display:none as well)
  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      if (index === stepIndex) {
        step.classList.add("active");
        // ensure visible even if HTML had inline display:none
        step.style.display = "";
      } else {
        step.classList.remove("active");
        // hide non-active steps so layout doesn't collapse weirdly
        step.style.display = "none";
      }
    });
    updateDots();
  }

  function updateDots() {
    if (!dots.length) return;
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentStep);
    });
  }

  function nextStep() {
    // validation for each step BEFORE advancing
    if (currentStep === 0) {
      const raw = (areaInput && areaInput.value) ? areaInput.value.trim() : "";
      if (!raw) return alert("Enter your project area");
      const areaVal = parseFloat(raw.replace(/,/g,''));
      if (!areaVal || isNaN(areaVal) || areaVal <= 0) return alert("Please enter a valid numeric area (sq.ft)");
    }

    if (currentStep === 1) {
      if (!qualitySelect || !qualitySelect.value) return alert("Select construction quality");
    }

    if (currentStep === 2) {
      if (!finishSelect || !finishSelect.value) return alert("Select finishing type");
    }

    currentStep++;
    if (currentStep >= steps.length) currentStep = steps.length - 1;

    if (currentStep === 3) {
      calculateCost();
    }

    showStep(currentStep);
  }

  function prevStep() {
    currentStep--;
    if (currentStep < 0) currentStep = 0;
    showStep(currentStep);

  }

  function calculateCost() {
    const raw = (areaInput && areaInput.value) ? areaInput.value.trim() : "";
    const area = parseFloat(raw.replace(/,/g,'')); // allow commas in input
    if (!area || isNaN(area) || area <= 0) {
      result.innerHTML = `<p style="color:#c0392b">Invalid area. Please go back and enter a valid numeric area (e.g. 800).</p>`;
      return;
    }

    const qualityRates = { basic: 1200, standard: 1800, premium: 2500 };
    const finishRates = { standard: 100, luxury: 200 };

    const qualityKey = qualitySelect && qualitySelect.value ? qualitySelect.value : "basic";
    const finishKey = finishSelect && finishSelect.value ? finishSelect.value : "standard";

    const qualityRate = qualityRates[qualityKey] ?? qualityRates.basic;
    const finishRate = finishRates[finishKey] ?? finishRates.standard;

    const totalCost = area * (qualityRate + finishRate);
    const formatted = totalCost.toLocaleString('en-IN');

    result.innerHTML = `
      <strong>Area:</strong> ${area} sq.ft<br>
      <strong>Quality:</strong> ${qualityKey.toUpperCase()}<br>
      <strong>Finish:</strong> ${finishKey.toUpperCase()}<br><br>
      💰 <strong>Estimated Total:</strong> ₹${formatted}
    `;

    suggestContractors(qualityKey);
  }

  function suggestContractors(category) {
    const suggestionDiv = document.getElementById("suggestions");
    if (!suggestionDiv) return;
    suggestionDiv.innerHTML = `<h4>Recommended Contractors for You</h4>`;

    // fetch local contractors JSON if present (graceful fallback)
    fetch("contractors.json")
      .then(res => {
        if (!res.ok) throw new Error("Contractor data not available");
        return res.json();
      })
      .then(data => {
        let matches = [];

        if (category === "premium") {
          matches = data.filter(c => Number(c.rating) >= 4.5);
        } else if (category === "standard") {
          matches = data.filter(c => {
            const r = Number(c.rating);
            return r >= 4.0 && r < 4.5;
          });
        } else {
          matches = data;
        }

        if (!matches || matches.length === 0) {
          suggestionDiv.innerHTML += `<p style="margin-top:10px;">No matching contractors found for this quality type.</p>`;
          return;
        }

        matches.forEach(c => {
          const card = document.createElement("div");
          card.classList.add("contractor-card");
          card.innerHTML = `
            <h4>${c.name}</h4>
            <p><strong>Location:</strong> ${c.location || c.city || "N/A"}</p>
            <p><strong>Expertise:</strong> ${c.specialization || c.specialties || "General"}</p>
            <p><strong>Rating:</strong> ⭐ ${c.rating ?? "—"}</p>
            <p><strong>Price Range:</strong> ${c.priceRange ?? "—"}</p>
          `;
          suggestionDiv.appendChild(card);
        });
      })
      .catch(err => {
        console.warn("Error loading contractor data:", err);
        suggestionDiv.innerHTML += `<p style="margin-top:10px;">Unable to load contractor details right now.</p>`;
      });
  }

  // wire up buttons (works even if elements are added later)
  document.querySelectorAll(".nextBtn").forEach(btn => btn.addEventListener("click", nextStep));
  document.querySelectorAll(".prevBtn").forEach(btn => btn.addEventListener("click", prevStep));
  document.querySelectorAll(".nextBtn, .prevBtn").forEach(b => b.setAttribute("type","button"));


  // ensure initial step visibility (show first step)
  showStep(currentStep);

  // after showStep(currentStep);
const visible = steps[currentStep];
if (visible) {
  // Smoothly bring current step into center to avoid browser jumping to other elements
  visible.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Ensure focus so keyboard users don't lose place
  const firstInput = visible.querySelector('input, select, button, textarea');
  if (firstInput) firstInput.focus({ preventScroll: true });
}

});
