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

export { bypass };
