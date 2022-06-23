const express = require("express");
const { GoogleSpreadsheet } = require("google-spreadsheet");
require("dotenv").config();
const cors = require("cors");
const { findName, buildLink, CommitCode, EditCells, addRecords } = require("./util.js");
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


	//routes
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

	app.post("/register", async (req, res) => {
		const data = req.body;
		console.log(data);
		const name =
				`${data.fname} ${data.mname} ${data.lname}`.toLowerCase();
		const ok = await addRecords(InfoSheet,data,name)
		// const ok = true;
		if(ok){
			res.redirect(data.source+'?name='+name.replace(/\s/g,'_')+'&problem=https://leetcode.com/problems/fizz-buzz/')
		}else{
			res.redirect(data.source+'?error='+ok)
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
