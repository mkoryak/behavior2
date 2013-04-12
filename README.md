Behavior2
=========

A very small lib to organize page behavior code into modular, easy to read code.
Each behavior is bound to an DOM element via a selector. 
All the event binding happens in the context of that DOM element which eliminates dependancies and makes you write very modular drop-in ready code.

An example
----------

Behavior that creates a simple "show more text" widget. The html might look like this:

    <span class="more-expand">
       <span class='pruned'>Lorem ipsum dolor sit amet <a class="more">(show more)</a></span>
       <span class='all hide'>
          , consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          <a class="less">(show less)</a>
       </span>
    </span>

Javascript:  

      Behavior2.Class("MoreText", "span.more-expand", { 
          click: {
              'a.more':'more',
              'a.less':'less'
          }
      }, function ($ctx, that) {
          var $pruned = $ctx.find("span.pruned");
          var $all = $ctx.find("span.all");
      
          that.more = function (e) {
              e.preventDefault();
              $pruned.hide();
              $all.show();
          };
          that.less = function(e){
              e.preventDefault();
              $pruned.show();
              $all.hide();
          };
      });
    
The above code will bind events to the DOM within the context of `span.more-expand`. 

Documentation
-------------

Behavior2 high level overview:  
`Behavior2.Class()` - creates and registers a new behavior  
`Behavior2.contentChaged()` - triggers all behaviors to check for new elements to bind to. Typically used after ajaxing in new content
    
