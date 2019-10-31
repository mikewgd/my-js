---
layout: project
title: Placeholder Polyfill
docs: ''
scriptFile: ''
description: A polyfill for input placeholder attribute.
notes: >-
  * No JS needed! [Browser support](https://caniuse.com/#search=placeholder)

  * Focus state can be styled via `:focus`

  * Placeholder text can be styled `:placeholder`, browser support varies
  though.
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

