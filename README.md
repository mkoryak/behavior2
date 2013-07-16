Behavior2
=========

A very small lib to organize page behavior code into modular, easy to read code.
Each behavior is bound to an DOM element via a selector. 
All the event binding happens in the context of that DOM element which eliminates dependancies and makes you write very modular drop-in ready code.


How is Behavior2 different than backbone models or X?
=====================================================

I wrote this lib because of one major gripe with popular event binding libs:  
They all use prototypical inheritence and make you add the event handler functions (and other functions) to the prototype of some object.
This means that in order for you to call one function from another you have to keep track of the correct ```this```.
This also leads to excessive ```$.proxy()``` use and hacks like ```var that = this;```. Shared variables are also harder to use,
because they all live on *this*. For example: ```this.foo = 'bar'```.  

I wanted to have an implementation where I wouldnt have to worry about this (no pun intended). Behavior2 solves this problem
by giving you a single ```function($ctx, that)``` in which you must add event handlers to a special ```that`` object.   
You work inside of a closure. You no longer need to refernece ```this```, only ```that``` which never changes.


An example
----------

Behavior that creates a simple "show more text" widget. The html might look like this:
```html
<span class="more-expand">
   <span class='pruned'>Lorem ipsum dolor sit amet <a class="more">(show more)</a></span>
   <span class='all hide'>
      , consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      <a class="less">(show less)</a>
   </span>
</span>
```
Javascript:  
```js      
  Behavior2.Class("MoreText", "span.more-expand", { 
      click: { //event mapping
          'a.more':'more', //selector: function name
          'a.less':'less'
      }
      //$ctx is a single 'span.more-expand' span.
      //that is a special object to which you bind event functions defined above
      //this function is executed once per every 'span.more-expand' span
  }, function ($ctx, that) {
  
      //these variables are 'global' to all your event handler functions 
      //they are also private
      var $pruned = $ctx.find("span.pruned");
      var $all = $ctx.find("span.all");
  
      that.more = function (e) { //event handler for click on 'a.more'
          e.preventDefault();
          $pruned.hide();
          $all.show();
      };
      that.less = function(e){ //event handler for click on 'a.less'
          e.preventDefault();
          $pruned.show();
          $all.hide();
      };
  });
```    
The above code will bind events to the DOM within the context of `span.more-expand`. 

More realistic example
----------------------

I use behavior2 in a sample TodoMVC app. 2 behaviors drive the entire app. Its written in coffeescript but there is a compiled version commited alongside:  
[todoMVC example](https://github.com/OpenMile/nunjucks-shared-templates/blob/master/public/js/todos.coffee)

Documentation
-------------

Behavior2 high level overview:  
`Behavior2.Class()` - creates and registers a new behavior  
`Behavior2.contentChaged()` - triggers all behaviors to check for new elements to bind to. Typically used after ajaxing in new content
    
