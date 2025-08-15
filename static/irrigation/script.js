// Get references to elements
const form = document.getElementById("irrigationForm");
const moistureSlider = document.getElementById("moistureSlider");
const temperatureSlider = document.getElementById("temperatureSlider");
const moistureValue = document.getElementById("moistureValue");
const temperatureValue = document.getElementById("temperatureValue");
const selectedCropText = document.getElementById("selectedCrop");
const selectedSoilText = document.getElementById("selectedSoil");
const resultMethod = document.getElementById("resultMethod");
const resultFrequency = document.getElementById("resultFrequency");
const resultWaterAmount = document.getElementById("resultWaterAmount");
const resultSection = document.getElementById("resultSection");
const errorMessage = document.getElementById("errorMessage");

// Update slider values in UI
moistureSlider.addEventListener("input", () => {
  moistureValue.textContent = moistureSlider.value;
});

temperatureSlider.addEventListener("input", () => {
  temperatureValue.textContent = temperatureSlider.value;
});

// Handle form submission
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Gather form data
  const formData = {
    crop: form.crop.value,
    soil_type: form.soil_type.value,
    moisture: moistureSlider.value,
    temperature: temperatureSlider.value,
  };

  // Validate inputs
  if (!formData.crop || !formData.soil_type) {
    errorMessage.textContent = "Please select both crop and soil type.";
    errorMessage.style.display = "block";
    resultSection.classList.add("hidden");
    return;
  } else {
    errorMessage.style.display = "none";
  }

  try {
    // Send POST request with form data as JSON
    const response = await fetch("/irrigation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Parse JSON response
    const recommendation = await response.json();

    // Update UI with response data
    selectedCropText.textContent = formData.crop;
    selectedSoilText.textContent = formData.soil_type;
    resultMethod.textContent = recommendation.method || "N/A";
    resultFrequency.textContent = recommendation.frequency || "N/A";
    resultWaterAmount.textContent = recommendation.waterAmount || "N/A";

    resultSection.classList.remove("hidden");
  } catch (error) {
    errorMessage.textContent = `Error: ${error.message}`;
    errorMessage.style.display = "block";
    resultSection.classList.add("hidden");
  }
});
