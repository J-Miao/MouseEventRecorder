/**
 * Created by J-Miao on 5/11/16.
 */

var s = document.createElement('script');
s.src = chrome.extension.getURL('mouseevent.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);

// receive msg from the injected page and forward it to background.js
window.addEventListener('message', function(event) {
    // check event.type and event.data
    if (event.data.hasOwnProperty('_pf_event_records')) {
        //recordList.push(event.data['data']);
        //if (recordList.length > 100) {
        //    var tempList = recordList;
        //    recordList = [];
        //    chrome.runtime.sendMessage({"data": tempList});
        //}
        chrome.runtime.sendMessage({"data": event.data['_pf_event_records']});
    }
});
