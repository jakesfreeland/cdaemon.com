function toggleMenu() {
    var navLinks = document.getElementById("navLinks");
    var nav = document.getElementsByTagName("nav")[0];
    if (navLinks.style.display === "block") {
        navLinks.style.display = "none"
        nav.style.background = "transparent"
    } else {
        navLinks.style.display = "block"
        nav.style.background = "#1a1a1a"
    }
}