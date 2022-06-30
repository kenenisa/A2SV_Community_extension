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

function populateNextProblems(problems, result) {
	let p = "";
	let exists = false;
	problems.forEach((problem) => {
		if (problem) {
			exists = true;
			p += '<button class="next-btn">' + problem + "</button>";
		}
	});
	if (exists) {
		id("next").style.display = "block";
		id("next-problems").innerHTML = p;
		attachEventHandlers(result);
	}
}
function attachEventHandlers(result) {
	const buttons = cls("next-btn");
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener("click", function (el) {
			window.open(
				result.nextProblems.find((e) => e.title === el.target.innerHTML)
					.link,
				"_blank"
			);
		});
	}
}
chrome.storage.sync.get(["nextProblems"], function (result) {
	if (result.nextProblems) {
		populateNextProblems(
			result.nextProblems.map((r) => r.title),
			result
		);
	}
});
id("set-btn").addEventListener("click", function () {
	let name = id("setup-name").value;
	if (name && name !== "") {
		name = name.replace(/\s/g, "_");
		chrome.storage.sync.set({ name }, function () {
			window.location.reload();
		});
	}
});
