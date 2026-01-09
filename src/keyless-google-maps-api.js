const bypass = function (googleAPIcomponentJS, googleAPIcomponentURL) {
    console.log("bypass", googleAPIcomponentJS, googleAPIcomponentURL);
    if (googleAPIcomponentURL.toString().indexOf("common.js") != -1) {
        var removeFailureAlert = async function(googleAPIcomponentURL) {
            const responseText = await fetch(`https://corsproxy.io/?url=${googleAPIcomponentURL}&key=7f86085c`).then(res => res.text())
            const anotherAppendChildToHeadJSRegex = /\.head;.*src=(.*?);/;
            const anotherAppendChildToHeadJS = responseText.match(anotherAppendChildToHeadJSRegex);
            const googleAPItrustedScriptURL = anotherAppendChildToHeadJS[1];
            const bypassQuotaServicePayload = anotherAppendChildToHeadJS[0].replace(googleAPItrustedScriptURL, googleAPItrustedScriptURL+'.toString().indexOf("QuotaService.RecordEvent")!=-1?"":'+googleAPItrustedScriptURL);

            const script = document.createElement('script');
            script.innerHTML = responseText.replace(new RegExp(/;if\(![a-z]+?\).*Failure.*?\}/), ";").replace(new RegExp(/(\|\|\(\(\)=>\{\}\);\S+\?\S+?\()/), "$1true||").replace(anotherAppendChildToHeadJSRegex, bypassQuotaServicePayload);
            document.head.appendChild(script);
        }
        googleAPIcomponentJS.innerHTML = '(' + removeFailureAlert.toString() + ')("' + googleAPIcomponentURL.toString() + '")';
    } else if(googleAPIcomponentURL.toString().indexOf("map.js") != -1){
        var hijackMapJS = async function(googleAPIcomponentURL) {
            const responseText = await fetch(`https://corsproxy.io/?url=${googleAPIcomponentURL}&key=7f86085c`).then(res => res.text())
            const script = document.createElement('script');
            script.innerHTML = responseText.replace(new RegExp(/if\(\w+!==1&&\w+!==2\)/), "if(false)");
            document.head.appendChild(script);
        }
        googleAPIcomponentJS.innerHTML = '(' + hijackMapJS.toString() + ')("' + googleAPIcomponentURL.toString() + '")';
    } else {
        googleAPIcomponentJS.src = googleAPIcomponentURL;
    }
}

async function importLibrary() {
    const url = new URL("https://maps.googleapis.com/maps/api/js");
    url.searchParams.set("callback", "initMap");
    url.searchParams.set("v", "weekly");
    url.searchParams.set("key", "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg");
    const googleAPIjs = await fetch(url).then(res => res.text())
    console.log("googleAPIjs", googleAPIjs.slice(0, 500));
    const appendChildToHeadJS = googleAPIjs.match(/(\w+)\.src=(_.*?);/);
    const googleAPIcomponentJS = appendChildToHeadJS[1];
    const googleAPIcomponentURL = appendChildToHeadJS[2];
    const script = document.createElement('script');
    script.innerHTML = googleAPIjs.replace(appendChildToHeadJS[0], '(' + bypass.toString() + ')(' + googleAPIcomponentJS + ', ' + googleAPIcomponentURL + ');');
    document.head.appendChild(script);
};

function setOptions(options) {}

export { importLibrary, setOptions }