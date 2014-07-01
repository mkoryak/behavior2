/**
 * behavior2
 * Copyright (c) 2012-2014 Misha Koryak - https://github.com/mkoryak/behavior2
 * Licensed under MIT
 * Date: 7/01/14
 *
 * Dependancies:
 * jquery 1.8.0 + [required]
 * underscore.js 1.3.0 + [required]
 *
 *
 * Tested on FF13+, Chrome 21+, IE9, IE8, IE7
 *
 * @author Misha Koryak
 * @version 1.2.1
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
          subclasses[name] = ret;
          $ctx.data(dataName, ret);

          runOnce($ctx, ret, $doc, behaviorGlobals); //if they overwrite ret instead of setting properties on it, it will be sad!
          ret.initialize && ret.initialize();

          _.each(events, function(selectors, event){
            _.each(selectors, function(func, selector){
              if(ret[func]){
                var gloabalEvent = false;
                if(event.match(/^!(.+)/)){ //bind globally (not within ctx) - useful for popups. to be used sparingly
                    event = RegExp.$1;
                    gloabalEvent = true;
                }
                $doc.on(event, selector, function(e){ //we do not need to special case 'focus' and 'blur' jquery does this for delegated events already.
                  var $target = $(e.currentTarget);
                  if(gloabalEvent || $target.is($ctx) || $target.closest($ctx).length){
                    ret[func].apply($target, $.makeArray(arguments));
                  }
                });
              } else {
                throw "Behavior2: "+ name+": Did not find an event function ["+func+"] used by '"+selector+"' on ["+event+"]. You must create that fn on the object which is the 2nd argument to the init. DO NOT overwrite that object with your own or you will bust the pointers!"
              }
            });
          });
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
