console.log("A2SV Script Loaded and Running...");
console.log(document);
localStorage.A2SV_timer = localStorage.A2SV_timer || new Date().getTime();
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
//wait for submission result
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
// attach action when submit button is pressed
loaded((submitButton) => {
	submitButton.addEventListener("click", () => {
		const [qId, qTitle] = document
			.querySelector('[data-cy="question-title"]')
			.innerHTML.split(". "); // question id and title
		const user = JSON.parse(localStorage["GLOBAL_DATA:value"]).userStatus;
		const username = user.username;
		const asi = user.activeSessionId;
		const lang = JSON.parse(localStorage.global_lang); // lang used
		result(() => {
			console.log("result obtained");
			let code = localStorage[qId + "_" + asi + "_" + lang]; //code submitted
			if (!code) {
				code = localStorage[qId + "_" + 0 + "_" + lang];
			}
			const submissions =
				document.getElementsByClassName("ant-table-tbody")[0].children
					.length; //number of submissions
			const rawInfo = document.getElementsByClassName("info__2oQ9");
			const info = [rawInfo[0], rawInfo[1]].map((el) => {
				return el.innerHTML
					.replace(/<[^>]*>/g, "")
					.replace(/:[^;]*;/g, ": ");
			}); // info thrown out by leet code
			const time = new Date().getTime() - Number(localStorage.A2SV_timer); // time taken in ms
			const data = {
				code,
				submissions,
				info,
				time,
				qTitle,
				qId,
				username,
				site: "leetcode",
				lang,
			};
			console.log(data);
			// console.log(JSON.stringify(data));
			fetch("http://localhost:5000/progress", {
				method: "POST",
				body: JSON.stringify(data),
			}).then(() => {
				alert("A2SV knows what you did");
			});
		});
	});
});
