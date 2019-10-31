---
layout: project
title: Breakpoints
docs: ML.Breakpoints.html
scriptFile: breakpoints.js
description: >-
  A custom resize event based on "breakpoints" or media queries in the CSS on
  the page.
notes: |-
  * Only `min-width` media queries supported.
  * Pixel values supported for `min-width` media queries.
  * Name of the media query is called `bp-{width}`.
  * Custom event gets fired on load.
examples: <div class="current-bp"></div>
script: |-
  <script>
      var currentBp = ML.El.$q('.current-bp');
      ML.El.evt(window, 'switch', function(e) {
        currentBp.innerHTML = JSON.stringify(e.detail);
      });
    </script>
---

