/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function dropSelectClickHandler() {
    var selectMenu = document.querySelector("ul[data-name='" + this.dataset.for+"']"),
        container = getGroupContainerElement(this, 'ds');

    container.classList.add('frnt');
    selectMenu.classList.add('open-d');

}


/**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****

* @param  {Node}   elem     The element
* @param  {Node}   elem     The element
* @return {Array}           The parent elements
**** **** * * * * * * * * * * * * * * * * * * * * * * * * * * **** ****/

function selectOptionClickHandler() {
    var container = getGroupContainerElement(this, 'ds'),
        selectEquiv = document.getElementsByName(this.dataset.for)[0],
        selectVisual = document.querySelector("div[data-for='" + this.parentNode.dataset.group + "'] .ds-selection"),
        selectContext = document.querySelector("div[data-for='" + this.parentNode.dataset.group + "'] .ds-selection .ds-context .ds-value");

    selectEquiv.selected = true;
    selectContext.innerHTML = this.dataset.value;

    primarySelect = document.querySelector("ul[data-name='" + this.parentNode.dataset.name + "'] .highlight");
    if (primarySelect) {
        primarySelect.classList.remove('highlight');
    }

    if (this.dataset.value == "NA") {
        selectVisual.classList.remove('selected');
    } else {
        selectVisual.classList.add('selected');
        this.classList.add('highlight');
    }

    this.parentNode.classList.remove('open-d');
    container.classList.remove('frnt');

}



function addParentToForeground(elem, levels) {
    var idx = 1;
    var parent = elem.parentNode;
    while (idx++ < levels) {
        parent = parent.parentNode;
    }
    parent.classList.add('topper');
}

function removeParentFromForeground(elem, levels) {
    var idx = 1;
    var parent = elem.parentNode;
    while (idx++ < levels) {
        parent = parent.parentNode;
    }
    parent.classList.remove('topper');
}

function deactivateSelect(select) {

    if (!select.classList.contains('active')) {
        return;
    }

    var optList = select.querySelector('.ds-menu');

    optList.classList.remove('active');
    select.classList.remove('active');
    removeParentFromForeground(optList, 3);

}

function activeSelect(select, selectVisual) {

    if (select.classList.contains('active')) {
        return;
    }

    selectVisual.forEach(deactivateSelect);
    select.classList.add('active');

}

function toggleOptList(select, show) {

    var optList = select.querySelector('.ds-menu');
    optList.classList.toggle('active');
    addParentToForeground(optList, 3);

}

function highlightOption(select, option) {

    var optionList = select.querySelectorAll('.option');

    optionList.forEach(function(other) {
        other.classList.remove('highlight');
    });

    option.classList.add('highlight');

}

function updateValue(select, index) {

    var nativeWidget = select.previousElementSibling;
    var value = select.querySelector('.ds-context .ds-value');
    var optionList = select.querySelectorAll('.option');

    optionList.forEach(function(other) {
        other.setAttribute('aria-selected', 'false');
        other.classList.remove('hidden');
    });

    optionList[index].setAttribute('aria-selected', 'true');
    optionList[index].classList.add('hidden');

    nativeWidget.selectedIndex = index;

    value.innerHTML = optionList[index].innerHTML;
    value.dataset.value = optionList[index].innerHTML;

    if (value.dataset.value == "NA") {
        select.classList.remove('selected');
    } else {
        select.classList.add('selected');
    }

    highlightOption(select, optionList[index]);

}

function getIndex(select) {
    var nativeWidget = select.previousElementSibling;
    return nativeWidget.selectedIndex;
}

window.addEventListener('load', function() {
    var form = document.querySelector('form');
    form.classList.remove('no-widget');
    form.classList.add('widget');
});

window.addEventListener('load', function() {

    var selectVisual = document.querySelectorAll('.ds-visual');

    selectVisual.forEach(function(select) {

        var optionList = select.querySelectorAll('.option');
        select.tabIndex = 0;
        select.previousElementSibling.tabIndex = -1;
        updateValue(select, optionList.length - 1);

        optionList.forEach(function(option, index) {
            option.addEventListener('mouseover', function() {
                highlightOption(select, option);
            });

            option.addEventListener('click', function(event) {
                updateValue(select, index);
            });
        });

        select.addEventListener('click', function(event) {
            toggleOptList(select);
        });

        select.addEventListener('focus', function(event) {
            activeSelect(select, selectVisual);
        });

        select.addEventListener('blur', function(event) {
            deactivateSelect(select);
        });

        select.addEventListener('keyup', function(event) {
            var length = optionList.length,
                index = getIndex(select);

            if (event.keyCode === 40 && index < length - 1) {
                index++;
            }
            if (event.keyCode === 38 && index > 0) {
                index--;
            }

            updateValue(select, index);
        });
    });

});
