document.getElementById("glucoseForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const diabetic = document.getElementById("diabetic").value === "yes";
  const cpb = document.getElementById("cpb").value === "yes";
  const glucose = parseInt(document.getElementById("glucose").value);
  let resultText = "";
  let startInfusion = false;

  if ((diabetic && glucose >= 100) || (!diabetic && glucose >= 140)) {
    startInfusion = true;
  }

  if (!startInfusion) {
    resultText = "No insulin infusion needed at this time.";
  } else {
    let bolus = 0, rate = 0;

    const ranges = [
      [100, 110, 0, 2],
      [111, 130, 0, 4],
      [131, 150, cpb ? 2 : 1, 4],
      [151, 170, cpb ? 4 : 2, 6],
      [171, 190, 4, 8],
      [191, 210, cpb ? 6 : 3, 8],
      [211, 230, cpb ? 8 : 4, 10],
      [231, 250, cpb ? 10 : 5, 10],
      [251, 300, cpb ? 12 : 6, 14],
      [301, 999, cpb ? 12 : 6, 14],
    ];

    for (let [min, max, b, r] of ranges) {
      if (glucose >= min && glucose <= max) {
        bolus = b;
        rate = r;
        break;
      }
    }

    resultText = `Start insulin infusion.<br><strong>Bolus:</strong> ${bolus} units<br><strong>Infusion Rate:</strong> ${rate} units/hr`;
    startTimer(30 * 60);
  }

  document.getElementById("result").innerHTML = resultText;

  const logEntry = document.createElement("li");
  const timestamp = new Date().toLocaleTimeString();
  logEntry.innerHTML = `Time: ${timestamp} — BG: ${glucose} mg/dL — ${resultText.replace(/<[^>]*>?/gm, '')}`;
  document.getElementById("glucoseLog").appendChild(logEntry);
});

document.getElementById("protocolSummary").addEventListener("click", () => {
  alert(`Protocol Summary:\n
- Start insulin if diabetic and BG ≥100\n
- Start insulin if non-diabetic and BG ≥140\n
- Initial dosing based on CPB status and BG\n
- Recheck glucose every 30 minutes\n
- Adjust insulin based on BG change (delta logic)\n
- Cross Clamp Applied button:\n
  >120 mg/dL → 10u bolus\n
  ≤120 mg/dL → 5u bolus\n
- BG <60 → Stop insulin + give 25ml D50`);
});

document.getElementById("crossClampButton").addEventListener("click", () => {
  const lastBG = prompt("Enter the most recent blood glucose (mg/dL):");
  if (lastBG !== null) {
    const bgValue = parseFloat(lastBG);
    if (!isNaN(bgValue)) {
      if (bgValue > 120) {
        alert("Recommend 10 units insulin bolus.");
      } else {
        alert("Recommend 5 units insulin bolus.");
      }
    } else {
      alert("Invalid blood glucose value entered.");
    }
  }
});

let timerInterval;
function startTimer(duration) {
  clearInterval(timerInterval);
  let timeLeft = duration;

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById("timer").textContent = 
      `Next glucose check in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("timer").textContent = "⏰ Time to recheck glucose!";
    }
    timeLeft--;
  }

  updateTimerDisplay();
  timerInterval = setInterval(updateTimerDisplay, 1000);
}
