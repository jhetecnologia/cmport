document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. MENU MOBILE
    ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".header .nav");

    if (menuToggle && nav) {

        function fecharMenu() {
            nav.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }
        }

        menuToggle.addEventListener("click", function () {
            const aberto = nav.classList.toggle("active");

            menuToggle.setAttribute("aria-expanded", aberto ? "true" : "false");

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.toggle("fa-bars", !aberto);
                icon.classList.toggle("fa-xmark", aberto);
            }
        });

        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", fecharMenu);
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) {
                fecharMenu();
            }
        });
    }


    /* =====================================================
       2. CARROSSEL DO POSTE DE MONITORAMENTO
       Arrastar (mouse e toque), setas e indicadores.
    ===================================================== */

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {

        const track = carousel.querySelector("[data-carousel-track]");
        const prev = carousel.querySelector("[data-carousel-prev]");
        const next = carousel.querySelector("[data-carousel-next]");
        const dots = Array.from(carousel.querySelectorAll("[data-carousel-dots] button"));
        const slides = track ? Array.from(track.children) : [];

        if (!track || slides.length === 0) {
            return;
        }

        function currentIndex() {
            return Math.max(
                0,
                Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth))
            );
        }

        function goTo(index) {
            const target = Math.max(0, Math.min(slides.length - 1, index));

            track.scrollTo({
                left: target * track.clientWidth,
                behavior: "smooth"
            });
        }

        function updateControls() {
            const index = currentIndex();

            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);

                if (i === index) {
                    dot.setAttribute("aria-current", "true");
                } else {
                    dot.removeAttribute("aria-current");
                }
            });

            if (prev) { prev.disabled = index === 0; }
            if (next) { next.disabled = index === slides.length - 1; }
        }

        if (prev) {
            prev.addEventListener("click", function () { goTo(currentIndex() - 1); });
        }

        if (next) {
            next.addEventListener("click", function () { goTo(currentIndex() + 1); });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () { goTo(i); });
        });

        track.addEventListener("scroll", function () {
            window.requestAnimationFrame(updateControls);
        }, { passive: true });

        track.addEventListener("keydown", function (event) {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goTo(currentIndex() - 1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                goTo(currentIndex() + 1);
            }
        });

        // Arrastar com o mouse (o toque já funciona nativamente).
        let dragging = false;
        let startX = 0;
        let startScroll = 0;

        track.addEventListener("pointerdown", function (event) {
            if (event.pointerType !== "mouse") { return; }

            dragging = true;
            startX = event.clientX;
            startScroll = track.scrollLeft;
            track.classList.add("is-dragging");
        });

        window.addEventListener("pointermove", function (event) {
            if (!dragging) { return; }
            track.scrollLeft = startScroll - (event.clientX - startX);
        });

        function endDrag() {
            if (!dragging) { return; }

            dragging = false;
            track.classList.remove("is-dragging");
            goTo(currentIndex());
        }

        window.addEventListener("pointerup", endDrag);
        window.addEventListener("pointercancel", endDrag);

        window.addEventListener("resize", function () {
            track.scrollLeft = currentIndex() * track.clientWidth;
            updateControls();
        });

        updateControls();
    });


    /* =====================================================
       3. GERENCIAMENTO DE COOKIES
    ===================================================== */

    const banner = document.getElementById("cookie-banner");
    const preferences = document.getElementById("cookie-preferences");

    // Se o HTML do aviso não estiver nesta página, não interfere no site.
    if (!banner || !preferences) {
        return;
    }

    const STORAGE_KEY = "cmport_cookie_consent";

    const acceptButton = document.getElementById("cookie-accept");
    const rejectButton = document.getElementById("cookie-reject");
    const settingsButton = document.getElementById("cookie-settings");
    const saveButton = document.getElementById("cookie-save");
    const cancelButton = document.getElementById("cookie-cancel");

    const analyticsCheckbox = document.getElementById("cookie-analytics");
    const marketingCheckbox = document.getElementById("cookie-marketing");

    let savedConsent = null;

    function readConsent() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (!stored) {
                return null;
            }

            const consent = JSON.parse(stored);

            if (
                consent &&
                consent.necessary === true &&
                typeof consent.analytics === "boolean" &&
                typeof consent.marketing === "boolean"
            ) {
                return consent;
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    function saveConsent(consent) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    necessary: true,
                    analytics: consent.analytics,
                    marketing: consent.marketing,
                    updatedAt: new Date().toISOString()
                })
            );

            savedConsent = readConsent();
            banner.hidden = true;
            preferences.hidden = true;

            document.dispatchEvent(
                new CustomEvent("cmport:consent-updated", {
                    detail: savedConsent
                })
            );

        } catch (error) {
            // Se o navegador bloquear o armazenamento,
            // não confirmamos que a preferência foi salva.
            banner.hidden = false;
            preferences.hidden = true;
        }
    }

    function openPreferences() {
        const current = readConsent();

        analyticsCheckbox.checked = current ? current.analytics : false;
        marketingCheckbox.checked = current ? current.marketing : false;

        preferences.hidden = false;

        const panel = preferences.querySelector(".cookie-preferences-panel");

        if (panel) {
            panel.setAttribute("tabindex", "-1");
            panel.focus();
        }
    }

    function closePreferences() {
        preferences.hidden = true;

        if (!readConsent()) {
            banner.hidden = false;

            if (settingsButton) {
                settingsButton.focus();
            }
        }
    }

    // Sem escolha anterior, exibe o banner.
    savedConsent = readConsent();
    banner.hidden = Boolean(savedConsent);
    preferences.hidden = true;

    if (acceptButton) {
        acceptButton.addEventListener("click", function () {
            saveConsent({ analytics: true, marketing: true });
        });
    }

    if (rejectButton) {
        rejectButton.addEventListener("click", function () {
            saveConsent({ analytics: false, marketing: false });
        });
    }

    if (settingsButton) {
        settingsButton.addEventListener("click", openPreferences);
    }

    if (saveButton) {
        saveButton.addEventListener("click", function () {
            saveConsent({
                analytics: analyticsCheckbox.checked,
                marketing: marketingCheckbox.checked
            });
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closePreferences);
    }

    // Fechar ao clicar fora do painel.
    preferences.addEventListener("click", function (event) {
        if (event.target === preferences) {
            closePreferences();
        }
    });

    // Fechar pelo teclado.
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !preferences.hidden) {
            closePreferences();
        }
    });

    // Permite reabrir as preferências por links ou botões do site.
    document.querySelectorAll("[data-cookie-settings]").forEach(function (element) {
        element.addEventListener("click", function (event) {
            event.preventDefault();
            openPreferences();
        });
    });

});


/* ==========================================
   ANIMAÇÕES DE SCROLL - CM PORT
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {
    const selectors = [
        "main > section",
        ".hero-content",
        ".hero-container > *",
        ".section-header",
        ".section-top",
        ".section-heading",
        ".intro-grid > *",
        ".intro-features > *",
        ".differential-grid > *",
        ".services-grid > *",
        ".numbers-grid > *",
        ".inspection-grid > *",
        ".contact-grid > *",
        ".about-hero-copy",
        ".about-hero-image",
        ".about-story-grid > *",
        ".about-results-heading",
        ".about-results-grid > *",
        ".about-purpose-heading",
        ".about-purpose-grid > *",
        ".about-poste-grid > *",
        ".about-commitment-content",
        ".footer .container > *"
    ];

    const elements = document.querySelectorAll(selectors.join(","));

    if (!elements.length) return;

    document.documentElement.classList.add("cm-motion-enabled");

    elements.forEach(function (element) {
        element.setAttribute("data-cm-reveal", "");

        const grid = element.parentElement;

        if (
            grid &&
            grid.matches(
                ".services-grid, .differential-grid, .numbers-grid, .inspection-grid, .contact-grid, .about-results-grid, .about-purpose-grid, .about-poste-grid"
            )
        ) {
            const siblings = Array.from(grid.children);
            const index = siblings.indexOf(element);

            element.style.setProperty(
                "--cm-reveal-delay",
                Math.min(index * 100, 400) + "ms"
            );
        }
    });

    if (
        "IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        const observer = new IntersectionObserver(
            function (entries, observerInstance) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("cm-is-visible");
                        observerInstance.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        elements.forEach(function (element) {
            observer.observe(element);
        });
    } else {
        elements.forEach(function (element) {
            element.classList.add("cm-is-visible");
        });
    }

    /* ======================================
       CONTADORES ANIMADOS
       ====================================== */

    const counterSelectors = [
        ".number-card > strong",
        ".about-result strong",
        ".about-number-item strong"
    ];

    const counters = document.querySelectorAll(
        counterSelectors.join(",")
    );

    function animateCounter(element) {
        if (element.dataset.cmCounterAnimated) return;

        const originalText = element.textContent.trim();
        const match = originalText.match(/^([\d.]+)(.*)$/);

        if (!match) return;

        const target = Number(match[1].replace(/\./g, ""));
        const suffix = match[2];

        if (!Number.isFinite(target) || target <= 0) return;

        element.dataset.cmCounterAnimated = "true";

        const duration = 1300;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(target * easedProgress);

            element.textContent =
                currentValue.toLocaleString("pt-BR") + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent =
                    target.toLocaleString("pt-BR") + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    if (
        "IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        const counterObserver = new IntersectionObserver(
            function (entries, observerInstance) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observerInstance.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.5
            }
        );

        counters.forEach(function (counter) {
            counterObserver.observe(counter);
        });
    }
});

