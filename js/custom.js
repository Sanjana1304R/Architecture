document.addEventListener("DOMContentLoaded", () => {
    // Dismiss Preloader on window load
    const preloader = document.getElementById("preloader");
    if (preloader) {
        const dismissPreloader = () => {
            preloader.style.opacity = "0";
            preloader.style.visibility = "hidden";
            setTimeout(() => {
                preloader.style.display = "none";
                document.body.classList.add("loaded");
            }, 500);
        };

        if (document.readyState === "complete") {
            dismissPreloader();
        } else {
            window.addEventListener("load", dismissPreloader);
        }
        
        // Fallback: hide preloader after 3 seconds in case window load event already fired or is delayed
        setTimeout(() => {
            if (preloader.style.visibility !== "hidden") {
                dismissPreloader();
            }
        }, 3000);
    }

    const container = document.getElementById("renovationSlider");
    const plainLayer = document.getElementById("plainLayer");
    const handle = document.getElementById("sliderHandle");

    if (!container || !plainLayer || !handle) return;

    let isDragging = false;
    let containerRect = container.getBoundingClientRect();

    let currentPercentage = 50;
    let targetPercentage = 50;
    const easeMultiplier = 0.12;  // Controls the smooth "antigravity" float effect

    // Keeps images perfectly sized to the full screen
    const updateImageProportions = () => {
        containerRect = container.getBoundingClientRect();
        const imgs = container.querySelectorAll(".image-layer img");
        imgs.forEach(img => {
            img.style.width = `${window.innerWidth}px`;
            img.style.height = `${window.innerHeight}px`;
        });
    };

    window.addEventListener("resize", updateImageProportions);
    updateImageProportions();

    // Mouse Tracking Controls
    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        containerRect = container.getBoundingClientRect();
        processMove(e.clientX);
        document.body.style.cursor = "ew-resize";
        document.body.style.userSelect = "none";
    });

    window.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        processMove(e.clientX);
    });

    // Touch/Mobile Tracking Controls
    container.addEventListener("touchstart", (e) => {
        isDragging = true;
        containerRect = container.getBoundingClientRect();
        if (e.touches.length > 0) processMove(e.touches[0].clientX);
        document.body.style.userSelect = "none";
    }, { passive: true });

    window.addEventListener("touchend", () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = "";
        }
    });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging || e.touches.length === 0) return;
        if (e.cancelable) {
            e.preventDefault();
        }
        processMove(e.touches[0].clientX);
    }, { passive: false });

    function processMove(clientX) {
        const xPos = clientX - containerRect.left;
        let calculatedPercentage = (xPos / containerRect.width) * 100;

        if (calculatedPercentage < 0) calculatedPercentage = 0;
        if (calculatedPercentage > 100) calculatedPercentage = 100;

        targetPercentage = calculatedPercentage;
    }

    // Smooth Physics Rendering Loop
    function renderPhysicsLoop() {
        const distanceToTravel = targetPercentage - currentPercentage;
        currentPercentage += distanceToTravel * easeMultiplier;

        plainLayer.style.width = `${currentPercentage}%`;
        handle.style.left = `${currentPercentage}%`;

        requestAnimationFrame(renderPhysicsLoop);
    }

    requestAnimationFrame(renderPhysicsLoop);
});