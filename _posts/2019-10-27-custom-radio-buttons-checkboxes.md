---
layout: project
title: Custom Radio Buttons & Checkboxes
docs: ML.CustomRadios.html
scriptFile: radiocheck.js
description: Custom radio buttons and checkboxes.
notes: >-
  * You can style when the input is focused by styling `.focus `placed on the
  input.

  * `.checked` class name is added to custom input.</li>
examples: >-
  <form id="random" method="" action="">
      <strong>Radios with same "name" attribute</strong><br />

  <input type="radio" id="male" name="sex" value="male" />

  <label for="male">male</label>

  <div style="height:5px;clear:both;"></div>

  <input type="radio" id="female" name="sex" value="female" />

  <label for="female">female</label>

  <div style="height:5px;clear:both;"></div>

  <input type="radio" id="none" name="sex" value="none" />

  <label for="none">none</label>

  <div style="height:5px;clear:both;"></div>


  <div style="height:10px;clear:both;"></div>


  <strong>Radios with different "name" attributes</strong><br />


  <input type="radio" id="hello" name="hello" value="hello" />

  <label for="hello">hello</label>

  <div style="height:5px;clear:both;"></div>

  <input type="radio" id="green" name="green" value="green" />

  <label for="green">green</label>

  <div style="height:5px;clear:both;"></div>


  <div style="height:10px;clear:both;"></div>


  <input type="checkbox" name="age" id="ages10-20" value="ages10-20" />

  <label for="ages10-20">Age(s) 10 - 20</label>

  <div style="height:2px;clear:both;"></div>

  <input type="checkbox" name="age" id="ages20-30" value="ages20-30" />

  <label for="ages20-30">Age(s) 20 - 30</label>

  <div style="height:2px;clear:both;"></div>

  <input type="checkbox" name="age" id="ages30-40" value="ages30-40" />

  <label for="ages30-40">Age(s) 30 - 40</label>

  <div style="height:2px;clear:both;"></div>

  <input type="checkbox" name="age" id="ages50up" value="ages50up" />

  <label for="ages50up">Age(s) 50+</label>

  <div style="height:2px;clear:both;"></div>


  <div style="height:10px;clear:both;"></div>


  <input type="checkbox" name="age" id="dis1" disabled="disabled" value="dis1"
  />

  <label for="dis1">Disabled</label>

  <div style="height:2px;clear:both;"></div>

  <input type="radio" name="age" id="dis2" disabled="disabled" value="dis2" />

  <label for="dis2">Disabled</label>

  <div style="height:2px;clear:both;"></div>

  <input type="radio" class="system" name="unstyled" id="unstyled"
  value="unstyled" />

  <label for="unstyled">Unstyled</label>    



  <div style="height:10px;clear:both;"></div>

  <button type="submit">submit</button>

    </form>
---

