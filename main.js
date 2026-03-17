const generateBtn = document.getElementById('generate-btn');
const numbersContainer = document.getElementById('numbers-container');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Theme Toggle Logic
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️ Light Mode';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    let theme = 'light';
    if (body.classList.contains('dark-mode')) {
        theme = 'dark';
        themeToggle.textContent = '☀️ Light Mode';
    } else {
        themeToggle.textContent = '🌙 Dark Mode';
    }
    localStorage.setItem('theme', theme);
});

// Lotto Generation Logic
generateBtn.addEventListener('click', () => {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    
    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    
    sortedNumbers.forEach((number, index) => {
        setTimeout(() => {
            const numberElement = document.createElement('div');
            numberElement.classList.add('number');
            numberElement.textContent = number;
            numbersContainer.appendChild(numberElement);
            
            // Basic animation
            numberElement.style.opacity = '0';
            numberElement.style.transform = 'translateY(10px)';
            numberElement.style.transition = 'all 0.3s ease';
            
            requestAnimationFrame(() => {
                numberElement.style.opacity = '1';
                numberElement.style.transform = 'translateY(0)';
            });
        }, index * 100);
    });
});

// Teachable Machine Image Model Logic
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/BC8cG9qja/";

let model, labelContainer, maxPredictions;

// Load the model initially
async function loadModel() {
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

// Initial model load
loadModel();

const imageUpload = document.getElementById("image-upload");
const previewImage = document.getElementById("preview-image");

imageUpload.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
            
            // Give image a moment to render before predicting
            previewImage.onload = async () => {
                await predict(previewImage);
            };
        };
        reader.readAsDataURL(file);
    }
});

// run the image through the image model
async function predict(imageElement) {
    if (!model) {
        console.error("Model not loaded yet.");
        return;
    }
    const prediction = await model.predict(imageElement);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(0) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
