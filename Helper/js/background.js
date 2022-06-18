// // chrome.runtime.onInstalled.addListener(async () => {
// function injectScript(tabId) {
//   chrome.scripting.executeScript(
//     {
//       target: { tabId: tabId },
//       files: ["js/script.js"],
//     },
//     () => {
//       console.log("started scripting");
//     }
//   );
//   console.log("Main loaded");
// }
// // });

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   console.log({ tabId, changeInfo, tab });
//   if (changeInfo.status === "complete") {
//     injectScript(tabId);
//   }
// });
