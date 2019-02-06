window.state = {
    overlay: {
        displayed: false
    },
    modules: {
        active: "",
        positions: {

        }
    },
    getDockPosition() {
        var footer = document.getElementsByTagName('footer')[0],
            footerRect = footer.getBoundingClientRect();
        return footerRect.top;
    }
};

var xhr;

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


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****
Initialize page actions
* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

(function initEventListeners() {
    var chgToggle = document.getElementsByName('chg')[0],
        overlay = document.getElementsByClassName('overlay')[0];
		//login = document.getElementById('login');
		//register = document.getElementById('register');
		//butt = document.getElementById('butt');

    chgToggle.addEventListener('click', cardToggleClickHandler, false);

    //overlay.addEventListener('click', overlayClickHandler, false);

	//login.addEventListener('click', buttonTest, false);
	//register.addEventListener('click', buttonTest, false);
	//butt.addEventListener('click', buttonTest, false);

    document.addEventListener('click', function(event) {
        if (window.state.modules.active) {
            if ( 'group' in event.target.dataset ) {
                if ( event.target.dataset.group != window.state.modules.active.dataset.group ) {
                    closeActiveModule();
                }
            } else {
                closeActiveModule();
            }
        }
    });

})();


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function closeActiveModule() {
    var fn;
    fn = window.state.modules.active.closeHandler;
    if (typeof fn === 'function') { fn(window.state.modules.active); }
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function overlayClickHandler() {

    this.classList.add('nv');
    setTimeout(function(overlay) {
        overlay.classList.add('nd');
    }, 10, this);

}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function cardToggleClickHandler() {

    var loginCard = document.getElementsByClassName('login')[0],
        registerCard = document.getElementsByClassName('register')[0];

    if (this.dataset.active == "log") {
        setTimeout(function(tog) {
            tog.dataset.active = "reg";
            tog.innerHTML = "Login";
        }, 500, this);
        chgActiveCard(registerCard, loginCard);
    }
    else {
        setTimeout(function(tog) {
            tog.dataset.active = "log";
            tog.innerHTML = "Register";
        }, 500, this);
        chgActiveCard(loginCard, registerCard);
    }

}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function chgActiveCard(active, inactive) {

    inactive.classList.add('lft-open');
    active.classList.add('rgt-open');

    setTimeout(function() {
        active.classList.remove('bck');
        inactive.classList.add('bck');
        setTimeout(function() {
            inactive.classList.remove('lft-open');
            active.classList.remove('rgt-open');
        }, 10);
    }, 450);

}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function handleOverlay(overlay, topModule, type) {
    if (!window.state.overlay.displayed) {
        switch (type) {
            case 1:
                window.state.overlay.displayed = true;
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
                window.state.overlay.displayed = false;
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

function eventFire(element, etype){
    if (element.fireEvent) {
        element.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        element.dispatchEvent(evObj);
    }
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****
* First Non-Text Node Helper
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function matchChildElement(parent, element) {
    var idx = 0, currentNode;

    for (idx = 0; idx < parent.childNodes.length; idx++) {
        currentNode = parent.childNodes[idx];
        if (currentNode != null && currentNode.nodeType == 3) {
            // for (var i = 0; i < array.length; i++) {
            //     array[i]
            // }
        }
    }

}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****
* First Non-Text Node Helper
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function findFirstObjectNode(element) {
    var currentNode = elements.childNodes[0];

    while (currentNode != null && currentNode.nodeType == 3) {
        currentNode = currentNode.nextSibling
    }

    return currentNode;
}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****
* Get all of an element's parent elements up the DOM tree until a matching parent is found
* @param  {Node}   elem     The element
* @param  {String} selector The selector to filter against [optionals]
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function getGroupContainerElement( child, group ) {
    var elem = child,
        selector = "." + group + "-container";

    // Get matching parent elements
    while (elem && elem !== document) {
        if ( elem.matches( selector ) ) { return elem; break; }
        elem = elem.parentNode;
    }

    return null;

};

function buttonTest(button) {
	// AJAX request
	xhr = new XMLHttpRequest();

	// Variables to hold data to send to server
	var urlEncodedData = "";
	var urlEncodedDataPairs = {};
	var field;
	var inputList = document.querySelectorAll("input");
    
	// If the AJAX request failed to be created, exit immediately
	if( !xhr ) {
		alert( "Cannot create http request." );
		return false;
	}
	
	// Check which field is submitting a request, if login post to /login, if register post to /register
	if(button == 'login'){
		xhr.open( 'POST', 'https://access.localhost:3006/login' );
		for(field = 0; field < 2; field++){
			urlEncodedDataPairs[inputList[field].name] = inputList[field].value;
			//urlEncodedDataPairs.push(encodeURIComponent(inputList[field].name) + '=' + encodeURIComponent(inputList[field].value));
		}
	}
	else{
		xhr.open( 'POST', 'https://access.localhost:3006/register' );
		for(field = 2; field < inputList.length; field++){
			urlEncodedDataPairs[inputList[field].name] = inputList[field].value;
			//urlEncodedDataPairs.push(encodeURIComponent(inputList[2].name) + '=' + encodeURIComponent(inputList[2].value));
		}
	}

	// Encode the data into string pairs
	//urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

	// Set the ready state response, the header, and send the data to the server
	xhr.onreadystatechange = logContents;
	xhr.setRequestHeader('Content-Type', 'application/json')
	//xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
	console.log(JSON.stringify(urlEncodedDataPairs));
	xhr.send(JSON.stringify(urlEncodedDataPairs));
}

function logContents() {
	if( xhr.readyState === 4 && xhr.status === 200 ) {
		console.log( xhr.responseText );
	}
	else {
		console.log( 'There was an issue logging the response.' );
		console.log( xhr.readyState );
		console.log( xhr.status );
	}
}
