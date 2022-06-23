const express = require("express");
const { GoogleSpreadsheet } = require("google-spreadsheet");
require("dotenv").config();
const cors = require("cors");
const { findName, buildLink, CommitCode, EditCells } = require("./util.js");
const { cacheProblems } = require("./Caching.js");
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
	//routes

	const InfoRows = await InfoSheet.getRows();
	// console.log({ InfoRows });
	app.post("/progress", async (req, res) => {
		const timer = new Date().getTime();

		// const data = JSON.parse(
		// 	'{"code":"\\"THIS IS THE CODE\\"","submissions":6,"info":["Runtime: 75 ms, faster than 84.62% of JavaScript online submissions for Fizz Buzz.","Memory Usage: 44.4 MB, less than 62.00% of JavaScript online submissions for Fizz Buzz."],"time":130809,"qTitle":"Fizz Buzz","qId":"412","username":"kenenisa","site":"leetcode","lang":"php"}'
		// );
		const data = req.body;
		const name = findName(
			InfoRows,
			buildLink(data.site, data.username)
		).Name;
		console.log("DONE! name", (new Date().getTime() - timer) / 1000 + "s");

		if (!name) {
			res.send("NoName");
			res.end();
			return;
		}
		console.log({ name });
		data.name = name;
		//commit the code to github
		const hyperLink = CommitCode(data);
		//edit the right cells on the sheet
		const status = await EditCells(
			data,
			ProgressSheet,
			ProgressSheetGrid,
			hyperLink
		);
		console.log("DONE!", (new Date().getTime() - timer) / 1000 + "s");
		res.send(status);
		res.end();
	});

	app.post("/register", (req, res) => {
		console.log(req.body);

		res.send("<h1>This will work soon!</h1>");
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
