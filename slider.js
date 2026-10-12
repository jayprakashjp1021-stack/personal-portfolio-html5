/*
 * Image Slider Library
 * Personal Portfolio - Jay Prakash Thakur
 * Built with vanilla JavaScript and an ES6 class.
 */

class ImageSlider {
    constructor(selector, options = {}) {
        this.slider = document.querySelector(selector);

        if (!this.slider) {
            return;
        }

        this.track = this.slider.querySelector(".slider-track");
        // Fixed selectors to match your HTML classes (.slider-btn.prev and .slider-btn.next)
        this.previousButton = this.slider.querySelector(".slider-btn.prev");
        this.nextButton = this.slider.querySelector(".slider-btn.next");
        this.dotsContainer = this.slider.querySelector(".slider-dots");
        this.status = this.slider.querySelector(".slider-status");

        if (
            !this.track ||
            !this.previousButton ||
            !this.nextButton ||
            !this.dotsContainer ||
            !this.status
        ) {
            return;
        }

        this.options = {
            autoplay: true,
            interval: 5000,
            transitionDuration: 500,
            ...options
        };

        this.originalSlides = Array.from(
            this.track.querySelectorAll(".slide")
        );

        this.slideCount = this.originalSlides.length;
        this.currentIndex = 1;
        this.isTransitioning = false;
        this.timer = null;
        this.resizeTimer = null;

        this.reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        if (this.slideCount === 0) {
            return;
        }

        this.initialize();
    }

    /*
     * Initialize the slider.
     */
    initialize() {
        this.createClonedSlides();
        this.createDots();
        this.bindEvents();

        this.updatePosition(false);
        this.updateDots();
        this.updateStatus();

        this.startAutoplay();
    }

    /*
     * Clone the first and last slides for infinite looping.
     */
    createClonedSlides() {
        const firstClone = this.originalSlides[0].cloneNode(true);
        const lastClone = this.originalSlides[this.slideCount - 1].cloneNode(true);

        firstClone.classList.add("slide-clone");
        lastClone.classList.add("slide-clone");

        firstClone.setAttribute("aria-hidden", "true");
        lastClone.setAttribute("aria-hidden", "true");

        firstClone.setAttribute("inert", "");
        lastClone.setAttribute("inert", "");

        this.track.appendChild(firstClone);
        this.track.insertBefore(lastClone, this.originalSlides[0]);
    }

    /*
     * Create navigation dots dynamically.
     */
    createDots() {
        this.dotsContainer.replaceChildren();
        this.dots = [];

        this.originalSlides.forEach((slide, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "slider-dot";
            dot.setAttribute("aria-label", "Show image " + (index + 1));

            dot.addEventListener("click", () => {
                this.goTo(index + 1);
                this.restartAutoplay();
            });

            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });
    }

    /*
     * Add event listeners for slider controls.
     */
    bindEvents() {
        this.nextButton.addEventListener("click", () => {
            this.next();
            this.restartAutoplay();
        });

        this.previousButton.addEventListener("click", () => {
            this.previous();
            this.restartAutoplay();
        });

        this.track.addEventListener("transitionend", (event) => {
            if (
                event.target !== this.track ||
                event.propertyName !== "transform"
            ) {
                return;
            }

            this.handleTransitionEnd();
        });

        this.slider.addEventListener("mouseenter", () => {
            this.stopAutoplay();
        });

        this.slider.addEventListener("mouseleave", () => {
            this.startAutoplay();
        });

        this.slider.addEventListener("focusin", () => {
            this.stopAutoplay();
        });

        this.slider.addEventListener("focusout", () => {
            this.startAutoplay();
        });

        /*
         * Keyboard controls: Left arrow & Right arrow.
         */
        this.slider.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") {
                event.preventDefault();
                this.next();
                this.restartAutoplay();
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                this.previous();
                this.restartAutoplay();
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stopAutoplay();
            } else {
                this.startAutoplay();
            }
        });

        this.motionChangeHandler = () => {
            if (this.reducedMotion.matches) {
                this.stopAutoplay();
                this.setTransition(false);
            } else {
                this.setTransition(true);
                this.startAutoplay();
            }
        };

        if (this.reducedMotion.addEventListener) {
            this.reducedMotion.addEventListener(
                "change",
                this.motionChangeHandler
            );
        }

        this.resizeHandler = () => {
            window.clearTimeout(this.resizeTimer);

            this.resizeTimer = window.setTimeout(() => {
                this.updatePosition(false);
            }, 100);
        };

        window.addEventListener("resize", this.resizeHandler);
    }

    next() {
        if (this.isTransitioning || this.slideCount < 2) {
            return;
        }

        this.goTo(this.currentIndex + 1);
    }

    previous() {
        if (this.isTransitioning || this.slideCount < 2) {
            return;
        }

        this.goTo(this.currentIndex - 1);
    }

    goTo(index) {
        if (this.isTransitioning || this.slideCount < 2) {
            return;
        }

        this.currentIndex = index;

        if (this.reducedMotion.matches) {
            if (this.currentIndex === this.slideCount + 1) {
                this.currentIndex = 1;
            } else if (this.currentIndex === 0) {
                this.currentIndex = this.slideCount;
            }

            this.updatePosition(false);
            this.updateDots();
            this.updateStatus();
            return;
        }

        this.isTransitioning = true;

        this.setTransition(true);
        this.updatePosition(true);
        this.updateDots();
        this.updateStatus();
    }

    updatePosition(animate) {
        if (!animate) {
            this.setTransition(false);
        }

        const offset = this.currentIndex * 100;

        this.track.style.transform = "translateX(-" + offset + "%)";
    }

    setTransition(enabled) {
        if (enabled && !this.reducedMotion.matches) {
            this.track.style.transition =
                "transform " +
                this.options.transitionDuration +
                "ms ease-in-out";
        } else {
            this.track.style.transition = "none";
        }
    }

    handleTransitionEnd() {
        if (this.currentIndex === this.slideCount + 1) {
            this.currentIndex = 1;
            this.updatePosition(false);
        } else if (this.currentIndex === 0) {
            this.currentIndex = this.slideCount;
            this.updatePosition(false);
        }

        this.isTransitioning = false;

        this.updateDots();
        this.updateStatus();
    }

    updateDots() {
        const activeIndex =
            (this.currentIndex - 1 + this.slideCount) % this.slideCount;

        this.dots.forEach((dot, index) => {
            const isActive = index === activeIndex;

            dot.classList.toggle("active", isActive);

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    updateStatus() {
        const activeIndex =
            (this.currentIndex - 1 + this.slideCount) % this.slideCount;

        this.status.textContent =
            "Slide " + (activeIndex + 1) + " of " + this.slideCount;
    }

    startAutoplay() {
        if (
            !this.options.autoplay ||
            this.reducedMotion.matches ||
            document.hidden ||
            this.timer !== null ||
            this.slider.matches(":hover") ||
            this.slider.contains(document.activeElement)
        ) {
            return;
        }

        this.timer = window.setInterval(() => {
            if (!this.isTransitioning) {
                this.next();
            }
        }, this.options.interval);
    }

    stopAutoplay() {
        if (this.timer !== null) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
    }

    restartAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }

    destroy() {
        this.stopAutoplay();
        window.clearTimeout(this.resizeTimer);

        this.track
            .querySelectorAll(".slide-clone")
            .forEach((clone) => clone.remove());

        this.dotsContainer.replaceChildren();
        this.track.style.transition = "";
        this.track.style.transform = "";

        window.removeEventListener("resize", this.resizeHandler);

        if (this.reducedMotion.removeEventListener) {
            this.reducedMotion.removeEventListener(
                "change",
                this.motionChangeHandler
            );
        }
    }
}

/*
 * Initialize the portfolio slider when the page loads.
 */
document.addEventListener("DOMContentLoaded", () => {
    const portfolioSlider = new ImageSlider(".image-slider", {
        autoplay: true,
        interval: 5000,
        transitionDuration: 500
    });
});