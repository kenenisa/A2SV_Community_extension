# A2SV community progress tracker

## Getting started

### Components

* Helper Extension
  * This is where all the data about a progress is collected. It also is used for registration and other
       simple functionalities. The aim is to make it work with zero configuration or out of the box.
* Server
  * handles registration and progress tracking requests
  * Manages external api calls and data manipulation

**Note: The System makes a couple  important assumptions.*

  1. Names are unique and consistent across sheets.
  2. Time spent are recorded from time of loading the question up to the last correct submission.
  3. One best solution is submitted last*

### Folder structure

The `root` contains 2 directories:
* `Helper`: Contains a chrome extension project and all of it's scripts.
* `Server`: Contains an express server.

### Setup

For the system to function both the helper extension and server must be available.

* First steps
  * Clone or fork this repository
  * Install the extension on your chrome browser. Go to chrome://extensions/ then *Load unpacked* from there select where the `Helper` dir is then you'll be all set here.
  * Finally this should automatically inject a script into [leetcode.com](https://leetcode.com/problems)
* Next steps
  * Navigate to the `Server` dir on your terminal and run `npm install`
  * You can start the server using `npm start` on port 5000 by default. Requests will be made to `localhost:5000`. If you change the port, which you can do in .env file PORT key, you also have to change where the helper script sends requests to.
  * You need to setup your .env file. It must contain 2 important keys SHEET_ID that can be found on the spreadsheet url. Used to identify which spreadsheet we're working with and GITHUB_ACCESS_TOKEN used for code storage. I used a personal account to setup a test thats why i'm not sharing the access token but this key can be removed once a public repo and account has been setup.

## Contribution

You are welcome to contribute to this project. There are 2 ways you can contribute.

1. You can use and inspect the project and submit issues through github issues. You can open them any time and someone will solve them.
2. You can directly work on the code base. First you need to clone or fork the repo and work on your own version. When you're done you can submit a pull request to this repo. It will be reviewed and merged to the master branch here.

Please don't shy away from both or any of the above contributions.

**Note: This is an Alpha version(0.0.1). It hasn't been tested or used properly and it has critical issues that need to be fixed first.**
