# Mouse Event Recorder

Mouse Event Recorder is a Chrome Extension which records the mouse events on the DOM elements that have events attached to them. It generates plain text files containing the spatial information of DOM elements and the mouse events records.

## Usage

Mouse Event Recorder is a Chrome Browser extension, so it can be simply installed through the Extensions page chrome://extensions/ by either dropping the crx file on this page or loading the unpacked extension.

After installing, Mouse Event Recorder can be enabled on any web page by clicking its icon that will appear on the right of the address bar.

Then you can just browse web pages as usual and download the record file periodically (every 20,000 records per file).

## Structure of the file

Because there may be hundreds or even thousands of DOM elements on one web page, storing the spatial information costs too much. Mouse Event Recorder stores these information incrementally. Each row in mouse_event_record.txt represents one record, and only the first record contains the spatial information of all DOM elements at the beginning.

Notice that the mouse event triggers on the deepest possible element in the DOM tree, it then triggers on parents in nesting order. Therefore, if the mouse event is triggered on an element el, Mouse Event Recorder will find its lowest ancestor that has an attached event in the DOM tree.

Structure of each row, values are separated by commas:
```text
timestamp, mouse_event_type(0 for mousedown, 1 for mousemove, 2 for mouseup), x coordinate of the cursor, y coordinate of the cursor, index of the element, list of modified elements(optional)
```

Structure of modified elements(the number of elements is not fixed):
```text
index, left offset of the element, top offset of the element, width of the element, height of the element
```

If the offsets, width, and height of the element are all -1, then it means that this element is removed. Sometimes the width and the height of an element may be set to 0, and you can consider it as being removed as well. Moreover, there may be newly added elements whose index has not appeared before.
