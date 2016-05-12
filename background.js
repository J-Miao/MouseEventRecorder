'use strict';

var enabled = false;
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log(enabled);
    enabled = !enabled;
    if (!enabled) {
        generateFile(eventRecordList);
        eventRecordList = [];
    }
    else {
        chrome.tabs.executeScript(tab.id, {file: "third-party/jquery-1.12.3.min.js"}, function () {
            chrome.tabs.executeScript(tab.id, {file: "third-party/d3.v3.min.js"}, function () {
                chrome.tabs.executeScript(tab.id, {file: "content.js"});
            });
        });
    }
});

var eventRecordList = [];
// Receive msg from content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    eventRecordList = eventRecordList.concat(message['data']);
    if (eventRecordList.length > 20000) {
        generateFile(eventRecordList);
        eventRecordList = [];
    }
});

// generate a text file to download when the records are more than the threshold
function generateFile(tempList) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var newList = tempList.map(function (x) {
        var tempX = [x['timestamp'], x['type'], x['cursor'][0], x['cursor'][1], x['curElement']];
        for (var i = 0; i < x['modifiedElements'].length; i++) {
            tempX = tempX.concat(x['modifiedElements'][i]);
        }

        return tempX.map(function (y) {
            return y.toString();
        }).join(",")
    }).join("\n");

    var blob = new Blob([newList], {type: "application/octet-binary"}),
        url = window.URL.createObjectURL(blob);

    chrome.downloads.download({
            url: url,
            filename: "mouse_event_records.txt",
            conflictAction: 'uniquify',
            saveAs: true
        }
    );
}
