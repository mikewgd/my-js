/**
* @class AccordionHandler
* @namespace ML
* Handles calling the Accordion class.
*/
ML.AccordionHandler = function() {
    var acc = ML.$C('.accordion');

    for (var i = 0; i < acc.length; i++) {
        var tog = (ML.El.data(acc[i], 'acc') == 'multiple') ? true : false;
        var a = new ML.Accordion(acc[i], tog);
        a.setup();
    }
};

/**
* @class Accordion
* @namespace ML
*
* @property {HTMLElement} el - accordion element.
* @property {Boolean} multiple - toggling multiple at a time (true=yes, false=no).
*/
ML.Accordion = function(acc, toggle) {
    return {
        el: acc,
        multiple: toggle,

        /**
        * @function setup
        * Setup for the Accordion class, performs necessary functions.
        */
        setup: function() {
            this.hideLis();
            this.bindEvents();

            if (this.el.id && window.location.hash) {
                this.windowSet();
            }
        },

        /**
        * @function hideLis
        * Adds class of "hide" to <li> elements.
        * If an <li> has a class of "open", it stays open. This is if you want open by default.
        *
        * @param {HTMLElement} - specifically for toggling one at a time.
        */
        hideLis: function(el) {
            var li = ML._$('li', this.el);

            ML.loop(li, function(item, i) {
                if (el) {
                    if (el == item) {
                        ML.toggleClass(el, 'hide');
                    } else {
                        ML.addClass(item, 'hide');
                    }
                } else {
                    ML.addClass(item, 'hide');

                    if (ML.hasClass(item, 'open')) {
                        ML.removeClass(item, 'hide');
                        ML.removeClass(item, 'open');
                    }
                }
            });
        },

        /**
        * @function bindEvents
        * Binds events to necessary elements.
        */
        bindEvents: function() {
            var self = this;

            ML.loop(ML._$('a', this.el), function(item, i) {
                if (ML.hasClass(item, 'acc')) {

                    ML.El.evt(item, 'click', function(e) {
                        self.expandCollapse(ML.El.clicked(e).parentNode);
                    });
                }
            });
        },

        /**
        * @function windowSet
        * Sets the current active tab based on hash.
        * URL Format: #acc-{ID of ACCORDION ELEMENT}-{TAB INDEX}
        */
        windowSet: function() {
            var param = window.location.hash.split('-'),
                acc = param[1],
                tab = parseInt(param[2]),
                activeTab = ML._$('li', ML.$(acc));

            this.expandCollapse(activeTab[tab]);
        },

        /**
        * @function expandCollapse
        * Shows/Hides the accordion content based on the link you have clicked.
        *
        * @param {HTMLElement} li - parent element to the accordion toggle, i.e. <li>
        */
        expandCollapse: function(li) {
            if (this.multiple) {
                ML.toggleClass(li, 'hide');
            } else {
                this.hideLis(li);
            }
        }
    }
};