---
layout: project
title: Placeholder Polyfill
docs: ML.InputControl.html
scriptFile: input.js
description: A polyfill for input placeholder attribute.
notes: >-
  * You can style when the input is focused by styling `.focus` placed on the
  input.

  * You can style placeholder, by styling `.js-input-placeholder` added to the
  input.

  * When form is submitted logic will need to be put in place so placeholder
  value does not get passed when placeholder not supported.
examples: |-
  <form id="random" method="" action="">
      <label for="first-name">First Name:</label><br />
      <input type="text" id="first-name" name="first-name" />

  <div class="fixer" style="height:10px;"></div>

  <label for="last-name">Last Name:</label><br />
  <input type="text" id="last-name" name="last-name" placeholder="Smith" /> 

  <button type="submit">send</button>           

    </form>
---

