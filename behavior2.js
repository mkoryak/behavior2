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
 *
 * Use this shim in the <head> if you plan to create behaviors before this script is included on the page:

 Behavior2={_opts:{},_cls:[],contentChanged:function(){},get:function(){}};
 Behavior2.options=function(name, obj){Behavior2._opts[name]=obj};
 Behavior2.Class=function(){Behavior2._cls.push(arguments)};

 *
 * @author Misha Koryak
 * @version 1.3.0
 */
var Behavior2 = (function(){
  var that = {};
  var children = {};

  var subclasses = {};
  var subclassOptions = {};
  var $doc = $(document);


  if(window.Behavior2){
    subclassOptions = window.Behavior2._opts;
    _.each(window.Behavior2._cls, function(args) {
      create.apply(null, _.toArray(args));
    });
  }

  var mergeOptions = function(that, options){
    var opts = that.options || {};
    if (_.isObject(opts)) {
      that.options = _.extend(opts, options);
    }
  };

  //name=string, required ex: 'awesomeness'
  //context=selector, required ex: 'div.awesome'
  //events=map, optional ex: {click: {'span.cool': 'clickHandler'}}
  //runOnce=fn, required ex: function($ctx, that)
  function create(name, context, events, runOnce){
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
          if(subclassOptions[name]){
            mergeOptions(ret, subclassOptions[name]);
          }

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
          ret.initialize && ret.initialize();
        }
      });
    };
  }
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

  //set options that will become available inside of the behavior as `that.options`, or if such object exists, extended
  var options = function(behaviorName, object) {
    if (object){
      subclassOptions[behaviorName] = object;
      if(subclasses[behaviorName]) {
        mergeOptions(subclasses[behaviorName], object)
      }
    } else {
      return subclasses[behaviorName].options;
    }
  };

  that.Class = create;
  that.contentChanged = contentChanged;
  that.get = get;
  that.options = options; //to use options provided by this method, you must use them within that.initialize()
  $(contentChanged);
  return that;
}());