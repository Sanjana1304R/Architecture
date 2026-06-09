document.addEventListener("DOMContentLoaded", () => {
    let triggerSliderAutoMove = null;

    // === Preloader ===
    const preloader = document.getElementById("preloader");
    if (preloader) {
        const dismissPreloader = () => {
            preloader.style.opacity = "0";
            preloader.style.visibility = "hidden";
            setTimeout(() => {
                preloader.style.display = "none";
                document.body.classList.add("loaded");
                if (triggerSliderAutoMove) {
                    triggerSliderAutoMove();
                }
            }, 500);
        };

        if (document.readyState === "complete") {
            dismissPreloader();
        } else {
            window.addEventListener("load", dismissPreloader);
        }

        setTimeout(() => {
            if (preloader.style.visibility !== "hidden") {
                dismissPreloader();
            }
        }, 3000);
    } else {
        setTimeout(() => {
            if (triggerSliderAutoMove) triggerSliderAutoMove();
        }, 100);
    }

    // === Before/After Slider ===
    const container = document.getElementById("renovationSlider");
    const plainLayer = document.getElementById("plainLayer");
    const handle = document.getElementById("sliderHandle");

    if (container && plainLayer && handle) {
        let isDragging = false;
        let containerRect = container.getBoundingClientRect();
        let currentPercentage = 0;
        let targetPercentage = 0;
        const easeMultiplier = 0.08;

        plainLayer.style.width = "0%";
        handle.style.left = "0%";

        let autoMoveActive = false;

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

        const stopAutoMove = () => { autoMoveActive = false; };

        container.addEventListener("mouseenter", stopAutoMove);

        container.addEventListener("mousedown", (e) => {
            if (e.target.closest(".hero-caption-container")) return;
            isDragging = true;
            stopAutoMove();
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

        container.addEventListener("touchstart", (e) => {
            if (e.target.closest(".hero-caption-container")) return;
            isDragging = true;
            stopAutoMove();
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
            if (e.cancelable) e.preventDefault();
            processMove(e.touches[0].clientX);
        }, { passive: false });

        function processMove(clientX) {
            const xPos = clientX - containerRect.left;
            let pct = (xPos / containerRect.width) * 100;
            if (pct < 0) pct = 0;
            if (pct > 100) pct = 100;
            targetPercentage = pct;
        }

        const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const duration = 3000;
        let startTime = null;

        const animateAutoMove = (timestamp) => {
            if (!autoMoveActive) return;
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const val = easeInOutQuad(progress) * 100;
            targetPercentage = val;
            currentPercentage = val;
            plainLayer.style.width = `${currentPercentage}%`;
            handle.style.left = `${currentPercentage}%`;
            if (progress < 1) {
                requestAnimationFrame(animateAutoMove);
            } else {
                autoMoveActive = false;
            }
        };

        triggerSliderAutoMove = () => {
            autoMoveActive = true;
            requestAnimationFrame(animateAutoMove);
        };

        function renderPhysicsLoop() {
            if (!autoMoveActive) {
                const dist = targetPercentage - currentPercentage;
                currentPercentage += dist * easeMultiplier;
                plainLayer.style.width = `${currentPercentage}%`;
                handle.style.left = `${currentPercentage}%`;
            }
            requestAnimationFrame(renderPhysicsLoop);
        }
        requestAnimationFrame(renderPhysicsLoop);
    }

    // === WebP Frame Animation Player ===
        const canvas = document.getElementById("luxuryCanvas");
        const fallbackImg = document.getElementById("luxuryFallbackImg");
        const framePreloader = document.getElementById("framePreloader");
        const preloadPercentage = document.getElementById("preloadPercentage");
        const preloadProgressBar = document.getElementById("preloadProgressBar");

        if (canvas && fallbackImg) {
            const ctx = canvas.getContext("2d");
            let frameImages = [];
            let isLoaded = false;
            let currentFrameIndex = 0;
            let lastFrameTime = 0;
            const fps = 24;
            const frameInterval = 1000 / fps;
            let animationFrameId = null;

            // Handle DPI
            const dpr = window.devicePixelRatio || 1;
            
            const resizeCanvas = () => {
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                ctx.scale(dpr, dpr);
                drawCurrentFrame();
            };

            const drawImageProp = (img) => {
                const w = window.innerWidth;
                const h = window.innerHeight;
                const iw = img.width;
                const ih = img.height;
                const r = Math.min(w / iw, h / ih);
                let nw = iw * r;
                let nh = ih * r;
                let cx, cy, cw, ch, ar = 1;

                if (nw < w) ar = w / nw;
                if (Math.abs(nh - h) < 0.0001 && ar === 1) ar = h / nh;
                nw *= ar;
                nh *= ar;

                cw = iw / (nw / w);
                ch = ih / (nh / h);

                cx = (iw - cw) * 0.5;
                cy = (ih - ch) * 0.5;

                if (cx < 0) cx = 0;
                if (cy < 0) cy = 0;
                if (cw > iw) cw = iw;
                if (ch > ih) ch = ih;

                ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
            };

            const drawCurrentFrame = () => {
                if (frameImages[currentFrameIndex] && frameImages[currentFrameIndex].complete) {
                    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                    drawImageProp(frameImages[currentFrameIndex]);
                }
            };

            let isPaused = false;

            const startFrameLoop = (timestamp) => {
                if (isPaused) {
                    animationFrameId = requestAnimationFrame(startFrameLoop);
                    return;
                }

                if (!lastFrameTime) lastFrameTime = timestamp;
                const elapsed = timestamp - lastFrameTime;

                // Only play when the section is in viewport to save CPU/battery
                const inViewport = window.scrollY < window.innerHeight;

                if (inViewport && elapsed >= frameInterval) {
                    if (currentFrameIndex === frameImages.length - 1) {
                        drawCurrentFrame();
                        isPaused = true;
                        setTimeout(() => {
                            currentFrameIndex = 0;
                            isPaused = false;
                            lastFrameTime = performance.now();
                        }, 4000); // Pause on the completed house render for at least 4 seconds
                    } else {
                        currentFrameIndex++;
                        drawCurrentFrame();
                    }
                    lastFrameTime = timestamp - (elapsed % frameInterval);
                }
                
                animationFrameId = requestAnimationFrame(startFrameLoop);
            };

            // Preload WebP frames
            fetch("js/frames.json")
                .then(res => res.json())
                .then(frameFiles => {
                    let loadedCount = 0;
                    const totalFrames = frameFiles.length;

                    frameFiles.forEach((file, index) => {
                        const img = new Image();
                        img.src = `file/${file}`;
                        img.onload = () => {
                            loadedCount++;
                            const pct = Math.round((loadedCount / totalFrames) * 100);
                            if (preloadPercentage) preloadPercentage.textContent = `${pct}%`;
                            if (preloadProgressBar) preloadProgressBar.style.width = `${pct}%`;

                            if (loadedCount === totalFrames) {
                                isLoaded = true;
                                currentFrameIndex = 0; // Start from frame_000 (blueprint)
                                resizeCanvas();
                                
                                // Smooth transition
                                if (framePreloader) {
                                    framePreloader.style.opacity = "0";
                                    framePreloader.style.visibility = "hidden";
                                    setTimeout(() => framePreloader.style.display = "none", 500);
                                }
                                if (fallbackImg) {
                                    fallbackImg.style.opacity = "0";
                                    setTimeout(() => fallbackImg.style.display = "none", 500);
                                }

                                requestAnimationFrame(startFrameLoop);
                            }
                        };
                        img.onerror = () => {
                            // Skip broken frames but keep loading
                            loadedCount++;
                            if (loadedCount === totalFrames) {
                                isLoaded = true;
                                currentFrameIndex = 0; // Start from frame_000 (blueprint)
                                resizeCanvas();
                                if (framePreloader) {
                                    framePreloader.style.opacity = "0";
                                    framePreloader.style.visibility = "hidden";
                                    setTimeout(() => framePreloader.style.display = "none", 500);
                                }
                                if (fallbackImg) {
                                    fallbackImg.style.opacity = "0";
                                    setTimeout(() => fallbackImg.style.display = "none", 500);
                                }
                                requestAnimationFrame(startFrameLoop);
                            }
                        };
                        frameImages[index] = img;
                    });
                })
                .catch(err => {
                    console.error("Failed to load animation frames:", err);
                    // Fallback to static image
                    if (fallbackImg) fallbackImg.style.opacity = "1";
                    if (framePreloader) framePreloader.style.display = "none";
                });

            window.addEventListener("resize", resizeCanvas);
            resizeCanvas();
        }

    // === Scroll-based Reveal ===
    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));

    // === Active Navigation on Scroll ===
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".main-menu-list a");

    const updateActiveNav = () => {
        const scrollPos = window.scrollY + 120;
        let currentSection = "";
        sections.forEach(section => {
            if (section.offsetTop <= scrollPos) {
                currentSection = section.getAttribute("id");
            }
        });
        navLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#")) {
                link.classList.remove("active");
                if (href === `#${currentSection}`) link.classList.add("active");
            }
        });
    };
    window.addEventListener("scroll", updateActiveNav);

    // === Header Shrink on Scroll ===
    const header = document.getElementById("mainHeader");
    if (header) {
        window.addEventListener("scroll", () => {
            header.classList.toggle("scrolled", window.scrollY > 80);
        });
    }

    // === Scroll-to-Top Progress Wrap ===
    const progressWrap = document.querySelector(".progress-wrap");
    if (progressWrap) {
        progressWrap.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        window.addEventListener("scroll", () => {
            const show = window.scrollY > 300;
            progressWrap.style.opacity = show ? "1" : "0";
            progressWrap.style.visibility = show ? "visible" : "hidden";
            progressWrap.style.transform = show ? "translateY(0)" : "translateY(20px)";
        });
    }

    // === Animated Counter for Stats ===
    const statNums = document.querySelectorAll(".sp-stat-num[data-target]");
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute("data-target"));
                let current = 0;
                const inc = target / (1800 / 16);
                const timer = setInterval(() => {
                    current += inc;
                    if (current >= target) { current = target; clearInterval(timer); }
                    el.textContent = Math.floor(current);
                }, 16);
                countObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    statNums.forEach(el => countObserver.observe(el));

    // === Smooth Scroll for Nav Links ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            if (href === "#") return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });

    // ============================================================
    //  GSAP MAGIC CURSOR
    // ============================================================
    class Cursor {
        constructor(options) {
            this.options = $.extend(true, {
                container: "body",
                speed: 0.7,
                ease: "expo.out",
                visibleTimeout: 300
            }, options);
            this.body = $(this.options.container);
            this.el = $('<div class="cb-cursor"></div>');
            this.text = $('<div class="cb-cursor-text"></div>');
            this.init();
        }

        init() {
            this.el.append(this.text);
            this.body.append(this.el);
            this.bind();
            this.move(-window.innerWidth, -window.innerHeight, 0);
        }

        bind() {
            const self = this;

            this.body.on('mouseleave', () => {
                self.hide();
            }).on('mouseenter', () => {
                self.show();
            }).on('mousemove', (e) => {
                this.pos = {
                    x: this.stick ? this.stick.x - ((this.stick.x - e.clientX) * 0.15) : e.clientX,
                    y: this.stick ? this.stick.y - ((this.stick.y - e.clientY) * 0.15) : e.clientY
                };
                this.update();
            }).on('mousedown', () => {
                self.setState('-active');
            }).on('mouseup', () => {
                self.removeState('-active');
            }).on('mouseenter', 'a,input,textarea,button,.sp-btn,.progress-wrap', () => {
                self.setState('-pointer');
            }).on('mouseleave', 'a,input,textarea,button,.sp-btn,.progress-wrap', () => {
                self.removeState('-pointer');
            }).on('mouseenter', 'iframe', () => {
                self.hide();
            }).on('mouseleave', 'iframe', () => {
                self.show();
            }).on('mouseenter', '[data-cursor]', function () {
                self.setState(this.dataset.cursor);
            }).on('mouseleave', '[data-cursor]', function () {
                self.removeState(this.dataset.cursor);
            }).on('mouseenter', '[data-cursor-text]', function () {
                self.setText(this.dataset.cursorText);
            }).on('mouseleave', '[data-cursor-text]', function () {
                self.removeText();
            }).on('mouseenter', '[data-cursor-stick]', function () {
                self.setStick(this.dataset.cursorStick);
            }).on('mouseleave', '[data-cursor-stick]', function () {
                self.removeStick();
            });
        }

        setState(state) {
            this.el.addClass(state);
        }

        removeState(state) {
            this.el.removeClass(state);
        }

        toggleState(state) {
            this.el.toggleClass(state);
        }

        setText(text) {
            this.text.html(text);
            this.el.addClass('-text');
        }

        removeText() {
            this.el.removeClass('-text');
        }

        setStick(el) {
            const target = $(el);
            const bound = target.get(0).getBoundingClientRect();
            this.stick = {
                y: bound.top + (target.height() / 2),
                x: bound.left + (target.width() / 2)
            };
            this.move(this.stick.x, this.stick.y, 5);
        }

        removeStick() {
            this.stick = false;
        }

        update() {
            this.move();
            this.show();
        }

        move(x, y, duration) {
            if (typeof gsap !== 'undefined') {
                gsap.to(this.el, {
                    x: x || this.pos.x,
                    y: y || this.pos.y,
                    force3D: true,
                    overwrite: true,
                    ease: this.options.ease,
                    duration: this.visible ? (duration || this.options.speed) : 0
                });
            }
        }

        show() {
            if (this.visible) return;
            clearInterval(this.visibleInt);
            this.el.addClass('-visible');
            this.visibleInt = setTimeout(() => this.visible = true);
        }

        hide() {
            clearInterval(this.visibleInt);
            this.el.removeClass('-visible');
            this.visibleInt = setTimeout(() => this.visible = false, this.options.visibleTimeout);
        }
    }

    if (window.innerWidth > 991 && typeof gsap !== 'undefined') {
        const cursor = new Cursor();
    }

    // === YouTube Dynamic Video Slider ===
    const youtubeTrack = document.getElementById("youtubeSliderTrack");
    const youtubeWrapper = document.getElementById("youtubeSliderWrapper");
    const youtubeDots = document.getElementById("youtubeSliderDots");
    const prevArrow = document.querySelector(".prev-arrow");
    const nextArrow = document.querySelector(".next-arrow");

    if (youtubeTrack && youtubeWrapper) {
        const channelId = "UCB1lMrzFkZjs7qu4jxl32zA";
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}&t=${Date.now()}`;

        // Utility to format ISO date to a localized readable format
        const formatDate = (isoString) => {
            try {
                const date = new Date(isoString);
                if (isNaN(date.getTime())) return "Recent Video";
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                return "Recent Video";
            }
        };

        // Utility to escape HTML strings safely
        const escapeHTML = (str) => {
            if (!str) return "";
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        const getElementText = (parent, tagName) => {
            let el = parent.getElementsByTagName("yt:" + tagName)[0] || 
                     parent.getElementsByTagName(tagName)[0] ||
                     parent.getElementsByTagNameNS("*", tagName)[0];
            return el ? el.textContent.trim() : "";
        };

        const setupSliderNavigation = () => {
            const getSlideStep = () => {
                const firstCard = youtubeTrack.children[0];
                if (!firstCard) return 0;
                return firstCard.offsetWidth + 24; // card width + gap
            };

            // Arrow Clicks
            if (nextArrow) {
                nextArrow.addEventListener("click", () => {
                    const step = getSlideStep();
                    youtubeWrapper.scrollBy({ left: step, behavior: "smooth" });
                });
            }
            if (prevArrow) {
                prevArrow.addEventListener("click", () => {
                    const step = getSlideStep();
                    youtubeWrapper.scrollBy({ left: -step, behavior: "smooth" });
                });
            }

            // Sync active dot on scroll
            let isScrolling;
            youtubeWrapper.addEventListener("scroll", () => {
                window.clearTimeout(isScrolling);
                isScrolling = setTimeout(() => {
                    const scrollLeft = youtubeWrapper.scrollLeft;
                    const step = getSlideStep();
                    if (step === 0) return;
                    const activeIndex = Math.min(
                        youtubeTrack.children.length - 1,
                        Math.max(0, Math.round(scrollLeft / step))
                    );

                    const dots = youtubeDots.querySelectorAll(".slider-dot");
                    dots.forEach((dot, index) => {
                        dot.classList.toggle("active", index === activeIndex);
                    });
                }, 66);
            }, { passive: true });

            // Initialize Dot clicks for existing cards if we are in fallback mode
            const dots = youtubeDots.querySelectorAll(".slider-dot");
            dots.forEach((dot, index) => {
                dot.addEventListener("click", () => {
                    const step = getSlideStep();
                    youtubeWrapper.scrollTo({
                        left: index * step,
                        behavior: "smooth"
                    });
                });
            });
        };

        // Render cards dynamically
        const renderYouTubeCards = (videos) => {
            youtubeTrack.innerHTML = "";
            youtubeDots.innerHTML = "";

            videos.forEach((video, index) => {
                // Card Markup
                const card = document.createElement("div");
                card.className = "youtube-card";
                card.setAttribute("data-index", index);
                card.innerHTML = `
                    <a href="${escapeHTML(video.url)}" target="_blank" rel="noopener" class="youtube-card__link">
                        <div class="youtube-card__thumb-container">
                            <img src="${escapeHTML(video.thumbnail)}" alt="${escapeHTML(video.title)}" class="youtube-card__thumb" loading="lazy">
                            <div class="youtube-card__play-btn">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </div>
                        </div>
                        <div class="youtube-card__info">
                            <span class="youtube-card__date">${formatDate(video.published)}</span>
                            <h4 class="youtube-card__title">${escapeHTML(video.title)}</h4>
                        </div>
                    </a>
                `;
                youtubeTrack.appendChild(card);

                // Indicator Dots markup
                const dot = document.createElement("button");
                dot.className = `slider-dot${index === 0 ? ' active' : ''}`;
                dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
                youtubeDots.appendChild(dot);
            });

            // Re-setup navigation and swipe events
            setupSliderNavigation();
        };

        // Fetch feed asynchronously
        fetch(proxyUrl)
            .then(res => {
                if (!res.ok) throw new Error("CORS Proxy issue");
                return res.json();
            })
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                
                // Check parse error
                const parserError = xmlDoc.getElementsByTagName("parsererror");
                if (parserError.length > 0) throw new Error("XML Parse Error");

                const entries = xmlDoc.getElementsByTagName("entry");
                if (entries.length === 0) throw new Error("No entries found");

                const videos = [];
                for (let i = 0; i < Math.min(8, entries.length); i++) {
                    const entry = entries[i];
                    const id = getElementText(entry, "videoId");
                    const title = getElementText(entry, "title");
                    const published = getElementText(entry, "published");

                    if (id) {
                        videos.push({
                            id: id,
                            title: title,
                            published: published,
                            url: `https://www.youtube.com/watch?v=${id}`,
                            thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
                        });
                    }
                }

                if (videos.length > 0) {
                    renderYouTubeCards(videos);
                } else {
                    throw new Error("No valid videos parsed");
                }
            })
            .catch(err => {
                console.warn("Could not load fresh YouTube feed, keeping fallback static cards:", err);
                // Fallback: Setup navigation events for the static HTML fallback cards already on the page
                setupSliderNavigation();
            });
    }

});