
/* =========================================
   MINDMETRIC
   Student Mental Health Score Predictor
========================================= */

// Local FastAPI endpoint.
// Change this if your backend is deployed.
const API_URL = "https://mental-health-predictor-api-y8u6.onrender.com/predict";


// Your model's score display range.
// Change these if your dataset uses a different range.
const MIN_SCORE = 0;
const MAX_SCORE = 10;


// =========================================
// DOM ELEMENTS
// =========================================

const form = document.getElementById("assessmentForm");

const predictButton = document.getElementById("predictButton");

const buttonText = document.getElementById("buttonText");

const buttonIcon = document.getElementById("buttonIcon");

const errorMessage = document.getElementById("errorMessage");

const errorText = document.getElementById("errorText");

const progressFill = document.getElementById("progressFill");

const progressText = document.getElementById("progressText");

const scoreValue = document.getElementById("scoreValue");

const scoreRing = document.getElementById("scoreRing");

const scoreUnit = document.getElementById("scoreUnit");

const scoreLabel = document.getElementById("scoreLabel");

const scoreDescription = document.getElementById("scoreDescription");

const insightContent = document.getElementById("insightContent");

const resultStatus = document.getElementById("resultStatus");

const resultScaleNote = document.getElementById("resultScaleNote");


// =========================================
// FORM PROGRESS
// =========================================

const formInputs = [
    ...form.querySelectorAll("input, select")
];

const sections = [
    ...document.querySelectorAll(".form-section")
];

const stepItems = [
    ...document.querySelectorAll(".step-item")
];


function updateProgress() {

    const filledInputs = formInputs.filter(input => {

        return input.value.trim() !== "";

    }).length;


    const progress = Math.round(
        (filledInputs / formInputs.length) * 100
    );


    progressFill.style.width = `${progress}%`;

    progressText.textContent = `${progress}%`;


    sections.forEach(section => {

        const inputs = [
            ...section.querySelectorAll("input, select")
        ];

        const completed = inputs.every(input => {

            return input.value.trim() !== "";

        });


        const stepItem = document.querySelector(
            `.step-item[data-step="${section.dataset.section}"]`
        );


        if (stepItem) {

            stepItem.classList.toggle(
                "completed",
                completed
            );

        }

    });


    const firstIncomplete = sections.find(section => {

        const inputs = [
            ...section.querySelectorAll("input, select")
        ];

        return !inputs.every(input => {

            return input.value.trim() !== "";

        });

    });


    stepItems.forEach(item => {

        item.classList.remove("active");

    });


    if (firstIncomplete) {

        const activeStep = document.querySelector(
            `.step-item[data-step="${firstIncomplete.dataset.section}"]`
        );

        if (activeStep) {

            activeStep.classList.add("active");

        }

    }

}


formInputs.forEach(input => {

    input.addEventListener("input", updateProgress);

    input.addEventListener("change", updateProgress);

});


updateProgress();


// =========================================
// ERROR HANDLING - FIXED
// =========================================

function showError(message) {
    errorText.textContent = message;

    errorMessage.hidden = false;
    errorMessage.style.display = "flex";
}

function hideError() {
    errorText.textContent = "";

    errorMessage.hidden = true;
    errorMessage.style.display = "none";
}


// =========================================
// LOADING STATE
// =========================================

function setLoading(isLoading) {

    predictButton.disabled = isLoading;


    if (isLoading) {

        buttonText.textContent = "Generating prediction...";

        buttonIcon.className = "fa-solid fa-spinner fa-spin";

    } else {

        buttonText.textContent = "Generate my prediction";

        buttonIcon.className = "fa-solid fa-arrow-right";

    }

}


// =========================================
// GET FORM DATA
// =========================================

function getFormData() {

    const formData = new FormData(form);

    const data = {};


    formData.forEach((value, key) => {

        data[key] = value;

    });


    // Convert values to the types expected by Pydantic.
    data.age = Number(data.age);

    data.avg_daily_usage_hours = Number(
        data.avg_daily_usage_hours
    );

    data.daily_unlocks = Number(
        data.daily_unlocks
    );

    data.study_hours = Number(
        data.study_hours
    );

    data.physical_activity_hours = Number(
        data.physical_activity_hours
    );

    data.sleep_hours_per_night = Number(
        data.sleep_hours_per_night
    );


    // stress_level stays a STRING:
    // "Low", "Medium", "High", "Very High"


    return data;

}


// =========================================
// READ BACKEND RESPONSE
// =========================================

function getPredictionValue(data) {

    // Exact response from your PredictionResponse model.
    const prediction = data.predicted_mental_health_score;


    if (
        prediction === undefined ||
        prediction === null
    ) {

        throw new Error(
            "The backend response does not contain " +
            "predicted_mental_health_score."
        );

    }


    const score = Number(prediction);


    if (!Number.isFinite(score)) {

        throw new Error(
            "The backend returned an invalid prediction score."
        );

    }


    return score;

}


// =========================================
// SCORE ANIMATION
// =========================================

function animateScore(score) {

    const duration = 1400;

    const startTime = performance.now();


    // Clamp the visual score to the configured range.
    // The original returned value is still displayed.
    const normalizedScore = Math.max(
        MIN_SCORE,
        Math.min(MAX_SCORE, score)
    );


    const percentage =
        ((normalizedScore - MIN_SCORE) /
        (MAX_SCORE - MIN_SCORE)) * 100;


    const targetDegrees = percentage * 3.6;


    function update(currentTime) {

        const elapsed = currentTime - startTime;


        const progress = Math.min(
            elapsed / duration,
            1
        );


        // Smooth animation.
        const eased = 1 - Math.pow(1 - progress, 4);


        const currentScore = score * eased;

        const currentDegrees = targetDegrees * eased;


        scoreValue.textContent =
            currentScore.toFixed(2);


        scoreRing.style.setProperty(
            "--score-progress",
            `${currentDegrees}deg`
        );


        if (progress < 1) {

            requestAnimationFrame(update);

        } else {

            scoreValue.textContent =
                score.toFixed(2);

        }

    }


    scoreValue.textContent = "0.00";


    scoreRing.style.setProperty(
        "--score-progress",
        "0deg"
    );


    requestAnimationFrame(update);

}


// =========================================
// RESULT DASHBOARD
// =========================================

function showResult(score) {

    // Animate the prediction.
    animateScore(score);


    // Display the score.
    scoreUnit.textContent = "Model prediction";


    scoreLabel.textContent =
        "Prediction generated";


    scoreDescription.textContent =
        "Your machine learning model generated " +
        "this numerical prediction. The meaning of " +
        "the score depends on the target definition " +
        "and scale used during model training.";


    // Status.
    resultStatus.innerHTML = `
        <span class="status-dot"></span>
        Prediction generated
    `;


    resultStatus.classList.add("completed");


    // Update explanation.
    insightContent.innerHTML = "";


    const icon = document.createElement("div");

    icon.className = "empty-result-icon";

    icon.innerHTML = `
        <i class="fa-solid fa-chart-pie"></i>
    `;


    const heading = document.createElement("h4");

    heading.textContent = "Your prediction is ready";


    const paragraph = document.createElement("p");

    paragraph.textContent =
        `Your model returned ${score.toFixed(2)}. ` +
        "This is a machine learning output, not a " +
        "clinical assessment. The score should be " +
        "interpreted using your dataset's target definition.";


    insightContent.appendChild(icon);

    insightContent.appendChild(heading);

    insightContent.appendChild(paragraph);


    resultScaleNote.textContent =
        `The circular visualization uses a ${MIN_SCORE}–${MAX_SCORE} ` +
        "display scale. This visualization does not define " +
        "clinical mental health categories.";


    // Scroll to results.
    document.getElementById("results").scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


// =========================================
// FORM SUBMISSION
// =========================================

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    hideError();


    // Check browser form validation.
    if (!form.checkValidity()) {

        form.reportValidity();

        return;

    }


    const payload = getFormData();


    console.log("Sending prediction request:", payload);


    try {

        setLoading(true);


        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(payload)

        });


        // FastAPI validation or backend error.
        if (!response.ok) {

            let message = `Request failed: ${response.status}`;


            try {

                const errorData = await response.json();


                if (errorData.detail) {

                    if (Array.isArray(errorData.detail)) {

                        message = errorData.detail
                            .map(error => {

                                const field = error.loc
                                    ? error.loc.join(" → ")
                                    : "Input";

                                return `${field}: ${error.msg}`;

                            })
                            .join(" | ");

                    } else {

                        message = errorData.detail;

                    }

                }

            } catch {

                // Keep default error.

            }


            throw new Error(message);

        }


        // Read response.
        const data = await response.json();


        console.log("Prediction response:", data);


        // Extract exact response field.
        const score = getPredictionValue(data);


        // Display result.
        showResult(score);


    } catch (error) {

        console.error("Prediction error:", error);


        if (error instanceof TypeError) {

            showError(
                "Unable to connect to FastAPI. " +
                "Make sure your backend is running " +
                "and the API URL is correct."
            );

        } else {

            showError(error.message);

        }

    } finally {

        setLoading(false);

    }

});
