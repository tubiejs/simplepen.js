; (function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['simplePen'], function (simplePen) {
      // Also create a global in case some scripts
      // that are loaded still are looking for
      // a global even when an AMD loader is in use.
      return (root.simplePen = factory(simplePen));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require('simplePen'));
  } else {
    // Browser globals (root is window)
    root.simplePen = factory(root.simplePen);
  }
}(this, function (simplePen) {

  var root = this || global;
  var previousSimplePen = root.simplePen;

  /**
   *
   * @param options
   * @constructor
   */
  var simplePen = function (options) {
    this.name = "simplePen";
    this.version = "${version}";
    this.currentPos = { x: 0, y: 0 };
    this.isWriting = false;
    this.path = [];// a set of points which make a line
    this.canvas = {};
    this.context = {};
    this.default = {
      lineWidth: 1,
      strokeStyle: 'black',
      canvas: ""
    };
    this.options = this.extend(this.default, options);
    this.init();
    this.bind();
  }

  simplePen.prototype = {
    /**
     * initialization
     * @private
     */
    init: function () {
      this.canvas = document.querySelector(this.options.canvas);
      this.context = this.canvas.getContext("2d");
      this.context.strokeStyle = this.options.strokeStyle;
      this.context.lineWidth = this.options.lineWidth;
    },
    getName: function () {
      return this.name;
    },
    getVersion: function () {
      return this.version;
    },
    /**
     * clone objs
     * @param target 
     * @param source 
     */
    extend: function (target, source) {
      for (var p in source) {
        if (source.hasOwnProperty(p)) {
          target[p] = source[p];
        }
      }
      return target;
    },
    /**
     * paint in canvas
     * @private
     */
    paint: function () {
      var posArr = this.path,
        context = this.context;
      context.beginPath();
      context.moveTo(posArr[0].x, posArr[0].y);
      if (posArr.length == 1)
        context.lineTo(posArr[0].x + 1, posArr[0].y + 1);
      else {
        var i = 1;
        for (i in posArr) {
          context.lineTo(posArr[i].x, posArr[i].y);
          context.moveTo(posArr[i].x, posArr[i].y);
        }

      }
      context.closePath();
      context.stroke();
    },
    /**
    * bind events'listeners
    * @private
    */
    bind: function () {
      var This = this;
      // touch start
      var offset = getDomOffset(This.canvas)
      This.canvas.addEventListener('touchstart', function (event) {
        This.isWriting = true;
        This.currentPos = { x: event.changedTouches[0].pageX - offset.left, y: event.changedTouches[0].pageY - offset.top };
        This.path.push(This.currentPos);
        This.paint();
      }, false);
      // touch move
      This.canvas.addEventListener('touchmove', function (event) {
        event.preventDefault();
        if (This.isWriting) {
          This.currentPos = { x: event.changedTouches[0].pageX - offset.left, y: event.changedTouches[0].pageY - offset.top };
          This.path.push(This.currentPos);
          This.paint();
        }
      }, false);
      // touch end
      This.canvas.addEventListener('touchend', function (event) {
        This.isWriting = false;
        This.path = [];
      }, false);
      // mouse down
      This.canvas.onmousedown = function (event) {
        This.isWriting = true;
        This.currentPos = { x: event.pageX - offset.left, y: event.pageY - offset.top };
        This.path.push(This.currentPos);
        This.paint();
      }

      // mouse up
      This.canvas.onmouseup = function (event) {
        This.isWriting = false;
        This.path = [];
      }


      // mouse move
      This.canvas.onmousemove = function (event) {
        event.preventDefault();
        if (This.isWriting) {
          This.currentPos = { x: event.pageX - offset.left, y: event.pageY - offset.top };
          This.path.push(This.currentPos);
          This.paint();
        }
      }
    },
    /**
    * change namespace of library to prevent name collisions
    * @private
    */
    setNamespace: function () {
      root.simplePen = previousSimplePen;
      return this;
    }

  };

  /**
   * 获取 Dom 元素相对于 html / body 的 offSet
   *
   * @param {HTMLDivElement} el
   * @return {Object} offset { left, top }
   */
  function getDomOffset (el) {
    return getOffset(el)
    function getOffset (e) {
      var offset = {
        top: e.offsetTop,
        left: e.offsetLeft
      }
      if (e.offsetParent) {
        var pOffset = getOffset(e.offsetParent)
        offset.top += pOffset.top
        offset.left += pOffset.left
      }
      return offset
    }
  }

  return simplePen;
}))
