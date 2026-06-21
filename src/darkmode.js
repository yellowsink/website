const prefersDark = () => !!window.matchMedia("(prefers-color-scheme: dark)").matches;
const root = document.getElementById("root");

const applyStyles = () => {
	if (
		document.cookie.split("; ").includes("dark") ||
		(!document.cookie.split("; ").includes("light") && prefersDark())
	)
		root.classList.add("dark");
	else root.classList.remove("dark");
};

export const toggleTheme = () => {
	let newIsDark = !root.classList.contains("dark");
	if (prefersDark() === newIsDark) document.cookie = "detect; Path=/";
	else if (newIsDark) document.cookie = "dark; Path=/";
	else document.cookie = "light; Path=/";

	applyStyles();
};

// page load
applyStyles();

document.getElementById("temp_dark").firstElementChild.remove();
setTimeout(() => {
	document.getElementById("temp_dark").remove();
}, 100);

// detect cookie moment
setInterval(applyStyles, 500);
