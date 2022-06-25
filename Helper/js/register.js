function id(str) {
	return document.getElementById(str);
}
id("source").value = window.location.href;
const prams = {};

window.location.search
	.slice(1)
	.split(/&/g)
	.forEach((str) => {
		const obj = str.split("=");
		prams[obj[0]] = obj[1];
	});
if (prams.error) {
	id("alert").className = "alert failed";
	id("alert-head").innerHTML = "Failed";
	id("alert-body").innerHTML = "Registration failed to process your request!";
	id("alert-btn").innerHTML = "Try again";
} else if (prams.name) {
	chrome.storage.sync.set({ name: prams.name }, () => {
		id("alert").className = "alert completed";
		id("alert-head").innerHTML = "Success";
		id("alert-body").innerHTML = "You have been successfully registered!";
	id("alert-btn").innerHTML = "Start solving problems";

	});
}
id("alert-btn").addEventListener("click", () => {
    if(prams.error){
        window.location.assign(window.location.origin + window.location.pathname)
    } else if(prams.name){
        window.location.assign(prams.problem)
    }
});
