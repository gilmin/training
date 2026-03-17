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

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    // Disable the start button
    const startBtn = document.getElementById("start-btn");
    startBtn.disabled = true;
    startBtn.textContent = "Loading Model...";

    try {
        // load the model and metadata
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }

        startBtn.style.display = 'none';
    } catch (error) {
        console.error("Error initializing Teachable Machine:", error);
        startBtn.textContent = "Error Loading Model";
        startBtn.disabled = false;
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(0) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
