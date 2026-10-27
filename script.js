
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

            menuToggle.setAttribute(
                "aria-expanded",
                aberto ? "true" : "false"
            );

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
       2. GERENCIAMENTO DE COOKIES
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

        analyticsCheckbox.checked = current
            ? current.analytics
            : false;

        marketingCheckbox.checked = current
            ? current.marketing
            : false;

        preferences.hidden = false;

        const panel = preferences.querySelector(
            ".cookie-preferences-panel"
        );

        if (panel) {
            panel.setAttribute("tabindex", "-1");
            panel.focus();
        }
    }

    function closePreferences() {
        preferences.hidden = true;

        if (!readConsent()) {
            banner.hidden = false;
        }

        if (settingsButton) {
            settingsButton.focus();
        }
    }

    // Sem escolha anterior, exibe o banner.
    savedConsent = readConsent();
    banner.hidden = Boolean(savedConsent);
    preferences.hidden = true;

    // Aceitar cookies opcionais.
    if (acceptButton) {
        acceptButton.addEventListener("click", function () {
            saveConsent({
                analytics: true,
                marketing: true
            });
        });
    }

    // Rejeitar cookies opcionais.
    if (rejectButton) {
        rejectButton.addEventListener("click", function () {
            saveConsent({
                analytics: false,
                marketing: false
            });
        });
    }

    // Abrir preferências.
    if (settingsButton) {
        settingsButton.addEventListener("click", openPreferences);
    }

    // Salvar escolhas personalizadas.
    if (saveButton) {
        saveButton.addEventListener("click", function () {
            saveConsent({
                analytics: analyticsCheckbox.checked,
                marketing: marketingCheckbox.checked
            });
        });
    }

    // Cancelar a configuração.
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
    document.querySelectorAll("[data-cookie-settings]").forEach(
        function (element) {
            element.addEventListener("click", function (event) {
                event.preventDefault();
                openPreferences();
            });
        }
    );

});
