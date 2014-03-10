My Scripts
==========

Please feel free to use any of these scripts for your own personal use
(reference, etc..).   
 Also please excuse any grammatical mistakes:)

If you find any bugs/suggestions/comments please feel free to email me
through my website ([http://mikewgd.com][]). Always looking for newer
and better ways to do code.

  [http://mikewgd.com]: http://mikewgd.com

Accordion
---------

There are two types of accordions: **multi-toggle** (toggle more than
one at a time) and **single-toggle** (toggle only one at a time).

### HTML Structure

    <ul class="accordion">    <li>        <a class="acc" href="javascript:void(0);">link</a>        <div class="content">            <!-- Place your content here -->        </div>    </li></ul>

### Notes, Tips and Etc…

You may also choose to have an item open when you arrive to the page.
Add “open” to the li class name. Just a note: Only one should be opened
for the single-toggler.

When using a multi-toggle accordion add `data-acc="multiple"` to the ul
element.

You can also access any item in an accordion by giving the ul a unique
id. To link to the 2nd item in the accordion your url would be:
http://yourwebsite.com/accordion.html\#acc-{ID}-{1}

  
### Activating the script

Include the accordion JavaScript file and all you need to do is call
**ML.AccordionHandler();**. Doing this just loops through any accordion
on the page and performs the necessary functions.

You can initialize it manually by doing:

    var accordion = new ML.Accordion(ML.$('accEle'), false);accordion.init();

The second parameter **must** be include either true or false
(multi-toggle). It can **NOT** be left blank.

* * * * *

Carousel
--------

### HTML Structure

The order of the HTML does not matter for this script. As long as they
are children of the `<div class="carousel" />`. I would keep the slides
in the unordered list structure.

    <div class="carousel">    <a href="javascript:void(0);" class="pag prev" rel="prv">&larr;</a>    <a href="javascript:void(0);" class="pag next" rel="nxt">&rarr;</a>    <div class="viewer">        <ul>            <li><!-- Slide Content --></li>        </ul>    </div></div>

### Notes, Tips and Etc…

If you want jump links (i.e. the dots) just include
`<div class="jump"></div>` as a child element.

There are 2 settings you can apply to the carousel: auto-rotate and
current slide. All you need to do is add
`data-carousel="curr:2:rotate:true"` to the `<div class="carousel" />`
(I.e Current slide will start on slide 3 and it will auto-rotate)

You may also choose to have a function(s) fire once the animation is
complete and you can do this by applying a callback to the
initialization of the carousel. Please look for details regarding this
under the section **Activating the script** for the carousel.

  
### Activating the script

Include the carousel JavaScript file and all you need to do is call
**ML.CarouselHandler();**. Doing this just loops through any carousel on
the page and performs the necessary functions.

You can initialize it manually by doing:

    var carouselArgs = {curr: 1, rotate: true},    carousel = new ML.Carousel(ML.$('carEle'), carouselArgs, function(i, el){alert('happens after each slide');});carousel.init();

Setting the current slide and auto-rotate are optional. Current slide
defaults to 0 and rotate is set to false unless stated.

The callback function passes in the current slide and the carousel
element which you can access in your callback function.

* * * * *

Form Elements
-------------

### HTML Structure

There is no special HTML structure for doing custom radio buttons,
checkboxes and select menus. Just code the elements how you would
normally, like so:

    <input type="radio" id="radio" name="radio" value="radio" /><label for="radio">Radio</label><input type="checkbox" name="checkbox" id="checkbox" value="checkbox" /><label for="checkbox">Checkbox</label><label for="select">Select</label><select id="select" name="select">    <option value="Select Option 1">Option 1</option>    <option value="Select Option 2">Option 2</option>    <option value="Select Option 3">Option 3</option></select>

  
### Activating the script

Include the radiocheck.js or select.js file to the bottom of the page to
use these custom form element.

* * * * *

Input Control
-------------

### HTML Structure

There is no special HTML structure. Just code the input how you would
normally:

    <input type="text" id="input" name="input" placeholder="input placeholder" />

  
### Activating the script

Include the input.js to the bottom of the page to use all the benefits
of the input on browsers that dont support certain states (:focus in
css, placeholder attribute, etc..).

* * * * *

Overlays (Tooltips)
-------------------

There are two types of tooltips: **static** (HTML coded on page) and
**dynamic** (created and inserted into DOM).

### HTML Structure

    <!-- Element that activates Tooltip (static) --><a href="javascript:void(0);" data-tooltip rel="unique-id">tooltip link</a><!-- Element that activates Tooltip (dynamic) --><a href="javascript:void(0);" data-tooltip rel="unique-id-1" title="Tooltip content goes here.">tooltip link</a><!-- Tooltip Structure --><div class="tooltip hidden" id="unique-id">    <span class="arrow"></span>    <div class="content">        <!-- Tooltip content -->    </div></div>

### Notes, Tips and Etc…

There are 2 settings you can apply to the tooltip: width and direction.
All you need to do is edit the `data-tooltip` attribute. For example:
`data-tooltip="direction:top:width:500"`

Make sure the rel attribute is something unique, it should follow the
same criteria when giving an element an id.

When creating a **dynamic** tooltip please be aware that the content
will be placed into 1 paragraph element.

  
### Activating the script

Include the tooltip JavaScript file and all you need to do is call
**ML.TooltipHandler();**. Doing this just loops through any element on
the page with `data-tooltip` on the page and performs the necessary
functions.

You can also call a tooltip manually:

    var tooltipArgs = {width:200, direction: 'left'},    tooltip = new ML.Tooltip(ML.$('tooltipEle'), tooltipArgs);tooltip.show(true);

Setting the width and direction are optional. Width is defaulted to 100
and direction is set defaulted to appear on the right side of the link.

* * * * *

Overlays (Modals)
-----------------

There are two types of modals: **static** (HTML coded on page) and
**dynamic** (created and inserted into DOM in an IFRAME or ajaxed in).

### HTML Structure

    <!-- Element that activates Modal (static) --><a href="javascript:void(0);" rel="unique-id">modal link</a><!-- Element that activates Modal (dynamic - iframe) --><a href="http://www.amodesigns.net" rel="iframe">modal link</a><!-- Element that activates Tooltip (dynamic - ajaxed in) --><a href="files/ajax-overlay.html" rel="ajax">modal link</a><!-- Modal Structure --><div class="modal hidden" id="unique-id">    <div class="header">        <!-- Place heading here <h1>, <h2>, <h3>, etc... (optional) -->        <a href="javascript:void(0);" class="close">X</a>    </div>    <div class="content">        <!-- Place modal content here -->    </div></div>

### Notes, Tips and Etc…

There are 2 settings you can apply to the modal: width and height. All
you need to do is edit the `data-modal` attribute. For example:
`data-modal="width:600:height:150"`

When creating a **dynamic** modal where the content is in an IFRAME,
make sure to put the URL you want to put in the iframe is the `href`
attribute of the link. See the second example in the HTML above.

When creating a **dynamic** modal and the content is ajaxed, make sure
to put the location of the file you want ajaxed in in the `href` of the
link. Seed the third example in the HTML above.

For the **dynamic** modals there is one more setting you can apply and
that is adding a custom header, i.e. `data-modal="header:Google.com"`

  
### Activating the script

Include the modal JavaScript file and all you need to do is call
**ML.ModalHandler();**. Doing this just loops through any element on the
page with `data-modal` on the page and performs the necessary functions.

You can also call a modal manually:

    var modalArgs = {width:200, height: 400},    modal = new ML.Tooltip(ML.$('modalEle'), modalArgs);modal.show(true);

Setting the width, height and header are optional. Width is defaulted to
600, height is defaulted to auto and header is defaulted to Modal
Header.

* * * * *

Toggler
-------

There are two types of toggles: **regular** (typical hide and show) and
**slide** (toggles content by sliding it up and/or down).

### HTML Structure

    <!-- Toggle Link --><a href="javscript:void(0);" class="toggleContent">toggle link</a><!-- Toggle Content --><div id="toggleContent">    <!-- Content goes here --></div>

### Notes, Tips and Etc…

There is no strict HTML for this, but the content that is being toggled
needs to have a unique id.

The link that activates the toggle must equal the id of the element that
holds the content. For example
`<a href="javascript:void(0);" data-toggle="toggleContent">toggle link</a>`
or it can be some sort of other attribute.

The link that activates the toggle and content are the same between the
two different types of toggles.

For the **slide** toggle you can have a callback function which gets
fired after the animation is complete.

  
### Activating the script

Include the toggle JavaScript file.

Then apply an event handler to the toggle link like below:

    var toggleLink = ML.$('toggleLink');/* Regular Toggle */ML.El.evt(toggleLink, 'click', function (e) {    var content = ML.El.clicked(e).className    ML.Toggle(ML.$(content));});ML.El.evt(toggleLink, 'click', function (e) {    var content = ML.El.clicked(e).className    ML.slideToggle(ML.$(content), function(shown) {alert('Im being shown? '+shown)});}); 

The callback function passes in whether the content being toggled is
shown or hidden (true/false). This callback function is completely
optional.