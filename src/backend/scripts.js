// Wait until DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    updateParallax();

    // Navigation: Hide all sections/forms and show target section.
    window.navigateToSection = function (section) {
        event.preventDefault();
        document.querySelectorAll('section, form').forEach(el => {
            el.style.display = 'none';
        });
        document.getElementById(section).style.display = 'block';
        history.pushState({ section: section }, '', '#' + section);
    };

    // Handle browser navigation (back/forward)
    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.section) {
            document.querySelectorAll('section, form').forEach(el => {
                el.style.display = 'none';
            });
            document.getElementById(event.state.section).style.display = 'block';
        } else {
            // Default to features section if no state
            document.querySelectorAll('section, form').forEach(el => {
                el.style.display = 'none';
            });
            document.getElementById('features-section').style.display = 'block';
        }
    });

    // Subtle Parallax: The hero background scrolls extremely slowly.
    function updateParallax() {
        const hero = document.querySelector('.hero');
        const scrolled = window.pageYOffset;
        // Multiply by 0.01 for a very subtle movement
        hero.style.backgroundPosition = "center " + (-scrolled * 0.01) + "px";
    }
    window.addEventListener('scroll', updateParallax);

    // Dummy toggles for forms.
    document.getElementById('btnShowLogin').addEventListener('click', function () {
        document.getElementById('formStudent').style.display = 'none';
        document.getElementById('formLogin').style.display = 'block';
    });
    document.getElementById('btnShowRegister').addEventListener('click', function () {
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formStudent').style.display = 'block';
    });
    document.getElementById('btnShowRegisterFaculty').addEventListener('click', function () {
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formStudent').style.display = 'none';
        document.getElementById('formFaculty').style.display = 'block';
    });
});
