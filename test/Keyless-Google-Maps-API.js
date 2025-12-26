import fs from 'fs';
var args = '';
if (typeof language != 'undefined') args += '&language=' + language;

var bypass = function (googleAPIcomponentJS, googleAPIcomponentURL) {
    if (googleAPIcomponentURL.toString().indexOf("common.js") != -1) {
        var removeFailureAlert = function(googleAPIcomponentURL) {
            sendRequestThroughCROSproxy(googleAPIcomponentURL,(responseText)=>{
                var anotherAppendChildToHeadJSRegex = /\.head;.*src=(.*?);/;
                var anotherAppendChildToHeadJS = responseText.match(anotherAppendChildToHeadJSRegex);
                var googleAPItrustedScriptURL = anotherAppendChildToHeadJS[1];
                var bypassQuotaServicePayload = anotherAppendChildToHeadJS[0].replace(googleAPItrustedScriptURL, googleAPItrustedScriptURL+'.toString().indexOf("QuotaService.RecordEvent")!=-1?"":'+googleAPItrustedScriptURL);

                var script = document.createElement('script');
                script.innerHTML = responseText.replace(new RegExp(/;if\(![a-z]+?\).*Failure.*?\}/), ";").replace(new RegExp(/(\|\|\(\(\)=>\{\}\);\S+\?\S+?\()/), "$1true||").replace(anotherAppendChildToHeadJSRegex, bypassQuotaServicePayload);
                document.head.appendChild(script);
            });
        }
        googleAPIcomponentJS.innerHTML = '(' + removeFailureAlert.toString() + ')("' + googleAPIcomponentURL.toString() + '")';
    } else if(googleAPIcomponentURL.toString().indexOf("map.js") != -1){
        var hijackMapJS = function(googleAPIcomponentURL) {
            sendRequestThroughCROSproxy(googleAPIcomponentURL,(responseText)=>{
                var script = document.createElement('script');
                script.innerHTML = responseText.replace(new RegExp(/if\(\w+!==1&&\w+!==2\)/), "if(false)");
                document.head.appendChild(script);
            });
        }
        googleAPIcomponentJS.innerHTML = '(' + hijackMapJS.toString() + ')("' + googleAPIcomponentURL.toString() + '")';
    } else {
        googleAPIcomponentJS.src = googleAPIcomponentURL;
    }
}

var createAndExecutePayload = function (googleAPIjs){
    var script = document.createElement('script');
    var appendChildToHeadJS = googleAPIjs.match(/(\w+)\.src=(_.*?);/);
    var googleAPIcomponentJS = appendChildToHeadJS[1];
    var googleAPIcomponentURL = appendChildToHeadJS[2];
    script.innerHTML = googleAPIjs.replace(appendChildToHeadJS[0], '(' + bypass.toString() + ')(' + googleAPIcomponentJS + ', ' + googleAPIcomponentURL + ');');
    document.head.appendChild(script);
}

function run() {
    const googleMapsAPI = fs.readFileSync('./test/googlemapsapi.js', 'utf8');
    console.log('Injecting Google Maps API bypass script...', googleMapsAPI.slice(0, 100) + '...');
    console.log('bypass function:', bypass.toString().slice(0, 100) + '...');
    var appendChildToHeadJS = googleMapsAPI.match(/(\w+)\.src=(_.*?);/);
    var googleAPIcomponentJS = appendChildToHeadJS[1];
    var googleAPIcomponentURL = appendChildToHeadJS[2];
    console.log('Executing payload...', {googleAPIcomponentJS, googleAPIcomponentURL});
    googleMapsAPI.replace(appendChildToHeadJS[0], '(' + bypass.toString() + ')(' + googleAPIcomponentJS + ', ' + googleAPIcomponentURL + ');');
}

run()
