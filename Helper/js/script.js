console.log("A2SV Script Loaded and Running...");
const config = {
	// href: "http://localhost:5000",
	href: "https://immense-sea-06160.herokuapp.com",
};
function id(str) {
	return document.getElementById(str);
}
chrome.storage.sync.get(["time", "name"], function (result) {
	console.log(result);
});
const injectHTMLSpinner = () => {
	if (id("a-loader")) return;
	document.getElementsByTagName("body")[0].innerHTML += `
	<style>
		@keyframes ARotate {from {transform: rotate(0deg)} to {transform: rotate(360deg)}}
		#a-loader{position: fixed;top:1rem;right:0;border-top-left-radius: 2rem;border-bottom-left-radius: 2rem;background:white;border:1px solid #ddd;box-shadow: 1px 1px 10px 2px rgba(0,0,0,0.1);padding:0.5rem;height:3.5rem;width:14rem;display: flex;align-items: center}
		#a-loader #a-spinner{position: relative;margin:0.25rem 0;width:2rem;height:2rem;border-right:5px solid darkgreen;border-bottom:5px solid darkgreen;border-top:5px solid rgba(0, 100, 0, 0);border-left:5px solid rgba(0, 100, 0, 0);border-radius:50%;display: inline-block;margin-right:0.5rem;animation: ARotate 500ms infinite}
		#a-loader span{font-size:1rem;position:absolute;top:1rem;left:3rem;}
	</style>
	<div id="a-loader">
	<div id="a-spinner"></div>
	<span>Accessing A2SV sheets...</span>
</div>`;
};
const startSpinner = () => {
	injectHTMLSpinner();
	id("a-loader").style.display = "block";
};
const injectHTML = () => {
	// document.getElementsByTagName("body")[0].innerHTML += "<h1>GO GO SCRIPT</h1>"
	// document.getElementsByTagName("head")[0].innerHTML += ``;
	// const bdy = document.getElementsByTagName("body")[0].innerHTML;
	document.getElementsByTagName("body")[0].innerHTML += `<style>
			@keyframes AshowUp {
				from {top: -5rem;transform: rotateX(90deg);}
				to {top: 1rem;transform: rotateX(0);}
			}
			#a-progress {position: fixed;top: 1rem;right: 1rem;width: 20rem;background: rgb(248, 255, 248);z-index: 10;border-radius: 10px;border: 1px solid #ddd;box-shadow: 1px 2px 5px 1px rgba(221, 221, 221, 0.322);font-size: 0.9rem;padding: 1rem 0.5rem;animation: AshowUp 500ms forwards ease-in-out;font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;display: none;}
			#a-progress #a-head {padding-bottom: 0.25rem;margin-bottom: 0.5rem;border-bottom: 1px solid #ddd;font-size: 1.1rem;font-weight: 500;color: darkgreen;}
			#a-progress .a-problem,
			#a-progress .a-results {font-weight: 400;color: rgb(58, 58, 58);font-size: 0.85rem;}
			#a-progress .a-msg {font-size: 0.9rem;font-weight: 500;margin-top: 0.5rem;}
			#a-progress .a-results {text-align: right;border-bottom: 1px solid #ddd;padding-bottom: 0.5rem;margin-bottom: 0.5rem;}
			#a-progress .a-next-btn {text-align: center;color: rgb(1, 33, 75);padding: 0.4rem;border-radius: 15px;cursor: pointer;font-size: 0.95rem;font-weight: 400;border: unset;background: rgba(0, 0, 0, 0);}
			#a-progress .a-next-btn:hover {background: #ddd;}
			#a-progress .a-next-btn:active {background: rgb(204, 204, 204);}
			#a-progress .x {position: absolute;top: 0rem;right: 0rem;background: rgba(0, 0, 0, 0);border: unset;font-size: 1.5rem;padding: 0.05rem 0.5rem;cursor: pointer;}
			#a-progress .x:hover {background: rgba(0, 0, 0, 0.08);}
			#a-progress.a-failed #a-head {color: darkred;}
			#a-progress.a-failed .a-next,
			#a-progress.a-failed .a-results {display: none;}
		</style>
		<div class="a-progress" id="a-progress">
			<div class="a-head" id="a-head">
				A2SV Progress
				<span class="a-problem">• <i id="a-problem"></i></span>
				<button class="x" id="x">×</button>
			</div>
			<div class="a-msg" id="a-msg">
			</div>
			<div class="a-results">
				<span id="a-sub"></span> submissions •
				<span id="a-time"></span>mins spent
			</div>
			<div class="a-next" id="a-next-con">
				Next up:
				<div id="a-next"></div>
			</div>
		</div>`;
	// + bdy;
};
const errorMsg = (str) => {
	return {
		OK: "Your progress has been recorded on A2SV Progress Sheet.",
		NoName: "Site account not found in info sheet. Please check if you're name exists in the info sheet along with the right profile links",
		NoMatchingName:
			"Name found in info sheet doesn't match any names in progress sheet",
		NoProblemExists: "This problem is not listed in the sheet",
		FailedToEdit: "Failed to edit the sheet",
	}[str];
};
const displayPrompt = (e) => {
	injectHTML();
	id("a-loader").style.display = "none";
	id("a-msg").innerHTML = errorMsg(e.status.status);
	id("x").addEventListener("click", () => {
		id("a-progress").style.display = "none";
	});
	if (e.status.status !== "OK") {
		console.log(e);
		id("a-progress").style.display = "block";
		id("a-progress").className = "a-progress a-failed";
		id("a-problem").innerHTML = "Failed to process";
		return;
	}

	chrome.storage.sync.set(
		{ nextProblems: e.next, name: e.name.replace(/\s/g, "_") },
		function () {
			id("a-progress").style.display = "block";
			id("a-problem").innerHTML = e.solved;
			id("a-sub").innerHTML = e.subs;
			id("a-time").innerHTML = e.spent;
			let btn = "";
			e.next.forEach((n) => {
				btn += `<button class="a-next-btn">${n.title}</button>`;
			});
			id("a-next").innerHTML = btn;
			const buttons = document.getElementsByClassName("a-next-btn");
			for (let i = 0; i < buttons.length; i++) {
				buttons[i].addEventListener("click", function (el) {
					chrome.storage.sync.get(
						["nextProblems"],
						function (result) {
							if (result.nextProblems) {
								window.location.assign(
									result.nextProblems.find(
										(e) => e.title === el.target.innerHTML
									).link
								);
							}
						}
					);
				});
			}
		}
	);
};

//wait for submission result
const result = (resolve) => {
	const LookForResult = () => {
		const success = document.getElementsByClassName("success__3Ai7")[0];
		const error = document.getElementsByClassName("error__2Ft1")[0];
		if (success || error) {
			if (success) {
				resolve(success);
			}
			// if (error) {
			//   reject(error);
			// }
		} else {
			setTimeout(LookForResult, 500);
		}
	};
	LookForResult();
};
const loaded = (resolve) => {
	const Loading = () => {
		const submitButton = document.querySelector(
			'[data-cy="submit-code-btn"]'
		);
		if (submitButton) {
			resolve(submitButton);
		} else {
			setTimeout(Loading, 500);
		}
	};
	Loading();
};
const recordStartingTime = (qTitle, resolve) => {
	chrome.storage.sync.get(["time"], function (result) {
		let time = result.time;
		if (!time) {
			time = {};
		}
		let origin = time[window.location.origin];
		if (!origin) {
			time[window.location.origin] = {};
		}
		if (!time[window.location.origin][qTitle]) {
			time[window.location.origin][qTitle] = new Date().getTime();
		}
		chrome.storage.sync.set({ time }, function () {
			resolve();
		});
	});
};
const submitData = (data) => {
	chrome.storage.sync.get(["time", "name"], function (result) {
		console.log(result);
		const time =
			new Date().getTime() -
			Number(result.time[window.location.origin][qTitle]); // time taken in ms
		data.time = time;
		data.name = result.name.replace(/_/g, " ");

		console.log(data);
		fetch(config.href + "/progress", {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		})
			.then((e) => e.json())
			.then((e) => {
				console.log(e);
				displayPrompt(e);
				// alert("A2SV knows what you did");
			});
	});
};
// attach action when submit button is pressed
loaded((submitButton) => {
	const [qId, qTitle] = document
		.querySelector('[data-cy="question-title"]')
		.innerHTML.split(". "); // question id and title
	recordStartingTime(qTitle, () => {
		submitButton.addEventListener("click", () => {
			const user = JSON.parse(
				localStorage["GLOBAL_DATA:value"]
			).userStatus;
			const username = user.username;
			const asi = user.activeSessionId;
			const lang = document
				.querySelector(
					'[data-cy="lang-select"] .ant-select-selection-selected-value'
				)
				.title.toLowerCase(); // lang used
			result(() => {
				console.log("result obtained");
				startSpinner();
				let code = localStorage[qId + "_" + asi + "_" + lang]; //code submitted
				if (!code) {
					code = localStorage[qId + "_0_" + lang];
				}
				console.log({
					codeName: qId + "_0_" + lang,
					shes: localStorage[qId + "_0_" + lang],
					code,
				});
				const submissions =
					document.getElementsByClassName("ant-table-tbody")[0]
						.children.length; //number of submissions
				const rawInfo = document.getElementsByClassName("info__2oQ9");
				const info = [rawInfo[0], rawInfo[1]].map((el) => {
					return el.innerHTML
						.replace(/<[^>]*>/g, "")
						.replace(/:[^;]*;/g, ": ");
				}); // info thrown out by leet code
				const data = {
					code,
					submissions,
					info,
					qTitle,
					qId,
					username,
					site: "leetcode",
					lang,
				};
				submitData(data);
			});
		});
	});
});
