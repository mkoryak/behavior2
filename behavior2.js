/**
 * behavior2
 * Copyright (c) 2012 Misha Koryak - https://github.com/mkoryak/behavior2
 * Licensed under Creative Commons Attribution-NonCommercial 3.0 Unported - http://creativecommons.org/licenses/by-sa/3.0/
 * Date: 10/03/13
 *
 * Dependancies:
 * jquery 1.8.0 + [required]
 * underscore.js 1.3.0 + [required]
 *
 * http://notetodogself.blogspot.com
 *
 * Tested on FF13+, Chrome 21+, IE9, IE8, IE7
 *
 * @author Misha Koryak
 * @version 0.6.0
 */
var Behavior2 = (function(){
  var that = {};
  var children = {};

  var subclasses = {};
  var $doc = $(document);

  //name=string, required ex: 'awesomeness'
  //context=selector, required ex: 'div.awesome'
  //events=map, optional ex: {click: {'span.cool': 'clickHandler'}}
  //runOnce=fn, required ex: function($ctx, that)
  var create = function(name, context, events, runOnce){
    var dataName = "Behavior2_"+name;
    if(arguments.length == 3 && _.isFunction(events)){
      runOnce = events;
      events = {};
    }
    if(children[name]){
      throw "Can not create duplicate behavior2 names: "+ name;
    }
    var behaviorGlobals = {}; //shared data between behavior instances [not used - maybe should remove?]
    children[name] = function(){
      var $contexts = $(context);
      $contexts.each(function(){
        var $ctx = $(this);
        if(!$ctx.data(dataName)){
          var ret = {};
          try {
            runOnce($ctx, ret, $doc, behaviorGlobals); //if they overwrite ret instead of setting properties on it, it will be sad!
            ret.initialize && ret.initialize();
          } catch(e){
            window.console && window.console.error && window.console.error("Behavior2: ["+name+"] threw an exception during init: "+ e.name+": "+ e.message);
          }
          _.each(events, function(selectors, event){
            _.each(selectors, function(func, selector){
              if(ret[func]){
                $doc.on(event, selector, function(e){ //we do not need to special case 'focus' and 'blur' jquery does this for delegated events already.
                  var $target = $(e.currentTarget);
                  if($target.is($ctx) || $target.closest($ctx).length){
                    ret[func].apply($target, $.makeArray(arguments));
                  }
                });
              } else {
                throw "Behavior2: "+ name+": Did not find an event function ["+func+"] used by '"+selector+"' on ["+event+"]. You must create that fn on the object which is the 2nd argument to the init. DO NOT overwrite that object with your own or you will bust the pointers!"
              }
            });
          });
          subclasses[name] = ret;
          $ctx.data(dataName, subclasses[name]);
        }
      });
    };
  };
  var contentChanged = function(){
    _.each(children, function(func, name){
      func();
    });
  };


  var get = function(behaviorName, $context){
    if($context){
      return $context.data("Behavior2_"+behaviorName);
    } else {
      return subclasses[behaviorName];
    }
  };

  that.Class = create;
  that.contentChanged = contentChanged;
  that.get = get;
  $(contentChanged);
  return that;
}());
