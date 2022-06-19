const { Octokit } = require("@octokit/rest");
const { Base64 } = require("js-base64");
const lang = require("./langs.json");
const octokit = new Octokit({
	auth: process.env.GITHUB_ACCESS_TOKEN,
});
const findProgressNameRow = (sheet, name) => {
	let x = 0;
	while (sheet.getCell(4 + x, 0)) {
		const cell = sheet.getCell(4 + x, 0);
		if (cell.value.toLowerCase() === name.toLowerCase()) {
			return cell._row;
		}
		x += 1;
	}
};
const findProblemCol = (sheet, problem) => {
	let x = 0;
	while (sheet.getCell(3, 6 + x)) {
		const cell = sheet.getCell(3, 6 + x);
		if (cell.value.toLowerCase() === problem.toLowerCase()) {
			return cell._column;
		}
		x += 2;
	}
};

module.exports = {
	findName: (rows, link) => {
		return rows.find((row) => {
			let l = row.Leetcode;
			if (l) {
				if (l.slice(-1) === "/") {
					l = l.slice(0, -1);
				}
				return l.toLowerCase() === link.toLowerCase();
			}
		});
	},
	findRowPos: (rows, name) => {
		const user = rows.find((row) => {
			if (row.name) {
				return (
					row.name.toLowerCase().trim() === name.toLowerCase().trim()
				);
			}
		});
		return user._rowNumber;
	},
	buildLink: (site, username) => {
		return `https://${site}.com/${username}`;
	},
	CommitCode: async (data) => {
		if (data.code) {
			const date = new Date().toDateString().replace(/\s/g, "-");
			const time = new Date().getTime();
			const extension = lang[data.lang] || "txt";
			const msg = data.lang + " - " + data.info.join("\n");
			const code = Base64.encode(JSON.parse(data.code));
			//appropriate file path to store the code in
			const path = `${data.name.replace(/\s/g, "_")}/${date}/${
				data.qId + "_" + data.qTitle
			}_at${time}.${extension}`;
			await octokit.repos
				.createOrUpdateFileContents({
					owner: "kenenisa",
					repo: "A2SV_Community",
					path,
					// path:'sample.txt',
					content: code,
					fullyQualifiedRef: "heads/master",
					forceUpdate: true,
					message: msg,
					token: process.env.GITHUB_API_TOKEN,
					author: {
						name: "Robot",
						email: "helper@a2sv-353720.iam.gserviceaccount.com",
					},
					committer: {
						name: "Robot",
						email: "helper@a2sv-353720.iam.gserviceaccount.com",
					},
				})
				.catch((e) => console.log(e));
			// return link to where the code is stored
			return `https://github.com/kenenisa/A2SV_Community/blob/main/${path}`;
		}
	},
	EditCells: async (data, ProgressSheet, hyperLink) => {
		//find where the user row is
		await ProgressSheet.loadCells("A:A");
		const row = findProgressNameRow(ProgressSheet, data.name);
		//find where the problem column is
		await ProgressSheet.loadCells("F4:4");
		const column = findProblemCol(ProgressSheet, data.qTitle);
		await ProgressSheet.loadCells(row + 1 + ":" + (row + 1));
		//get the target cell for submissions and time spent
		const ProblemCell = ProgressSheet.getCell(row, column);
		ProblemCell.value = data.submissions;
		ProblemCell.formula = `=HYPERLINK("${hyperLink}", "${data.submissions}")`;
		const TimeCell = ProgressSheet.getCell(row, column + 1);
		TimeCell.value = Math.round(data.time / 1000 / 60);
		//save any modification made
		await ProgressSheet.saveUpdatedCells();
	},
};
