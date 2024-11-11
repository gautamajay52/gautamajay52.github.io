const toggleButton = document.querySelector('.dark-mode-toggle');
const body = document.body;

// const currentTheme = localStorage.getItem('theme');

// if (currentTheme) {
//     body.classList.toggle('light-mode', currentTheme === 'dark');
//     toggleButton.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';
// } else {
//     body.classList.toggle('light-mode');
//     toggleButton.innerHTML = '🌙';
// }

toggleButton.addEventListener('click', () => {
    body.classList.toggle('light-mode');

    if (body.classList.contains('light-mode')) {
        // localStorage.setItem('theme', 'light');
        toggleButton.innerHTML = '🌙';
    } else {
        // localStorage.setItem('theme', 'dark');
        toggleButton.innerHTML = '☀️';
    }
});

// Initialize particles.js
particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 200,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#00FFFF"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#fff000"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 6,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": true,
            "attract": {
                "enable": true,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 140,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});


const titleElement = document.querySelector('title');
const text = titleElement.textContent;
titleElement.textContent = '|';

let index = 0;
let isDeleting = false;
const typingSpeed = 250;
const deleteSpeed = 150;
const blinkSpeed = 80;
const deleteDelay = 250;

function typeText() {
    if (isDeleting && index >= 0) {
        titleElement.textContent = text.substring(0, index) + '|';
        index--;
        setTimeout(typeText, deleteSpeed);
    } else if (!isDeleting && index < text.length) {
        titleElement.textContent = text.substring(0, index) + '|';
        index++;
        setTimeout(typeText, typingSpeed);
    } else {
        titleElement.textContent = text.substring(0, index);
        titleElement.textContent += '|';
        isDeleting = !isDeleting;
        setTimeout(() => {
            setTimeout(typeText, deleteDelay);
        }, blinkSpeed);
    }
}

typeText();