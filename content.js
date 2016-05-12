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
        chrome.runtime.sendMessage({"data": event.data['_pf_event_records']});
    }
});
