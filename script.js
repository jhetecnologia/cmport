// =========================================================
// MENU MOBILE
// =========================================================

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });
}


// =========================================================
// NÚMEROS ANIMADOS
// =========================================================

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const counter = entry.target;
            const target = Number(counter.dataset.target);

            let current = 0;

            const duration = 1800;
            const increment = target / (duration / 16);

            const updateCounter = () => {

                current += increment;

                if (current >= target) {
                    counter.textContent = target.toLocaleString("pt-BR");
                    return;
                }

                counter.textContent = Math.floor(current).toLocaleString("pt-BR");

                requestAnimationFrame(updateCounter);
            };

            updateCounter();

            observer.unobserve(counter);
        });

    },
    {
        threshold: 0.5
    }
);


counters.forEach(counter => {
    counterObserver.observe(counter);
});
