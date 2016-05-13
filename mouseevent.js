(function() {
    if (!window.jQuery) {
        var script=document.createElement('script');
        script.src='https://code.jquery.com/jquery-1.12.1.min.js';
        script.onload=startRecording;
        document.body.appendChild(script);
    }
    else {
        startRecording();
    }

    function startRecording() {

        // Insert a record for each mouse event
        function _pf_insertLog(curLog) {
            var elementList = [];

            // Find elements that has changed in size or position
            for (var i = 0; i < _pf_elementList.length; i++) {
                var d = _pf_elementList[i][1];
                var curEleID = _pf_elementList[i][0];

                if ($(d).length) {
                    var pos = [$(d).offset().left , $(d).offset().top];
                    var size =  [$(d).width(), $(d).height()];
                    if (_pf_elementInfo[curEleID]['position'][0] === pos[0] && _pf_elementInfo[curEleID]['position'][1] === pos[1]
                        && _pf_elementInfo[curEleID]['size'][0] === size[0] && _pf_elementInfo[curEleID]['size'][1] === size[1]) {
                        continue;
                    }
                    // console.log($(d).attr('_pf_ele_id'));
                    elementList.push([curEleID, $(d).offset().left , $(d).offset().top, $(d).width(), $(d).height()]);
                    _pf_elementInfo[curEleID]['position'] = pos;
                    _pf_elementInfo[curEleID]['size'] = size;
                }
                else {
                    elementList.push([curEleID, -1, -1, -1, -1]);
                    _pf_elementInfo[curEleID]['position'] = [-1,-1];
                    _pf_elementInfo[curEleID]['size'] = [-1,-1];
                }
            }

            curLog['modifiedElements'] = elementList;
            _pf_logList.push(curLog);
            // send to the content script for every 100 records
            if (_pf_logList.length >= 100) {
                window.postMessage({
                        '_pf_event_records': _pf_logList
                    },
                    '*'
                );
                _pf_logList = [];
            }
        }

        // For each element, find its lowest ancestor attached with an event handler(marked before)
        // Assign unique ids to newly added elements during traversing in the DOM tree
        // If there is no such ancestor exists, then return the element itself
        function getAncestor(el) {
            var temp = el;
            while (el) {
                if ($(el).attr('_pf_ele_id') === undefined) {
                    var curEleID = _pf_eleCnt++;
                    $(el).attr('_pf_ele_id', curEleID);

                    if (jQueryGeneric(rez, el, el)) {
                        if ($(el).attr('_pf_event_id') === undefined) {
                            $(el).attr('_pf_event_id', _pf_eventCnt++);
                            _pf_elementList.push([+$(el).attr('_pf_ele_id'), el]);
                            _pf_elementInfo[curEleID] = {
                                'position': [-1, -1],
                                'size': [-1, -1]
                            }
                        }
                    };
                }

                if ($(el).attr('_pf_event_id') !== undefined) {
                    break;
                }
                var pa = $(el).parent()[0];
                if (!pa) break;
                // if ($(pa).width() !== $(el).width() || $(pa).height() !== $(el).height()) break;
                el = pa;
            }
            if (!el || $(el).attr('_pf_event_id') === undefined) {
                return temp;
            }
            else {
                return el;
            }
        }


        var _pf_eleCnt = 0; // count of elements
        var _pf_eventCnt = 0; // count of elements attached with an event handler
        var _pf_logList = [];
        var _pf_dragging = false;
        var rez = [];
        var _pf_elementList = [];
        var _pf_elementInfo = {}; // position and size of elements

        $(window).on('mousemove', function(e) {

            var p = [e.clientX, e.clientY];
            var el = getAncestor($(e.target));
            var curEleID = +$(el).attr('_pf_ele_id');
            var curTime = Math.floor(Date.now());
            var curLog = {'type': 1, 'dragState': _pf_dragging, 'timestamp': curTime,
                'cursor': p, 'curElement': curEleID};
            _pf_insertLog(curLog);
        });

        $(document).on('mousedown', function(e) {

            e.preventDefault();
            if (e.button === 2) return;
            var p = [e.clientX, e.clientY];
            _pf_dragging = true;

            var el = getAncestor($(e.target));
            var curEleID = $(el).attr('_pf_ele_id');
            // console.log(curEleID);
            var curTime = Math.floor(Date.now());
            var curLog = {'type': 0, 'dragState': _pf_dragging, 'timestamp': curTime,
                'cursor': p, 'curElement': curEleID};
            _pf_insertLog(curLog);
        });

        $(document).on('mouseup', function(e) {
            if (e.button === 2) return;
            var el = getAncestor($(e.target));

            var curEleID = $(el).attr('_pf_ele_id');
            var p = [e.clientX, e.clientY];
            _pf_dragging = false;
            var curTime = Math.floor(Date.now());
            var curLog = {'type': 2, 'dragState': _pf_dragging, 'timestamp': curTime,
                'cursor': p, 'curElement': curEleID};
            _pf_insertLog(curLog);
        });

        $(document).ready(function(){
            // traverse all existing elements
            rez = [];
            var nodes = $('*');
            // console.log(nodes);
            nodes.each(function(index1, element) {
                // Assign a unique id to the element
                if (!$(element).hasOwnProperty('_pf_ele_id')) {
                    $(element).attr('_pf_ele_id', _pf_eleCnt ++);
                }
                // Mark the element if it is attached with an event handler
                if (jQueryGeneric(rez, element, element)) {
                    if (!$(element).hasOwnProperty('_pf_event_id')) {
                        $(element).attr('_pf_event_id', _pf_eventCnt ++);
                        _pf_elementList.push([+$(element).attr('_pf_ele_id'), element]);
                        _pf_elementInfo[+$(element).attr('_pf_ele_id')] = {
                            'position': [-1, -1],
                            'size': [-1, -1]
                        };
                    }
                };
            });
        });
    }

    // Code borrowed from Visual Events
    function jQueryGeneric (elements, eventsObject, node) {
        var originalLen = elements.length;

        if (typeof eventsObject == 'object') {
            var events;

            if (typeof eventsObject.events == 'object') {
                events = eventsObject.events;
            }

            if (!events) {
                events = $._data(eventsObject, 'events');
            }

            var func;

            for (var type in events) {
                if (events.hasOwnProperty(type)) {
                    /* Ignore live event object - live events are listed as normal events as well */
                    if (type == 'live') {
                        continue;
                    }

                    var oEvents = events[type];

                    for (var j in oEvents) {
                        if (oEvents.hasOwnProperty(j)) {
                            var aNodes = [];
                            var sjQuery = 'jQuery ' + jQuery.fn.jquery;

                            if (typeof oEvents[j].selector != 'undefined' && oEvents[j].selector !== null) {
                                aNodes = $(oEvents[j].selector, node);
                                sjQuery += ' (live event)';
                            }
                            else {
                                aNodes.push(node);
                            }

                            for (var k = 0, kLen = aNodes.length; k < kLen; k++) {
                                elements.push({
                                    'node': aNodes[k],
                                    'listeners': []
                                });

                                if (typeof oEvents[j].origHandler != 'undefined') {
                                    func = oEvents[j].origHandler.toString();
                                }
                                else if (typeof oEvents[j].handler != 'undefined') {
                                    func = oEvents[j].handler.toString();
                                }
                                else {
                                    func = oEvents[j].toString();
                                }

                                if (oEvents[j] && func != '0') {
                                    elements[elements.length - 1].listeners.push({
                                        'type': type,
                                        'func': func,
                                        'removed': false,
                                        'source': sjQuery
                                    });
                                }
                            }
                        }

                        /* Remove elements that didn't have any listeners (i.e. might be a Visual Event node)*/
                        if (elements.length && elements[elements.length - 1].listeners.length === 0) {
                            elements.splice(elements.length - 1, 1);
                        }
                    }
                }
            }
        }
        return (originalLen < elements.length);
    }
})();

