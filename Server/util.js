const { Octokit } = require("@octokit/rest");
const { Base64 } = require("js-base64");
const { cachedProblems } = require("./Caching");
const lang = require("./langs.json");
const octokit = new Octokit({
	auth: process.env.GITHUB_ACCESS_TOKEN,
});
const findProgressNameRow = (sheet, name, ProgressSheetGrid) => {
	let x = 0;
	try {
		while (ProgressSheetGrid.rowCount > x) {
			const cell = sheet.getCell(4 + x, 0);
			if (cell.value.toLowerCase() === name.toLowerCase()) {
				return cell._row;
			}
			x += 1;
		}
	} catch (e) {
		console.log(e);
	}
	return null;
};
const findProblemCol = (sheet, problem, ProgressSheetGrid) => {
	let x = 0;
	while (ProgressSheetGrid.columnCount > x) {
		const cell = sheet.getCell(3, 6 + x);
		if (cell.value.toLowerCase() === problem.toLowerCase()) {
			return cell._column;
		}
		x += 2;
	}
	return null;
};

module.exports = {
	findName: (rows, link) => {
		return (
			rows.find((row) => {
				let l = row.Leetcode;
				if (l) {
					if (l.slice(-1) === "/") {
						l = l.slice(0, -1);
					}
					return l.toLowerCase() === link.toLowerCase();
				}
			}) || { Name: null }
		);
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
	CommitCode: (data) => {
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
			octokit.repos
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
	EditCells: async (data, ProgressSheet, ProgressSheetGrid, hyperLink) => {
		//find where the user row is
		await ProgressSheet.loadCells("A:A");
		const row = findProgressNameRow(
			ProgressSheet,
			data.name,
			ProgressSheetGrid
		);
		if (!row) return { status: "NoMatchingName" };
		//find where the problem column is
		let column;
		const cachedColumn = cachedProblems(
			ProgressSheet,
			ProgressSheetGrid,
			data.qTitle
		);
		if (cachedColumn) {
			column = cachedColumn;
		} else {
			await ProgressSheet.loadCells("F4:4");
			column = findProblemCol(
				ProgressSheet,
				data.qTitle,
				ProgressSheetGrid
			);
		}
		if (!column) return { status: "NoProblemExists" };
		try {
			await ProgressSheet.loadCells({
				startRowIndex: row,
				endRowIndex: row + 1,
				startColumnIndex: column,
				endColumnIndex: column + 2,
			});
			console.log("LOADED!!");
			//get the target cell for submissions and time spent
			const ProblemCell = ProgressSheet.getCell(row, column);
			ProblemCell.value = data.submissions;
			ProblemCell.formula = `=HYPERLINK("${hyperLink}", "${data.submissions}")`;
			const TimeCell = ProgressSheet.getCell(row, column + 1);
			TimeCell.value = Math.round(data.time / 1000 / 60);
			//save any modification made
			await ProgressSheet.saveUpdatedCells();
		} catch (e) {
			console.log(e);
			return { status: "FailedToEdit" };
		}
		return { status: "OK", row, column };
	},
	addRecords: async (sheet, data, name) => {
		try {
			await sheet.addRow({
				Name: name,
				Email: data.email,
				"Phone Number": data.phone,
				Instagram: data.instagram,
				Birthday: data.birthday,
				Joined: new Date().toDateString(),
				"Short Bio": data.bio,
				"Expected Graduation Date": data.graduationDate,
				University: data.university,
				Department: data.department,
				Leetcode: data.leet,
				Hackerrank: data.hacker,
				Codeforces: data.codeforce,
				Github: data.Github,
				"Favorite Language": data.languages,
				"Tshirt Color": data.shirtColor,
				"Tshirt Size": data.shirtSize,
			});
		} catch (e) {
			console.log(e);
			return false;
		}
		return true;
		// await sheet.loadCells((row + 1) +':' + (row + 1))
		// const nameCell = sheet.getCell(row,0)
		// nameCell.value = name
		// const emailCell = sheet.getCell()

		// await sheet.saveUpdatedCells();
	},
	findEmptySpot: (sheet, ProgressSheetGrid) => {
		let x = 0;
		try {
			while (ProgressSheetGrid.rowCount > x) {
				const cell = sheet.getCell(4 + x, 0);
				const cell2 = sheet.getCell(4 + x, 2);
				if (!cell.value && cell2.value == 0) {
					return cell._row;
				}
				x += 1;
			}
		} catch (e) {
			console.log(e);
		}
		return null;
	},
	findNextProblems: async (ProgressSheet, ProgressSheetGrid, pos) => {
		await ProgressSheet.loadCells(["4:4", `${pos.row + 1}:${pos.row + 1}`]);
		let x = 0;
		let col = [];
		while (ProgressSheetGrid.columnCount > x) {
			if (col.length < 3) {
				const cell = ProgressSheet.getCell(pos.row, 6 + x);
				if (!cell.value) {
					col.push(6 + x);
				}
			} else {
				col.length < 4;
			}
			x += 2;
		}
		const result = [];
		col.forEach((c) => {
			const resultCell = ProgressSheet.getCell(3, c);
			result.push({
				link: resultCell.hyperlink,
				title: resultCell.value,
			});
		});
		return result;
	},
};
