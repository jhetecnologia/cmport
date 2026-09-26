/* =========================================================
   CMPORT
   JAVASCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   MENU MOBILE
========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

function closeMobileMenu() {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.remove("open");

    const icon = menuToggle.querySelector("i");

    if (icon) {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
    }

    menuToggle.setAttribute("aria-label", "Abrir menu");
}

if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", (event) => {

        event.stopPropagation();

        mainNav.classList.toggle("open");

        const icon = menuToggle.querySelector("i");

        if (!icon) return;

        if (mainNav.classList.contains("open")) {

            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");

            menuToggle.setAttribute(
                "aria-label",
                "Fechar menu"
            );

        } else {

            closeMobileMenu();

        }

    });


    const navLinks = mainNav.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {
            closeMobileMenu();
        });

    });

}


/* =========================================================
   FECHAR MENU AO CLICAR FORA
========================================================= */

document.addEventListener("click", event => {

    if (!menuToggle || !mainNav) return;

    const clickedInsideMenu =
        mainNav.contains(event.target);

    const clickedButton =
        menuToggle.contains(event.target);

    if (
        !clickedInsideMenu &&
        !clickedButton &&
        mainNav.classList.contains("open")
    ) {

        closeMobileMenu();

    }

});


/* =========================================================
   HEADER AO ROLAR
========================================================= */

const header = document.querySelector(".site-header");

if (header) {

    const updateHeader = () => {

        if (window.scrollY > 30) {

            header.style.background =
                "rgba(7, 20, 38, 0.98)";

        } else {

            header.style.background =
                "rgba(11, 31, 59, 0.94)";

        }

    };

    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

}


/* =========================================================
   ANIMAÇÃO DOS ELEMENTOS
========================================================= */

const animatedElements = document.querySelectorAll(
    ".service-card, .why-item, .differential-item, .maintenance-feature"
);

if ("IntersectionObserver" in window && animatedElements.length) {

    const animationObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");

                    observer.unobserve(entry.target);

                });

            },
            {
                threshold: 0.12
            }
        );

    animatedElements.forEach(element => {

        element.classList.add("animate-on-scroll");

        animationObserver.observe(element);

    });

}


/* =========================================================
   ANO AUTOMÁTICO
========================================================= */

const footerYear = document.querySelector(
    ".footer-bottom p"
);

if (footerYear) {

    footerYear.innerHTML =
        footerYear.innerHTML.replace(
            /20\d{2}/,
            new Date().getFullYear()
        );

}
