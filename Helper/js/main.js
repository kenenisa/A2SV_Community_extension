function id(str) {
	return document.getElementById(str);
}
function cls(str) {
	return document.getElementsByClassName(str);
}

chrome.storage.sync.get(["name"], function (result) {
	if (result.name) {
		id("register").style.display = "none";
		id("user").style.display = "block";
		id("name_reg").innerHTML = result.name
			.split("_")
			.map((e) => e[0].toUpperCase() + e.slice(1))
			.join(" ");
	}
	console.log(result);
});

function populateNextProblems(problems) {
	let p = "";
	problems.forEach((problem) => {
		p += '<button class="next-btn">' + problem + "</button>";
	});
	id("next").style.display = "block";
	id("next-problems").innerHTML = p;
    attachEventHandlers()
}
function attachEventHandlers(){
    const buttons = cls("next-btn");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function (el) {
            chrome.storage.sync.get(["nextProblems"], function (result) {
				window.open(
					result.nextProblems.find(
						(e) => e.title === el.target.innerHTML
					).link
				,"_blank");
			});
        });
    }
}
chrome.storage.sync.get(["nextProblems"], function (result) {
	populateNextProblems(result.nextProblems.map(r=>r.title))
})

// populateNextProblems(["Reverse Linked List", "Linked List", "Cycle Detection"]);

