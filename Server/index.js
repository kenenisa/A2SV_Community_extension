(async function () {
	const express = require("express");
	require("dotenv").config();
	const cors = require("cors");
	const {
		findName,
		buildLink,
		CommitCode,
    EditCells,
	} = require("./util.js");
	const app = express();
	app.use(cors());
	app.use(express.urlencoded({ extended: true }));
	// const db = require('./models/db.js');

	//google sheets
	const { GoogleSpreadsheet } = require("google-spreadsheet");
	const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
	await doc.useServiceAccountAuth(require("./keys.json"));
	await doc.loadInfo();
	const InfoSheet = doc.sheetsByTitle["Info"];
	const ProgressSheet = doc.sheetsByTitle["Progress Sheet"];

	//routes
	const data = JSON.parse(
		'{"code":"THIS IS THE CODE","submissions":6,"info":["Runtime: 75 ms, faster than 84.62% of JavaScript online submissions for Fizz Buzz.","Memory Usage: 44.4 MB, less than 62.00% of JavaScript online submissions for Fizz Buzz."],"time":130809,"qTitle":"Fizz Buzz","qId":"412","username":"kenenisa","site":"leetcode","lang":"php"}'
	);
	// const data = req.body;
	const InfoRows = await InfoSheet.getRows();
	const name = findName(InfoRows, buildLink(data.site, data.username));
	console.log({ name });
	data.name = name;
	//commit the code to github
	const hyperLink = await CommitCode(data);
	//edit the right cells on the sheet
	await EditCells(data,ProgressSheet,hyperLink)

  app.post("/progress", async (req, res) => {
		res.send("OK");
	});

	app.post("/register", (req, res) => {
		console.log(req.body);
		res.send("<h1>This will work soon!</h1>");
	});

	app.set("port", process.env.PORT || 5000);
	app.set("host", process.env.HOST || "localhost");
	console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
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
