function id(str){
    return document.getElementById(str)
}

chrome.storage.sync.get(["name"], function (result) {
	if(result.name){
        id("register").style.display = "none"
        id("user").style.display ="block"
        id("name_reg").innerHTML = result.name.split('_').map(e=>e[0].toUpperCase()+e.slice(1)).join(" ")
    }
    console.log(result);
});