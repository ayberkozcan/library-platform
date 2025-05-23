const themeToggleBtn = document.getElementById("themeToggle");

document.getElementById("themeToggle").addEventListener("click", function (e) {
    if (localStorage.getItem("theme") === "light") {
        document.getElementById("themeToggle").innerText = "🌙";
        document.getElementById("themeToggle").classList.replace("btn-light", "btn-dark");
    } else {
        document.getElementById("themeToggle").innerText = "🌞";
        document.getElementById("themeToggle").classList.replace("btn-dark", "btn-light");
    }
});

function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("bg-gray-100");
    } else {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("bg-gray-100");
    }
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    applyTheme(savedTheme);
}

themeToggleBtn.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
        applyTheme("light");
        localStorage.setItem("theme", "light");
    } else {
        applyTheme("dark");
        localStorage.setItem("theme", "dark");
    }
});