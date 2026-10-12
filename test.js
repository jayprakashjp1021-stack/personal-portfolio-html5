document.addEventListener("DOMContentLoaded", function() {
    // --- 1. THREE.JS 3D MOTION BACKGROUND ANIMATION ---
    const container = document.getElementById("canvas-container");
    if (container) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Create a 3D Torus Knot (Wireframe) matching your red/creamy theme tones
        const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff6666,
            wireframe: true
        });
        const torusKnot = new THREE.Mesh(geometry, material);
        scene.add(torusKnot);

        camera.position.z = 30;

        // Animation Loop
        function animate3D() {
            requestAnimationFrame(animate3D);
            torusKnot.rotation.x += 0.005;
            torusKnot.rotation.y += 0.008;
            renderer.render(scene, camera);
        }
        animate3D();

        // Responsive resize handler
        window.addEventListener("resize", () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    // --- 2. ARRAY-POWERED IMAGE GALLERY SLIDER ---
    const sliderData = [{
            image: "web.jpeg",
            title: "Web Development",
            description: "Building responsive and user-friendly websites."
        },
        {
            image: "work.jpeg",
            title: "Programming",
            description: "Learning Python, problem-solving, and software development."
        },
        {
            image: "Emarket.jpeg",
            title: "Cybersecurity",
            description: "Exploring Linux, networking, and digital security."
        }
    ];

    let currentIndex = 0;

    const sliderImage = document.getElementById("slider-image");
    const sliderTitle = document.getElementById("slider-title");
    const sliderDesc = document.getElementById("slider-desc");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const dotsContainer = document.getElementById("slider-dots");
    const statusText = document.getElementById("slider-status");

    // Generate pagination dots dynamically from the array
    if (dotsContainer) {
        sliderData.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.classList.add("dot");
            if (index === 0) dot.classList.add("active");
            dot.setAttribute("aria-label", `Slide ${index + 1}`);
            dot.addEventListener("click", () => {
                currentIndex = index;
                updateSlider();
            });
            dotsContainer.appendChild(dot);
        });
    }

    const dots = document.querySelectorAll(".dot");

    function updateSlider() {
        const currentSlide = sliderData[currentIndex];

        if (sliderImage) sliderImage.src = currentSlide.image;
        if (sliderTitle) sliderTitle.textContent = currentSlide.title;
        if (sliderDesc) sliderDesc.textContent = currentSlide.description;

        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });

        if (statusText) {
            statusText.textContent = `Slide ${currentIndex + 1} of ${sliderData.length}`;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + sliderData.length) % sliderData.length;
            updateSlider();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % sliderData.length;
            updateSlider();
        });
    }

    // Initialize first slide
    updateSlider();
});