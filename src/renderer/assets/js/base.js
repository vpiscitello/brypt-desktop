var windowState = {
    overlayDisplayed: false,
};

// Element.matches() polyfill
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--idx >= 0 && matches.item(idx) !== this) {}
            return idx > -1;
        };
}


NodeList.prototype.forEach = function(callback) {
    Array.prototype.forEach.call(this, callback);
};

/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****
Initialize page actions
* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

window.addEventListener('load', function() {
    var menuToggle = document.querySelector('nav .toggle');
    menuToggle.addEventListener('click', menuToggleClickHandler, false);
});


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function menuToggleClickHandler() {
    var nav = document.getElementsByTagName('nav')[0];
    var overlay = document.getElementsByClassName('overlay')[0];

    if (nav.classList.contains('open-m')) {
        closeMenuModule(overlay, nav);
        setTimeout(handleOverlay, overlay, nav, 1, 100);
    } else {
        openMenuModule(overlay, nav);
        setTimeout(handleOverlay, 100, overlay, nav, 1);
    }
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function openMenuModule(overlay, nav) {
    overlay.classList.remove('nd');
    nav.classList.remove('hd-m');
    setTimeout(function() {
        nav.classList.remove('nv-m');
        nav.classList.add('open-m');
        overlay.classList.remove('nv');
    }, 10, nav);
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function closeMenuModule(overlay, nav) {
    overlay.classList.add('nv');
    nav.classList.add('nv-m');
    nav.classList.remove('open-m');
    setTimeout(function() {
        nav.classList.add('hd-m');
        overlay.classList.add('nd');
    }, 400, nav);
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function handleOverlay(overlay, topModule, type) {
    if (!windowState.overlayDisplayed) {
        switch (type) {
            case 1:
                windowState.overlayDisplayed = true;
                overlay.addEventListener('click', function clickMenuToggle() {
                    eventFire(document.getElementById('menu-toggle'), 'click');
                }, false);
                break;
            default:
                return;
        }
    } else {
        switch (type) {
            case 1:
                windowState.overlayDisplayed = false;
                // overlay.removeEventListener('click', closeMenuModule, false);
                break;
            default:
                return;
        }
    }
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function eventFire(element, etype) {
    if (element.fireEvent) {
        element.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        element.dispatchEvent(evObj);
    }
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****
First Non-Text Node Helper
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function findFirstObjectNode(element) {
    var currentNode = elements.childNodes[0];

    while (currentNode != null && currentNode.nodeType == 3) {
        currentNode = currentNode.nextSibling;
    }

    return currentNode;
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****
Get all of an element's parent elements up the DOM tree until a matching parent is found
* @param  {Node}   elem     The element
* @param  {String} selector The selector to filter against [optionals]
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function getGroupContainerElement(child, group) {
    var elem = child,
        selector = "." + group + "-container";

    // Get matching parent elements
    while (elem && elem !== document) {
        if (elem.matches(selector)) {
            return elem;
        }
        elem = elem.parentNode;
    }

    return null;

}
