document.addEventListener("DOMContentLoaded", function () {

    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".header .nav");

    if (!menuToggle || !nav) {
        return;
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

        link.addEventListener("click", function () {

            nav.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }

        });

    });

    window.addEventListener("resize", function () {

        if (window.innerWidth > 768) {

            nav.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            const icon = menuToggle.querySelector("i");

            if (icon) {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }

        }

    });

});
