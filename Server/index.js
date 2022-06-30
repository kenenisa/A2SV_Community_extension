const express = require("express");
const { GoogleSpreadsheet } = require("google-spreadsheet");
require("dotenv").config();
const cors = require("cors");
const {
	findName,
	buildLink,
	CommitCode,
	EditCells,
	addRecords,
	findEmptySpot,
	findNextProblems,
} = require("./util.js");
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
(async function () {
	//google sheets
	const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
	await doc.useServiceAccountAuth(require("./keys.json"));
	await doc.loadInfo();
	// console.log(doc);
	const InfoSheet = doc.sheetsByTitle["Info"];
	const ProgressSheet = doc.sheetsByTitle["Progress Sheet"];
	const ProgressSheetGrid = ProgressSheet._rawProperties.gridProperties;

	const InfoRows = await InfoSheet.getRows();
	await ProgressSheet.loadCells("A:C");

	//routes
	app.post("/progress", async (req, res) => {
		const timer = new Date().getTime();

		// const data = JSON.parse(
		// 	'{"code":"\\"THIS IS THE CODE\\"","submissions":6,"info":["Runtime: 75 ms, faster than 84.62% of JavaScript online submissions for Fizz Buzz.","Memory Usage: 44.4 MB, less than 62.00% of JavaScript online submissions for Fizz Buzz."],"time":130809,"qTitle":"Fizz Buzz","qId":"412","username":"kenenisa","site":"leetcode","lang":"php"}'
		// );
		const data = req.body;
		if (!data.name) {
			let name = "";
			name = findName(InfoRows, buildLink(data.site, data.username)).Name;
			if (!name || name === "") {
				res.send({ status: { status: "NoName" } });
				res.end();
				return;
			}
			console.log({ name });
			data.name = name;
		}

		//commit the code to github
		const hyperLink = CommitCode(data);
		//edit the right cells on the sheet
		const status = await EditCells(
			data,
			ProgressSheet,
			ProgressSheetGrid,
			hyperLink
		);
		let next = "";
		if (status.status === "OK") {
			next = await findNextProblems(
				ProgressSheet,
				ProgressSheetGrid,
				status
			);
		}
		const response = {
			status,
			subs: data.submissions,
			solved: data.qTitle,
			spent: Math.floor(data.time / 1000 / 60),
			next,
			name:data.name
		}
		console.log(response);
		console.log("DONE!", (new Date().getTime() - timer) / 1000 + "s");
		res.json(response);
		res.end();
	});

	app.post("/register", async (req, res) => {
		const data = req.body;
		const name = `${data.fname} ${data.mname} ${data.lname}`
			.toLowerCase()
			.split(" ")
			.map((e) => e[0].toUpperCase() + e.slice(1))
			.join(" ");
		const row = findEmptySpot(ProgressSheet, ProgressSheetGrid);
		let ok = await addRecords(InfoSheet, data, name);
		if (!row) ok = false;
		await ProgressSheet.loadCells({
			startRowIndex: row,
			endRowIndex: row + 1,
			startColumnIndex: 0,
			endColumnIndex: 1,
		});
		const availableCell = ProgressSheet.getCell(row, 0);
		availableCell.value = name;
		// const ok = true;
		await ProgressSheet.saveUpdatedCells();

		if (ok) {
			res.redirect(
				data.source +
					"?name=" +
					name.replace(/\s/g, "_") +
					"&problem=https://leetcode.com/problems/fizz-buzz/"
			);
		} else {
			res.redirect(data.source + "?error=" + ok);
		}
	});

	app.set("port", process.env.PORT || 5000);
	app.set("host", process.env.HOST || "localhost");
	// db.sequelize.sync().then(function () {
	app.get("/", async (req, res) => {
		res.send("OK");
	});
	app.listen(app.get("port"), function () {
		console.log(
			"%s server listening at http://%s:%s",
			process.env.NODE_ENV,
			app.get("host"),
			app.get("port")
		);
	});
})();

// })
