document.addEventListener("DOMContentLoaded", function () {

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* =====================================================
       1. MENU MOBILE
    ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".header .nav");

    if (menuToggle && nav) {

        const menuIcon = menuToggle.querySelector("i");

        function setMenu(open) {
            nav.classList.toggle("active", open);

            menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
            menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");

            if (menuIcon) {
                menuIcon.classList.toggle("fa-bars", !open);
                menuIcon.classList.toggle("fa-xmark", open);
            }
        }

        menuToggle.addEventListener("click", function () {
            setMenu(!nav.classList.contains("active"));
        });

        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () { setMenu(false); });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && nav.classList.contains("active")) {
                setMenu(false);
                menuToggle.focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (
                nav.classList.contains("active") &&
                !nav.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                setMenu(false);
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) {
                setMenu(false);
            }
        });
    }


    /* =====================================================
       2. CARROSSEL DO POSTE DE MONITORAMENTO
       Arrastar (mouse e toque), setas e indicadores.
       Só é iniciado quando chega perto da tela, para não
       pesar no carregamento inicial da página.
    ===================================================== */

    function initCarousel(carousel) {

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
                behavior: reduceMotion ? "auto" : "smooth"
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

        let scrollTicking = false;

        track.addEventListener("scroll", function () {
            if (scrollTicking) { return; }

            scrollTicking = true;

            window.requestAnimationFrame(function () {
                updateControls();
                scrollTicking = false;
            });
        }, { passive: true });

        if (prev) {
            prev.addEventListener("click", function () { goTo(currentIndex() - 1); });
        }

        if (next) {
            next.addEventListener("click", function () { goTo(currentIndex() + 1); });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () { goTo(i); });
        });

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

        let resizeFrame = null;

        window.addEventListener("resize", function () {
            if (resizeFrame) { return; }

            resizeFrame = window.requestAnimationFrame(function () {
                resizeFrame = null;
                track.scrollLeft = currentIndex() * track.clientWidth;
                updateControls();
            });
        });

        updateControls();
    }

    const carousels = document.querySelectorAll("[data-carousel]");

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    initCarousel(entry.target);
                }
            });
        }, { rootMargin: "300px 0px" });

        carousels.forEach(function (carousel) { observer.observe(carousel); });

    } else {
        carousels.forEach(initCarousel);
    }


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
    let lastOpener = null;

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

            if (lastOpener && typeof lastOpener.focus === "function") {
                lastOpener.focus();
            }

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

    function openPreferences(opener) {
        const current = readConsent();

        lastOpener = opener || document.activeElement;

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
        } else if (lastOpener && typeof lastOpener.focus === "function") {
            lastOpener.focus();
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
        settingsButton.addEventListener("click", function () {
            openPreferences(settingsButton);
        });
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
            openPreferences(element);
        });
    });

});
