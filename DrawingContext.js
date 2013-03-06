/*jshint  laxcomma:true */
/* global CanvasRenderingContext2D, Integer, console */
"use strict";

// Last updated November 2011
// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Simple class for keeping track of the current transformation matrix

// For instance:
//    var t = new Transform();
//    t.rotate(5);
//    var m = t.m;
//    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

// Is equivalent to:
//    ctx.rotate(5);

// But now you can retrieve it :)

// Remember that this does not account for any CSS transforms applied to the canvas

function Transform(a,b,c,d,e,f) {
    this.m = [a,b,c,d,e,f];
}

Transform.prototype.reset = function() {
    this.m = [1,0,0,1,0,0];
};

Transform.prototype.toString = function(){
    return "["+this.m[0]+","+this.m[1]+","+this.m[2]+","+this.m[3]+","+this.m[4]+","+this.m[5]+"]";
};

Transform.prototype.getScale = function(){
   return [  parseFloat(Math.sqrt(Math.pow(this.m[0],2) + Math.pow(this.m[1],2)).toFixed(4))
           ,parseFloat(Math.sqrt(Math.pow(this.m[2],2) + Math.pow(this.m[3],2)).toFixed(4))];
};

Transform.prototype.getRotation = function(){
    return parseFloat(Math.atan2(this.m[2], this.m[3]).toFixed(4));
};

Transform.prototype.getOrigin = function(){
    return [parseFloat(this.m[4].toFixed(4)), parseFloat(this.m[5].toFixed(4))];
};

Transform.prototype.multiply = function(matrix) {
    var m11 = this.m[0] * matrix[0] + this.m[2] * matrix[1];
    var m12 = this.m[1] * matrix[0] + this.m[3] * matrix[1];
    
    var m21 = this.m[0] * matrix[2] + this.m[2] * matrix[3];
    var m22 = this.m[1] * matrix[2] + this.m[3] * matrix[3];
    
    var dx = this.m[0] * matrix[4] + this.m[2] * matrix[5] + this.m[4];
    var dy = this.m[1] * matrix[4] + this.m[3] * matrix[5] + this.m[5];
    
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    this.m[4] = dx;
    this.m[5] = dy;
};
Transform.prototype.rotate = function(rad) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    var m11 = this.m[0] * c + this.m[2] * s;
    var m12 = this.m[1] * c + this.m[3] * s;
    var m21 = this.m[0] * -s + this.m[2] * c;
    var m22 = this.m[1] * -s + this.m[3] * c;
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
};

Transform.prototype.translate = function(x, y) {
    this.m[4] += this.m[0] * x + this.m[2] * y;
    this.m[5] += this.m[1] * x + this.m[3] * y;
};

Transform.prototype.scale = function(sx, sy) {
    this.m[0] *= sx;
    this.m[1] *= sx;
    this.m[2] *= sy;
    this.m[3] *= sy;
};

Transform.prototype.transformPoint = function(px, py) {
    var x = px;
    var y = py;
    px = x * this.m[0] + y * this.m[2] + this.m[4];
    py = x * this.m[1] + y * this.m[3] + this.m[5];
    return [px, py];
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              EXTENSIONS THAT THE OBJECTS *SHOULD* HAVE HAD ANYWAY
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// allow Strings to un-ligature themselves
String.prototype.removeLigatures = function(){
  var result = "";
  for(var i=0; i<this.length; i++){
    if(this.charCodeAt(i) === 64260)    {    result+="ffl"; } // ﬄ
    else if(this.charCodeAt(i) === 64259){    result+="ffi"; } // ﬃ
    else if(this.charCodeAt(i) === 64258){    result+="fl";  } // ﬂ
    else if(this.charCodeAt(i) === 64257){    result+="fi";  } // ﬁ
    else if(this.charCodeAt(i) === 64256){    result+="ff";  } // ﬀ
    else if(this.charCodeAt(i) === 307)  {    result+="ij";  } // ĳ
    else if(this.charCodeAt(i) === 230)  {    result+="ae";  } // æ
    else if(this.charCodeAt(i) === 198)  {    result+="AE";  } // Æ
    else if(this.charCodeAt(i) === 339)  {    result+="oe";  } // œ
    else if(this.charCodeAt(i) === 338)  {    result+="OE";  } // Œ
    else if(this.charCodeAt(i) === 7531) {    result+="ue";  } // ᵫ
    else if(this.charCodeAt(i) === 64262){    result+="st";  } // ﬆ
    else { result+=this.charAt(i); }
  }
  return result;
};

Array.prototype.append = Array.prototype.concat;
Array.prototype.last = function(){
  return this[this.length-1];
};

// hasAlpha : void -> Boolean
// if any pixel's alpha is less than 255, there IS an alpha channel used
CanvasRenderingContext2D.prototype.hasAlpha = function(){
  var imgd = this.getImageData(0,0,this.canvas.width, this.canvas.height);
  var pixels = imgd.data;
  for (var i = 0; i<pixels.length; i+=4) {
    if(pixels[i+3]<255){ return true; }
  }
  return false;
};


// isColor : void -> Boolean
// if every pixel's R==G==B, it's NOT a color image
CanvasRenderingContext2D.prototype.isColor = function(){
  var imgd = this.getImageData(0,0,this.canvas.width, this.canvas.height);
  var pixels = imgd.data;
  for (var i = 0; i<pixels.length; i += 4) {
    if(!(pixels[i]===pixels[i+1] && pixels[i+1]===pixels[i+2])){ return true; }
  }
  return false;
};

// isMonochrome : void -> Boolean
// if every pixel is anything besides 0 or 1, it's NOT a monochrome image
CanvasRenderingContext2D.prototype.isMonochrome = function(){
  var imgd = this.getImageData(0,0,this.canvas.width, this.canvas.height);
  var pixels = imgd.data;
  for (var i = 0; i<pixels.length; i++) {
    if(!(pixels[i]===0 || pixels[i]===255)){ return false; }
  }
  return true;
};


// use the DOM and CSS to get accurate and complete font metrics
// based off of the amazing work at http://mudcu.be/journal/2011/01/html5-typographic-metrics/#baselineCanvas
// PENDING CANVAS V5 API: http://www.whatwg.org/specs/web-apps/current-work/#textmetrics
CanvasRenderingContext2D.prototype._measureText = CanvasRenderingContext2D.prototype.measureText;
CanvasRenderingContext2D.prototype.measureText = function(str){
  var metrics = this._measureText(str);
	// setting up html used for measuring text-metrics
	var container = document.createElement("div");
  container.style.cssText = "position: absolute; top: 0px; left: 0px;  zIndex=-1";
	var parent = document.createElement("span");
  parent.style.font = this.font;                // use the same font settings as the context
	var image = document.createElement("img");    // hack to get at CSS baselines properties
	image.width = 42; image.height = 1;           // we use a dataURL to reduce dependency on external image files
	image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWM4MbPgPwAGzwLR05RbqwAAAABJRU5ErkJggg==";
	parent.appendChild(document.createTextNode(str));
	parent.appendChild(image);
	container.appendChild(parent);
  document.body.appendChild(container);
  
	// getting css equivalent of ctx.measureText() <-- overrides default width
	image.style.display = "none";
	parent.style.display = "inline";
  metrics.width = parent.offsetWidth;
  metrics.height = parent.offsetHeight;
  
	// making sure super-wide text stays in-bounds
	image.style.display = "inline";
	var forceWidth = metrics.width + image.offsetWidth;
  
	// capturing the "top" and "bottom" baseline
	parent.style.cssText += "margin: 50px 0; display: block; width: " + forceWidth + "px";
  metrics.topBaseline = image.offsetTop - 49;
  metrics.bottomBaseline = metrics.topBaseline - parent.offsetHeight;
  
	// capturing the "middle" baseline
	parent.style.cssText += "line-height: 0; display: inline; width: " + forceWidth + "px";
  metrics.middleBaseline = image.offsetTop + 1;
  
  // derive other measurement from what we've got
  metrics.alphaBaseline = 0;
  metrics.descender = metrics.alphaBaseline - metrics.bottomBaseline;
  metrics.topPadding = metrics.height - metrics.topBaseline;
  
  document.body.removeChild(container);       // clean up after ourselves
  metrics.str = str;                          // debugging: let's keep the original string
  metrics.font = this.font.cssString;         // and font information lying around
  return metrics;
};

// Transformation pipeline - initial values
CanvasRenderingContext2D.prototype.m            = new Transform(1,0,0,1,0,0);
CanvasRenderingContext2D.prototype.scaleValues  = [1.0, 1.0];
CanvasRenderingContext2D.prototype.rotation     = 0;
CanvasRenderingContext2D.prototype.origin       = [0, 0];

// Store original methods that we'll need to override
CanvasRenderingContext2D.prototype._rotate = CanvasRenderingContext2D.prototype.rotate;
CanvasRenderingContext2D.prototype._scale = CanvasRenderingContext2D.prototype.scale;
CanvasRenderingContext2D.prototype._transform = CanvasRenderingContext2D.prototype.transform;

// udpatePipeline : void -> void
// apply the stored transform matrix, translation and rotation values to the native transform matrix
CanvasRenderingContext2D.prototype.updatePipeline = function(){
  // set the tranformation matrix
  this.setTransform(this.m.m[0],this.m.m[1],this.m.m[2],this.m.m[3],this.m.m[4],this.m.m[5]);
  this.translate(this.origin[0], this.origin[1]);         // then translate
  this._scale(this.scaleValues[0], this.scaleValues[1]);   // then scale
  this._rotate(this.rotation);                             // and finally rotate
};

// transform : Real Real Real Real Real -> void
// Adds a transformation by m to the drawing context’s current transformation.
CanvasRenderingContext2D.prototype.transform = function(m){
  this.m.multiply(m);
  this.updatePipeline();
};

// rotate : Angle -> void
// Adds a rotation of angle radians to the drawing context’s current transformation.
// DOES NOT change the separate rotation
CanvasRenderingContext2D.prototype.rotate = function(radians){
  this.m.rotate(radians);
  this.updatePipeline();
};

// scale : xScale yScale -> void
// Adds a scaling of x-scale in the X-direction and y-scale in the Y-direction to the drawing context’s current transformation.
// DOES NOT change the separate scale values
CanvasRenderingContext2D.prototype.scale = function(xScale, yScale){
  this.m.scale(xScale, yScale);
  this.updatePipeline();
};

// getTransformation : -> (Vector (Vector Real Real Real Real Real Real) Real Real Real Real Real)
CanvasRenderingContext2D.prototype.getTransformation = function(){
  var scale   = this.getScale();
  var origin  = this.getOrigin();
  var rotation= this.getRotation();
  return [this.m, origin[0], origin[1], scale[0], scale[1], rotation];
};

// setTransformation : T Real Real Real Real Real)-> void
// changes all transformation values
CanvasRenderingContext2D.prototype.setTransformation = function(m, xOrigin, yOrigin, xScale, yScale, rotation){
  this.m = new Transform(m[0],m[1],m[2],m[3],m[4],m[5]);
  this.origin = [xOrigin, yOrigin];
  this.scaleValues = [xScale, yScale];
  this.rotation = rotation;
  this.updatePipeline();
};

// getRotation : void -> Real
CanvasRenderingContext2D.prototype.getRotation = function(){
  return this.rotation;
};

// setRotation : Angle -> void
// changes the rotation, but NOT the transformation matrix
CanvasRenderingContext2D.prototype.setRotation = function(radians){
  this.rotation = -radians;
  this.updatePipeline();
};

// getScale : void -> Real Real
CanvasRenderingContext2D.prototype.getScale = function(){
  return this.scaleValues;
};

// setScale : xScale yScale -> void
// changes the scale values, but NOT the transformation matrix
CanvasRenderingContext2D.prototype.setScale = function(xScale, yScale){
  this.scaleValues = [xScale, yScale];
  this.updatePipeline();
};

// getInitialMatrix : void -> (Vector xx xy yx yy xO yO)
CanvasRenderingContext2D.prototype.getInitialMatrix = function(){
  return this.m;
};

// setInitialMatrix : (Vector real real real real real real) -> void
CanvasRenderingContext2D.prototype.setInitialMatrix = function(m){
  this.m = new Transform(m[0],m[1],m[2],m[3],m[4],m[5]);
  this.updatePipeline();
};

// setLineDash : [Numbers] -> void
if(!CanvasRenderingContext2D.prototype.setLineDash){
  CanvasRenderingContext2D.prototype.setLineDash = function(dashes){
    this.mozDash = this.webkitLineDash = dashes;
  };
}

// ellipse : x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise -> void
// re-map the native implementation, if it exists. Otherwise install Ben Deane's arc code
// see https://github.com/xach/vecto/blob/master/arc.lisp
// TODO: take CCW into account!!
CanvasRenderingContext2D.prototype.ellipse = CanvasRenderingContext2D.prototype.ellipse ||
function(x, y, width, height, eta1, eta2, ccw){
  console.log('fake ellipse method called with '+x+', '+y+', '+width+', '+height+', '+eta1+', '+eta2);
  var that  = this;
  
  // set ccw to false by default
  ccw = ccw || true;
  
  // since the racket drawing spec puts 0.5PI at 12 o'clock, we treat eta2 as the
  // amount to SUBTRACT from eta1, which properly translates the angle
  eta2 = 2*Math.PI-eta2;
  
  // make sure everything is within 0-2PI radians, and that eta1 is LARGER
  eta1 = eta1 % (2*Math.PI); eta2 = eta2 % (2*Math.PI);
  if(eta1 <= eta2){ eta1 += 2*Math.PI; }
  
  // If start == end, it's a no-op
  if(eta1 === eta2){ return; }
  
  // set up variables needed by the approximateArc function
  var a  = width/2, b  = height/2, cx = x+a, cy = y+b;
  
  // take note that we haven't issues a moveTo yet
  var movedTo = true;
  
  // approximate the arc, going from max->min or min-max depending on ccw
  approximateArc(cx, cy, a, b, eta1, eta2);
  
  // approximate an arc from eta1 to eta2 within an error by subdividing
  // return a list of beziers
  function approximateArc(cx, cy, a, b, eta1, eta2){
    var etamid;
    if(eta1 < eta2){ throw "approximateArc: eta2 must be bigger than eta1"; }
    else if(eta1-eta2 > Math.PI/2){
      etamid = eta1 - Math.PI/2;
      approximateArc(cx, cy, a, b, eta1, etamid);
      approximateArc(cx, cy, a, b, etamid, eta2);
      // if a single arc is NOT within acceptable error bounds (0.5),
      // cut it in half and approximate the two sub-arcs
    } else if(bezierError(a, b, eta1, eta2) >= 0.5){
      etamid = (eta1+eta2)/2;
      approximateArc(cx, cy, a, b, eta1, etamid);
      approximateArc(cx, cy, a, b, etamid, eta2);
      // otherwise, draw the darned thing!
    } else {
      var k = Math.tan((eta1-eta2)/2);
      var alpha = Math.sin(eta1-eta2) * (Math.sqrt(4 + 3*k*k) - 1) / 3;
      
      var p1x = cx  + a*Math.cos(eta1),
      p1y = cy  + b*Math.sin(eta1),
      p2x = cx  + a*Math.cos(eta2),
      p2y = cy  + b*Math.sin(eta2),
      c1x = p1x - (-a*Math.sin(eta1))*alpha,
      c1y = p1y - b*Math.cos(eta1)*alpha,
      c2x = p2x + -a*Math.sin(eta2)*alpha,
      c2y = p2y + b*Math.cos(eta2)*alpha;
      
      if(movedTo){ that.moveTo(p1x, p1y); movedTo = false;}
      that.bezierCurveTo(c1x, c1y, c2x, c2y, p2x, p2y);
    }
  }
  
  // compute the error of a cubic bezier that approximates an elliptical arc
  // with radii a, b between angles eta1 and eta2
  function bezierError(a, b, eta1, eta2){
    // coefficients for error estimation: 0 < b/a < 1/4
    var coeffs3Low = [
                      [[  3.85268,   -21.229,      -0.330434,    0.0127842  ],
                       [ -1.61486,     0.706564,    0.225945,    0.263682   ],
                       [ -0.910164,    0.388383,    0.00551445,  0.00671814 ],
                       [ -0.630184,    0.192402,    0.0098871,   0.0102527  ]]
                    , [[ -0.162211,    9.94329,     0.13723,     0.0124084  ],
                       [ -0.253135,    0.00187735,  0.0230286,   0.01264    ],
                       [ -0.0695069,  -0.0437594,   0.0120636,   0.0163087  ],
                       [ -0.0328856,  -0.00926032, -0.00173573,  0.00527385 ]]
                      ];
    
    // coefficients for error estimation: 1/4 <= b/a <= 1
    var coeffs3High = [
                       [[  0.0899116, -19.2349,     -4.11711,     0.183362   ],
                        [  0.138148,   -1.45804,     1.32044,     1.38474    ],
                        [  0.230903,   -0.450262,    0.219963,    0.414038   ],
                      [  0.0590565,  -0.101062,    0.0430592,   0.0204699  ]]
                     , [[  0.0164649,   9.89394,     0.0919496,   0.00760802 ],
                        [  0.0191603,  -0.0322058,   0.0134667,  -0.0825018  ],
                        [  0.0156192,  -0.017535,    0.00326508, -0.228157   ],
                        [ -0.0236752,   0.0405821,  -0.0173086,   0.176187   ]]
                       ];
    
    var calcCTerm = function(i, ratio, etasum, arr){
      var cTerm = 0;
      for(var j=0; j<4; j++){
        cTerm+= Math.cos(j*etasum) *
        ((Math.pow(arr[i][j][0]*ratio,2) + arr[i][j][1]*ratio) + arr[i][j][2]) / (arr[i][j][3]+ratio);
      }
      return cTerm;
    };
    
    var ratio = b/a;
    var etadiff = eta2 - eta1;
    var etasum  = eta2 + eta1;
    var coeffs = (ratio < 0.25)? coeffs3Low : coeffs3High;
    
    return (((0.001*Math.pow(ratio,2)) + (4.98*ratio) + 0.207) / (ratio + 0.0067)) *
    a * Math.pow(Math.e,(calcCTerm(0, ratio, etasum, coeffs)) +
                 (calcCTerm(1, ratio, etasum, coeffs) * etadiff));
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              COLOR AND COLORDB
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Color : [ Number Number Number ] -> Color
// Color : String -> Color
// implements color%, as defined in http://docs.racket-lang.org/draw/color_.html?q=dc
function Color(c){
  var that = this;
  var rgb = arguments;
  if(arguments.length === 1){ rgb = colorDB.findColor(c); }// get RGB array, if it's not already one
  
  that.r = rgb[0];
  that.g = rgb[1];
  that.b = rgb[2];
  that.a = (rgb[3] === undefined)? 1 : rgb[3];
  
  that.red = function(){return that.r;};
  that.green = function(){return that.g;};
  that.blue = function(){return that.b;};
  that.alpha = function(){return that.a;};
  
  function valid(v){return v>=0 && v<=255;}
  
  that.ok = function(){
    return valid(that.r) && valid(that.g) && valid(that.b) && that.alpha >=0 && that.alpha <=1;
  };
  that.set = function (r, g, b, a){
    that.r = r;
    that.g = g;
    that.b = b;
    that.a = a;
  };
  that.copyFrom = function (c){
    that.set(c.red(), c.green(). c.blue(), c.alpha());
  };
  
  that.getRGBA = function(){
    return "rgba("+that.r+", "+that.g+", "+that.b+", "+that.a+")";
  };
  
  return this;
}

// ColorDatabase : void -> this
// implements color-database%, as defined in http://docs.racket-lang.org/draw/color-database___.html
function ColorDatabase() {
  this.colors = {};
  
  // based on an awesome hack from http://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
  this.findColor = function(name){
    // create and color a textarea, and use the browser to get the RGB values of that color
    var color, probe = document.createElement("textarea");
    probe.style.display = "none";
    document.body.appendChild(probe);
    probe.style.color = name;
    if(window.getComputedStyle){
      var style = window.getComputedStyle(probe, null);
      var rgb = style.getPropertyCSSValue('color').getRGBColorValue();
      color = [parseInt(rgb.red.cssText),
               parseInt(rgb.green.cssText),
               parseInt(rgb.blue.cssText)];
    } else {
      var hex = probe.set('value', '').createTextRange().queryCommandValue("ForeColor");
      color = [Integer.valueOf( hex.substring( 1, 3 ), 16 ),
               Integer.valueOf( hex.substring( 3, 5 ), 16 ),
               Integer.valueOf( hex.substring( 5, 7 ), 16 ) ];
    }
    document.body.removeChild(probe);
    return color;
  };
  return this;
}

var colorDB = new ColorDatabase();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              DC-PATH
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// implements dc-path%, as defined by  http://docs.racket-lang.org/draw/dc-path_.html

/*
 * Each dc-path% has a single array of operations which specify an
 * open sub-path (openPath), and an array of closed sub-paths (closedPaths)
 * the object also tracks the min/max coordinates each time a path is modified, to easily retrieve bounding box info
 */
function dcPath(){
  var that = this;
  that.openPath = false;
  that.closedPaths = [];
  that.minX = null;
  that.minY = null;
  that.maxX = null;
  that.maxY = null;
  return this;
}

dcPath.prototype.toString = function(){
  var str = "";
  var printPath = function(path){
    for(var i=0; i<path.length; i++){
      str += "ctx."+path[i].f+"("+path[i].args.map(Math.round).join(",")+");\n";
    }
  };
  
  // print out all the closed sub-paths first
  for(var i=0; i<this.closedPaths.length; i++){ printPath(this.closedPaths[i]); }
  printPath(this.openPath);
  return str;
};

// append : dc-path -> dc-path
// append closed paths, and add that.open to this.openPath via a lineTo
dcPath.prototype.append = function(p){
  this.closedPaths.append(p.closedPaths);
  // if they both have open paths...
  // connect the end of this one to the start of the other via lineTo
  // then skip over the first instruction (ALWAYS a moveTo), since it becomes no-op
  if(this.openPath && p.openPath){
    this.lineTo(p.openPath[0].from);
    for(var i=1; i< p.openPath.length; i++){ this.openPath.push(p.openPath[i]); }
    // if this one has no open path, grab the other's
  } else if(!this.openPath){
    this.openPath = p.openPath;
  }
  
  // update bounding box args
  this.minX = Math.min(this.minX, p.minX);
  this.minY = Math.min(this.minY, p.minY);
  this.maxX = Math.max(this.maxX, p.maxX);
  this.maxY = Math.max(this.maxY, p.maxY);
};

// reverse : void -> void
// reverses all sub-paths
dcPath.prototype.reverse = function(){
  var oldClosed   = this.closedPaths;
  var oldOpen     = this.openPath;
  this.reset();
  var that = this;
  // reverse a single sub-path
  var reverseSubPath = function(subPath){
    for(var i=subPath.length-1; i > -1; i--){
      // close -> moveTo(from)
      if(subPath[i].f === CanvasRenderingContext2D.prototype.closePath){
        that.moveTo.apply(that, subPath[i].from);
        // curveTo -> curveTo(from[x,y], c3[x,y], c2[x,y])
      } else if(subPath[i].f === CanvasRenderingContext2D.prototype.bezierCurveTo){
        var c2 = subPath[i].args.slice(2,4);
        var c3 = subPath[i].args.slice(4);
        var args = c3.append(c2).append(subPath[i].from);
        that.curveTo.apply(that, args);
        // lineTo -> lineTo(from)
      } else if(subPath[i].f === CanvasRenderingContext2D.prototype.lineTo){
        that.lineTo.apply(that, subPath[i].from);
        // moveTo -> close()
      } else if(subPath[i].f === CanvasRenderingContext2D.prototype.moveTo){
        that.close();
      }
    }
  };
  
  // reverse every closed subPath (in reverse order)
  for(var i=oldClosed.length-1; i>-1; i--){ reverseSubPath(oldClosed[i]); }
  
  if(oldOpen){
    var start = oldOpen.last().to;
    that.moveTo(start[0], start[1]); // insert a moveTo operation to set the new start
    reverseSubPath(oldOpen.slice(1));// reverse the path, ignoring the moveTo operation at index 0
  }
};

// open : void -> Boolean
// if the openPath array is defined, and nonempty, we have an open path
dcPath.prototype.open = function(){
  return (this.openPath.length > 0);
};

// open : void -> void
// set openPath to false, closePaths to an empty array
dcPath.prototype.reset = function(){
  this.openPath = false;
  this.closedPaths = [];
  // nullify bounding box args
  this.minX = null;
  this.minY = null;
  this.maxX = null;
  this.maxY = null;
};

// get-bounding-box : void -> Real Real Real Real
// return the min and max coordinates
dcPath.prototype.getBoundingBox = function(){
  return [Math.round(this.minX), Math.round(this.minY),
          Math.round(this.maxX), Math.round(this.maxY)];
};

////////////////////////////////////// SUB-PATH PRIMITIVES /////////////////////////////////////
/*
 *  A sub-path is a defined as an array of *operations*, which are structs that include
 *          1) f:    the canvas path function
 *          2) args: an array of arguments to the function
 *          3) from: the ending x,y coordinates of the _previous_ operation
 *          4) to:   the ending x,y coordinates of the operation
 *
 *  All sub-paths are made of these operations, which also update the bounding coordinates.
 *  There are FOUR operations: close(), curveTo(), lineTo() and moveTo(). Everything else
 *  is implemented based on calls to these four.
 */

// close : void -> void
// if there's an open path, add the closePath operation and push the array into closedPaths
dcPath.prototype.close = function(){
  if(!this.openPath){ throw "exn:fail:contract -- there was no open path to close"; }
  this.openPath.push({f:      CanvasRenderingContext2D.prototype.closePath
                     ,args:   []
                     ,from:   this.openPath.last().to.slice(0) // pass by value, not ref
                     ,to:     this.openPath.last().to.slice(0)});
  this.closedPaths.push(this.openPath);
  this.openPath = false;
};

// curveTo : Real Real Real Real Real -> void
// Push the bezierCurveTo operation. ONLY valid if there's an open path.
dcPath.prototype.curveTo = function(cx1, cy1, cx2, cy2, x3, y3){
  if(!this.openPath){ throw "exn:fail:contract -- there was no open path from which to extend a curve"; }
  
  this.openPath.push({f:      CanvasRenderingContext2D.prototype.bezierCurveTo
                     ,args:   [cx1, cy1, cx2, cy2, x3, y3]
                     ,from:   this.openPath.last().to.slice(0) // pass by value, not ref
                     ,to:     [x3, y3]});
  // update bounding box args. from the spec:
  // "the bounding box encloses the two control points as well as the start and end points"
  this.minX = Math.min(this.minX, cx1, cx2, x3);
  this.minY = Math.min(this.minY, cy1, cy2, y3);
  this.maxX = Math.max(this.maxX, cx1, cx2, x3);
  this.maxY = Math.max(this.maxY, cy1, cy2, y3);
};

// ellipseTo : Real Real Real Real Real Real -> void
// Push the bezierCurveTo operation. ONLY valid if there's an open path.
dcPath.prototype.arcTo = function(x, y, width, height, eta1, eta2){
  if(!this.openPath){ throw "exn:fail:contract -- there was no open path from which to extend an arc"; }
  // set up variables needed by the approximateArc function
  var a  = width/2, b  = height/2, cx = x+a, cy = y+b,
      k = Math.tan((eta1-eta2)/2);
  var x2 = cx  + a*Math.cos(eta2),
      y2 = cy  + b*Math.sin(eta2);
  this.openPath.push({f:      CanvasRenderingContext2D.prototype.ellipse
                     ,args:   [x, y, width, height, eta1, eta2]
                     ,from:   this.openPath.last().to.slice(0) // pass by value, not ref
                     ,to:     [x2, y2]});
  // update bounding box args. from the spec:
  // "the bounding box encloses the two control points as well as the start and end points"
  this.minX = Math.min(this.minX, x, x+width);
  this.minY = Math.min(this.minY, y, y+height);
  this.maxX = Math.max(this.maxX, x, x+width);
  this.maxY = Math.max(this.maxY, y, y+height);
};

// lineTo : Real Real -> void
// Push the lineeTo operation. ONLY valid if there's an open path.
dcPath.prototype.lineTo = function(x, y){
  if(!this.openPath){ throw "exn:fail:contract -- there was no open path from which to extend a line"; }
  
  this.openPath.push({f:      CanvasRenderingContext2D.prototype.lineTo
                     ,args:   [x, y]
                     ,from:   this.openPath.last().to.slice(0) // pass by value, not ref
                     ,to:     [x, y]});
  // update bounding box args
  this.minX = Math.min(this.minX, x);
  this.minY = Math.min(this.minY, y);
  this.maxX = Math.max(this.maxX, x);
  this.maxY = Math.max(this.maxY, y);
};

// moveTo : Real Real -> void
// closes an open path (if one exists) and starts a new one by pushing a moveTo operation
dcPath.prototype.moveTo = function(x, y){
  if(this.openPath){ this.close(); }
  
  this.openPath = [];
  this.openPath.push({f:      CanvasRenderingContext2D.prototype.moveTo
                     ,args:   [x, y]
                     ,from:   [x, y]
                     ,to:     [x, y]});
  // update bounding box args
  this.minX = Math.min(this.minX, x);
  this.minY = Math.min(this.minY, y);
  this.maxX = Math.max(this.maxX, x);
  this.maxY = Math.max(this.maxY, y);
};

//////////////// Higher-level Subpath Operations /////////////////////////////

// lines : (Vector Points) Real Real -> void
// Push a series of lineTo operations. ONLY valid if there's an open path.
dcPath.prototype.lines = function(points, xOffset, yOffset){
  if(!this.openPath){ throw "exn:fail:contract -- there was no open path from which to extend lines"; }
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;
  
  for(var i=0; i<points.length; i++){
    this.lineTo(points[i].x+xOffset, points[i].y+yOffset);
  }
};

// ellipse : Real Real Real Real -> void
// closes an open path (if one exists), pushes the necessary operations for an ellipse,
// then closes the subpath
dcPath.prototype.ellipse = function(x, y, width, height){
  this.arc(x, y, width, height, 0, 2*Math.PI);
};

// arc : Real Real Real Real Real Real -> void
// closes an open path (if one exists), pushes the necessary operations for an ellipse,
// then closes the subpath
dcPath.prototype.arc = function(x, y, width, height, eta1, eta2){
  if(this.openPath){ this.close(); }
  this.moveTo(x, y);
  this.arcTo(x, y, width, height, eta1, eta2);
};

// roundedRectangle : Real Real Real Real Integer -> void
dcPath.prototype.roundedRectangle = function(x, y, width, height, radius){
  // check to make sure the radius is valid
  // if radius is negative, use the absolute value as a proportion of the shortest side
  var shortestSide = Math.min(width, height);
  if(isNaN(radius) || (radius > 0.5*shortestSide) || (radius < -0.5)){ throw "Exn:fail:contract"; }
  if(radius<0){ radius = shortestSide*Math.abs(radius); }
  
  // from http://nacho4d-nacho4d.blogspot.com/2011/05/bezier-paths-rounded-corners-rectangles.html
  var kappa = 0.5522848;
  var co = kappa * radius;                            // control offset
  
  this.moveTo(x+radius, y);
  this.lineTo(x+width-radius, y);
  this.curveTo(x+width-co, y, x+width, y+co, x+width, y+radius);
  this.lineTo(x+width, y+height-radius);
  this.curveTo(x+width, y+height-co, x+width-co, y+height, x+width-radius, y+height);
  this.lineTo(x+radius, y+height);
  this.curveTo(x+co, y+height, x, y+height-co, x, y+height-radius);
  this.lineTo(x, y+radius);
  this.curveTo(x, y+co, x+co, y, x+radius, y);
  this.close();
};

// rectangle : Real Real Real Real -> void
// implemented in terms of roundedRectangle
dcPath.prototype.rectangle = function(x, y, width, height){
  this.moveTo(x, y);
  this.lineTo(x+width, y);
  this.lineTo(x+width, y+height);
  this.lineTo(x, y+height);
  this.lineTo(x, y);
  this.close();
};
//////////////// Operations that transform the path /////////////////////////////

// mapPoints : (Real Real -> void) -> void
// _stateful_ implementation of map, which apply a function f to every
// (x,y) pair in each Operation in each subpath
dcPath.prototype.mapPoints = function(f){
  var from, to, args;
  var applyf = function(f){
    return function(op){
      if(op.f === CanvasRenderingContext2D.prototype.closePath){
        from = f(op.from);
        to = f(op.to);
      } else if(op.f === CanvasRenderingContext2D.prototype.bezierCurveTo){
        var c1 = f(op.args.slice(0,2));
        var c2 = f(op.args.slice(2,4));
        var p = f(op.args.slice(4,6));
        args = c1.append(c2).append(p);
        from = f(op.from);
        to = f(op.to);
        
      } else if(op.f === CanvasRenderingContext2D.prototype.lineTo){
        args = f(op.args);
        from = f(op.from);
        to = f(op.to);
        
      } else if(op.f === CanvasRenderingContext2D.prototype.moveTo){
        args = f(op.args);
        from = f(op.from);
        to = f(op.to);
      }
      return {f: op.f, args: args, from: from, to: to};
    };
  };
  
  // make a function that knows how to apply f to any operation
  var f_applier = applyf(f);
  // map f over each operation in each closedPath
  for(var i=0; i<this.closedPaths.length; i++) {
    this.closedPaths[i] = this.closedPaths[i].map(f_applier);
  }
  // map f over each operation in the openPath
  this.openPath = this.openPath.map(f_applier);
};

// scale : Real Real -> void
// scale all points in the path
dcPath.prototype.scale = function(xScale, yScale){
  // scalePoint: [Real Real] -> void
  var scalePoint = function(point){ return [point[0] * xScale, point[1] * yScale]; };
  this.mapPoints(scalePoint);
};

// translate : Real Real -> void
// scale all points in the path
dcPath.prototype.translate = function(x, y){
  var translatePoint = function(point){ return [point[0] + x, point[1] + y]; };
  this.mapPoints(translatePoint);
};

// rotate : Real -> void
// rotate all points in the path
dcPath.prototype.rotate = function(radians){
  var rotatePoint = function(point){
    return [ Math.floor(Math.cos(radians) * point[0])
            ,Math.floor(Math.sin(radians) * point[1])];
  };
  this.mapPoints(rotatePoint);
  
};

//////////////// Given a 2D Context, Translate to a native path ///////////////////

// makeCanvasPath : CanvasRenderingContext2D -> void
// call each operation in a subpath with it's args, in the given CanvasRenderingContext
dcPath.prototype.makeCanvasPath = function(ctx){
  var translateSubPath = function(subPath){
    for(var i=0; i < subPath.length; i++){
      subPath[i].f.apply(ctx, subPath[i].args);
    }
  };
  
  // translate all closed sub-paths, then the open path
  for(var i=0; i < this.closedPaths.length; i++){
    translateSubPath(this.closedPaths[i]);
  }
  translateSubPath(this.openPath);
  
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              REGIONS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// implements region%, as defined by http://docs.racket-lang.org/draw/region_.html


/*
 * Each region% is basically a B&W canvas, whose transformations are set
 * at initialization or use by an associated DC. Bounding boxes are
 * determined by using the dcPath& object to draw into these canvases
 * and union/intersection/xoring is done through the canvas's native
 * globalCompositeOperation
 */
function Region(dc){
  this.dc   = false;              // dc is false if one has not been initialized
  this.boundingBox = false;       // bounding box is also false if there's no path or dc
  
  // our hook into the native canvas element
  this.ctx  = document.createElement('canvas').getContext('2d');
  this.ctx.fillStyle = 'black';
  
  // if a DC is provided, copy its dimensions and start out clipping the whole rectangle
  if(dc){
    this.ctx.canvas.width = dc.getWidth();
    this.ctx.canvas.height = dc.getHeight();
    this.dc = dc;
    this.setRectangle(0,0,dc.getWidth(), dc.getHeight());
  }
  
  var that = this;
  
  // combine : Region String -> void
  // private method that actually does the composition
  // combine the two regions with the given globalCompositeOperation
  // The dc of both regions must be the same, or they must both be unassociated to any dc.
  function combine(rgn, operation){
    if(that.dc !== rgn.dc){ throw "exn:fail:contract -- both regions must have the same DC to combine, or none at all"; }
    that.ctx.globalCompositeOperation = operation;
    that.ctx.drawImage(rgn.ctx.canvas,0,0);      // let the browser do the actual gruntwork
    // combine bounding boxes
    that.boundingBox[0] = Math.min(that.boundingBox[0], rgn.boundingBox[0]);
    that.boundingBox[1] = Math.min(that.boundingBox[1], rgn.boundingBox[1]);
    that.boundingBox[2] = Math.max(that.boundingBox[2], rgn.boundingBox[2]);
    that.boundingBox[2] = Math.max(that.boundingBox[3], rgn.boundingBox[3]);
  }
  
  // intersect : Region -> void
  // Set the region to the intersection of itself and another region
  this.intersect  = function(rgn){ combine(rgn, "source-in"); };
  
  // subtract : Region -> void
  // Set the region to the subtraction of another region from itself
  this.subtract   = function(rgn){ combine(rgn, "destination-out"); };
  
  // union : Region -> void
  // Set the region to the union of another region from itself
  this.union      = function(rgn){ combine(rgn, "source-over"); };
  
  // xor : Region -> void
  // Set the region to the xor of another region from itself
  this.xor        = function(rgn){ combine(rgn, "xor"); };
  
  // getDC : void -> dc / false
  this.getDC      = function(){return this.dc; };
  return this;
}


// get-bounding-box : void -> Real Real Real Real
// if there's a dc, return the min and max coordinates
// otherwise, return the tracked box
Region.prototype.getBoundingBox = function(){
  if(this.dc){ return [0, 0, this.dc.getWidth(), this.dc.getHeight()]; }
  else{ return this.boundingBox; }
};

// in-region? : Real Real -> Boolean
Region.prototype.inRegion = function(x, y){
  // if there's a DC, transform the point first and then check the bounds
  if(this.dc){
    var m = this.dc.getInitialMatrix(),
        point = m.transformPoint(x, y);
    return (point[0]>=0 && point[0]<=this.dc.width &&
            point[1]>=0 && point[1]<=this.dc.height);
    // if not, check the bounding box first, then the individual pixel
  } else {
    var box = this.boundingBox;
    // if it's outside the box, return false
    if(!box || (x < box[0] && x > box[2] && y < box[1] && y > box[3])){ return false;}
    // otherwise, check the individual pixels of the bounding box
    var image  = this.ctx.getImageData(box[0], box[1], box[2], box[3]);
    var pixels = image.data;
    var index = y*box[2]+x; // flatten 2d index into a 1d index
    return (pixels[4*index+3] === 255); // is the pixel not alpha'd out?
  }
};

// isEmpty : void -> Boolean
// From the spec "Returns #t if the region is _approximately_ empty". If no DC is associated, throw an exception
Region.prototype.isEmpty = function(rgn){
  if(!this.dc){ throw "exn:fail:contract -- a region must have an attached DC to check if empty"; }
  else{
    var box = this.boundingBox;
    return box && (box[2] - box[0])*(box[3] - box[1]) === 0; // is the area of bounding box 0?
  }
};

// setArc : Real Real Real Real Real -> void
// Set the region to the arc specificed by x,y,w,h,eta1 and eta2. (Use a path)
Region.prototype.setArc = function(x, y, w, h, eta1, eta2){
  this.ctx.canvas.width = this.ctx.canvas.width;
  var p = new dcPath();
  p.arc(x, y, w, h, eta1, eta2);          // make the path
  p.makeCanvasPath(this.ctx);             // draw it in the current context
  this.ctx.fill();                        // fill with black
  this.boundingBox = p.getBoundingBox();  // update the new boundingBox
  
};

// setEllipse : Real Real Real Real Real -> void
// Set the region to the ellipse specificed by x,y,w,h. (Use a path)
Region.prototype.setEllipse = function(x, y, w, h){
  this.ctx.canvas.width = this.ctx.canvas.width;
  var p = new dcPath();
  p.ellipse(x, y, w, h);                  // make the path
  p.makeCanvasPath(this.ctx);             // draw it in the current context
  this.ctx.fill();                        // fill with black
  this.boundingBox = p.getBoundingBox();  // update the new boundingBox
  
};

// setPath : Path [Real Real fillStyle] -> void
// Set the region to the Path specificed, offset by x and y
Region.prototype.setPath = function(path, xOffset, yOffset, fillStyle){
  // winding => nonzero, odd-even => evenodd (currently only works on Mozilla 7+)
  fillStyle = fillStyle || "winding";
  this.ctx.fillRule       = (fillStyle === "winding")? "nonzero" : "evenodd";
  this.ctx.mozFillRule    = (fillStyle === "winding")? "nonzero" : "evenodd";
  this.ctx.webkitFillRule = (fillStyle === "winding")? "nonzero" : "evenodd";
  console.log("winding fillRule may not be available on all browsers");

  this.ctx.canvas.width = this.ctx.canvas.width;
  path.translate(xOffset, yOffset);          // translate the path using the offsets
  path.makeCanvasPath(this.ctx);             // draw it in the current context
  this.ctx.fill();                           // fill with black
  this.boundingBox = path.getBoundingBox();  // update the new boundingBox
  
};

// setPolygon : (Vector points) Real Real fillStyle -> void
// Set the region to the polygon specificed by these points, offset by x and y. (Use a path)
Region.prototype.setPolygon = function(points, xOffset, yOffset, fillStyle){
  // winding => nonzero, odd-even => evenodd (currently only works on Mozilla 7+)
  fillStyle = fillStyle || "winding";
  this.ctx.fillRule       = (fillStyle === "winding")? "nonzero" : "evenodd";
  this.ctx.mozFillRule    = (fillStyle === "winding")? "nonzero" : "evenodd";
  this.ctx.webkitFillRule = (fillStyle === "winding")? "nonzero" : "evenodd";
  
  this.ctx.canvas.width = this.ctx.canvas.width;
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;
  var p = new dcPath();
  p.moveTo(points[0].x+xOffset, points[0].x+yOffset);
  p.lines(points, xOffset, yOffset);
  // close the polygon
  p.lineTo(points[0].x+xOffset, points[0].y+yOffset);
  p.close();
  
  p.makeCanvasPath(this.ctx);             // draw it in the current context
  this.ctx.fill();                        // fill with black
  this.boundingBox = p.getBoundingBox();  // update the new boundingBox
  
};

// setRectangle : Real Real Real Real -> void
// Set the region to the rectangle specificed by x,y,w,h. (Use a path)
Region.prototype.setRectangle = function(x, y, w, h){
  this.ctx.canvas.width = this.ctx.canvas.width;
  var p = new dcPath();
  p.rectangle(x, y, w, h);                // make the path
  p.makeCanvasPath(this.ctx);             // draw it in the current context
  this.ctx.fill();                        // fill with black
  this.boundingBox = p.getBoundingBox();  // update the new boundingBox
  
};

// setRoundedRectangle : Real Real Real Real Real -> void
// Set the region to the rectangle specificed by x,y,w,h, with radius r. (Use a path)
Region.prototype.setRoundedRectangle = function(x, y, w, h, r){
  this.ctx.canvas.width = this.ctx.canvas.width;
  var p = new dcPath();
  p.roundedRectangle(x, y, w, h, r);      // make the path
  p.makeCanvasPath(this.ctx);             // draw it in the current context
  this.ctx.fill();                        // fill with black
  this.boundingBox = p.getBoundingBox();  // update the new boundingBox
  
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              BITMAPS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Bitmap : Number Number [Boolean Boolean]? -> Bitmap
// implements Bitmap%, as defined by http://docs.racket-lang.org/draw/bitmap_.html?q=dc
function Bitmap(width, height, monochrome, alpha ){
  this.width          = width;
  this.height         = height;
  this.monochrome     = monochrome || false;
  this.alpha          = alpha || false;
  this.isOk           = false;
  
  // create a canvas of the correct size, with a solid white BG
  this.canvas = document.createElement('canvas');
  this.canvas.width   = this.width;
  this.canvas.height  = this.height;
  this.ctx = this.canvas.getContext('2d');
  
  return this;
}

Bitmap.prototype.getWidth       = function(){return this.width;};
Bitmap.prototype.getHeight      = function(){return this.height;};
Bitmap.prototype.getMonochrome  = function(){return this.monochrome;};
Bitmap.prototype.getalpha       = function(){return this.alpha;};


// get-argb-pixels : x y width height pixels [just-alpha? pre-multiplied?] -> void
// getImageData() for the specified region, then reshuffle output to match interface
Bitmap.prototype.getARGBpixels = function(x, y, w, h, pixels, justAlpha, preMultiplied){
  justAlpha      = justAlpha || false;
  preMultiplied  = preMultiplied || false;
  var img = this.ctx.getImageData(x,y,w,h);
  for(var i=0; i< img.data.length; i+=4){
    pixels.push(img.data[i+3]);
    // if justAlpha, stop at the alpha pixel
    if(justAlpha){ continue; }                   // A
    // otherwise, if there *is* an alpha channel and preMultiplied is true,
    // scale all the RGB values by alpha
    else {
      var factor = (preMultiplied && this.alpha)? this.alpha : 255;
      pixels.push((img.data[i]   * factor)/255);   // R
      pixels.push((img.data[i+1] * factor)/255);   // G
      pixels.push((img.data[i+2] * factor)/255);   // B
    }
  }
};

// set-argb-pixels : x y width height pixels [just-alpha? pre-multiplied?] -> void
// reshuffle pixels to match imageData object
Bitmap.prototype.setARGBpixels = function(x, y, w, h, pixels, justAlpha, preMultiplied){
  justAlpha      = justAlpha || false;
  preMultiplied  = preMultiplied || false;
  var img = this.ctx.createImageData(w,h);
  for(var i=0; i< pixels.length; i+=4){
    // make a grayscale image that's the inverse of the alpha
    if(justAlpha && !this.alpha){
      img.data[i+3]  = 255;                  // A
      img.data[i]    = 255-pixels[i+3];      // R
      img.data[i+1]  = 255-pixels[i+3];      // G
      img.data[i+2]  = 255-pixels[i+3];      // B
    }
    // if the RGB values have been premultiplied, make sure they're not larger than the alpha
    else if(preMultiplied && !justAlpha && this.alpha){
      img.data[i+3]  = 255;                              // A
      img.data[i+1]  = Math.min(pixels[i+1],pixels[i]);  // R
      img.data[i+2]  = Math.min(pixels[i+2],pixels[i]);  // G
      img.data[i+3]  = Math.min(pixels[i+3],pixels[i]);  // B
      // just copy all four pixels, converting RGB->ARGB
    } else {
      img.data[i+3]  = pixels[i];            // A
      img.data[i]    = pixels[i+1];          // R
      img.data[i+1]  = pixels[i+2];          // G
      img.data[i+2]  = pixels[i+3];          // B
    }
    this.ctx.putImageData(img, x, y);
  }
};

// get-depth: void -> Number
// gets the depth of the bitmap, which is either 1 or 32
Bitmap.prototype.getDepth = function(){return this.isColor? 32 : 1; };

// get-loaded-mask: void -> Bitmap
// generate a bitmap from the alpha channel - differs from interface in that it's done on-demand
Bitmap.prototype.getLoadedMask = function(){
  var mask = document.createElement('canvas');
  mask.width = this.width; mask.height = this.height;
  var maskCtx = mask.getContext('2d');
  
  // generate a grayscale canvas whose values are the inverse of the bitmap's alpha
  var alphaPixels = [];
  this.getARGBpixels(0, 0, this.width, this.height, alphaPixels, true);
  var maskData = maskCtx.createImageData(this.width, this.height);
  for(var i=0; i<maskData.data.length; i+=4){
    maskData.data[i]   = 255-alphaPixels[Math.floor(i/4)];     // R
    maskData.data[i+1] = 255-alphaPixels[Math.floor(i/4)];     // G
    maskData.data[i+2] = 255-alphaPixels[Math.floor(i/4)];     // B
    maskData.data[i+3] = 255;                                  // A
  }
  maskCtx.putImageData(maskData,0,0);
  return mask;
};

// has-alpha-channel : void -> Boolean
// does the bitmap contain an alpha channel?
Bitmap.prototype.hasAlphaChannel = function(){
  return this.ctx.hasAlpha();
};

// is-color : void -> Boolean
// is the bitmap monochrome?
Bitmap.prototype.isColor = function(){
  return this.ctx.isColor();
};

// ok : void -> Boolean
// Returns #t if the bitmap is valid in the sense that an image file was loaded successfully.
Bitmap.prototype.ok = function(){return this.isOk;};

// load-file : path [kind Color Complain] -> boolean
// try loading an image into the Bitmap. If successful, set ok to true
// TODO: use bgcolor with PNGs
Bitmap.prototype.loadFile = function(url, kind, bgcolor, complain){
  complain = complain || false;
  var that = this;
  try{
    var img = new Image();
    img.src = url;
    img.onload = function(){
      // http://www.sajithmr.me/javascript-check-an-image-is-loaded-or-not
      if(img.naturalWidth === 0){ throw "image did not load"; }
      that.canvas.width = img.width;
      that.canvas.height = img.height;
      that.ctx.drawImage(img,0,0);
      that.isOk = true;
    };
  } catch (e) {
    if(complain){ throw e;}
    this.isOk = false;
  }
};

// save-file : String [String Number] -> boolean
// TODO: extend the converter to return BMP, XPM and XBM files
// there's code out there to do it, but do we really care about these types in 2013?
Bitmap.prototype.saveFile = function(name, kind, q){
  var converter       = [];
  converter.png    = function(canvas,q){ return canvas.toDataURL("image/png"); };
  converter.jpeg   = function(canvas,q){ return canvas.toDataURL("image/jpeg"); };
  converter.xbm    = function(canvas,q){ throw "save-file: XBM is not supported!"; };
  converter.xpm    = function(canvas,q){ throw "save-file: XPM is not supported!"; };
  converter.bmp    = function(canvas,q){ throw "save-file: BMP is not supported!"; };
  var uriContent = converter[kind](this.canvas, q);
  window.open(uriContent, name+"."+kind);
};


// buffer : void -> Context
// return a copy of the original context
Bitmap.prototype.buffer = function(){
  var c = document.createElement('canvas');
  c.width = this.canvas.width;
  c.height = this.canvas.height;
  var ctx = c.getContext('2d');
  ctx.drawImage(this.canvas,0,0);
  return ctx;
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              STIPPLES, PENS AND FONTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// load all the built-in stipples
var StippleDB = [];
var stipples = new Array('bdiagonal-hatch','crossdiag-hatch','fdiagonal-hatch'
                         ,'cross-hatch','horizontal-hatch','vertical-hatch');
for(var i=0; i<stipples.length; i++){
  var b = new Bitmap(16,16,false,true);
  b.loadFile('stipples/'+stipples[i]+'.gif');
  StippleDB[stipples[i]] = b;
}

// makeStipple : Bitmap% Color% -> 2dContext
// buffer the stipple image to an offscreen canvas, and return the canvas
var makeStipple = function(stipple, color){
  var stippleCtx = stipple.buffer();
  var stippleData = stippleCtx.getImageData(0,0,stipple.width, stipple.height);
  
  // replace black stipple pixels with the rgb values of the color
  // set all white pixels to maximum alpha
  for(var i=0; i<stippleData.data.length; i += 4){
    var isBlackPixel = ((stippleData.data[i]+stippleData.data[i+1]+stippleData.data[i+2]) === 0);
    if(!isBlackPixel){
      stippleData.data[i+3]  = 1;
    } else {
      stippleData.data[i]    = color.red();
      stippleData.data[i+1]  = color.green();
      stippleData.data[i+2]  = color.blue();
    }
  }
  stippleCtx.putImageData(stippleData,0,0);
  return stippleCtx.canvas;
};

// Font : Number String String [String Number Boolean Boolean Number] -> Font
// imlements Font%, as defined by http://docs.racket-lang.org/draw/font_.html?q=font&q=dc
function Font(size, family, face, style, weight, underline, smoothing, pixels){
  this.size       = size;
  this.family     = family ||  "normal";
  this.face       = face || false;
  this.style      = style || "normal";
  this.weight     = weight || "normal";
  this.underline  = underline || false;
  this.smoothing  = smoothing || "default";
  this.pixels     = pixels || false;
  var families = new Array("default","decorative","roman","script","swiss","modern","symbol","system");
  var styles = new Array("normal","slant","italic","oblique");
  var weights = new Array("normal","light","bold");
  var smoothings = new Array("default","partly-smoothed","smoothed","unsmoothed");
  if(families.indexOf(this.family)    === -1){ throw "Invalid font family: "+family;    }
  if(styles.indexOf(this.style)       === -1){ throw "Invalid font style: "+style;      }
  if(weights.indexOf(this.weight)     === -1){ throw "Invalid font weight: "+weight;    }
  if(smoothings.indexOf(this.smoothing)===-1){ throw "Invalid font smoothing: "+smoothing;}
  
  this.getSize       = function(){return this.size;};
  this.getFamily     = function(){return this.family;};
  this.getFace       = function(){return this.face;};
  this.getStyle      = function(){return this.style;};
  this.getWeight     = function(){return this.weight;};
  this.getUnderline  = function(){return this.underline;};
  this.getSmoothing  = function(){return this.smoothing;};
  this.getPixels     = function(){return this.pixels;};
  
  this.toCSSString = function (){
    var families = [], weights = [], styles = [];
    families.default     = "Arial";
    families.decorative  = "Impact";
    families.roman       = "Times New Roman";
    families.script      = "cursive";
    families.swiss       = "Verdana";
    families.modern      = "monospace";
    families.symbol      = "Symbol";
    families.system      = "";
    weights.normal       = 400;
    weights.light        = 200;
    weights.bold         = 700;
    styles.normal        = "";
    styles.italic        = "italic";
    styles.slant         = "italic";
    return styles[this.style]+" "+weights[this.weight]+" "+this.size+"px "+(this.face? face : families[this.family]);
  };
  
  // draw the char and a known-bad char on separate contexts in the desired font,
  // then compare the pixel data for both
  this.screenGlyphExists     = function(str){
    // get char code for glyph, as well as known-failing code
    var charCode    = str.charCodeAt(0);
    var failCode    = -1;
    // make two canvases, and get their contexts
    var cCheck      = document.createElement('canvas');
    var cFail       = document.createElement('canvas');
    var ctxCheck    = cCheck.getContext('2d');
    var ctxFail     = cFail.getContext('2d');
    // set both contexts to the desired font, and measure the characters
    ctxCheck.font   = this.toCSSString();
    ctxFail.font    = this.toCSSString();
    var metricsCheck= ctxCheck.measureText(String.fromCharCode(charCode));
    var metricsFail = ctxFail.measureText(String.fromCharCode(failCode));
    // draw the characters
    ctxCheck.fillText((String.fromCharCode(charCode)), 0, metricsCheck.height);
    ctxFail.fillText((String.fromCharCode(failCode)), 0, metricsFail.height);
    var checkD = ctxCheck.getImageData(0,0,cCheck.width,cCheck.height);
    var checkP = checkD.data;
    var failD = ctxFail.getImageData(0,0,cCheck.width,cCheck.height);
    var failP = failD.data;
    // if any pixel differs, return true
    for(var i=0; i<failP.length; i++){
      if(failP[i] !== checkP[i]){ return true; }
    }
    // otherwise, we know the glyph is the fail character, so return false
    return false;
  };
}

// FontList : void -> FontList
// imlements FontList%, as defined by http://docs.racket-lang.org/draw/font-list_.html?q=font&q=dc
function FontList(){
  this.fonts = [];
  
  // findOrCreateFont : color width style [cap join] -> pen
  this.findOrCreateFont = function(size, family, style, weight, underline, smoothing, pixels){
    // if a matching pen exists, return it
    for(var i=0; i<this.fonts.length; i++){
      if(this.fonts[i].size   === size &&
         this.fonts[i].family === family &&
         this.fonts[i].style   === style &&
         this.fonts[i].weight === weight &&
         (underline === undefined || this.fonts[i].underline === underline) &&
         (smoothing === undefined || this.fonts[i].smoothing === smoothing) &&
         (pixels    === undefined || this.fonts[i].pixels    === pixels)){
        return this.fonts[i];
      }
    }
    // otherwise make a new Font and add it
    var font = new Font(size, family, style, style, weight, underline, smoothing, pixels);
    this.fonts.push(font);
    return font;
  };
  
  return this;
}

// Point: Real Real -> Point
// implements Point%, as defined http://docs.racket-lang.org/draw/point_.html?q=dc
function Point(x, y){
  this.x = x;
  this.y = y;
  this.getX = function(){ return this.x;};
  this.getY = function(){ return this.y;};
  this.setX = function(x){ this.x = x;  };
  this.setY = function(y){ this.y = y;  };
}

// Pen : color width style cap join stipple -> Pen
// implements Pen%, as defined by http://docs.racket-lang.org/draw/pen_.html
function Pen(color, width, style, cap, join, stipple){
  this.color = color || "black";  // Name or RGB value
  this.width = width || 0;        // real 0-255
  this.style = style || "solid";  // transparent, solid, xor, hilite, dot, long-dash, short-dash, dot-dash...
  this.cap   = cap || "round";    // round, projecting, butt
  this.join  = join || "round";   // round, bevel, miter
  
  this.styles = new Array('transparent', 'solid', 'xor', 'hilite','dot','long-dash','short-dash','dot-dash','xor-dot','xor-long-dash','xor-short-dash','xor-dot-dash');
  
  // if the style is NOT a valid style, throw an error
  if(this.styles.indexOf(this.style) < 0) {
    throw "Not a valid pen style: "+this.style;
  }
  
  // override any built-stipple with a custom stipple
  if(stipple){ this.stipple = makeStipple(stipple, this.color); }
  
  this.getCap = function(){ return this.cap;};
  this.getColor = function(){ return this.color;};
  this.getStyle = function(){ return this.style;};
  this.getWidth = function(){ return this.width;};
  this.getJoin = function(){ return this.join;};
  this.getStipple = function(){ return this.stipple;};
  this.setCap = function(cap){ this.cap = cap;};
  this.setColor = function(color){ this.color = color;};
  this.setStyle = function(style){ this.style = style;};
  this.setWidth = function(width){ this.width = width;};
  this.setJoin = function(join){ this.join = join;};
  this.setStipple = function(stipple){ this.stipple = stipple;};
  
  return this;
}

// PenList : void -> PenList
// imlements PenList%, as defined by http://docs.racket-lang.org/draw/pen-list_.html?q=dc
function PenList(){
  this.pens = [];
  
  // findOrCreatePen : color width style [cap join] -> pen
  this.findOrCreatePen = function(color, width, style, cap, join){
    // if a matching pen exists, return it
    for(var i=0; i<this.pens.length; i++){
      if(this.pens[i].color === color &&
         this.pens[i].width === width &&
         this.pens[i].style === style &&
         (cap  === undefined || this.pens[i].cap  === cap) &&
         (join === undefined || this.pens[i].join === join)){
        return this.pens[i];
      }
    }
    // otherwise make a new pen and add it
    var pen = new Pen(color, width, style, cap, join);
    this.pens.push(pen);
    return pen;
  };
  
  return this;
}

// Brush : color stipple gradient style transformation -> Brush
// implements Brush%, as defined by http://docs.racket-lang.org/draw/brush_.html
function Brush(color, stipple, gradient, style, t){
  this.color      = color || "black";    // Name or RGB value
  this.gradient   = gradient || false;   // false, a linear gradient or a radial gradient
  this.style      = style || "solid";    // solid, or a built-in stipple
  this.transformation = t || false;      // false, or a transformation
  
  this.styles = new Array('transparent', 'solid','opaque','xor','hilite','panel');
  this.stipples = new Array('bdiagonal-hatch','crossdiag-hatch','fdiagonal-hatch'
                            ,'cross-hatch','horizontal-hatch','vertical-hatch');
  
  // if the style corresponds to a built-in stipple, install the stipple and set style to "solid"
  // if the style is NOT a valid style, throw an error
  if(StippleDB[this.style] !== undefined){
    this.stipple = makeStipple(StippleDB[this.style], this.color);
    this.style = "solid";
  } else if(this.styles.indexOf(this.style) < 0) {
    throw "Not a valid brush style: "+this.style;
  }
  // override any built-stipple with a custom stipple
  if(stipple){ this.stipple = makeStipple(stipple, this.color); }
  
  this.getColor = function(){return this.color;};
  this.getStyle = function(){return this.style;};
  this.getStipple = function(){return this.stipple;};
  this.getGradient = function(){return this.gradient;};
  this.getTransformation = function(){return this.transformation;};
  this.setColor = function(color){this.color = color;};
  this.setStyle = function(style){this.style = style;};
  this.setStipple = function(stipple){this.stipple = stipple;};
  this.setGradient = function(gradient){this.gradient = gradient;};
  this.setTransformation = function(t){this.transformation = t;};
  return this;
}

// BrushList : void -> BrushList
// imlements BrushList%, as defined by http://docs.racket-lang.org/draw/brush-list_.html?q=dc
function BrushList(){
  this.brushes = [];
  
  // findOrCreateBrush : color style -> brush / #f
  // returns a brush, or false if not a valid colorname
  this.findOrCreateBrush = function(color, style){
    // if a matching brush exists, return it
    for(var i=0; i<this.brushes.length; i++){
      if(this.brushes[i].color === color && this.brushes[i].style === style){
        return this.brushes[i];
      }
    }
    // otherwise make a new brush and add it, if it's a valid color
    var brush = new Brush(color, false, false, style);
    this.brushes.push(brush);
    return brush;
  };
  
  return this;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              GRADIENTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// LinearGradient : Real Real Real Real (Listof [0-1, color]) -> CanvasGradient
// implements LinearGradient%, as defined by http://docs.racket-lang.org/draw/linear-gradient_.html
var LinearGradient = function(x0, y0, x1, y1, stops){
  this.x0 = x0; this.y0 = y0;
  this.x1 = x1; this.y1 = y1;
  this.stops = stops;
  return this;
};
LinearGradient.prototype.getLine = function(){
  return [this.x0, this.y0, this.x1, this.y1];
};
LinearGradient.prototype.getStops = function(){
  return this.stops;
};

// RadialGradient : Real Real Real Real Real Real (Listof [0-1, color]) -> CanvasGradient
// implements RadialGradient% as defined by http://docs.racket-lang.org/draw/radial-gradient_.html
var RadialGradient = function(x0, y0, r0, x1, y1, r1, stops){
  this.x0 = x0; this.y0 = y0; this.r0 = r0;
  this.x1 = x1; this.y1 = y1; this.r1 = r1;
  this.stops = stops;
  return this;
};
RadialGradient.prototype.getCircles = function(){
  return [this.x0, this.y0, this.r0, this.x1, this.y1, this.r1];
};
RadialGradient.prototype.getStops = function(){
  return this.stops;
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              DRAWING CONTEXT
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// implements dc%, as defined by  http://docs.racket-lang.org/draw/dc___.html
function dc(width, height){
  this.canvas = document.createElement('canvas');
  width = width || 500;
  height = height || 500;
  this.canvas.width = width;
  this.canvas.height = height;
  this.ctx = this.canvas.getContext("2d");
  
  // make a buffer, which we'll draw to and let flushing handle the rest
  this.buffer         = document.createElement('canvas').getContext('2d');
  this.buffer.canvas.width  = width;
  this.buffer.canvas.height = height;
  
  // default values, fontLists, brushLists and penLists
  this.GlContext      = false;
  this.smoothing      = true;
  this.textForeground = "black";
  this.textBackground = "white";
  this.textMode       = "transparent";
  this.penList        = new PenList();
  this.brushList      = new BrushList();
  this.fontList       = new FontList();
  this.pen            = this.penList.findOrCreatePen(new Color(0,0,0), 1);
  this.brush          = this.brushList.findOrCreateBrush(new Color(0,0,0),"transparent");
  this.font           = new Font(18, "default", false, "normal", "normal");
  this.buffer.font       = this.font.cssString;
  this.buffer.background = "white";
  
  // private members
  var that = this,
  clippingRegion = false,
  flushLock      = false;
  
  // getClippingRegion : void -> Region / False
  this.getClippingRegion = function(){
    return that.clippingRegion;
  };
  
  // setClippingRegion : Region/False -> void
  this.setClippingRegion = function(rgn){
    that.clippingRegion = rgn;
  };
  
  // setClippingRect : x y width height -> void
  this.setClippingRect = function(x, y, width, height){
    var rgn = new Region(that);
    rgn.setRectangle(x, y, width, height);
    that.setClippingRegion(rgn);
  };
  
  // flush : void -> void
  // Clip whatever is on the buffer using the region, copy the result to the canvas
  // afterwards, clear the buffer for future drawing
  this.flush = function(){
    if(that.flushLock){ return; }
    if(that.clippingRegion){                                      // if we need to clip....
      that.buffer.globalCompositeOperation = 'destination-in';     // mode = "clipping"
      that.buffer.drawImage(that.clippingRegion.ctx.canvas, 0, 0);// clip the region
    }
    that.ctx.drawImage(that.buffer.canvas, 0, 0);                   // copy the buffer to the ctx
    that.buffer.clearRect(0,0, that.getWidth(), that.getHeight());  // clear the buffer
    that.buffer.globalCompositeOperation = 'source-over';            // mode = "drawing"
  };
  
  // suspend-flush : void -> void
  // if we're doing everything using offscreen buffers, this should stop drawing onscreen
  // until "resume-flush" is called
  this.suspendFlush = function(){ that.flushLock = true; };
  
  // resume-flush : void -> void
  // if we're doing everything using offscreen buffers, this should erase a suspend-flush operation
  this.resumeFlush = function(){ that.flushLock = false; };
  
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              STROKE AND FILL
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// provide custom fill implementation, using our brush
dc.prototype.fill = function(p, fillStyle){
  
  // winding => nonzero, odd-even => evenodd (use proprietary properties as well, just in case)
  this.ctx.fillRule       = (fillStyle === "winding")? "nonzero" : "evenodd";
  this.ctx.mozFillRule    = (fillStyle === "winding")? "nonzero" : "evenodd";
  this.ctx.webkitFillRule = (fillStyle === "winding")? "nonzero" : "evenodd";
  
  this.buffer.beginPath();       // empty the current list of subpaths
  p.makeCanvasPath(this.buffer); // generate native path from %path object
  
  // if a stipple is installed, ignore EVERYTHING ELSE and just use it as a pattern
  if(this.brush.stipple){
    this.buffer.fillStyle = this.buffer.createPattern(this.brush.stipple,'repeat');
  }
  // if it's a gradient Object, build the gradient in the current context and use that as our fillStyle
  else if(this.brush.gradient){
    var g = this.brush.gradient, gradient;
    if(g instanceof LinearGradient){
      gradient = this.buffer.createLinearGradient(g.x0, g.y0, g.x1, g.y1);
    } else if(g instanceof RadialGradient){
      gradient = this.buffer.createRadialGradient(g.x0, g.y0, g.r0, g.x1, g.y1, g.r1);
    }
    for(var i=0; i<g.stops.length; i++){
      gradient.addColorStop(g.stops[i][0], g.stops[i][1].getRGBA());
    }
    this.buffer.fillStyle = gradient;
  }
  // solid (and deprecated styles) use black pixels from a monochrome stipple, if there's one installed
  else if((new Array('solid', 'xor','panel').indexOf(this.brush.style)) >= 0){
    this.buffer.fillStyle = this.brush.color.getRGBA();
  }
  // opaque is the same as solid, but if there's a monochrome stipple we paint the white pixels
  else if((new Array('solid', 'xor','panel').indexOf(this.brush.style)) >= 0){
    this.buffer.fillStyle = this.brush.color.getRGBA();
  }
  // if it's hilite, use the RGBa value for the same color, but with an opacity of 0.3
  else if(this.brush.style === 'hilite'){
    var c = this.brush.color;
    this.buffer.fillStyle = "rgba("+c.red()+","+c.green()+","+c.blue()+",0.3)";
  }
  this.buffer.fill();
  this.flush();
};

// provide custom stroke implementation, using our pen
// dc mapping is almost perfect, except that projecting->square cap
// PENDING CANVAS V5 API: http://www.whatwg.org/specs/web-apps/current-work/#dom-context-2d-setlinedash
dc.prototype.stroke = function(p){
  this.buffer.beginPath();       // empty the current list of subpaths
  p.makeCanvasPath(this.buffer); // generate native path from %path object
  
  this.buffer.strokeStyle  = this.pen.color;
  this.buffer.lineCap      = (this.pen.cap === "projecting")? "square" : this.pen.cap;
  this.buffer.lineJoin     = this.pen.join;
  this.buffer.lineWidth    = this.pen.width;
  
  switch(this.pen.style){
      // transparent pens don't draw at all
    case "transparent":
      return;
    case "solid":
      this.buffer.strokeStyle = this.pen.color.getRGBA();
      break;
      // hilite pens draw with a 30% alpha
    case "hilite":
      var c = this.pen.color;
      this.buffer.strokeStyle = "rgba("+c.red()+","+c.green()+","+c.blue()+",0.3)";
      break;
    case "dot":
      this.buffer.setLineDash([1,2]);
      break;
    case "long-dash":
      this.buffer.setLineDash([4,2]);
      break;
    case "short-dash":
      this.buffer.setLineDash([2,2]);
      break;
    case "dot-dash":
      this.buffer.setLineDash([4,2,1,2]);
      break;
    default: console.log("WARNING: xor pen styles are NOT SUPPORTED");
  }
  
  // if a stipple is installed, use it as a pattern
  if(this.pen.stipple){
    this.buffer.strokeStyle = this.buffer.createPattern(this.pen.stipple,'repeat');
  }
  
  this.buffer.stroke();
  this.flush();
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              GETTERS AND SETTERS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// getWidth :  void -> Width
dc.prototype.getWidth = function(){
  return this.canvas.width;
};
// getHeight :  void -> Height
dc.prototype.getHeight = function(){
  return this.canvas.height;
};
// getDeviceScale : void -> Real Real
dc.prototype.getDeviceScale = function(){
  return [1.0, 1.0];
};
// setAlpha : alpha -> void
dc.prototype.setAlpha = function(alpha){
  if(alpha<0 || alpha>1){ throw "Invalid alpha value"; }
  this.buffer.globalAlpha = alpha;
};
// getAlpha : void -> alpha
dc.prototype.getAlpha = function(){
  return this.buffer.globalAlpha;
};
// getBackround : void -> Color
dc.prototype.getBackground = function(){
  return this.buffer.background;
};
// getBrush : void -> Brush
dc.prototype.getBrush = function(){
  return this.brush;
};
// getPen : void -> Pen
dc.prototype.getPen = function(){
  return this.pen;
};
// getSmoothing : void -> Smoothing
dc.prototype.getSmoothing = function(){
  return this.smoothing;
};
// setBackground : Color -> void
dc.prototype.setBackground = function(color){
  this.buffer.background = color;
};
// setBrush : Brush -> void
dc.prototype.setBrush = function(brush){
  this.brush = brush;
};
// setPen : Pen -> void
dc.prototype.setPen = function(pen){
  this.pen = pen;
};


// getGlContext : void -> GlContext / false
// if someone feels like implementing the sgl interface, this would be the way to go...
// see http://docs.racket-lang.org/sgl/main.html
dc.prototype.getGlContext = function(){ return false; };

// setSmoothing : Mode -> void
dc.prototype.setSmoothing = function(mode){
  if(!(mode === "unsmoothed" || mode === "smoothed" || mode === "aligned")){
    throw "INVALID MODE PASSED TO setSmoothing: "+mode;
  }
  // currently, all we can do is turn smoothing on and off for canvas elements
  this.ctx.imageSmoothingEnabled       = (mode === "smoothed");
  this.ctx.mozImageSmoothingEnabled    = (mode === "smoothed");
  this.ctx.webkitImageSmoothingEnabled = (mode === "smoothed");
  console.log("Image Smoothing settings may not be supported on all browsers");
  this.smoothing = mode;
};

// cacheFontMetricsKey : void -> exact-integer
dc.prototype.cacheFontMetricsKey = function(){
  return 0;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              DRAWING PRIMITIVES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// clear : void -> void
// Clears the drawing region (fills it with the current background color, as determined by get-background).
dc.prototype.clear = function(){
  this.buffer.save();
  this.buffer.fillStyle = this.getBackground();
  this.buffer.fillRect(0, 0, this.getWidth(), this.getHeight());
  this.buffer.restore();
};

// erase : void -> void
// Clears the drawing region (see clear). For transparent canvases, sets globalAlpha to 1.0
dc.prototype.erase = function(){
  this.clear();
  if(this.globalAlpha > 0){ this.ctx.globalAlpha = 1.0; }
};

// copy : x y width height x2 y2 -> void
// Copies the rectangle defined by x, y, width, and height to x2, y2
// The result is UNDEFINED if the source and destination rectangles overlap.
dc.prototype.copy = function(x, y, width, height, x2, y2){
  if((x2 <= x+width)  && (x2 >= x) && // if there's a horizontal overlap
    (y2 <= y+height) && (y2 >= y)) {  // AND vertical overlap, then we need to return UNDEFINED
    throw "UNDEFINED";
  }
  else{ this.buffer.drawImage(this.canvas, x, y, width, height, x2, y2, width, height); }
};

// drawBitmapSection : source destX destY srcX srcY srcWidth srcHeight [style color mask] -> void
dc.prototype.drawBitmapSection = function(srcBitmap, destX, destY, srcX, srcY,
                                          srcWidth, srcHeight, style, color, maskBitmap){
  // replace the source's alpha channel with mask's inverse R channel (since R=B=G)
  var monochromeMask = function(sPixels,mPixels){
    for(var i=0; i<mPixels.length; i += 4){ sPixels[i+3] = 255-mPixels[i]; }
  };
  // replace the source's alpha channel with the mask's
  var alphaMask = function(sPixels,mPixels){
    for(var i=0; i<mPixels.length; i += 4){ sPixels[i+3] = mPixels[i+3]; }
  };
  // replace the source's alpha channel with the average value of mask's R, G and B channels
  var colorMask = function(sPixels,mPixels){
    for(var i=0; i<mPixels.length; i += 4){ sPixels[i+3] = 255-((mPixels[i]+mPixels[i+1]+mPixels[i+2])/3); }
  };
  
  // copy the source to an offscreen buffer, and extract it's pixels
  var src = srcBitmap.buffer();
  var srcData = src.getImageData(0,0,srcBitmap.width, srcBitmap.height);
  
  // Monochrome Images: transparent styles abort, everything else recolors
  if(src.isMonochrome() && color !== undefined){
    if(style === 'transparent'){ return; }
    // replace source pixel's rgb values should be the rgb values of the color
    for(var i=0; i<srcData.data.length; i += 4){
      var isBlackPixel = ((srcData.data[i]+srcData.data[i+1]+srcData.data[i+2]) === 0);
      // Skip black pixels if style is opaque. Otherwise skip white pixels.
      if((style==='opaque' && isBlackPixel) || (style!=='opaque' && !isBlackPixel)){ continue; }
      srcData.data[i]    = color.red();
      srcData.data[i+1]  = color.green();
      srcData.data[i+2]  = color.blue();
    }
  }
  
  // MASKING, grab the mask's pixel values and perform the operation
  if(maskBitmap!==undefined){
    if(maskBitmap.width !== srcBitmap.width || maskBitmap.height !== srcBitmap.height){
      throw "A mask must be the same size as the source image. src=" +
      src.getWidth()+"x"+src.getHeight()+", mask="+src.getWidth()+"x"+src.getHeight();
    }
    var maskCtx = maskBitmap.ctx;
    var mask_pixels = maskCtx.getImageData(0,0,maskBitmap.width, maskBitmap.height).data;
    
    if(maskCtx.isMonochrome())   { monochromeMask(srcData.data, mask_pixels); }
    else if(maskCtx.hasAlpha())  { alphaMask(srcData.data, mask_pixels); }
    else if(maskCtx.isColor())   { colorMask(srcData.data, mask_pixels); }
  }
  // reset and replace the source data with the new pixels, now properly masked
  src.canvas.width = srcWidth; src.canvas.height = srcHeight;
  src.putImageData(srcData,0,0);
  
  // use drawImage to preserve transparency, since putImageData doesn't
  this.buffer.drawImage(src.canvas,destX,destY);
  this.flush();
};

// drawBitmap : source destX destY [style color mask] -> void
// just draw a section that happens to be the width and height of the entire sourse
dc.prototype.drawBitmap = function(src, destX, destY, style, color, mask){
  this.drawBitmapSection(src, destX, destY,
                         0, 0,
                         src.width,
                         src.height,
                         style, color, mask);
};

// drawArc : x y width height startRadians endRadians -> void
// draw a CCW arc of an ellipse, inscribed in a WxH rectangle
dc.prototype.drawArc = function(x, y, width, height, startRadians, endRadians){
  var p = new dcPath();
  p.arc(x, y, width, height, startRadians, endRadians);
  // if the brush is not transparent, add a line to the center and then fill
  if(this.brush.style !== "transparent"){
    p.lineTo(x+width/2, y+height/2);
    this.fill(p);
  }
  this.stroke(p);
};

// drawEllipse : x y width height -> void
// draw an elliptical arc which happens to go the entire 2pi radians
dc.prototype.drawEllipse = function(x, y, width, height){
  var p = new dcPath();
  p.arc(x, y, width, height, 0, 2*Math.PI);
  this.fill(p);
  this.stroke(p);
};

// drawLine : x1 y1 x2 y2 -> void
dc.prototype.drawLine = function(x1, y1, x2, y2){
  var p = new dcPath();
  p.moveTo(x1, y1);
  p.lineTo(x2, y2);
  this.stroke(p);
};

// drawLines : points [xOffset yOffset] -> void
dc.prototype.drawLines = function(points, xOffset, yOffset){
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;
  var p = new dcPath();
  p.moveTo(points[0].x+xOffset, points[0].y+yOffset);
  p.lines(points, xOffset, yOffset);
  this.stroke(p);
};

// drawPath : path [xOffset yOffset fillStyle] -> void
dc.prototype.drawPath = function(path, xOffset, yOffset, fillStyle){
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;
  path.translate(xOffset, yOffset);
  this.fill(path, fillStyle);
};

// drawPoint : x y -> void
// draw an infinitely short line
dc.prototype.drawPoint = function(x, y){
  var p = new dcPath();
  p.rectangle(x, y, 1, 1);
  this.stroke(p);
};

// drawPolygon : points [xOffset yOffset fillStyle] -> void
dc.prototype.drawPolygon = function(points, xOffset, yOffset, fillStyle){
  xOffset = xOffset || 0;
  yOffset = yOffset || 0;
  var p = new dcPath();
  p.moveTo(points[0].x+xOffset, points[0].x+yOffset);
  p.lines(points, xOffset, yOffset);
  // close the polygon
  p.lineTo(points[0].x+xOffset, points[0].y+yOffset);
  p.close();
  this.fill(p, fillStyle);
  this.stroke(p);
};

// drawRectangle : x y width height -> void
dc.prototype.drawRectangle = function(x, y, width, height){
  var p = new dcPath();
  p.rectangle(x,y,width,height);
  this.fill(p);
  this.stroke(p);
};

// drawRoundedRectangle : x y width height [radius] -> void
dc.prototype.drawRoundedRectangle = function(x, y, width, height, radius){
  var p = new dcPath();
  p.roundedRectangle(x,y,width,height,radius);
  this.fill(p);
  this.stroke(p);
};

// drawSpline : x1 y1 x2 y2 x3 y3 -> void
// draw a quadratic bezier curve from (x1,y1) to (x3,y3), using (x2,y2) as a control point
// see http://chickenmeister.posterous.com/convert-quadratic-to-cubic-bezier-curves
dc.prototype.drawSpline = function(x1, y1, x2, y2, x3, y3){
  var p = new dcPath();
  p.moveTo(x1, y1);
  var c1x = 0.33*x1+0.66*x2, c1y = 0.33*y1+0.66*y2;
  var c2x = 0.66*x2+0.33*x3, c2y = 0.66*y2+0.33*y3;
  p.curveTo(c1x, c1y, c2x, c2y, x3, y3);
  this.stroke(p);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                              TEXT PRIMITIVES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// drawText : text x y [combine offset angle] -> void
// if textMode is 'solid', fill a rectangle with text-background color
// TODO: implement subpixel antialiasing http://www.bel.fi/~alankila/lcd/
dc.prototype.drawText = function(str, x, y, combine, offset, angle){
  this.buffer.save();
  angle   = angle || 0;       // angle is zero unless specified otherwise
  offset  = offset || 0;
  combine = combine || false;
  if(parseInt(offset)!==offset || offset<0){ throw "Offset must be an exact, non-negative integer"; }
  str = str.slice(offset);
  str = combine? str : str.removeLigatures(); // if combine is off, remove all ligatures
  
  // assign as the canvas font, and measure the text
  this.buffer.font = this.font.toCSSString();
  var metrics = this.buffer.measureText(str);
  
  // if textMode is solid and there's no rotation, fill a rectangle with the text-background-color
  this.buffer.fillStyle = this.getTextBackground();
  if(this.buffer.textMode === 'solid' && angle === 0){
    this.buffer.fillRect(x, y, metrics.width, metrics.height);
  }
  // if there's an angle, rotate the canvas
  if(angle!==0){ this.buffer._rotate(angle);}
  
  // fillText uses the bottom-right corner to start, so we need to offset by the height
  this.buffer.fillStyle = this.getTextForeground();
  this.buffer.fillText(str, x, y+metrics.height);
  
  // underline by drawing alone the baseline in the same color
  if(this.font.underline){
    this.buffer.beginPath();
    this.buffer.moveTo(x,y+metrics.topBaseline+metrics.topPadding+2);
    this.buffer.lineTo(x+metrics.width, y+metrics.topBaseline+metrics.topPadding+2);
    this.buffer.closePath();
    this.buffer.strokeStyle = this.getTextForeground();
    this.buffer.lineWidth = 1;
    this.buffer.stroke();
  }
  this.buffer.restore();
  this.flush();
};

// getCharHeight : void -> Real
dc.prototype.getCharHeight = function(){
  var charSize = this.buffer.measureText("M");
  return charSize.height;
};

// getCharWidth : void -> Real
dc.prototype.getCharWidth = function(){
  var charSize = this.buffer.measureText("M");
  return charSize.width;
};

// getTextBackground : void -> Color / false
dc.prototype.getTextBackground = function(){
  return this.textBackground;
};

// getTextForeground : void -> Color
dc.prototype.getTextForeground = function(){
  return this.textForeground;
};

// getTextExtent : string [font% combine offset] -> real real real real
dc.prototype.getTextExtent = function(str, font, combine, offset){
  this.buffer.save();
  if(font){ this.buffer.font = font.toCSSString(); }
  str = combine? str : str.removeLigatures();
  var metrics = this.buffer.measureText(str.slice(offset));
  this.buffer.restore();
  return [metrics.width, metrics.height, metrics.descender, metrics.topPadding];
};

// getTextMode : void -> Mode
dc.prototype.getTextMode = function(){
  return this.textMode;
};

// getFont : void -> Font
dc.prototype.getFont = function(){
  return this.font;
};

// glyphExists : Char -> Boolean
dc.prototype.glyphExists = function(c){
  return this.font.screenGlyphExists(c);
};

// setFont : Font -> void
// set the *real* font property to the cssString of the Font object
dc.prototype.setFont = function(font){
  this.font = font;
};

// setTextBackground : Color -> void
dc.prototype.setTextBackground = function(color){
  this.textBackground = color;
};

// setTextForeground : Color -> void
dc.prototype.setTextForeground = function(color){
  this.textForeground = color;
};

// setTextMode : Mode -> void
dc.prototype.setTextMode = function(mode){
  if(!(mode === "solid" || mode === "transparent")){
    throw "INVALID MODE PASSED TO setTextMode: "+mode;
  }
  this.textMode = mode;
};

// tryColor : tryColor resultColor -> void
dc.prototype.tryColor = function(tryColor, resultColor){
  return "try-color: NOT IMPLEMENTED";
};

// transform : Real Real Real Real Real -> void
// Adds a transformation by m to the drawing context’s current transformation.
dc.prototype.transform = function(m){ this.buffer.transform(m); };

// rotate : Angle -> void
// Adds a rotation of angle radians to the drawing context’s current transformation.
// DOES NOT change the separate rotation
dc.prototype.rotate = function(radians){ this.buffer.rotate(radians); };

// scale : xScale yScale -> void
// Adds a scaling of x-scale in the X-direction and y-scale in the Y-direction to the drawing context’s current transformation.
// DOES NOT change the separate scale values
dc.prototype.scale = function(xScale, yScale){ this.buffer.scale(xScale, yScale); };

// getTransformation : -> (Vector (Vector Real Real Real Real Real Real) Real Real Real Real Real)
dc.prototype.getTransformation = function(){ return this.buffer.getTransformation(); };

// setTransformation : T Real Real Real Real Real)-> void
// changes all transformation values
dc.prototype.setTransformation = function(m, xOrigin, yOrigin, xScale, yScale, rotation){
  this.buffer.setTransformation(m, xOrigin, yOrigin, xScale, yScale, rotation);
};

// getRotation : void -> Real
dc.prototype.getRotation = function(){ return this.buffer.rotation; };

// setRotation : Angle -> void
// changes the rotation, but NOT the transformation matrix
dc.prototype.setRotation = function(radians){ this.buffer.setRotation(radians); };

// getScale : void -> Real Real
dc.prototype.getScale = function(){ return this.buffer.getScale(); };

// setScale : xScale yScale -> void
// changes the scale values, but NOT the transformation matrix
dc.prototype.setScale = function(xScale, yScale){ this.buffer.setScale(xScale, yScale); };

// getInitialMatrix : void -> (Vector xx xy yx yy xO yO)
dc.prototype.getInitialMatrix = function(){ return this.buffer.getInitialMatrix(); };

// setInitialMatrix : (Vector real real real real real real) -> void
dc.prototype.setInitialMatrix = function(m){  this.buffer.setInitialMatrix(m); };

// getOrigin : void -> Real Real
dc.prototype.getOrigin = function(){ return this.buffer.getOrigin(); };

// setOrigin : x y -> void
dc.prototype.setOrigin = function(x, y){ this.buffer.setOrigin(x,y); };

// getSize : void -> Real Real
// return the width and height of the context
dc.prototype.getSize = function(){  return this.buffer.getSize(); };


// implements bitmap_dc%, as defined by  http://docs.racket-lang.org/draw/bitmap-dc___.html
// inherit directly from dc%, then manually inherit each of the methods of bitmap%
bitmap_dc.prototype = new dc();
bitmap_dc.constructor=bitmap_dc;
function bitmap_dc(url){
  if(url){ this.loadFile(url,null,null,true); }
}
bitmap_dc.prototype.getARGBpixels = Bitmap.prototype.getARGBpixels;
bitmap_dc.prototype.setARGBpixels = Bitmap.prototype.setARGBpixels;
bitmap_dc.prototype.getDepth = Bitmap.prototype.getDepth;
bitmap_dc.prototype.hasAlphaChannel = Bitmap.prototype.hasAlphaChannel;
bitmap_dc.prototype.isColor = Bitmap.prototype.isColor;
bitmap_dc.prototype.ok = Bitmap.prototype.ok;
bitmap_dc.prototype.loadFile = Bitmap.prototype.loadFile;
bitmap_dc.prototype.saveFile = Bitmap.prototype.saveFile;
bitmap_dc.prototype.getPixel = function(x, y, color){
  var data = this.buffer.getImageData(x, y, 1, 1).data;
  color.r = data[0];
  color.g = data[1];
  color.b = data[2];
  color.a = data[3];
};
bitmap_dc.prototype.getBitmap = function(){
  var b = new Bitmap(this.getWidth(), this.getHeight(), this.monochrome, this.alpha);
  b.ctx.drawImage(this.canvas,0,0);
  return b;
};
bitmap_dc.prototype.setBitmap = function(bitmap){
  this.canvas.width = bitmap.width;
  this.canvas.height = bitmap.height;
  this.buffer.drawImage(bitmap.canvas,0,0);
};