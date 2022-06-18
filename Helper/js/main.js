// chrome.tabs.query({ active: true, currentWindow: true }).then((e) => {
//   let [tab] = e;
//   const tabId = tab.id;
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
// });

console.log("Main Loaded");
