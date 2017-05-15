
function BaseSlider() {
    this.ClassNames = {
        ROOT: 'slider_main_container',
        SLIDER_CONTENT: 'slider_content_container',
        ITEM_CONTAINER: 'slider_content_item',
        ITEM_CONTENT: 'slider_item_content',
        PAGER: 'slider_pages_container',
        PAGE_POINT: 'slider_pages_item',
        BTN: 'slider_btn_container',
        BTN_LEFT: 'left',
        BTN_RIGHT: 'right'
    }
    this.AtributesNames = {
        HIDDEN: 'hidden',
        ACTIVE: 'activeitem',
        ITEM_NUMBER: 'inumber',
        NEXT: 'next',
        PREV: 'prev'
    }
    this.contentData = {
        contentArray: null,
        contentSelector: null,
        contentContainer: null,
        contentCount: 0,
        setArray: function (contentArray) {
            this.contentArray = contentArray;
            this.contentCount = this.contentArray.length;
        },
        setArrayFromContainer: function (contentContainer, contentSelector) {
            this.contentSelector = contentSelector;
            this.contentContainer = contentContainer;
            this.setArray(contentContainer.querySelectorAll(contentSelector));
        }
    },
    this.displayContainer = null,
    this.ActiveItemNumber = 0,
    this.AutoStrollingInterval = 0,
    this.AutoStrollingTimerId = '',
    this.renderSlider = function () {
    };
    this.renderSliderItem = function (itemIndex) {
    };

    this.renderPager = function () {
    };

    this.renderBtns = function () {
    };

    this.SetScrolling = function (interval) {
        this.AutoStrollingInterval = interval
    }
};

function CurrentSlider(displayContainer, contentContainer, contentSelector, contentArray) {
    BaseSlider.apply(this);
    if (displayContainer != null) {
        this.displayContainer = displayContainer;
    }
    else {
        this.displayContainer = contentContainer;
    }
    if (contentArray != null) {
        this.contentData.setArray(contentArray);
    }
    else {
        this.contentData.setArrayFromContainer(contentContainer, contentSelector);
    }

    this.renderSlider = function () {
        this.displayContainer.innerHTML = '';
        if (this.displayContainer.className.indexOf(this.ClassNames.ROOT) < 0) {
            this.displayContainer.className += ' ' + this.ClassNames.ROOT;
        }
        var div = document.createElement("div");
        div.className = this.ClassNames.SLIDER_CONTENT;
        this.displayContainer.appendChild(div);

        for (var i = 0; i < this.contentData.contentCount; i++) {
            var content = document.createElement("div");
            content.className = this.ClassNames.ITEM_CONTAINER;
            content.setAttribute(this.AtributesNames.ITEM_NUMBER, i);
            if (i == this.ActiveItemNumber) {
                content.setAttribute(this.AtributesNames.ACTIVE, '');
            }
            else {
                content.setAttribute(this.AtributesNames.HIDDEN, '');
            }
            div.appendChild(content);
            content.appendChild(this.renderSliderItem(i));
        }

        this.renderBtns();
        this.renderPager();

        this.displayContainer.setAttribute('tabindex', 1);
        this.displayContainer.onkeydown = this.KeyboardAction.bind(this);
        if (this.AutoStrollingInterval > 0) {
            this.StartScrolling();
        }

        this.displayContainer.addEventListener('mouseenter', this.MouseEnter.bind(this));
        this.displayContainer.addEventListener('mouseleave', this.MouseLeave.bind(this));
    }

    this.renderSliderItem = function (itemIndex) {
        var div = document.createElement("div");
        div.className = this.ClassNames.ITEM_CONTENT;
        div.appendChild(this.contentData.contentArray[itemIndex]);
        return div;
    };

    this.renderPager = function () {
        var pDiv = document.createElement("div");
        pDiv.className = this.ClassNames.PAGER;
        this.displayContainer.appendChild(pDiv);
        for (var i = 0; i < this.contentData.contentCount; i++) {
            var content = document.createElement("div");
            content.className = this.ClassNames.PAGE_POINT;
            content.setAttribute(this.AtributesNames.ITEM_NUMBER, i);
            if (i == this.ActiveItemNumber) {
                content.setAttribute(this.AtributesNames.ACTIVE, '');
            }
            pDiv.appendChild(content);
        }
        pDiv.onclick = this.ClickOnPager.bind(this);
    };

    this.renderBtns = function () {
        var div = document.createElement("div");
        div.className = this.ClassNames.BTN + ' ' + this.ClassNames.BTN_LEFT;
        this.displayContainer.appendChild(div);
        div.setAttribute(this.AtributesNames.PREV, '');
        div.onclick = this.ClickOnBtn.bind(this);

        div = document.createElement("div");
        div.className = this.ClassNames.BTN + ' ' + this.ClassNames.BTN_RIGHT;
        div.setAttribute(this.AtributesNames.NEXT, '');
        this.displayContainer.appendChild(div);
        div.onclick = this.ClickOnBtn.bind(this);
    };

    this.StartScrolling = function () {
        this.ClearScrollingData();

        if (this.AutoStrollingInterval <= 0) return;

        this.AutoStrollingTimerId = setTimeout(
            (function (obj) {
                return function run() {
                    obj.simpleScrolling();
                    obj.AutoStrollingTimerId = setTimeout(run, obj.AutoStrollingInterval);
                }
            })(this), this.AutoStrollingInterval);
    }

    this.simpleScrolling = function () {
        this.ChangeActive(this.ComputeNextStep(true, false));

    }

    this.ClearScrollingData = function () {
        if (this.AutoStrollingTimerId != '') {
            clearTimeout(this.AutoStrollingTimerId);
            this.AutoStrollingTimerId = '';
        }
    }

}
CurrentSlider.prototype.MouseEnter = function (event) {
    this.ClearScrollingData()
}

CurrentSlider.prototype.MouseLeave = function (event) {
    this.StartScrolling();
}

CurrentSlider.prototype.KeyboardAction = function (event) {
    var number = 0;
    if (event.keyCode == 39 || event.keyCode == 110) {
        number = this.ComputeNextStep(true, false);
    }

    if (event.keyCode == 37 || event.keyCode == 112) {
        number = this.ComputeNextStep(false, true);
    }

    if (number < 0)
        return;

    this.ChangeActive(number);
}

CurrentSlider.prototype.ClickOnBtn = function (event) {
    if (event.target.className.indexOf(this.ClassNames.BTN) < 0) return;
    var next = event.target.getAttribute(this.AtributesNames.NEXT) != undefined;
    var prev = event.target.getAttribute(this.AtributesNames.PREV) != undefined;

    this.ChangeActive(this.ComputeNextStep(next, prev));
}

CurrentSlider.prototype.ComputeNextStep = function (next, prev) {
    var number = 0;
    if (prev) {
        number = this.ActiveItemNumber - 1;
    }
    if (next) {
        number = this.ActiveItemNumber + 1;
    }
    if (number == this.contentData.contentCount)
        number = 0;
    if (number < 0) {
        number = this.contentData.contentCount - 1;
    }
    return number;
}

CurrentSlider.prototype.ClickOnPager = function (event) {
    if (event.target.className != this.ClassNames.PAGE_POINT) return;
    var number = event.target.getAttribute(this.AtributesNames.ITEM_NUMBER);
    this.ChangeActive(number);
}

CurrentSlider.prototype.ChangeActive = function (newNumber) {
    if (newNumber == this.ActiveItemNumber) return;
    var pages = this.displayContainer.getElementsByClassName(this.ClassNames.PAGE_POINT);
    var items = this.displayContainer.getElementsByClassName(this.ClassNames.ITEM_CONTAINER);
    for (var i = 0; i < this.contentData.contentCount; i++) {
        if (i == this.ActiveItemNumber) {
            pages[i].removeAttribute(this.AtributesNames.ACTIVE);
            items[i].removeAttribute(this.AtributesNames.ACTIVE);
            items[i].setAttribute(this.AtributesNames.HIDDEN, '');
        }
        if (i == newNumber) {
            pages[i].setAttribute(this.AtributesNames.ACTIVE, '');
            items[i].removeAttribute(this.AtributesNames.HIDDEN);
            items[i].setAttribute(this.AtributesNames.ACTIVE, '');
        }
    }
    this.ActiveItemNumber = +newNumber;
}

CurrentSlider.prototype.StartAutoScrolling = function (interval) {
    if (interval > 0) {
        this.AutoStrollingInterval = interval;
        this.StartScrolling();
    }
    else {
        this.ClearScrollingData();
        this.AutoStrollingInterval = 0;
    }
}






