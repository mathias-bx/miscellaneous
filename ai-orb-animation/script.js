// Fixed Particle Data from the original implementation
const fixedParticleData = [
    { id: 0, radius: 62.62, angle: 212.00, size: 3.20, opacity: 0.49 },
    { id: 1, radius: 57.85, angle: 1.51, size: 4.93, opacity: 0.34 },
    { id: 2, radius: 76.35, angle: 164.00, size: 3.21, opacity: 0.14 },
    { id: 3, radius: 40.10, angle: 312.69, size: 3.16, opacity: 0.08 },
    { id: 4, radius: 62.26, angle: 9.83, size: 3.67, opacity: 0.16 },
    { id: 5, radius: 48.17, angle: 80.07, size: 3.34, opacity: 0.06 },
    { id: 6, radius: 69.18, angle: 80.48, size: 2.22, opacity: 0.41 },
    { id: 7, radius: 115.90, angle: 52.17, size: 3.41, opacity: 0.37 },
    { id: 8, radius: 55.48, angle: 113.71, size: 2.87, opacity: 0.53 },
    { id: 9, radius: 62.58, angle: 190.34, size: 4.91, opacity: 0.67 }
];

// Function to create animated particles
function createParticles() {
    const container = document.querySelector('.container');
    
    // Calculate animation parameters for each particle
    const baseDuration = 15;
    const baseFadeDuration = 8;
    
    // Create particles with animation properties
    fixedParticleData.forEach(p => {
        const duration = baseDuration + (p.id % 5);
        const delay = -(p.id * 2);
        const clockwise = p.id % 2 === 0;
        const fadeDuration = baseFadeDuration + (p.id % 4);
        const fadeDelay = -(p.id * 0.5);
        
        // Create orbit element
        const orbit = document.createElement('div');
        orbit.classList.add('orbit');
        orbit.style.transform = `translate(-50%, -50%) rotate(${p.angle}deg)`;
        orbit.style.animation = `${clockwise ? 'particle-rotate-variable-clockwise' : 'particle-rotate-variable-counter'} ${duration}s linear infinite`;
        orbit.style.animationDelay = `${delay}s`;
        orbit.style.zIndex = '5';
        orbit.style.setProperty('--initial-rotation', `${p.angle}deg`);
        
        // Create particle element
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.top = `-${p.size / 2}px`;
        particle.style.left = `-${p.size / 2}px`;
        particle.style.width = `${p.size}px`;
        particle.style.height = `${p.size}px`;
        particle.style.transform = `translateX(${p.radius}px)`;
        particle.style.animation = `particle-fade ${fadeDuration}s ease-in-out infinite`;
        particle.style.animationDelay = `${fadeDelay}s`;
        particle.style.setProperty('--particle-max-opacity', p.opacity);
        particle.style.setProperty('--particle-min-opacity', p.opacity * 0.3);
        
        // Append particle to orbit and orbit to container
        orbit.appendChild(particle);
        container.appendChild(orbit);
    });
}

// Function to create static particles - updated to match original StaticParticle component
function createStaticParticles() {
    const staticContainer = document.getElementById('static-particles');
    
    // Create static particles using the exact pattern from the React StaticParticle component
    fixedParticleData.forEach(p => {
        // Create orbit element (container for particle)
        const orbit = document.createElement('div');
        orbit.classList.add('static-orbit');
        orbit.style.position = 'absolute';
        orbit.style.top = '50%';
        orbit.style.left = '50%';
        orbit.style.width = '0px';
        orbit.style.height = '0px';
        orbit.style.transform = 'translate(-50%, -50%)';
        orbit.style.zIndex = '5';
        
        // Create particle element using the exact styling from StaticParticle
        const particle = document.createElement('div');
        particle.classList.add('static-particle');
        particle.style.position = 'absolute';
        particle.style.top = `-${p.size / 2}px`;
        particle.style.left = `-${p.size / 2}px`;
        particle.style.width = `${p.size}px`;
        particle.style.height = `${p.size}px`;
        particle.style.backgroundColor = 'white';
        particle.style.borderRadius = '50%';
        particle.style.filter = 'blur(1.5px)';
        particle.style.opacity = p.opacity;
        // Key difference: The transform matches the React implementation
        particle.style.transform = `rotate(${p.angle}deg) translateX(${p.radius}px)`;
        
        // Append particle to orbit and orbit to container
        orbit.appendChild(particle);
        staticContainer.appendChild(orbit);
    });

    // Add the remaining static elements based on the StaticAIOrb component
    updateStaticElements();
}

// Function to update static elements with the proper transforms from the StaticAIOrb component
function updateStaticElements() {
    // Update rim light 1 static
    const rimLightStatic = document.querySelector('.rim-light-static');
    if (rimLightStatic) {
        rimLightStatic.style.opacity = '1';
        rimLightStatic.style.transform = 'translate(-50%, -50%) scale(1.05)';
    }

    // Update rim light 3 static (using initial state of pendulum)
    const rimLight3Static = document.createElement('div');
    rimLight3Static.classList.add('static-element', 'rim-light-3-static');
    rimLight3Static.style.zIndex = '70';
    rimLight3Static.style.opacity = '1';
    rimLight3Static.style.transform = 'translate(-50%, -50%) translateX(-128px) rotate(45deg)';
    
    const rimLight3Inner = document.createElement('div');
    rimLight3Inner.style.position = 'absolute';
    rimLight3Inner.style.top = '-128px';
    rimLight3Inner.style.left = '-128px';
    rimLight3Inner.style.transform = 'scale(1.5)';
    rimLight3Inner.innerHTML = `
        <svg width="256" height="256" viewBox="0 0 337 308" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.6">
            <g filter="url(#filter0_f_5025_381_static)">
            <path d="M144.849 253.608C195.332 272.932 295.525 242.185 285.836 189.001C280.325 158.756 235.652 232.373 204.183 194.274C172.714 156.176 127.138 85.9921 67.812 120.804C8.48559 155.616 99.642 236.304 144.849 253.608Z" fill="url(#paint0_radial_5025_381_static)"/>
            </g>
            </g>
            <defs>
            <filter id="filter0_f_5025_381_static" x="0.366638" y="63.392" width="334.124" height="244.026" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feGaussianBlur stdDeviation="24" result="effect1_foregroundBlur_5025_381"/>
            </filter>
            <radialGradient id="paint0_radial_5025_381_static" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(223.5 240) rotate(-132.64) scale(163.126 119.034)">
            <stop offset="0.64" stop-color="white"/>
            <stop offset="1" stop-color="white" stop-opacity="0"/>
            </radialGradient>
            </defs>
        </svg>
    `;
    
    rimLight3Static.appendChild(rimLight3Inner);
    
    // Add rim light 4 static
    const rimLight4Static = document.createElement('div');
    rimLight4Static.classList.add('static-element', 'rim-light-4-static');
    rimLight4Static.style.zIndex = '95';
    rimLight4Static.style.mixBlendMode = 'color-dodge';
    rimLight4Static.style.opacity = '1';
    rimLight4Static.style.transform = 'translate(-50%, -50%) rotate(-60deg) scale(0.95)';
    
    const rimLight4Inner = document.createElement('div');
    rimLight4Inner.style.position = 'absolute';
    rimLight4Inner.style.top = '-128px';
    rimLight4Inner.style.left = '-128px';
    rimLight4Inner.innerHTML = `
        <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
        <g opacity="0.6" filter="url(#filter0_f_5060_630_static)">
        <circle cx="128" cy="128" r="112" fill="url(#paint0_radial_5060_630_static)"/>
        </g>
        </g>
        <defs>
        <filter id="filter0_f_5060_630_static" x="8" y="8" width="240" height="240" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feGaussianBlur stdDeviation="4" result="effect1_foregroundBlur_5060_630"/>
        </filter>
        <radialGradient id="paint0_radial_5060_630_static" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(128 179.52) rotate(-135.026) scale(164.505 243.528)">
        <stop offset="0.537777" stop-color="#FF62E2" stop-opacity="0"/>
        <stop offset="0.834122" stop-color="#FF62E2"/>
        </radialGradient>
        </defs>
        </svg>
    `;
    
    rimLight4Static.appendChild(rimLight4Inner);
    
    // Add rim light 5 static
    const rimLight5Static = document.createElement('div');
    rimLight5Static.classList.add('static-element', 'rim-light-5-static');
    rimLight5Static.style.zIndex = '100';
    rimLight5Static.style.mixBlendMode = 'color-dodge';
    rimLight5Static.style.opacity = '1';
    rimLight5Static.style.transform = 'translate(-50%, -50%) scale(1.05)';
    
    const rimLight5Inner = document.createElement('div');
    rimLight5Inner.style.position = 'absolute';
    rimLight5Inner.style.top = '-128px';
    rimLight5Inner.style.left = '-128px';
    rimLight5Inner.innerHTML = `
        <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_f_5060_644_static)">
        <path d="M154.499 32.5008C203.999 45.0005 237.765 114.042 198.999 94.4981C160.233 74.9542 94.7616 143.196 63.4999 94.4975C32.2381 45.7986 105 20.001 154.499 32.5008Z" fill="url(#paint0_radial_5060_644_static)"/>
        </g>
        <defs>
        <filter id="filter0_f_5060_644_static" x="43.9482" y="17.3705" width="183.892" height="107.031" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feGaussianBlur stdDeviation="6" result="effect1_foregroundBlur_5060_644"/>
        </filter>
        <radialGradient id="paint0_radial_5060_644_static" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(217.001 56.4989) rotate(139.004) scale(70.8837 140.972)">
        <stop offset="0.300664" stop-color="#FFC5E3"/>
        <stop offset="1" stop-color="#FFC5E3" stop-opacity="0"/>
        </radialGradient>
        </defs>
        </svg>
    `;
    
    rimLight5Static.appendChild(rimLight5Inner);
    
    // Get static container and append additional elements
    const staticContainer = document.querySelector('.static-container');
    if (staticContainer) {
        staticContainer.appendChild(rimLight3Static);
        staticContainer.appendChild(rimLight4Static);
        staticContainer.appendChild(rimLight5Static);
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    createStaticParticles();
}); 