/*!
 * Raphael 1.5.2 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 */
(function () {
    function R() {
        if (R.is(arguments[0], array)) {
            var a = arguments[0],
                cnv = create[apply](R, a.splice(0, 3 + R.is(a[0], nu))),
                res = cnv.set();
            for (var i = 0, ii = a[length]; i < ii; i++) {
                var j = a[i] || {};
                elements[has](j.type) && res[push](cnv[j.type]().attr(j));
            }
            return res;
        }
        return create[apply](R, arguments);
    }
    R.version = "1.5.2";
    var separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        doc = document,
        win = window,
        oldRaphael = {
            was: Object[proto][has].call(win, "Raphael"),
            is: win.Raphael
        },
        Paper = function () {
            this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = "createTouch" in doc,
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        join = "join",
        length = "length",
        lowerCase = Str[proto].toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object[proto][toString],
        paper = {},
        push = "push",
        ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        ms = " progid:DXImageTransform.Microsoft",
        upperCase = Str[proto].toUpperCase,
        availableAttrs = {blur: 0, "clip-rect": "0 0 1e9 1e9", cursor: "default", cx: 0, cy: 0, fill: "#fff", "fill-opacity": 1, font: '10px "Arial"', "font-family": '"Arial"', "font-size": "10", "font-style": "normal", "font-weight": 400, gradient: 0, height: 0, href: "http://raphaeljs.com/", opacity: 1, path: "M0,0", r: 0, rotation: 0, rx: 0, ry: 0, scale: "1 1", src: "", stroke: "#000", "stroke-dasharray": "", "stroke-linecap": "butt", "stroke-linejoin": "butt", "stroke-miterlimit": 0, "stroke-opacity": 1, "stroke-width": 1, target: "_blank", "text-anchor": "middle", title: "Raphael", translation: "0 0", width: 0, x: 0, y: 0},
        availableAnimAttrs = {along: "along", blur: nu, "clip-rect": "csv", cx: nu, cy: nu, fill: "colour", "fill-opacity": nu, "font-size": nu, height: nu, opacity: nu, path: "path", r: nu, rotation: "csv", rx: nu, ry: nu, scale: "csv", stroke: "colour", "stroke-opacity": nu, "stroke-width": nu, translation: "csv", width: nu, x: nu, y: nu},
        rp = "replace",
        animKeyFrames= /^(from|to|\d+%?)$/,
        commaSpaces = /\s*,\s*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,
        radial_gradient = /^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,
        sortByKey = function (a, b) {
            return a.key - b.key;
        };

    R.type = (win.SVGAngle || doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return R.type = null;
        }
        d = null;
    }
    R.svg = !(R.vml = R.type == "VML");
    Paper[proto] = R[proto];
    paperproto = Paper[proto];
    R._id = 0;
    R._oid = 0;
    R.fn = {};
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        return  (type == "null" && o === null) ||
            (type == typeof o) ||
            (type == "object" && o === Object(o)) ||
            (type == "array" && Array.isArray && Array.isArray(o)) ||
            objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return ((x < 0) * 180 + math.atan(-y / -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };
    function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [],
            i = 0;
        for (; i < 32; i++) {
            s[i] = (~~(math.random() * 16))[toString](16);
        }
        s[12] = 4;  // bits 12-15 of the time_hi_and_version field to 0010
        s[16] = ((s[16] & 3) | 8)[toString](16);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        return "r-" + s[join]("");
    }

    R.setWindow = function (newwin) {
        win = newwin;
        doc = win.document;
    };
    // colour utilities
    var toHex = function (color) {
            if (R.vml) {
                // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
                var trim = /^\s+|\s+$/g;
                var bod;
                try {
                    var docum = new ActiveXObject("htmlfile");
                    docum.write("<body>");
                    docum.close();
                    bod = docum.body;
                } catch(e) {
                    bod = createPopup().document.body;
                }
                var range = bod.createTextRange();
                toHex = cacher(function (color) {
                    try {
                        bod.style.color = Str(color)[rp](trim, E);
                        var value = range.queryCommandValue("ForeColor");
                        value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                        return "#" + ("000000" + value[toString](16)).slice(-6);
                    } catch(e) {
                        return "none";
                    }
                });
            } else {
                var i = doc.createElement("i");
                i.title = "Rapha\xebl Colour Picker";
                i.style.display = "none";
                doc.body[appendChild](i);
                toHex = cacher(function (color) {
                    i.style.color = color;
                    return doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
                });
            }
            return toHex(color);
        },
        hsbtoString = function () {
            return "hsb(" + [this.h, this.s, this.b] + ")";
        },
        hsltoString = function () {
            return "hsl(" + [this.h, this.s, this.l] + ")";
        },
        rgbtoString = function () {
            return this.hex;
        };
    R.hsb2rgb = function (h, s, b, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            b = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        return R.hsl2rgb(h, s, b / 2, o);
    };
    R.hsl2rgb = function (h, s, l, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        var rgb = {},
            channels = ["r", "g", "b"],
            t2, t1, t3, r, g, b;
        if (!s) {
            rgb = {
                r: l,
                g: l,
                b: l
            };
        } else {
            if (l < .5) {
                t2 = l * (1 + s);
            } else {
                t2 = l + s - l * s;
            }
            t1 = 2 * l - t2;
            for (var i = 0; i < 3; i++) {
                t3 = h + 1 / 3 * -(i - 1);
                t3 < 0 && t3++;
                t3 > 1 && t3--;
                if (t3 * 6 < 1) {
                    rgb[channels[i]] = t1 + (t2 - t1) * 6 * t3;
                } else if (t3 * 2 < 1) {
                    rgb[channels[i]] = t2;
                } else if (t3 * 3 < 2) {
                    rgb[channels[i]] = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                } else {
                    rgb[channels[i]] = t1;
                }
            }
        }
        rgb.r *= 255;
        rgb.g *= 255;
        rgb.b *= 255;
        rgb.hex = "#" + (16777216 | rgb.b | (rgb.g << 8) | (rgb.r << 16)).toString(16).slice(1);
        R.is(o, "finite") && (rgb.opacity = o);
        rgb.toString = rgbtoString;
        return rgb;
    };
    R.rgb2hsb = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            hue,
            saturation,
            brightness = max;
        if (min == max) {
            return {h: 0, s: 0, b: max, toString: hsbtoString};
        } else {
            var delta = (max - min);
            saturation = delta / max;
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            hue < 0 && hue++;
            hue > 1 && hue--;
        }
        return {h: hue, s: saturation, b: brightness, toString: hsbtoString};
    };
    R.rgb2hsl = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            h,
            s,
            l = (max + min) / 2,
            hsl;
        if (min == max) {
            hsl =  {h: 0, s: 0, l: l};
        } else {
            var delta = max - min;
            s = l < .5 ? delta / (max + min) : delta / (2 - max - min);
            if (red == max) {
                h = (green - blue) / delta;
            } else if (green == max) {
                h = 2 + (blue - red) / delta;
            } else {
                h = 4 + (red - green) / delta;
            }
            h /= 6;
            h < 0 && h++;
            h > 1 && h--;
            hsl = {h: h, s: s, l: l};
        }
        hsl.toString = hsltoString;
        return hsl;
    };
    R._path2string = function () {
        return this.join(",")[rp](p2s, "$1");
    };
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array[proto].slice.call(arguments, 0),
                args = arg[join]("\u25ba"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count[length] >= 1e3 && delete cache[count.shift()];
            count[push](args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none"};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1};
    }, R);
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    R.getColor.reset = function () {
        delete this.start;
    };
    // path utilities
    R.parsePathString = cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data[length]) {
            Str(pathString)[rp](pathCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c[rp](pathValues, function (a, b) {
                    b && params[push](+b);
                });
                if (name == "m" && params[length] > 2) {
                    data[push]([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                while (params[length] >= paramCounts[name]) {
                    data[push]([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data[toString] = R._path2string;
        return data;
    });
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            x = pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
            y = pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t * t * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t * t * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t * t * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t * t * (p2y - 2 * c2y + c1y),
            ax = (1 - t) * p1x + t * c1x,
            ay = (1 - t) * p1y + t * c1y,
            cx = (1 - t) * c2x + t * p2x,
            cy = (1 - t) * c2y + t * p2y,
            alpha = (90 - math.atan((mx - nx) / (my - ny)) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {x: x, y: y, m: {x: mx, y: my}, n: {x: nx, y: ny}, start: {x: ax, y: ay}, end: {x: cx, y: cy}, alpha: alpha};
    };
    var pathDimensions = cacher(function (path) {
            if (!path) {
                return {x: 0, y: 0, width: 0, height: 0};
            }
            path = path2curve(path);
            var x = 0,
                y = 0,
                X = [],
                Y = [],
                p;
            for (var i = 0, ii = path[length]; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = p[1];
                    y = p[2];
                    X[push](x);
                    Y[push](y);
                } else {
                    var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    X = X[concat](dim.min.x, dim.max.x);
                    Y = Y[concat](dim.min.y, dim.max.y);
                    x = p[5];
                    y = p[6];
                }
            }
            var xmin = mmin[apply](0, X),
                ymin = mmin[apply](0, Y);
            return {
                x: xmin,
                y: ymin,
                width: mmax[apply](0, X) - xmin,
                height: mmax[apply](0, Y) - ymin
            };
        }),
        pathClone = function (pathArray) {
            var res = [];
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            for (var i = 0, ii = pathArray[length]; i < ii; i++) {
                res[i] = [];
                for (var j = 0, jj = pathArray[i][length]; j < jj; j++) {
                    res[i][j] = pathArray[i][j];
                }
            }
            res[toString] = R._path2string;
            return res;
        },
        pathToRelative = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[push](["M", x, y]);
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i][length];
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, 0, pathClone),
        pathToAbsolute = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else {
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = res[i][res[i][length] - 2];
                        my = res[i][res[i][length] - 1];
                    default:
                        x = res[i][res[i][length] - 2];
                        y = res[i][res[i][length] - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, null, pathClone),
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                _13 * x1 + _23 * ax,
                _13 * y1 + _23 * ay,
                _13 * x2 + _23 * ax,
                _13 * y2 + _23 * ay,
                x2,
                y2
            ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res)[join]()[split](",");
                var newres = [];
                for (var i = 0, ii = res[length]; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = cacher(function (path, path2) {
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i][length] > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi[length]) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                };
            for (var i = 0, ii = mmax(p[length], p2 && p2[length] || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg[length],
                    seg2len = p2 && seg2[length];
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient[length]; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots[push](dot);
            }
            for (i = 1, ii = dots[length] - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        getContainer = function (x, y, w, h) {
            var container;
            if (R.is(x, string) || R.is(x, "object")) {
                container = R.is(x, string) ? doc.getElementById(x) : x;
                if (container.tagName) {
                    if (y == null) {
                        return {
                            container: container,
                            width: container.style.pixelWidth || container.offsetWidth,
                            height: container.style.pixelHeight || container.offsetHeight
                        };
                    } else {
                        return {container: container, width: y, height: w};
                    }
                }
            } else {
                return {container: 1, x: x, y: y, width: w, height: h};
            }
        },
        plugins = function (con, add) {
            var that = this;
            for (var prop in add) {
                if (add[has](prop) && !(prop in con)) {
                    switch (typeof add[prop]) {
                        case "function":
                            (function (f) {
                                con[prop] = con === that ? f : function () { return f[apply](that, arguments); };
                            })(add[prop]);
                            break;
                        case "object":
                            con[prop] = con[prop] || {};
                            plugins.call(this, con[prop], add[prop]);
                            break;
                        default:
                            con[prop] = add[prop];
                            break;
                    }
                }
            }
        },
        tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        removed = function (methodname) {
            return function () {
                throw new Error("Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object");
            };
        };
    R.pathToRelative = pathToRelative;
    // SVG
    if (R.svg) {
        paperproto.svgns = "http://www.w3.org/2000/svg";
        paperproto.xlink = "http://www.w3.org/1999/xlink";
        round = function (num) {
            return +num + (~~num === num) * .5;
        };
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) {
                    if (attr[has](key)) {
                        el[setAttribute](key, Str(attr[key]));
                    }
                }
            } else {
                el = doc.createElementNS(paperproto.svgns, el);
                el.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
                return el;
            }
        };
        R[toString] = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, SVG) {
            var el = $("path");
            SVG.canvas && SVG.canvas[appendChild](el);
            var p = new Element(el, SVG);
            p.type = "path";
            setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            return p;
        };
        var addGradientFill = function (o, gradient, SVG) {
            var type = "linear",
                fx = .5, fy = .5,
                s = o.style;
            gradient = Str(gradient)[rp](radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                    (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(angle * PI / 180), math.sin(angle * PI / 180)],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            var id = o.getAttribute(fillString);
            id = id.match(/^url\(#(.*)\)$/);
            id && SVG.defs.removeChild(doc.getElementById(id[1]));

            var el = $(type + "Gradient");
            el.id = createUUID();
            $(el, type == "radial" ? {fx: fx, fy: fy} : {x1: vector[0], y1: vector[1], x2: vector[2], y2: vector[3]});
            SVG.defs[appendChild](el);
            for (var i = 0, ii = dots[length]; i < ii; i++) {
                var stop = $("stop");
                $(stop, {
                    offset: dots[i].offset ? dots[i].offset : !i ? "0%" : "100%",
                    "stop-color": dots[i].color || "#fff"
                });
                el[appendChild](stop);
            }
            $(o, {
                fill: "url(#" + el.id + ")",
                opacity: 1,
                "fill-opacity": 1
            });
            s.fill = E;
            s.opacity = 1;
            s.fillOpacity = 1;
            return 1;
        };
        var updatePosition = function (o) {
            var bbox = o.getBBox();
            $(o.pattern, {patternTransform: R.format("translate({0},{1})", bbox.x, bbox.y)});
        };
        var setFillAndStroke = function (o, params) {
            var dasharray = {
                    "": [0],
                    "none": [0],
                    "-": [3, 1],
                    ".": [1, 1],
                    "-.": [3, 1, 1, 1],
                    "-..": [3, 1, 1, 1, 1, 1],
                    ". ": [1, 3],
                    "- ": [4, 3],
                    "--": [8, 3],
                    "- .": [4, 3, 1, 3],
                    "--.": [8, 3, 1, 3],
                    "--..": [8, 3, 1, 3, 1, 3]
                },
                node = o.node,
                attrs = o.attrs,
                rot = o.rotate(),
                addDashes = function (o, value) {
                    value = dasharray[lowerCase.call(value)];
                    if (value) {
                        var width = o.attrs["stroke-width"] || "1",
                            butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                            dashes = [];
                        var i = value[length];
                        while (i--) {
                            dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
                        }
                        $(node, {"stroke-dasharray": dashes[join](",")});
                    }
                };
            params[has]("rotation") && (rot = params.rotation);
            var rotxy = Str(rot)[split](separator);
            if (!(rotxy.length - 1)) {
                rotxy = null;
            } else {
                rotxy[1] = +rotxy[1];
                rotxy[2] = +rotxy[2];
            }
            toFloat(rot) && o.rotate(0, true);
            for (var att in params) {
                if (params[has](att)) {
                    if (!availableAttrs[has](att)) {
                        continue;
                    }
                    var value = params[att];
                    attrs[att] = value;
                    switch (att) {
                        case "blur":
                            o.blur(value);
                            break;
                        case "rotation":
                            o.rotate(value, true);
                            break;
                        case "href":
                        case "title":
                        case "target":
                            var pn = node.parentNode;
                            if (lowerCase.call(pn.tagName) != "a") {
                                var hl = $("a");
                                pn.insertBefore(hl, node);
                                hl[appendChild](node);
                                pn = hl;
                            }
                            if (att == "target" && value == "blank") {
                                pn.setAttributeNS(o.paper.xlink, "show", "new");
                            } else {
                                pn.setAttributeNS(o.paper.xlink, att, value);
                            }
                            break;
                        case "cursor":
                            node.style.cursor = value;
                            break;
                        case "clip-rect":
                            var rect = Str(value)[split](separator);
                            if (rect[length] == 4) {
                                o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                                var el = $("clipPath"),
                                    rc = $("rect");
                                el.id = createUUID();
                                $(rc, {
                                    x: rect[0],
                                    y: rect[1],
                                    width: rect[2],
                                    height: rect[3]
                                });
                                el[appendChild](rc);
                                o.paper.defs[appendChild](el);
                                $(node, {"clip-path": "url(#" + el.id + ")"});
                                o.clip = rc;
                            }
                            if (!value) {
                                var clip = doc.getElementById(node.getAttribute("clip-path")[rp](/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                            break;
                        case "path":
                            if (o.type == "path") {
                                $(node, {d: value ? attrs.path = pathToAbsolute(value) : "M0,0"});
                            }
                            break;
                        case "width":
                            node[setAttribute](att, value);
                            if (attrs.fx) {
                                att = "x";
                                value = attrs.x;
                            } else {
                                break;
                            }
                        case "x":
                            if (attrs.fx) {
                                value = -attrs.x - (attrs.width || 0);
                            }
                        case "rx":
                            if (att == "rx" && o.type == "rect") {
                                break;
                            }
                        case "cx":
                            rotxy && (att == "x" || att == "cx") && (rotxy[1] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "height":
                            node[setAttribute](att, value);
                            if (attrs.fy) {
                                att = "y";
                                value = attrs.y;
                            } else {
                                break;
                            }
                        case "y":
                            if (attrs.fy) {
                                value = -attrs.y - (attrs.height || 0);
                            }
                        case "ry":
                            if (att == "ry" && o.type == "rect") {
                                break;
                            }
                        case "cy":
                            rotxy && (att == "y" || att == "cy") && (rotxy[2] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "r":
                            if (o.type == "rect") {
                                $(node, {rx: value, ry: value});
                            } else {
                                node[setAttribute](att, value);
                            }
                            break;
                        case "src":
                            if (o.type == "image") {
                                node.setAttributeNS(o.paper.xlink, "href", value);
                            }
                            break;
                        case "stroke-width":
                            node.style.strokeWidth = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            if (attrs["stroke-dasharray"]) {
                                addDashes(o, attrs["stroke-dasharray"]);
                            }
                            break;
                        case "stroke-dasharray":
                            addDashes(o, value);
                            break;
                        case "translation":
                            var xy = Str(value)[split](separator);
                            xy[0] = +xy[0] || 0;
                            xy[1] = +xy[1] || 0;
                            if (rotxy) {
                                rotxy[1] += xy[0];
                                rotxy[2] += xy[1];
                            }
                            translate.call(o, xy[0], xy[1]);
                            break;
                        case "scale":
                            xy = Str(value)[split](separator);
                            o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, isNaN(toFloat(xy[2])) ? null : +xy[2], isNaN(toFloat(xy[3])) ? null : +xy[3]);
                            break;
                        case fillString:
                            var isURL = Str(value).match(ISURL);
                            if (isURL) {
                                el = $("pattern");
                                var ig = $("image");
                                el.id = createUUID();
                                $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                                $(ig, {x: 0, y: 0});
                                ig.setAttributeNS(o.paper.xlink, "href", isURL[1]);
                                el[appendChild](ig);

                                var img = doc.createElement("img");
                                img.style.cssText = "position:absolute;left:-9999em;top-9999em";
                                img.onload = function () {
                                    $(el, {width: this.offsetWidth, height: this.offsetHeight});
                                    $(ig, {width: this.offsetWidth, height: this.offsetHeight});
                                    doc.body.removeChild(this);
                                    o.paper.safari();
                                };
                                doc.body[appendChild](img);
                                img.src = isURL[1];
                                o.paper.defs[appendChild](el);
                                node.style.fill = "url(#" + el.id + ")";
                                $(node, {fill: "url(#" + el.id + ")"});
                                o.pattern = el;
                                o.pattern && updatePosition(o);
                                break;
                            }
                            var clr = R.getRGB(value);
                            if (!clr.error) {
                                delete params.gradient;
                                delete attrs.gradient;
                                !R.is(attrs.opacity, "undefined") &&
                                    R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                                !R.is(attrs["fill-opacity"], "undefined") &&
                                    R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                            } else if ((({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper)) {
                                attrs.gradient = value;
                                attrs.fill = "none";
                                break;
                            }
                            clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        case "stroke":
                            clr = R.getRGB(value);
                            node[setAttribute](att, clr.hex);
                            att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                            break;
                        case "gradient":
                            (({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper);
                            break;
                        case "opacity":
                            if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                                $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                            }
                        // fall
                        case "fill-opacity":
                            if (attrs.gradient) {
                                var gradient = doc.getElementById(node.getAttribute(fillString)[rp](/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    stops[stops[length] - 1][setAttribute]("stop-opacity", value);
                                }
                                break;
                            }
                        default:
                            att == "font-size" && (value = toInt(value, 10) + "px");
                            var cssrule = att[rp](/(\-.)/g, function (w) {
                                return upperCase.call(w.substring(1));
                            });
                            node.style[cssrule] = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            break;
                    }
                }
            }

            tuneText(o, params);
            if (rotxy) {
                o.rotate(rotxy.join(S));
            } else {
                toFloat(rot) && o.rotate(rot, true);
            }
        };
        var leading = 1.2,
            tuneText = function (el, params) {
                if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
                    return;
                }
                var a = el.attrs,
                    node = el.node,
                    fontSize = node.firstChild ? toInt(doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

                if (params[has]("text")) {
                    a.text = params.text;
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                    var texts = Str(params.text)[split]("\n");
                    for (var i = 0, ii = texts[length]; i < ii; i++) if (texts[i]) {
                        var tspan = $("tspan");
                        i && $(tspan, {dy: fontSize * leading, x: a.x});
                        tspan[appendChild](doc.createTextNode(texts[i]));
                        node[appendChild](tspan);
                    }
                } else {
                    texts = node.getElementsByTagName("tspan");
                    for (i = 0, ii = texts[length]; i < ii; i++) {
                        i && $(texts[i], {dy: fontSize * leading, x: a.x});
                    }
                }
                $(node, {y: a.y});
                var bb = el.getBBox(),
                    dif = a.y - (bb.y + bb.height / 2);
                dif && R.is(dif, "finite") && $(node, {y: a.y + dif});
            },
            Element = function (node, svg) {
                var X = 0,
                    Y = 0;
                this[0] = node;
                this.id = R._oid++;
                this.node = node;
                node.raphael = this;
                this.paper = svg;
                this.attrs = this.attrs || {};
                this.transformations = []; // rotate, translate, scale
                this._ = {
                    tx: 0,
                    ty: 0,
                    rt: {deg: 0, cx: 0, cy: 0},
                    sx: 1,
                    sy: 1
                };
                !svg.bottom && (svg.bottom = this);
                this.prev = svg.top;
                svg.top && (svg.top.next = this);
                svg.top = this;
                this.next = null;
            };
        var elproto = Element[proto];
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            var bbox = this.getBBox();
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null && cx !== false) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            (cy == null) && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            if (this._.rt.deg) {
                this.transformations[0] = R.format("rotate({0} {1} {2})", this._.rt.deg, cx, cy);
                this.clip && $(this.clip, {transform: R.format("rotate({0} {1} {2})", -this._.rt.deg, cx, cy)});
            } else {
                this.transformations[0] = E;
                this.clip && $(this.clip, {transform: E});
            }
            $(this.node, {transform: this.transformations[join](S)});
            return this;
        };
        Element[proto].hide = function () {
            !this.removed && (this.node.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.node.style.display = "");
            return this;
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            if (this.node.style.display == "none") {
                this.show();
                var hide = true;
            }
            var bbox = {};
            try {
                bbox = this.node.getBBox();
            } catch(e) {
                // Firefox 3.0.x plays badly here
            } finally {
                bbox = bbox || {};
            }
            if (this.type == "text") {
                bbox = {x: bbox.x, y: Infinity, width: 0, height: 0};
                for (var i = 0, ii = this.node.getNumberOfChars(); i < ii; i++) {
                    var bb = this.node.getExtentOfChar(i);
                    (bb.y < bbox.y) && (bbox.y = bb.y);
                    (bb.y + bb.height - bbox.y > bbox.height) && (bbox.height = bb.y + bb.height - bbox.y);
                    (bb.x + bb.width - bbox.x > bbox.width) && (bbox.width = bb.x + bb.width - bbox.x);
                }
            }
            hide && this.hide();
            return bbox;
        };
        Element[proto].attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, string)) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (value == null && R.is(name, array)) {
                var values = {};
                for (var j = 0, jj = name.length; j < jj; j++) {
                    values[name[j]] = this.attr(name[j]);
                }
                return values;
            }
            if (value != null) {
                var params = {};
                params[name] = value;
            } else if (name != null && R.is(name, "object")) {
                params = name;
            }
            for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            setFillAndStroke(this, params);
            return this;
        };
        Element[proto].toFront = function () {
            if (this.removed) {
                return this;
            }
            this.node.parentNode[appendChild](this.node);
            var svg = this.paper;
            svg.top != this && tofront(this, svg);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
                toback(this, this.paper);
                var svg = this.paper;
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[element.length - 1].node;
            if (node.nextSibling) {
                node.parentNode.insertBefore(this.node, node.nextSibling);
            } else {
                node.parentNode[appendChild](this.node);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[0].node;
            node.parentNode.insertBefore(this.node, node);
            insertbefore(this, element, this.paper);
            return this;
        };
        Element[proto].blur = function (size) {
            // Experimental. No Safari support. Use it on your own risk.
            var t = this;
            if (+size !== 0) {
                var fltr = $("filter"),
                    blur = $("feGaussianBlur");
                t.attrs.blur = size;
                fltr.id = createUUID();
                $(blur, {stdDeviation: +size || 1.5});
                fltr.appendChild(blur);
                t.paper.defs.appendChild(fltr);
                t._blur = fltr;
                $(t.node, {filter: "url(#" + fltr.id + ")"});
            } else {
                if (t._blur) {
                    t._blur.parentNode.removeChild(t._blur);
                    delete t._blur;
                    delete t.attrs.blur;
                }
                t.node.removeAttribute("filter");
            }
        };
        var theCircle = function (svg, x, y, r) {
                var el = $("circle");
                svg.canvas && svg.canvas[appendChild](el);
                var res = new Element(el, svg);
                res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
                res.type = "circle";
                $(el, res.attrs);
                return res;
            },
            theRect = function (svg, x, y, w, h, r) {
                var el = $("rect");
                svg.canvas && svg.canvas[appendChild](el);
                var res = new Element(el, svg);
                res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
                res.type = "rect";
                $(el, res.attrs);
                return res;
            },
            theEllipse = function (svg, x, y, rx, ry) {
                var el = $("ellipse");
                svg.canvas && svg.canvas[appendChild](el);
                var res = new Element(el, svg);
                res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
                res.type = "ellipse";
                $(el, res.attrs);
                return res;
            },
            theImage = function (svg, src, x, y, w, h) {
                var el = $("image");
                $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
                el.setAttributeNS(svg.xlink, "href", src);
                svg.canvas && svg.canvas[appendChild](el);
                var res = new Element(el, svg);
                res.attrs = {x: x, y: y, width: w, height: h, src: src};
                res.type = "image";
                return res;
            },
            theText = function (svg, x, y, text) {
                var el = $("text");
                $(el, {x: x, y: y, "text-anchor": "middle"});
                svg.canvas && svg.canvas[appendChild](el);
                var res = new Element(el, svg);
                res.attrs = {x: x, y: y, "text-anchor": "middle", text: text, font: availableAttrs.font, stroke: "none", fill: "#000"};
                res.type = "text";
                setFillAndStroke(res, res.attrs);
                return res;
            },
            setSize = function (width, height) {
                this.width = width || this.width;
                this.height = height || this.height;
                this.canvas[setAttribute]("width", this.width);
                this.canvas[setAttribute]("height", this.height);
                return this;
            },
            create = function () {
                var con = getContainer[apply](0, arguments),
                    container = con && con.container,
                    x = con.x,
                    y = con.y,
                    width = con.width,
                    height = con.height;
                if (!container) {
                    throw new Error("SVG container not found.");
                }
                var cnvs = $("svg");
                x = x || 0;
                y = y || 0;
                width = width || 512;
                height = height || 342;
                $(cnvs, {
                    xmlns: "http://www.w3.org/2000/svg",
                    version: 1.1,
                    width: width,
                    height: height
                });
                if (container == 1) {
                    cnvs.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px";
                    doc.body[appendChild](cnvs);
                } else {
                    if (container.firstChild) {
                        container.insertBefore(cnvs, container.firstChild);
                    } else {
                        container[appendChild](cnvs);
                    }
                }
                container = new Paper;
                container.width = width;
                container.height = height;
                container.canvas = cnvs;
                plugins.call(container, container, R.fn);
                container.clear();
                return container;
            };
        paperproto.clear = function () {
            var c = this.canvas;
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            this.bottom = this.top = null;
            (this.desc = $("desc"))[appendChild](doc.createTextNode("Created with Rapha\xebl"));
            c[appendChild](this.desc);
            c[appendChild](this.defs = $("defs"));
        };
        paperproto.remove = function () {
            this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
        };
    }

    // VML
    if (R.vml) {
        var map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
            bites = /([clmz]),?([^clmz]*)/gi,
            blurregexp = / progid:\S+Blur\([^\)]+\)/g,
            val = /-?[^,\s-]+/g,
            coordsize = 1e3 + S + 1e3,
            zoom = 10,
            pathlike = {path: 1, rect: 1},
            path2vml = function (path) {
                var total =  /[ahqstv]/ig,
                    command = pathToAbsolute;
                Str(path).match(total) && (command = path2curve);
                total = /[clmz]/g;
                if (command == pathToAbsolute && !Str(path).match(total)) {
                    var res = Str(path)[rp](bites, function (all, command, args) {
                        var vals = [],
                            isMove = lowerCase.call(command) == "m",
                            res = map[command];
                        args[rp](val, function (value) {
                            if (isMove && vals[length] == 2) {
                                res += vals + map[command == "m" ? "l" : "L"];
                                vals = [];
                            }
                            vals[push](round(value * zoom));
                        });
                        return res + vals;
                    });
                    return res;
                }
                var pa = command(path), p, r;
                res = [];
                for (var i = 0, ii = pa[length]; i < ii; i++) {
                    p = pa[i];
                    r = lowerCase.call(pa[i][0]);
                    r == "z" && (r = "x");
                    for (var j = 1, jj = p[length]; j < jj; j++) {
                        r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                    }
                    res[push](r);
                }
                return res[join](S);
            };

        R[toString] = function () {
            return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
        };
        thePath = function (pathString, vml) {
            var g = createNode("group");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            var el = createNode("shape"), ol = el.style;
            ol.width = vml.width + "px";
            ol.height = vml.height + "px";
            el.coordsize = coordsize;
            el.coordorigin = vml.coordorigin;
            g[appendChild](el);
            var p = new Element(el, g, vml),
                attr = {fill: "none", stroke: "#000"};
            pathString && (attr.path = pathString);
            p.type = "path";
            p.path = [];
            p.Path = E;
            setFillAndStroke(p, attr);
            vml.canvas[appendChild](g);
            return p;
        };
        setFillAndStroke = function (o, params) {
            o.attrs = o.attrs || {};
            var node = o.node,
                a = o.attrs,
                s = node.style,
                xy,
                newpath = (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.r != a.r) && o.type == "rect",
                res = o;

            for (var par in params) if (params[has](par)) {
                a[par] = params[par];
            }
            if (newpath) {
                a.path = rectPath(a.x, a.y, a.width, a.height, a.r);
                o.X = a.x;
                o.Y = a.y;
                o.W = a.width;
                o.H = a.height;
            }
            params.href && (node.href = params.href);
            params.title && (node.title = params.title);
            params.target && (node.target = params.target);
            params.cursor && (s.cursor = params.cursor);
            "blur" in params && o.blur(params.blur);
            if (params.path && o.type == "path" || newpath) {
                node.path = path2vml(a.path);
            }
            if (params.rotation != null) {
                o.rotate(params.rotation, true);
            }
            if (params.translation) {
                xy = Str(params.translation)[split](separator);
                translate.call(o, xy[0], xy[1]);
                if (o._.rt.cx != null) {
                    o._.rt.cx +=+ xy[0];
                    o._.rt.cy +=+ xy[1];
                    o.setBox(o.attrs, xy[0], xy[1]);
                }
            }
            if (params.scale) {
                xy = Str(params.scale)[split](separator);
                o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
            }
            if ("clip-rect" in params) {
                var rect = Str(params["clip-rect"])[split](separator);
                if (rect[length] == 4) {
                    rect[2] = +rect[2] + (+rect[0]);
                    rect[3] = +rect[3] + (+rect[1]);
                    var div = node.clipRect || doc.createElement("div"),
                        dstyle = div.style,
                        group = node.parentNode;
                    dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                    if (!node.clipRect) {
                        dstyle.position = "absolute";
                        dstyle.top = 0;
                        dstyle.left = 0;
                        dstyle.width = o.paper.width + "px";
                        dstyle.height = o.paper.height + "px";
                        group.parentNode.insertBefore(div, group);
                        div[appendChild](group);
                        node.clipRect = div;
                    }
                }
                if (!params["clip-rect"]) {
                    node.clipRect && (node.clipRect.style.clip = E);
                }
            }
            if (o.type == "image" && params.src) {
                node.src = params.src;
            }
            if (o.type == "image" && params.opacity) {
                node.filterOpacity = ms + ".Alpha(opacity=" + (params.opacity * 100) + ")";
                s.filter = (node.filterMatrix || E) + (node.filterOpacity || E);
            }
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = '"' + params["font-family"][split](",")[0][rp](/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            if (params.opacity != null ||
                params["stroke-width"] != null ||
                params.fill != null ||
                params.stroke != null ||
                params["stroke-width"] != null ||
                params["stroke-opacity"] != null ||
                params["fill-opacity"] != null ||
                params["stroke-dasharray"] != null ||
                params["stroke-miterlimit"] != null ||
                params["stroke-linejoin"] != null ||
                params["stroke-linecap"] != null) {
                node = o.shape || node;
                var fill = (node.getElementsByTagName(fillString) && node.getElementsByTagName(fillString)[0]),
                    newfill = false;
                !fill && (newfill = fill = createNode(fillString));
                if ("fill-opacity" in params || "opacity" in params) {
                    var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                    opacity = mmin(mmax(opacity, 0), 1);
                    fill.opacity = opacity;
                }
                params.fill && (fill.on = true);
                if (fill.on == null || params.fill == "none") {
                    fill.on = false;
                }
                if (fill.on && params.fill) {
                    var isURL = params.fill.match(ISURL);
                    if (isURL) {
                        fill.src = isURL[1];
                        fill.type = "tile";
                    } else {
                        fill.color = R.getRGB(params.fill).hex;
                        fill.src = E;
                        fill.type = "solid";
                        if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill)) {
                            a.fill = "none";
                            a.gradient = params.fill;
                        }
                    }
                }
                newfill && node[appendChild](fill);
                var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
                    newstroke = false;
                !stroke && (newstroke = stroke = createNode("stroke"));
                if ((params.stroke && params.stroke != "none") ||
                    params["stroke-width"] ||
                    params["stroke-opacity"] != null ||
                    params["stroke-dasharray"] ||
                    params["stroke-miterlimit"] ||
                    params["stroke-linejoin"] ||
                    params["stroke-linecap"]) {
                    stroke.on = true;
                }
                (params.stroke == "none" || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
                var strokeColor = R.getRGB(params.stroke);
                stroke.on && params.stroke && (stroke.color = strokeColor.hex);
                opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
                var width = (toFloat(params["stroke-width"]) || 1) * .75;
                opacity = mmin(mmax(opacity, 0), 1);
                params["stroke-width"] == null && (width = a["stroke-width"]);
                params["stroke-width"] && (stroke.weight = width);
                width && width < 1 && (opacity *= width) && (stroke.weight = 1);
                stroke.opacity = opacity;

                params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                stroke.miterlimit = params["stroke-miterlimit"] || 8;
                params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
                if (params["stroke-dasharray"]) {
                    var dasharray = {
                        "-": "shortdash",
                        ".": "shortdot",
                        "-.": "shortdashdot",
                        "-..": "shortdashdotdot",
                        ". ": "dot",
                        "- ": "dash",
                        "--": "longdash",
                        "- .": "dashdot",
                        "--.": "longdashdot",
                        "--..": "longdashdotdot"
                    };
                    stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
                }
                newstroke && node[appendChild](stroke);
            }
            if (res.type == "text") {
                s = res.paper.span.style;
                a.font && (s.font = a.font);
                a["font-family"] && (s.fontFamily = a["font-family"]);
                a["font-size"] && (s.fontSize = a["font-size"]);
                a["font-weight"] && (s.fontWeight = a["font-weight"]);
                a["font-style"] && (s.fontStyle = a["font-style"]);
                res.node.string && (res.paper.span.innerHTML = Str(res.node.string)[rp](/</g, "&#60;")[rp](/&/g, "&#38;")[rp](/\n/g, "<br>"));
                res.W = a.w = res.paper.span.offsetWidth;
                res.H = a.h = res.paper.span.offsetHeight;
                res.X = a.x;
                res.Y = a.y + round(res.H / 2);

                // text-anchor emulationm
                switch (a["text-anchor"]) {
                    case "start":
                        res.node.style["v-text-align"] = "left";
                        res.bbx = round(res.W / 2);
                        break;
                    case "end":
                        res.node.style["v-text-align"] = "right";
                        res.bbx = -round(res.W / 2);
                        break;
                    default:
                        res.node.style["v-text-align"] = "center";
                        break;
                }
            }
        };
        addGradientFill = function (o, gradient) {
            o.attrs = o.attrs || {};
            var attrs = o.attrs,
                fill,
                type = "linear",
                fxfy = ".5 .5";
            o.attrs.gradient = gradient;
            gradient = Str(gradient)[rp](radial_gradient, function (all, fx, fy) {
                type = "radial";
                if (fx && fy) {
                    fx = toFloat(fx);
                    fy = toFloat(fy);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                    fxfy = fx + S + fy;
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            o = o.shape || o.node;
            fill = o.getElementsByTagName(fillString)[0] || createNode(fillString);
            !fill.parentNode && o.appendChild(fill);
            if (dots[length]) {
                fill.on = true;
                fill.method = "none";
                fill.color = dots[0].color;
                fill.color2 = dots[dots[length] - 1].color;
                var clrs = [];
                for (var i = 0, ii = dots[length]; i < ii; i++) {
                    dots[i].offset && clrs[push](dots[i].offset + S + dots[i].color);
                }
                fill.colors && (fill.colors.value = clrs[length] ? clrs[join]() : "0% " + fill.color);
                if (type == "radial") {
                    fill.type = "gradientradial";
                    fill.focus = "100%";
                    fill.focussize = fxfy;
                    fill.focusposition = fxfy;
                } else {
                    fill.type = "gradient";
                    fill.angle = (270 - angle) % 360;
                }
            }
            return 1;
        };
        Element = function (node, group, vml) {
            var Rotation = 0,
                RotX = 0,
                RotY = 0,
                Scale = 1;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.X = 0;
            this.Y = 0;
            this.attrs = {};
            this.Group = group;
            this.paper = vml;
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg:0},
                sx: 1,
                sy: 1
            };
            !vml.bottom && (vml.bottom = this);
            this.prev = vml.top;
            vml.top && (vml.top.next = this);
            vml.top = this;
            this.next = null;
        };
        elproto = Element[proto];
        elproto.rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            cy == null && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            this.setBox(this.attrs, cx, cy);
            this.Group.style.rotation = this._.rt.deg;
            // gradient fix for rotation. TODO
            // var fill = (this.shape || this.node).getElementsByTagName(fillString);
            // fill = fill[0] || {};
            // var b = ((360 - this._.rt.deg) - 270) % 360;
            // !R.is(fill.angle, "undefined") && (fill.angle = b);
            return this;
        };
        elproto.setBox = function (params, cx, cy) {
            if (this.removed) {
                return this;
            }
            var gs = this.Group.style,
                os = (this.shape && this.shape.style) || this.node.style;
            params = params || {};
            for (var i in params) if (params[has](i)) {
                this.attrs[i] = params[i];
            }
            cx = cx || this._.rt.cx;
            cy = cy || this._.rt.cy;
            var attr = this.attrs,
                x,
                y,
                w,
                h;
            switch (this.type) {
                case "circle":
                    x = attr.cx - attr.r;
                    y = attr.cy - attr.r;
                    w = h = attr.r * 2;
                    break;
                case "ellipse":
                    x = attr.cx - attr.rx;
                    y = attr.cy - attr.ry;
                    w = attr.rx * 2;
                    h = attr.ry * 2;
                    break;
                case "image":
                    x = +attr.x;
                    y = +attr.y;
                    w = attr.width || 0;
                    h = attr.height || 0;
                    break;
                case "text":
                    this.textpath.v = ["m", round(attr.x), ", ", round(attr.y - 2), "l", round(attr.x) + 1, ", ", round(attr.y - 2)][join](E);
                    x = attr.x - round(this.W / 2);
                    y = attr.y - this.H / 2;
                    w = this.W;
                    h = this.H;
                    break;
                case "rect":
                case "path":
                    if (!this.attrs.path) {
                        x = 0;
                        y = 0;
                        w = this.paper.width;
                        h = this.paper.height;
                    } else {
                        var dim = pathDimensions(this.attrs.path);
                        x = dim.x;
                        y = dim.y;
                        w = dim.width;
                        h = dim.height;
                    }
                    break;
                default:
                    x = 0;
                    y = 0;
                    w = this.paper.width;
                    h = this.paper.height;
                    break;
            }
            cx = (cx == null) ? x + w / 2 : cx;
            cy = (cy == null) ? y + h / 2 : cy;
            var left = cx - this.paper.width / 2,
                top = cy - this.paper.height / 2, t;
            gs.left != (t = left + "px") && (gs.left = t);
            gs.top != (t = top + "px") && (gs.top = t);
            this.X = pathlike[has](this.type) ? -left : x;
            this.Y = pathlike[has](this.type) ? -top : y;
            this.W = w;
            this.H = h;
            if (pathlike[has](this.type)) {
                os.left != (t = -left * zoom + "px") && (os.left = t);
                os.top != (t = -top * zoom + "px") && (os.top = t);
            } else if (this.type == "text") {
                os.left != (t = -left + "px") && (os.left = t);
                os.top != (t = -top + "px") && (os.top = t);
            } else {
                gs.width != (t = this.paper.width + "px") && (gs.width = t);
                gs.height != (t = this.paper.height + "px") && (gs.height = t);
                os.left != (t = x - left + "px") && (os.left = t);
                os.top != (t = y - top + "px") && (os.top = t);
                os.width != (t = w + "px") && (os.width = t);
                os.height != (t = h + "px") && (os.height = t);
            }
        };
        elproto.hide = function () {
            !this.removed && (this.Group.style.display = "none");
            return this;
        };
        elproto.show = function () {
            !this.removed && (this.Group.style.display = "block");
            return this;
        };
        elproto.getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (pathlike[has](this.type)) {
                return pathDimensions(this.attrs.path);
            }
            return {
                x: this.X + (this.bbx || 0),
                y: this.Y,
                width: this.W,
                height: this.H
            };
        };
        elproto.remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            this.Group.parentNode.removeChild(this.Group);
            this.shape && this.shape.parentNode.removeChild(this.shape);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        elproto.attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, "string")) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (this.attrs && value == null && R.is(name, array)) {
                var ii, values = {};
                for (i = 0, ii = name[length]; i < ii; i++) {
                    values[name[i]] = this.attr(name[i]);
                }
                return values;
            }
            var params;
            if (value != null) {
                params = {};
                params[name] = value;
            }
            value == null && R.is(name, "object") && (params = name);
            if (params) {
                for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                    var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                    this.attrs[key] = params[key];
                    for (var subkey in par) if (par[has](subkey)) {
                        params[subkey] = par[subkey];
                    }
                }
                if (params.text && this.type == "text") {
                    this.node.string = params.text;
                }
                setFillAndStroke(this, params);
                if (params.gradient && (({circle: 1, ellipse: 1})[has](this.type) || Str(params.gradient).charAt() != "r")) {
                    addGradientFill(this, params.gradient);
                }
                (!pathlike[has](this.type) || this._.rt.deg) && this.setBox(this.attrs);
            }
            return this;
        };
        elproto.toFront = function () {
            !this.removed && this.Group.parentNode[appendChild](this.Group);
            this.paper.top != this && tofront(this, this.paper);
            return this;
        };
        elproto.toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.Group.parentNode.firstChild != this.Group) {
                this.Group.parentNode.insertBefore(this.Group, this.Group.parentNode.firstChild);
                toback(this, this.paper);
            }
            return this;
        };
        elproto.insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[element.length - 1];
            }
            if (element.Group.nextSibling) {
                element.Group.parentNode.insertBefore(this.Group, element.Group.nextSibling);
            } else {
                element.Group.parentNode[appendChild](this.Group);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        elproto.insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[0];
            }
            element.Group.parentNode.insertBefore(this.Group, element.Group);
            insertbefore(this, element, this.paper);
            return this;
        };
        elproto.blur = function (size) {
            var s = this.node.runtimeStyle,
                f = s.filter;
            f = f.replace(blurregexp, E);
            if (+size !== 0) {
                this.attrs.blur = size;
                s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
                s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
            } else {
                s.filter = f;
                s.margin = 0;
                delete this.attrs.blur;
            }
        };

        theCircle = function (vml, x, y, r) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "circle";
            setFillAndStroke(res, {stroke: "#000", fill: "none"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.setBox({x: x - r, y: y - r, width: r * 2, height: r * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        function rectPath(x, y, w, h, r) {
            if (r) {
                return R.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z", x + r, y, w - r * 2, r, -r, h - r * 2, r * 2 - w, r * 2 - h);
            } else {
                return R.format("M{0},{1}l{2},0,0,{3},{4},0z", x, y, w, h, -w);
            }
        }
        theRect = function (vml, x, y, w, h, r) {
            var path = rectPath(x, y, w, h, r),
                res = vml.path(path),
                a = res.attrs;
            res.X = a.x = x;
            res.Y = a.y = y;
            res.W = a.width = w;
            res.H = a.height = h;
            a.r = r;
            a.path = path;
            res.type = "rect";
            return res;
        };
        theEllipse = function (vml, x, y, rx, ry) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "ellipse";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.setBox({x: x - rx, y: y - ry, width: rx * 2, height: ry * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        theImage = function (vml, src, x, y, w, h) {
            var g = createNode("group"),
                o = createNode("image");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            o.src = src;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "image";
            res.attrs.src = src;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas[appendChild](g);
            return res;
        };
        theText = function (vml, x, y, text) {
            var g = createNode("group"),
                el = createNode("shape"),
                ol = el.style,
                path = createNode("path"),
                ps = path.style,
                o = createNode("textpath");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            path.v = R.format("m{0},{1}l{2},{1}", round(x * 10), round(y * 10), round(x * 10) + 1);
            path.textpathok = true;
            ol.width = vml.width;
            ol.height = vml.height;
            o.string = Str(text);
            o.on = true;
            el[appendChild](o);
            el[appendChild](path);
            g[appendChild](el);
            var res = new Element(o, g, vml);
            res.shape = el;
            res.textpath = path;
            res.type = "text";
            res.attrs.text = text;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = 1;
            res.attrs.h = 1;
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000"});
            res.setBox();
            vml.canvas[appendChild](g);
            return res;
        };
        setSize = function (width, height) {
            var cs = this.canvas.style;
            width == +width && (width += "px");
            height == +height && (height += "px");
            cs.width = width;
            cs.height = height;
            cs.clip = "rect(0 " + width + " " + height + " 0)";
            return this;
        };
        var createNode;
        doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            createNode = function (tagName) {
                return doc.createElement('<rvml:' + tagName + ' class="rvml">');
            };
        } catch (e) {
            createNode = function (tagName) {
                return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
        create = function () {
            var con = getContainer[apply](0, arguments),
                container = con.container,
                height = con.height,
                s,
                width = con.width,
                x = con.x,
                y = con.y;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var res = new Paper,
                c = res.canvas = doc.createElement("div"),
                cs = c.style;
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            width == +width && (width += "px");
            height == +height && (height += "px");
            res.width = 1e3;
            res.height = 1e3;
            res.coordsize = zoom * 1e3 + S + zoom * 1e3;
            res.coordorigin = "0 0";
            res.span = doc.createElement("span");
            res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            c[appendChild](res.span);
            cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
            if (container == 1) {
                doc.body[appendChild](c);
                cs.left = x + "px";
                cs.top = y + "px";
                cs.position = "absolute";
            } else {
                if (container.firstChild) {
                    container.insertBefore(c, container.firstChild);
                } else {
                    container[appendChild](c);
                }
            }
            plugins.call(res, res, R.fn);
            return res;
        };
        paperproto.clear = function () {
            this.canvas.innerHTML = E;
            this.span = doc.createElement("span");
            this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            this.canvas[appendChild](this.span);
            this.bottom = this.top = null;
        };
        paperproto.remove = function () {
            this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
            return true;
        };
    }

    // rest
    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP")) {
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            win.setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = function () {};
    }

    // Events
    var preventDefault = function () {
            this.returnValue = false;
        },
        preventTouch = function () {
            return this.originalEvent.preventDefault();
        },
        stopPropagation = function () {
            this.cancelBubble = true;
        },
        stopTouch = function () {
            return this.originalEvent.stopPropagation();
        },
        addEvent = (function () {
            if (doc.addEventListener) {
                return function (obj, type, fn, element) {
                    var realName = supportsTouch && touchMap[type] ? touchMap[type] : type;
                    var f = function (e) {
                        if (supportsTouch && touchMap[has](type)) {
                            for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                                if (e.targetTouches[i].target == obj) {
                                    var olde = e;
                                    e = e.targetTouches[i];
                                    e.originalEvent = olde;
                                    e.preventDefault = preventTouch;
                                    e.stopPropagation = stopTouch;
                                    break;
                                }
                            }
                        }
                        return fn.call(element, e);
                    };
                    obj.addEventListener(realName, f, false);
                    return function () {
                        obj.removeEventListener(realName, f, false);
                        return true;
                    };
                };
            } else if (doc.attachEvent) {
                return function (obj, type, fn, element) {
                    var f = function (e) {
                        e = e || win.event;
                        e.preventDefault = e.preventDefault || preventDefault;
                        e.stopPropagation = e.stopPropagation || stopPropagation;
                        return fn.call(element, e);
                    };
                    obj.attachEvent("on" + type, f);
                    var detacher = function () {
                        obj.detachEvent("on" + type, f);
                        return true;
                    };
                    return detacher;
                };
            }
        })(),
        drag = [],
        dragMove = function (e) {
            var x = e.clientX,
                y = e.clientY,
                scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
                scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft,
                dragi,
                j = drag.length;
            while (j--) {
                dragi = drag[j];
                if (supportsTouch) {
                    var i = e.touches.length,
                        touch;
                    while (i--) {
                        touch = e.touches[i];
                        if (touch.identifier == dragi.el._drag.id) {
                            x = touch.clientX;
                            y = touch.clientY;
                            (e.originalEvent ? e.originalEvent : e).preventDefault();
                            break;
                        }
                    }
                } else {
                    e.preventDefault();
                }
                x += scrollX;
                y += scrollY;
                dragi.move && dragi.move.call(dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
            }
        },
        dragUp = function (e) {
            R.unmousemove(dragMove).unmouseup(dragUp);
            var i = drag.length,
                dragi;
            while (i--) {
                dragi = drag[i];
                dragi.el._drag = {};
                dragi.end && dragi.end.call(dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
            }
            drag = [];
        };
    for (var i = events[length]; i--;) {
        (function (eventName) {
            R[eventName] = Element[proto][eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = Element[proto]["un" + eventName] = function (fn) {
                var events = this.events,
                    l = events[length];
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        this._drag = {};
        this.mousedown(function (e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
                scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            onstart && onstart.call(start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move: onmove, end: onend, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
        });
        return this;
    };
    elproto.undrag = function (onmove, onstart, onend) {
        var i = drag.length;
        while (i--) {
            drag[i].el == this && (drag[i].move == onmove && drag[i].end == onend) && drag.splice(i++, 1);
        }
        !drag.length && R.unmousemove(dragMove).unmouseup(dragUp);
    };
    paperproto.circle = function (x, y, r) {
        return theCircle(this, x || 0, y || 0, r || 0);
    };
    paperproto.rect = function (x, y, w, h, r) {
        return theRect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
    };
    paperproto.ellipse = function (x, y, rx, ry) {
        return theEllipse(this, x || 0, y || 0, rx || 0, ry || 0);
    };
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        return thePath(R.format[apply](R, arguments), this);
    };
    paperproto.image = function (src, x, y, w, h) {
        return theImage(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
    };
    paperproto.text = function (x, y, text) {
        return theText(this, x || 0, y || 0, Str(text));
    };
    paperproto.set = function (itemsArray) {
        arguments[length] > 1 && (itemsArray = Array[proto].splice.call(arguments, 0, arguments[length]));
        return new Set(itemsArray);
    };
    paperproto.setSize = setSize;
    paperproto.top = paperproto.bottom = null;
    paperproto.raphael = R;
    function x_y() {
        return this.x + S + this.y;
    }
    elproto.resetScale = function () {
        if (this.removed) {
            return this;
        }
        this._.sx = 1;
        this._.sy = 1;
        this.attrs.scale = "1 1";
    };
    elproto.scale = function (x, y, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (x == null && y == null) {
            return {
                x: this._.sx,
                y: this._.sy,
                toString: x_y
            };
        }
        y = y || x;
        !+y && (y = x);
        var dx,
            dy,
            dcx,
            dcy,
            a = this.attrs;
        if (x != 0) {
            var bb = this.getBBox(),
                rcx = bb.x + bb.width / 2,
                rcy = bb.y + bb.height / 2,
                kx = abs(x / this._.sx),
                ky = abs(y / this._.sy);
            cx = (+cx || cx == 0) ? cx : rcx;
            cy = (+cy || cy == 0) ? cy : rcy;
            var posx = this._.sx > 0,
                posy = this._.sy > 0,
                dirx = ~~(x / abs(x)),
                diry = ~~(y / abs(y)),
                dkx = kx * dirx,
                dky = ky * diry,
                s = this.node.style,
                ncx = cx + abs(rcx - cx) * dkx * (rcx > cx == posx ? 1 : -1),
                ncy = cy + abs(rcy - cy) * dky * (rcy > cy == posy ? 1 : -1),
                fr = (x * dirx > y * diry ? ky : kx);
            switch (this.type) {
                case "rect":
                case "image":
                    var neww = a.width * kx,
                        newh = a.height * ky;
                    this.attr({
                        height: newh,
                        r: a.r * fr,
                        width: neww,
                        x: ncx - neww / 2,
                        y: ncy - newh / 2
                    });
                    break;
                case "circle":
                case "ellipse":
                    this.attr({
                        rx: a.rx * kx,
                        ry: a.ry * ky,
                        r: a.r * fr,
                        cx: ncx,
                        cy: ncy
                    });
                    break;
                case "text":
                    this.attr({
                        x: ncx,
                        y: ncy
                    });
                    break;
                case "path":
                    var path = pathToRelative(a.path),
                        skip = true,
                        fx = posx ? dkx : kx,
                        fy = posy ? dky : ky;
                    for (var i = 0, ii = path[length]; i < ii; i++) {
                        var p = path[i],
                            P0 = upperCase.call(p[0]);
                        if (P0 == "M" && skip) {
                            continue;
                        } else {
                            skip = false;
                        }
                        if (P0 == "A") {
                            p[path[i][length] - 2] *= fx;
                            p[path[i][length] - 1] *= fy;
                            p[1] *= kx;
                            p[2] *= ky;
                            p[5] = +(dirx + diry ? !!+p[5] : !+p[5]);
                        } else if (P0 == "H") {
                            for (var j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fx;
                            }
                        } else if (P0 == "V") {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fy;
                            }
                        } else {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= (j % 2) ? fx : fy;
                            }
                        }
                    }
                    var dim2 = pathDimensions(path);
                    dx = ncx - dim2.x - dim2.width / 2;
                    dy = ncy - dim2.y - dim2.height / 2;
                    path[0][1] += dx;
                    path[0][2] += dy;
                    this.attr({path: path});
                    break;
            }
            if (this.type in {text: 1, image:1} && (dirx != 1 || diry != 1)) {
                if (this.transformations) {
                    this.transformations[2] = "scale("[concat](dirx, ",", diry, ")");
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    dx = (dirx == -1) ? -a.x - (neww || 0) : a.x;
                    dy = (diry == -1) ? -a.y - (newh || 0) : a.y;
                    this.attr({x: dx, y: dy});
                    a.fx = dirx - 1;
                    a.fy = diry - 1;
                } else {
                    this.node.filterMatrix = ms + ".Matrix(M11="[concat](dirx,
                        ", M12=0, M21=0, M22=", diry,
                        ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            } else {
                if (this.transformations) {
                    this.transformations[2] = E;
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    a.fx = 0;
                    a.fy = 0;
                } else {
                    this.node.filterMatrix = E;
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            }
            a.scale = [x, y, cx, cy][join](S);
            this._.sx = x;
            this._.sy = y;
        }
        return this;
    };
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var attr = this.attr();
        delete attr.scale;
        delete attr.translation;
        return this.paper[this.type]().attr(attr);
    };
    var curveslengths = {},
        getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
            var len = 0,
                precision = 100,
                name = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y].join(),
                cache = curveslengths[name],
                old, dot;
            !cache && (curveslengths[name] = cache = {data: []});
            cache.timer && clearTimeout(cache.timer);
            cache.timer = setTimeout(function () {delete curveslengths[name];}, 2000);
            if (length != null) {
                var total = getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
                precision = ~~total * 10;
            }
            for (var i = 0; i < precision + 1; i++) {
                if (cache.data[length] > i) {
                    dot = cache.data[i * precision];
                } else {
                    dot = R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / precision);
                    cache.data[i] = dot;
                }
                i && (len += pow(pow(old.x - dot.x, 2) + pow(old.y - dot.y, 2), .5));
                if (length != null && len >= length) {
                    return dot;
                }
                old = dot;
            }
            if (length == null) {
                return len;
            }
        },
        getLengthFactory = function (istotal, subpath) {
            return function (path, length, onlystart) {
                path = path2curve(path);
                var x, y, p, l, sp = "", subpaths = {}, point,
                    len = 0;
                for (var i = 0, ii = path.length; i < ii; i++) {
                    p = path[i];
                    if (p[0] == "M") {
                        x = +p[1];
                        y = +p[2];
                    } else {
                        l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                        if (len + l > length) {
                            if (subpath && !subpaths.start) {
                                point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                                sp += ["C", point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                                if (onlystart) {return sp;}
                                subpaths.start = sp;
                                sp = ["M", point.x, point.y + "C", point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]][join]();
                                len += l;
                                x = +p[5];
                                y = +p[6];
                                continue;
                            }
                            if (!istotal && !subpath) {
                                point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                                return {x: point.x, y: point.y, alpha: point.alpha};
                            }
                        }
                        len += l;
                        x = +p[5];
                        y = +p[6];
                    }
                    sp += p;
                }
                subpaths.end = sp;
                point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[1], p[2], p[3], p[4], p[5], p[6], 1);
                point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
                return point;
            };
        };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        if (abs(this.getTotalLength() - to) < "1e-6") {
            return getSubpathsAtLength(this.attrs.path, from).end;
        }
        var a = getSubpathsAtLength(this.attrs.path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };

    // animation easing formulas
    R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 3);
        },
        ">": function (n) {
            return pow(n - 1, 3) + 1;
        },
        "<>": function (n) {
            n = n * 2;
            if (n < 1) {
                return pow(n, 3) / 2;
            }
            n -= 2;
            return (pow(n, 3) + 2) / 2;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = .3,
                s = p / 4;
            return pow(2, -10 * n) * math.sin((n - s) * (2 * PI) / p) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };

    var animationElements = [],
        animation = function () {
            var Now = +new Date;
            for (var l = 0; l < animationElements[length]; l++) {
                var e = animationElements[l];
                if (e.stop || e.el.removed) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now;
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case "along":
                                now = pos * ms * diff[attr];
                                to.back && (now = to.len - now);
                                var point = getPointAtLength(to[attr], now);
                                that.translate(diff.sx - diff.x || 0, diff.sy - diff.y || 0);
                                diff.x = point.x;
                                diff.y = point.y;
                                that.translate(point.x - diff.sx, point.y - diff.sy);
                                to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                                break;
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ][join](",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i][join](S);
                                }
                                now = now[join](S);
                                break;
                            case "csv":
                                switch (attr) {
                                    case "translation":
                                        var x = pos * ms * diff[attr][0] - t.x,
                                            y = pos * ms * diff[attr][1] - t.y;
                                        t.x += x;
                                        t.y += y;
                                        now = x + S + y;
                                        break;
                                    case "rotation":
                                        now = +from[attr][0] + pos * ms * diff[attr][0];
                                        from[attr][1] && (now += "," + from[attr][1] + "," + from[attr][2]);
                                        break;
                                    case "scale":
                                        now = [+from[attr][0] + pos * ms * diff[attr][0], +from[attr][1] + pos * ms * diff[attr][1], (2 in to[attr] ? to[attr][2] : E), (3 in to[attr] ? to[attr][3] : E)][join](S);
                                        break;
                                    case "clip-rect":
                                        now = [];
                                        i = 4;
                                        while (i--) {
                                            now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                        }
                                        break;
                                }
                                break;
                            default:
                                var from2 = [].concat(from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    that._run && that._run.call(that);
                } else {
                    if (to.along) {
                        point = getPointAtLength(to.along, to.len * !to.back);
                        that.translate(diff.sx - (diff.x || 0) + point.x - diff.sx, diff.sy - (diff.y || 0) + point.y - diff.sy);
                        to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                    }
                    (t.x || t.y) && that.translate(-t.x, -t.y);
                    to.scale && (to.scale += E);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements[length] && setTimeout(animation);
        },
        keyframesRun = function (attr, element, time, prev, prevcallback) {
            var dif = time - prev;
            element.timeouts.push(setTimeout(function () {
                R.is(prevcallback, "function") && prevcallback.call(element);
                element.animate(attr, dif, attr.easing);
            }, prev));
        },
        upto255 = function (color) {
            return mmax(mmin(color, 255), 0);
        },
        translate = function (x, y) {
            if (x == null) {
                return {x: this._.tx, y: this._.ty, toString: x_y};
            }
            this._.tx += +x;
            this._.ty += +y;
            switch (this.type) {
                case "circle":
                case "ellipse":
                    this.attr({cx: +x + this.attrs.cx, cy: +y + this.attrs.cy});
                    break;
                case "rect":
                case "image":
                case "text":
                    this.attr({x: +x + this.attrs.x, y: +y + this.attrs.y});
                    break;
                case "path":
                    var path = pathToRelative(this.attrs.path);
                    path[0][1] += +x;
                    path[0][2] += +y;
                    this.attr({path: path});
                    break;
            }
            return this;
        };
    elproto.animateWith = function (element, params, ms, easing, callback) {
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].el.id == element.id) {
                params.start = animationElements[i].start;
            }
        }
        return this.animate(params, ms, easing, callback);
    };
    elproto.animateAlong = along();
    elproto.animateAlongBack = along(1);
    function along(isBack) {
        return function (path, ms, rotate, callback) {
            var params = {back: isBack};
            R.is(rotate, "function") ? (callback = rotate) : (params.rot = rotate);
            path && path.constructor == Element && (path = path.attrs.path);
            path && (params.along = path);
            return this.animate(params, ms, callback);
        };
    }
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        this._run = f || 0;
        return this;
    };
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        element.timeouts = element.timeouts || [];
        if (R.is(easing, "function") || !easing) {
            callback = easing || null;
        }
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var from = {},
            to = {},
            animateable = false,
            diff = {};
        for (var attr in params) if (params[has](attr)) {
            if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                animateable = true;
                from[attr] = element.attr(attr);
                (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                to[attr] = params[attr];
                switch (availableAnimAttrs[attr]) {
                    case "along":
                        var len = getTotalLength(params[attr]);
                        var point = getPointAtLength(params[attr], len * !!params.back);
                        var bb = element.getBBox();
                        diff[attr] = len / ms;
                        diff.tx = bb.x;
                        diff.ty = bb.y;
                        diff.sx = point.x;
                        diff.sy = point.y;
                        to.rot = params.rot;
                        to.back = params.back;
                        to.len = len;
                        params.rot && (diff.r = toFloat(element.rotate()) || 0);
                        break;
                    case nu:
                        diff[attr] = (to[attr] - from[attr]) / ms;
                        break;
                    case "colour":
                        from[attr] = R.getRGB(from[attr]);
                        var toColour = R.getRGB(to[attr]);
                        diff[attr] = {
                            r: (toColour.r - from[attr].r) / ms,
                            g: (toColour.g - from[attr].g) / ms,
                            b: (toColour.b - from[attr].b) / ms
                        };
                        break;
                    case "path":
                        var pathes = path2curve(from[attr], to[attr]);
                        from[attr] = pathes[0];
                        var toPath = pathes[1];
                        diff[attr] = [];
                        for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                            diff[attr][i] = [0];
                            for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                            }
                        }
                        break;
                    case "csv":
                        var values = Str(params[attr])[split](separator),
                            from2 = Str(from[attr])[split](separator);
                        switch (attr) {
                            case "translation":
                                from[attr] = [0, 0];
                                diff[attr] = [values[0] / ms, values[1] / ms];
                                break;
                            case "rotation":
                                from[attr] = (from2[1] == values[1] && from2[2] == values[2]) ? from2 : [0, values[1], values[2]];
                                diff[attr] = [(values[0] - from[attr][0]) / ms, 0, 0];
                                break;
                            case "scale":
                                params[attr] = values;
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [(values[0] - from[attr][0]) / ms, (values[1] - from[attr][1]) / ms, 0, 0];
                                break;
                            case "clip-rect":
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [];
                                i = 4;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                                break;
                        }
                        to[attr] = values;
                        break;
                    default:
                        values = [].concat(params[attr]);
                        from2 = [].concat(from[attr]);
                        diff[attr] = [];
                        i = element.paper.customAttributes[attr][length];
                        while (i--) {
                            diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                        }
                        break;
                }
            }
        }
        if (!animateable) {
            var attrs = [],
                lastcall;
            for (var key in params) if (params[has](key) && animKeyFrames.test(key)) {
                attr = {value: params[key]};
                key == "from" && (key = 0);
                key == "to" && (key = 100);
                attr.key = toInt(key, 10);
                attrs.push(attr);
            }
            attrs.sort(sortByKey);
            if (attrs[0].key) {
                attrs.unshift({key: 0, value: element.attrs});
            }
            for (i = 0, ii = attrs[length]; i < ii; i++) {
                keyframesRun(attrs[i].value, element, ms / 100 * attrs[i].key, ms / 100 * (attrs[i - 1] && attrs[i - 1].key || 0), attrs[i - 1] && attrs[i - 1].value.callback);
            }
            lastcall = attrs[attrs[length] - 1].value.callback;
            if (lastcall) {
                element.timeouts.push(setTimeout(function () {lastcall.call(element);}, ms));
            }
        } else {
            var easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy[length] == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = function (t) {
                        return t;
                    };
                }
            }
            animationElements.push({
                start: params.start || +new Date,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                t: {x: 0, y: 0}
            });
            R.is(callback, "function") && (element._ac = setTimeout(function () {
                callback.call(element);
            }, ms));
            animationElements[length] == 1 && setTimeout(animation);
        }
        return this;
    };
    elproto.stop = function () {
        for (var i = 0; i < animationElements.length; i++) {
            animationElements[i].el.id == this.id && animationElements.splice(i--, 1);
        }
        for (i = 0, ii = this.timeouts && this.timeouts.length; i < ii; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.timeouts = [];
        clearTimeout(this._ac);
        delete this._ac;
        return this;
    };
    elproto.translate = function (x, y) {
        return this.attr({translation: x + " " + y});
    };
    elproto[toString] = function () {
        return "Rapha\xebl\u2019s object";
    };
    R.ae = animationElements;

    // Set
    var Set = function (items) {
        this.items = [];
        this[length] = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items[length]; i < ii; i++) {
                if (items[i] && (items[i].constructor == Element || items[i].constructor == Set)) {
                    this[this.items[length]] = this.items[this.items[length]] = items[i];
                    this[length]++;
                }
            }
        }
    };
    Set[proto][push] = function () {
        var item,
            len;
        for (var i = 0, ii = arguments[length]; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == Element || item.constructor == Set)) {
                len = this.items[length];
                this[len] = this.items[len] = item;
                this[length]++;
            }
        }
        return this;
    };
    Set[proto].pop = function () {
        delete this[this[length]--];
        return this.items.pop();
    };
    for (var method in elproto) if (elproto[has](method)) {
        Set[proto][method] = (function (methodname) {
            return function () {
                for (var i = 0, ii = this.items[length]; i < ii; i++) {
                    this.items[i][methodname][apply](this.items[i], arguments);
                }
                return this;
            };
        })(method);
    }
    Set[proto].attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name[length]; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items[length]; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    Set[proto].animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items[length],
            i = len,
            item,
            set = this,
            collector;
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        item = this.items[--i].animate(params, ms, easing, collector);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, params, ms, easing, collector);
        }
        return this;
    };
    Set[proto].insertAfter = function (el) {
        var i = this.items[length];
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    Set[proto].getBBox = function () {
        var x = [],
            y = [],
            w = [],
            h = [];
        for (var i = this.items[length]; i--;) {
            var box = this.items[i].getBBox();
            x[push](box.x);
            y[push](box.y);
            w[push](box.x + box.width);
            h[push](box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        return {
            x: x,
            y: y,
            width: mmax[apply](0, w) - x,
            height: mmax[apply](0, h) - y
        };
    };
    Set[proto].clone = function (s) {
        s = new Set;
        for (var i = 0, ii = this.items[length]; i < ii; i++) {
            s[push](this.items[i].clone());
        }
        return s;
    };

    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family][push](fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d[rp](/[mlcxtrv]/g, function (command) {
                        return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                    }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family[rp](/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font[length]; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        var out = this.set(),
            letters = Str(string)[split](E),
            shift = 0,
            path = E,
            scale;
        R.is(font, string) && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox.split(separator),
                top = +bb[0],
                height = +bb[1] + (origin == "baseline" ? bb[3] - bb[1] + (+font.face.descent) : (bb[3] - bb[1]) / 2);
            for (var i = 0, ii = letters[length]; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                    curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                curr && curr.d && out[push](this.path(curr.d).attr({fill: "#000", stroke: "none", translation: [shift, 0]}));
            }
            out.scale(scale, scale, top, height).translate(x - top, y - height);
        }
        return out;
    };

    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args[length] - 1 && (token = token[rp](formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    R.ninja = function () {
        oldRaphael.was ? (win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    R.el = elproto;
    R.st = Set[proto];

    oldRaphael.was ? (win.Raphael = R) : (Raphael = R);
})();

/*!*********************************************************************
 * ELYCHARTS v2.1.4-SNAPSHOT $Id: elycharts.min.js 52 2011-08-07 19:57:09Z stefano.bagnara@gmail.com $
 * A Javascript library to generate interactive charts with vectorial graphics.
 *
 * Copyright (c) 2010 Void Labs s.n.c. (http://void.it)
 * Licensed under the MIT (http://creativecommons.org/licenses/MIT/) license.
 **********************************************************************/
(function(a){if(!a.elycharts){a.elycharts={}}a.elycharts.templates={common:{margins:[10,10,10,10],interactive:true,defaultSeries:{visible:true,tooltip:{active:true,width:100,height:50,roundedCorners:5,padding:[6,6],offset:[20,0],frameProps:{fill:"white","stroke-width":2},contentStyle:{"font-family":"Arial","font-size":"12px","line-height":"16px",color:"black"}},highlight:{scaleSpeed:100,scaleEasing:"",moveSpeed:100,moveEasing:"",restoreSpeed:0,restoreEasing:""},anchor:{},startAnimation:{type:"simple",speed:600,delay:0,propsFrom:{},propsTo:{},easing:""},label:{active:false,html:false,props:{fill:"black",stroke:"none","font-family":"Arial","font-size":"16px"},style:{cursor:"default"}}},series:{empty:{label:{active:false},tooltip:{active:false}}},features:{tooltip:{fadeDelay:100,moveDelay:300},mousearea:{type:"single",indexCenter:"auto",areaMoveDelay:500,syncTag:false,onMouseEnter:false,onMouseExit:false,onMouseChanged:false,onMouseOver:false,onMouseOut:false},highlight:{indexHighlightProps:{opacity:1}},animation:{startAnimation:{speed:600,delay:0,easing:""},stepAnimation:{speed:600,delay:0,easing:""}},frameAnimation:{active:false,cssFrom:{opacity:0},cssTo:{opacity:1},speed:"slow",easing:"linear"},pixelWorkAround:{active:true},label:{},shadows:{active:false,offset:[2,2],props:{"stroke-width":0,"stroke-opacity":0,fill:"black","fill-opacity":0.3}},balloons:{active:false,style:{},padding:[5,5],left:10,line:[[0,0],[0,0]],lineProps:{}},legend:{horizontal:false,x:"auto",y:10,width:"auto",height:20,itemWidth:"fixed",margins:[0,0,0,0],dotMargins:[10,5],borderProps:{fill:"white",stroke:"black","stroke-width":1},dotType:"rect",dotWidth:10,dotHeight:10,dotR:4,dotProps:{type:"rect",width:10,height:10},textProps:{font:"12px Arial",fill:"#000"}},debug:{active:false}},nop:0},line:{template:"common",barMargins:0,defaultAxis:{normalize:2,min:0,labels:false,labelsDistance:8,labelsRotate:0,labelsProps:{font:"10px Arial",fill:"#000"},titleDistance:25,titleDistanceIE:0.75,titleProps:{font:"12px Arial",fill:"#000","font-weight":"bold"}},axis:{x:{titleDistanceIE:1.2}},defaultSeries:{type:"line",axis:"l",cumulative:false,rounded:1,lineCenter:"auto",plotProps:{"stroke-width":1,"stroke-linejoin":"round"},barWidthPerc:100,fill:false,fillProps:{stroke:"none","stroke-width":0,"stroke-opacity":0,opacity:0.3},dot:false,dotProps:{size:4,stroke:"#000",zindex:5},dotShowOnNull:false,mouseareaShowOnNull:false,startAnimation:{plotPropsFrom:false,fillPropsFrom:false,dotPropsFrom:false,shadowPropsFrom:false}},features:{grid:{nx:"auto",ny:4,draw:false,forceBorder:false,props:{stroke:"#e0e0e0","stroke-width":1},extra:[0,0,0,0],labelsCenter:"auto",evenVProps:false,oddVProps:false,evenHProps:false,oddHProps:false,ticks:{active:[false,false,false],size:[10,10],props:{stroke:"#e0e0e0","stroke-width":1}}}},nop:0},pie:{template:"common",startAngle:0,clockwise:false,valueThresold:0.006,defaultSeries:{}},funnel:{template:"common",rh:0,method:"width",topSector:0,topSectorProps:{fill:"#d0d0d0"},bottomSector:0.1,bottomSectorProps:{fill:"#d0d0d0"},edgeProps:{fill:"#c0c0c0","stroke-width":1,opacity:1},nop:0},barline:{template:"common",direction:"ltr"}}})(jQuery);(function(f){if(!f.elycharts){f.elycharts={}}f.elycharts.lastId=0;f.fn.chart=function(h){if(!this.length){return this}var i=this.data("elycharts_env");if(typeof h=="string"){if(h.toLowerCase()=="config"){return i?i.opt:false}if(h.toLowerCase()=="clear"){if(i){i.paper.clear();this.html("");this.data("elycharts_env",false)}}}else{if(!i){if(h){h=b(h)}if(!h||!h.type||!f.elycharts.templates[h.type]){alert("ElyCharts ERROR: chart type is not specified");return false}i=g(this,h);e(i,h);i.pieces=f.elycharts[i.opt.type].draw(i);this.data("elycharts_env",i)}else{h=d(h,i.opt);i.oldopt=c._clone(i.opt);i.opt=f.extend(true,i.opt,h);i.newopt=h;e(i,h);i.pieces=f.elycharts[i.opt.type].draw(i)}}return this};function g(j,h){if(!h.width){h.width=j.width()}if(!h.height){h.height=j.height()}var i={id:f.elycharts.lastId++,paper:c._RaphaelInstance(j.get()[0],h.width,h.height),container:j,plots:[],opt:h};i.paper.rect(0,0,1,1).attr({opacity:0});f.elycharts[h.type].init(i);return i}function e(i,h){if(h.style){i.container.css(h.style)}}function b(h){var i;if(f.elysia_charts){if(f.elysia_charts.default_options){for(i in f.elysia_charts.default_options){f.elycharts.templates[i]=f.elysia_charts.default_options[i]}}if(f.elysia_charts.templates){for(i in f.elysia_charts.templates){f.elycharts.templates[i]=f.elysia_charts.templates[i]}}}while(h.template){var j=h.template;delete h.template;h=f.extend(true,{},f.elycharts.templates[j],h)}if(!h.template&&h.type){h.template=h.type;while(h.template){j=h.template;delete h.template;h=f.extend(true,{},f.elycharts.templates[j],h)}}return d(h,h)}function d(h,i){if(h.type=="pie"||h.type=="funnel"){if(h.values&&f.isArray(h.values)&&!f.isArray(h.values[0])){h.values={root:h.values}}if(h.tooltips&&f.isArray(h.tooltips)&&!f.isArray(h.tooltips[0])){h.tooltips={root:h.tooltips}}if(h.anchors&&f.isArray(h.anchors)&&!f.isArray(h.anchors[0])){h.anchors={root:h.anchors}}if(h.balloons&&f.isArray(h.balloons)&&!f.isArray(h.balloons[0])){h.balloons={root:h.balloons}}if(h.legend&&f.isArray(h.legend)&&!f.isArray(h.legend[0])){h.legend={root:h.legend}}}if(h.defaultSeries){var n=i.type!="line"?i.type:(h.defaultSeries.type?h.defaultSeries.type:(i.defaultSeries.type?i.defaultSeries.type:"line"));a(h.defaultSeries,n,i);if(h.defaultSeries.stackedWith){h.defaultSeries.stacked=h.defaultSeries.stackedWith;delete h.defaultSeries.stackedWith}}if(h.series){for(var l in h.series){var k=i.type!="line"?i.type:(h.series[l].type?h.series[l].type:(i.series[l].type?i.series[l].type:(n?n:"line")));a(h.series[l],k,i);if(h.series[l].values){for(var m in h.series[l].values){a(h.series[l].values[m],k,i)}}if(h.series[l].stackedWith){h.series[l].stacked=h.series[l].stackedWith;delete h.series[l].stackedWith}}}if(h.type=="line"){if(!h.features){h.features={}}if(!h.features.grid){h.features.grid={}}if(typeof h.gridNX!="undefined"){h.features.grid.nx=h.gridNX;delete h.gridNX}if(typeof h.gridNY!="undefined"){h.features.grid.ny=h.gridNY;delete h.gridNY}if(typeof h.gridProps!="undefined"){h.features.grid.props=h.gridProps;delete h.gridProps}if(typeof h.gridExtra!="undefined"){h.features.grid.extra=h.gridExtra;delete h.gridExtra}if(typeof h.gridForceBorder!="undefined"){h.features.grid.forceBorder=h.gridForceBorder;delete h.gridForceBorder}if(h.defaultAxis&&h.defaultAxis.normalize&&(h.defaultAxis.normalize=="auto"||h.defaultAxis.normalize=="autony")){h.defaultAxis.normalize=2}if(h.axis){for(var j in h.axis){if(h.axis[j]&&h.axis[j].normalize&&(h.axis[j].normalize=="auto"||h.axis[j].normalize=="autony")){h.axis[j].normalize=2}}}}return h}function a(k,h,j){if(k.color){var i=k.color;if(!k.plotProps){k.plotProps={}}if(h=="line"){if(k.plotProps&&!k.plotProps.stroke&&!j.defaultSeries.plotProps.stroke){k.plotProps.stroke=i}}else{if(k.plotProps&&!k.plotProps.fill&&!j.defaultSeries.plotProps.fill){k.plotProps.fill=i}}if(!k.tooltip){k.tooltip={}}if(!k.tooltip.frameProps&&j.defaultSeries.tooltip.frameProps){k.tooltip.frameProps={}}if(k.tooltip&&k.tooltip.frameProps&&!k.tooltip.frameProps.stroke&&!j.defaultSeries.tooltip.frameProps.stroke){k.tooltip.frameProps.stroke=i}if(!k.legend){k.legend={}}if(!k.legend.dotProps){k.legend.dotProps={}}if(k.legend.dotProps&&!k.legend.dotProps.fill){k.legend.dotProps.fill=i}if(h=="line"){if(!k.dotProps){k.dotProps={}}if(k.dotProps&&!k.dotProps.fill&&!j.defaultSeries.dotProps.fill){k.dotProps.fill=i}if(!k.fillProps){k.fillProps={}}if(k.fillProps&&!k.fillProps.fill&&!j.defaultSeries.fillProps.fill){k.fillProps.fill=i}}}}f.elycharts.common={_RaphaelInstance:function(l,i,j){var k=Raphael(l,i,j);k.customAttributes.slice=function(h,s,o,n,q,p){a1=360-p;a2=360-q;var m=(a2-a1)>180;a1=(a1%360)*Math.PI/180;a2=(a2%360)*Math.PI/180;if(a1==a2&&q!=p){a2+=359.99*Math.PI/180}return{path:n?[["M",h+o*Math.cos(a1),s+o*Math.sin(a1)],["A",o,o,0,+m,1,h+o*Math.cos(a2),s+o*Math.sin(a2)],["L",h+n*Math.cos(a2),s+n*Math.sin(a2)],["A",n,n,0,+m,0,h+n*Math.cos(a1),s+n*Math.sin(a1)],["z"]]:[["M",h,s],["l",o*Math.cos(a1),o*Math.sin(a1)],["A",o,o,0,+m,1,h+o*Math.cos(a2),s+o*Math.sin(a2)],["z"]]}};return k},_clone:function(j){if(j==null||typeof(j)!="object"){return j}if(j.constructor==Array){return[].concat(j)}var h=new j.constructor();for(var i in j){h[i]=this._clone(j[i])}return h},_mergeObjects:function(i,h){return f.extend(true,i,h)},compactUnits:function(l,j){for(var k=j.length-1;k>=0;k--){var h=l/Math.pow(1000,k+1);if(h>=1&&h*10%10==0){return h+j[k]}}return l},getElementOriginalAttrs:function(i){var h=f(i.node).data("original-attr");if(!h){h=i.attr();f(i.node).data("original-attr",h)}return h},findInPieces:function(l,n,k,h,m){for(var j=0;j<l.length;j++){if((typeof n==undefined||n==-1||n==false||l[j].section==n)&&(typeof k==undefined||k==-1||k==false||l[j].serie==k)&&(typeof h==undefined||h==-1||h==false||l[j].index==h)&&(typeof m==undefined||m==-1||m==false||l[j].subSection==m)){return l[j]}}return false},samePiecePath:function(i,h){return(((typeof i.section==undefined||i.section==-1||i.section==false)&&(typeof h.section==undefined||h.section==-1||h.section==false))||i.section==h.section)&&(((typeof i.serie==undefined||i.serie==-1||i.serie==false)&&(typeof h.serie==undefined||h.serie==-1||h.serie==false))||i.serie==h.serie)&&(((typeof i.index==undefined||i.index==-1||i.index==false)&&(typeof h.index==undefined||h.index==-1||h.index==false))||i.index==h.index)&&(((typeof i.subSection==undefined||i.subSection==-1||i.subSection==false)&&(typeof h.subSection==undefined||h.subSection==-1||h.subSection==false))||i.subSection==h.subSection)},executeIfChanged:function(m,l){if(!m.newopt){return true}for(var k=0;k<l.length;k++){if(l[k][l[k].length-1]=="*"){for(var h in m.newopt){if(h.substring(0,l[k].length-1)+"*"==l[k]){return true}}}else{if(l[k]=="series"&&(m.newopt.series||m.newopt.defaultSeries)){return true}else{if(l[k]=="axis"&&(m.newopt.axis||m.newopt.defaultAxis)){return true}else{if(l[k].substring(0,9)=="features."){l[k]=l[k].substring(9);if(m.newopt.features&&m.newopt.features[l[k]]){return true}}else{if(typeof m.newopt[l[k]]!="undefined"){return true}}}}}}return false},areaProps:function(j,m,k,h,l){var i;if(!l){if(typeof k=="undefined"||!k){i=j.opt[m.toLowerCase()]}else{i=this._clone(j.opt["default"+m]);if(j.opt[m.toLowerCase()]&&j.opt[m.toLowerCase()][k]){i=this._mergeObjects(i,j.opt[m.toLowerCase()][k])}if((typeof h!="undefined")&&h>=0&&i.values&&i.values[h]){i=this._mergeObjects(i,i.values[h])}}}else{i=this._clone(j.opt[l.toLowerCase()]);if(typeof k=="undefined"||!k){if(j.opt[m.toLowerCase()]&&j.opt[m.toLowerCase()][l.toLowerCase()]){i=this._mergeObjects(i,j.opt[m.toLowerCase()][l.toLowerCase()])}}else{if(j.opt["default"+m]&&j.opt["default"+m][l.toLowerCase()]){i=this._mergeObjects(i,j.opt["default"+m][l.toLowerCase()])}if(j.opt[m.toLowerCase()]&&j.opt[m.toLowerCase()][k]&&j.opt[m.toLowerCase()][k][l.toLowerCase()]){i=this._mergeObjects(i,j.opt[m.toLowerCase()][k][l.toLowerCase()])}if(i&&(typeof h!="undefined")&&h>0&&i.values&&i.values[h]){i=this._mergeObjects(i,i.values[h])}}}return i},absrectpath:function(i,k,h,j,l){return[["M",i,k],["L",i,j],["L",h,j],["L",h,k],["z"]]},linepathAnchors:function(j,i,u,s,p,o,l){var h=1;if(l&&l.length){h=l[1];l=l[0]}if(!l){l=1}var m=(u-j)/2,k=(p-u)/2,v=Math.atan((u-j)/Math.abs(s-i)),t=Math.atan((p-u)/Math.abs(s-o));v=i<s?Math.PI-v:v;t=o<s?Math.PI-t:t;if(h==2){if((v-Math.PI/2)*(t-Math.PI/2)>0){v=0;t=0}else{if(Math.abs(v-Math.PI/2)<Math.abs(t-Math.PI/2)){t=Math.PI-v}else{v=Math.PI-t}}}var n=Math.PI/2-((v+t)%(Math.PI*2))/2,x=m*Math.sin(n+v)/2/l,r=m*Math.cos(n+v)/2/l,w=k*Math.sin(n+t)/2/l,q=k*Math.cos(n+t)/2/l;return{x1:u-x,y1:s+r,x2:u+w,y2:s+q}},linepathRevert:function(l){var h=[],k=false;for(var j=l.length-1;j>=0;j--){switch(l[j][0]){case"M":case"L":if(!k){h.push([h.length?"L":"M",l[j][1],l[j][2]])}else{h.push(["C",k[0],k[1],k[2],k[3],l[j][1],l[j][2]])}k=false;break;case"C":if(!k){h.push([h.length?"L":"M",l[j][5],l[j][6]])}else{h.push(["C",k[0],k[1],k[2],k[3],l[j][5],l[j][6]])}k=[l[j][3],l[j][4],l[j][1],l[j][2]]}}return h},linepath:function(r,h){var s=[];if(h){var m=false;for(var k=0,n=r.length-1;k<n;k++){if(k){var q=this.linepathAnchors(r[k-1][0],r[k-1][1],r[k][0],r[k][1],r[k+1][0],r[k+1][1],h);s.push(["C",m[0],m[1],q.x1,q.y1,r[k][0],r[k][1]]);m=[q.x2,q.y2]}else{s.push(["M",r[k][0],r[k][1]]);m=[r[k][0],r[k][1]]}}if(m){s.push(["C",m[0],m[1],r[n][0],r[n][1],r[n][0],r[n][1]])}}else{for(var l=0;l<r.length;l++){var p=r[l][0],o=r[l][1];s.push([l==0?"M":"L",p,o])}}return s},lineareapath:function(k,j,h){var n=this.linepath(k,h),m=this.linepathRevert(this.linepath(j,h));for(var l=0;l<m.length;l++){n.push(!l?["L",m[0][1],m[0][2]]:m[l])}if(n.length){n.push(["z"])}return n},getX:function(h,i){switch(h[0]){case"CIRCLE":return h[1];case"RECT":return h[!i?1:3];case"SLICE":return h[1];default:return h[h.length-2]}},getY:function(h,i){switch(h[0]){case"CIRCLE":return h[2];case"RECT":return h[!i?2:4];case"SLICE":return h[2];default:return h[h.length-1]}},getCenter:function(k,l){if(!k.path){return false}if(k.path.length==0){return false}if(!l){l=[0,0]}if(k.center){return[k.center[0]+l[0],k.center[1]+l[1]]}var j=k.path[0];switch(j[0]){case"CIRCLE":return[j[1]+l[0],j[2]+l[1]];case"RECT":return[(j[1]+j[2])/2+l[0],(j[3]+j[4])/2+l[1]];case"SLICE":var i=j[5]+(j[6]-j[5])/2;var h=Math.PI/180;return[j[1]+(j[4]+((j[3]-j[4])/2)+l[0])*Math.cos(-i*h)+l[1]*Math.cos((-i-90)*h),j[2]+(j[4]+((j[3]-j[4])/2)+l[0])*Math.sin(-i*h)+l[1]*Math.sin((-i-90)*h)]}alert("ElyCharts: getCenter with complex path not supported");return false},movePath:function(u,B,s,q,h){var k=[],t;if(B.length==1&&B[0][0]=="RECT"){return[[B[0][0],this._movePathX(u,B[0][1],s[0],q),this._movePathY(u,B[0][2],s[1],q),this._movePathX(u,B[0][3],s[0],q),this._movePathY(u,B[0][4],s[1],q)]]}if(B.length==1&&B[0][0]=="SLICE"){if(!h){var A=B[0][5]+(B[0][6]-B[0][5])/2;var v=Math.PI/180;var z=B[0][1]+s[0]*Math.cos(-A*v)+s[1]*Math.cos((-A-90)*v);var w=B[0][2]+s[0]*Math.sin(-A*v)+s[1]*Math.cos((-A-90)*v);return[[B[0][0],z,w,B[0][3],B[0][4],B[0][5],B[0][6]]]}else{return[[B[0][0],B[0][1]+s[0],B[0][2]+s[1],B[0][3],B[0][4],B[0][5],B[0][6]]]}}if(B.length==1&&B[0][0]=="CIRCLE"){return[[B[0][0],B[0][1]+s[0],B[0][2]+s[1],B[0][3]]]}if(B.length==1&&B[0][0]=="TEXT"){return[[B[0][0],B[0][1],B[0][2]+s[0],B[0][3]+s[1]]]}if(B.length==1&&B[0][0]=="LINE"){for(t=0;t<B[0][1].length;t++){k.push([this._movePathX(u,B[0][1][t][0],s[0],q),this._movePathY(u,B[0][1][t][1],s[1],q)])}return[[B[0][0],k,B[0][2]]]}if(B.length==1&&B[0][0]=="LINEAREA"){for(t=0;t<B[0][1].length;t++){k.push([this._movePathX(u,B[0][1][t][0],s[0],q),this._movePathY(u,B[0][1][t][1],s[1],q)])}var m=[];for(t=0;t<B[0][2].length;t++){m.push([this._movePathX(u,B[0][2][t][0],s[0],q),this._movePathY(u,B[0][2][t][1],s[1],q)])}return[[B[0][0],k,m,B[0][3]]]}var n=[];for(var r=0;r<B.length;r++){var l=B[r];switch(l[0]){case"M":case"m":case"L":case"l":case"T":case"t":n.push([l[0],this._movePathX(u,l[1],s[0],q),this._movePathY(u,l[2],s[1],q)]);break;case"A":case"a":n.push([l[0],l[1],l[2],l[3],l[4],l[5],this._movePathX(u,l[6],s[0],q),this._movePathY(u,l[7],s[1],q)]);break;case"C":case"c":n.push([l[0],l[1],l[2],l[3],l[4],this._movePathX(u,l[5],s[0],q),this._movePathY(u,l[6],s[1],q)]);break;case"S":case"s":case"Q":case"q":n.push([l[0],l[1],l[2],this._movePathX(u,l[3],s[0],q),this._movePathY(u,l[4],s[1],q)]);break;case"z":case"Z":n.push([l[0]]);break}}return n},_movePathX:function(j,h,i,k){if(!k){return h+i}h=h+i;return i>0&&h>j.opt.width-j.opt.margins[1]?j.opt.width-j.opt.margins[1]:(i<0&&h<j.opt.margins[3]?j.opt.margins[3]:h)},_movePathY:function(i,k,h,j){if(!j){return k+h}k=k+h;return h>0&&k>i.opt.height-i.opt.margins[2]?i.opt.height-i.opt.margins[2]:(h<0&&k<i.opt.margins[0]?i.opt.margins[0]:k)},getSVGProps:function(l,h){var j=h?h:{};var i="path",k;if(l.length==1&&l[0][0]=="RECT"){k=c.absrectpath(l[0][1],l[0][2],l[0][3],l[0][4],l[0][5])}else{if(l.length==1&&l[0][0]=="SLICE"){i="slice";k=[l[0][1],l[0][2],l[0][3],l[0][4],l[0][5],l[0][6]]}else{if(l.length==1&&l[0][0]=="LINE"){k=c.linepath(l[0][1],l[0][2])}else{if(l.length==1&&l[0][0]=="LINEAREA"){k=c.lineareapath(l[0][1],l[0][2],l[0][3])}else{if(l.length==1&&(l[0][0]=="CIRCLE"||l[0][0]=="TEXT"||l[0][0]=="DOMELEMENT"||l[0][0]=="RELEMENT")){return h?h:false}else{k=l}}}}}if(i!="path"||(k&&k.length>0)){j[i]=k}else{if(!h){return false}}return j},showPath:function(l,m,n){m=this.preparePathShow(l,m);if(!n){n=l.paper}if(m.length==1&&m[0][0]=="CIRCLE"){return n.circle(m[0][1],m[0][2],m[0][3])}if(m.length==1&&m[0][0]=="TEXT"){return n.text(m[0][2],m[0][3],m[0][1])}var j=this.getSVGProps(m);var i=false;for(var h in j){i=true;break}return j&&i?n.path().attr(j):false},preparePathShow:function(h,i){return h.opt.features.pixelWorkAround.active?this.movePath(h,this._clone(i),[0.5,0.5],false,true):i},getPieceFullAttr:function(i,h){if(!h.fullattr){h.fullattr=this._clone(h.attr);if(h.path){switch(h.path[0][0]){case"CIRCLE":var j=this.preparePathShow(i,h.path);h.fullattr.cx=j[0][1];h.fullattr.cy=j[0][2];h.fullattr.r=j[0][3];break;case"TEXT":case"DOMELEMENT":case"RELEMENT":break;default:h.fullattr=this.getSVGProps(this.preparePathShow(i,h.path),h.fullattr)}}if(typeof h.fullattr.opacity=="undefined"){h.fullattr.opacity=1}}return h.fullattr},show:function(l,m){m=this.getSortedPathData(m);c.animationStackStart(l);var h=false;for(var j=0;j<m.length;j++){var k=m[j];if(typeof k.show=="undefined"||k.show){k.element=k.animation&&k.animation.element?k.animation.element:false;k.hide=false;if(!k.path){k.hide=true}else{if(k.path.length==1&&k.path[0][0]=="TEXT"){if(k.element){c.animationStackPush(l,k,k.element,false,k.animation.speed,k.animation.easing,k.animation.delay,true);k.animation.element=false}k.element=this.showPath(l,k.path);if(k.element&&l.newopt&&h){k.element.insertAfter(h)}}else{if(k.path.length==1&&k.path[0][0]=="DOMELEMENT"){}else{if(k.path.length==1&&k.path[0][0]=="RELEMENT"){if(k.element){c.animationStackPush(l,k,k.element,false,k.animation.speed,k.animation.easing,k.animation.delay,true);k.animation.element=false}k.element=k.path[0][1];if(k.element&&h){k.element.insertAfter(h)}k.attr=false}else{if(!k.element){if(k.animation&&k.animation.startPath&&k.animation.startPath.length){k.element=this.showPath(l,k.animation.startPath)}else{k.element=this.showPath(l,k.path)}if(k.element&&l.newopt&&h){k.element.insertAfter(h)}}}}}}if(k.element){if(k.attr){if(!k.animation){if(typeof k.attr.opacity=="undefined"){k.attr.opacity=1}k.element.attr(k.attr)}else{if(!k.animation.element){k.element.attr(k.animation.startAttr?k.animation.startAttr:k.attr)}c.animationStackPush(l,k,k.element,this.getPieceFullAttr(l,k),k.animation.speed,k.animation.easing,k.animation.delay)}}else{if(k.hide){c.animationStackPush(l,k,k.element,false,k.animation.speed,k.animation.easing,k.animation.delay)}}h=k.element}}}c.animationStackEnd(l)},getSortedPathData:function(m){res=[];for(var k=0;k<m.length;k++){var l=m[k];if(l.paths){for(var h=0;h<l.paths.length;h++){l.paths[h].pos=res.length;l.paths[h].parent=l;res.push(l.paths[h])}}else{l.pos=res.length;l.parent=false;res.push(l)}}return res.sort(function(j,i){var o=typeof j.attr=="undefined"||typeof j.attr.zindex=="undefined"?(!j.parent||typeof j.parent.attr=="undefined"||typeof j.parent.attr.zindex=="undefined"?0:j.parent.attr.zindex):j.attr.zindex;var n=typeof i.attr=="undefined"||typeof i.attr.zindex=="undefined"?(!i.parent||typeof i.parent.attr=="undefined"||typeof i.parent.attr.zindex=="undefined"?0:i.parent.attr.zindex):i.attr.zindex;return o<n?-1:(o>n?1:(j.pos<i.pos?-1:(j.pos>i.pos?1:0)))})},animationStackStart:function(h){if(!h.animationStackDepth||h.animationStackDepth==0){h.animationStackDepth=0;h.animationStack={}}h.animationStackDepth++},animationStackEnd:function(i){i.animationStackDepth--;if(i.animationStackDepth==0){for(var h in i.animationStack){this._animationStackAnimate(i.animationStack[h],h);delete i.animationStack[h]}i.animationStack={}}},animationStackPush:function(l,k,j,h,n,o,i,m){if(typeof i=="undefined"){i=0}if(!l.animationStackDepth||l.animationStackDepth==0){this._animationStackAnimate([{piece:k,object:j,props:h,speed:n,easing:o,force:m}],i)}else{if(!l.animationStack[i]){l.animationStack[i]=[]}l.animationStack[i].push({piece:k,object:j,props:h,speed:n,easing:o,force:m})}},_animationStackAnimate:function(h,j){var i=this;var k=function(){var m=h.pop();i._animationStackAnimateElement(m);while(h.length>0){var l=h.pop();i._animationStackAnimateElement(l,m)}};if(j>0){setTimeout(k,j)}else{k()}},_animationStackAnimateElement:function(h,j){if(h.force||!h.piece.animationInProgress){h.object.stop();if(!h.props){h.props={opacity:0}}if(!h.speed||h.speed<=0){h.object.attr(h.props);h.piece.animationInProgress=false;return}h.piece.animationInProgress=true;var i=function(){h.piece.animationInProgress=false};if(j){h.object.animateWith(j,h.props,h.speed,h.easing?h.easing:"linear",i)}else{h.object.animate(h.props,h.speed,h.easing?h.easing:"linear",i)}}}};var c=f.elycharts.common;f.elycharts.featuresmanager={managers:[],initialized:false,register:function(i,h){f.elycharts.featuresmanager.managers.push([h,i]);f.elycharts.featuresmanager.initialized=false},init:function(){f.elycharts.featuresmanager.managers.sort(function(i,h){return i[0]<h[0]?-1:(i[0]==h[0]?0:1)});f.elycharts.featuresmanager.initialized=true},beforeShow:function(j,k){if(!f.elycharts.featuresmanager.initialized){this.init()}for(var h=0;h<f.elycharts.featuresmanager.managers.length;h++){if(f.elycharts.featuresmanager.managers[h][1].beforeShow){f.elycharts.featuresmanager.managers[h][1].beforeShow(j,k)}}},afterShow:function(j,k){if(!f.elycharts.featuresmanager.initialized){this.init()}for(var h=0;h<f.elycharts.featuresmanager.managers.length;h++){if(f.elycharts.featuresmanager.managers[h][1].afterShow){f.elycharts.featuresmanager.managers[h][1].afterShow(j,k)}}},onMouseOver:function(l,m,j,h){if(!f.elycharts.featuresmanager.initialized){this.init()}for(var k=0;k<f.elycharts.featuresmanager.managers.length;k++){if(f.elycharts.featuresmanager.managers[k][1].onMouseOver){f.elycharts.featuresmanager.managers[k][1].onMouseOver(l,m,j,h)}}},onMouseOut:function(l,m,j,h){if(!f.elycharts.featuresmanager.initialized){this.init()}for(var k=0;k<f.elycharts.featuresmanager.managers.length;k++){if(f.elycharts.featuresmanager.managers[k][1].onMouseOut){f.elycharts.featuresmanager.managers[k][1].onMouseOut(l,m,j,h)}}},onMouseEnter:function(l,m,j,h){if(!f.elycharts.featuresmanager.initialized){this.init()}for(var k=0;k<f.elycharts.featuresmanager.managers.length;k++){if(f.elycharts.featuresmanager.managers[k][1].onMouseEnter){f.elycharts.featuresmanager.managers[k][1].onMouseEnter(l,m,j,h)}}},onMouseChanged:function(l,m,j,h){if(!f.elycharts.featuresmanager.initialized){this.init()}for(var k=0;k<f.elycharts.featuresmanager.managers.length;k++){if(f.elycharts.featuresmanager.managers[k][1].onMouseChanged){f.elycharts.featuresmanager.managers[k][1].onMouseChanged(l,m,j,h)}}},onMouseExit:function(l,m,j,h){if(!f.elycharts.featuresmanager.initialized){this.init()}for(var k=0;k<f.elycharts.featuresmanager.managers.length;k++){if(f.elycharts.featuresmanager.managers[k][1].onMouseExit){f.elycharts.featuresmanager.managers[k][1].onMouseExit(l,m,j,h)}}}}})(jQuery);(function(c){var a=c.elycharts.featuresmanager;var b=c.elycharts.common;c.elycharts.anchormanager={afterShow:function(f,h){if(!f.opt.anchors){return}if(!f.anchorBinds){f.anchorBinds=[]}while(f.anchorBinds.length){var d=f.anchorBinds.pop();c(d[0]).unbind(d[1],d[2])}for(var e=0;e<f.mouseAreas.length;e++){var g=f.mouseAreas[e].piece?f.mouseAreas[e].piece.serie:false;var j;if(g){j=f.opt.anchors[g][f.mouseAreas[e].index]}else{j=f.opt.anchors[f.mouseAreas[e].index]}if(j&&f.mouseAreas[e].props.anchor&&f.mouseAreas[e].props.anchor.highlight){(function(m,k,n,l){var i=function(){l.anchorMouseOver(m,k)};var o=function(){l.anchorMouseOut(m,k)};if(!m.mouseAreas[e].props.anchor.useMouseEnter){m.anchorBinds.push([n,"mouseover",i]);m.anchorBinds.push([n,"mouseout",o]);c(n).mouseover(i);c(n).mouseout(o)}else{m.anchorBinds.push([n,"mouseenter",i]);m.anchorBinds.push([n,"mouseleave",o]);c(n).mouseenter(i);c(n).mouseleave(o)}})(f,f.mouseAreas[e],j,this)}}f.onAnchors=[]},anchorMouseOver:function(e,d){c.elycharts.highlightmanager.onMouseOver(e,d.piece?d.piece.serie:false,d.index,d)},anchorMouseOut:function(e,d){c.elycharts.highlightmanager.onMouseOut(e,d.piece?d.piece.serie:false,d.index,d)},onMouseOver:function(f,g,e,d){if(!f.opt.anchors){return}if(d.props.anchor&&d.props.anchor.addClass){var h;if(g){h=f.opt.anchors[g][d.index]}else{h=f.opt.anchors[d.index]}if(h){c(h).addClass(d.props.anchor.addClass);f.onAnchors.push([h,d.props.anchor.addClass])}}},onMouseOut:function(f,g,e,d){if(!f.opt.anchors){return}while(f.onAnchors.length>0){var h=f.onAnchors.pop();c(h[0]).removeClass(h[1])}}};c.elycharts.featuresmanager.register(c.elycharts.anchormanager,30)})(jQuery);(function(b){var a=b.elycharts.common;b.elycharts.animationmanager={beforeShow:function(c,d){if(!c.newopt){this.startAnimation(c,d)}else{this.stepAnimation(c,d)}},stepAnimation:function(c,d){d=this._stepAnimationInt(c,c.pieces,d)},_stepAnimationInt:function(m,d,c,o,k,h){var f=[],l;var e=0;for(var g=0;g<d.length;g++){var n=a.areaProps(m,o?o:d[g].section,k?k:d[g].serie);if(n&&n.stepAnimation){n=n.stepAnimation}else{n=m.opt.features.animation.stepAnimation}if(c&&(e>=c.length||!a.samePiecePath(d[g],c[e]))){if(!h){d[g].show=false;f.push(d[g])}else{l={path:false,attr:false,show:true};l.animation={element:d[g].element?d[g].element:false,speed:n&&n.speed?n.speed:300,easing:n&&n.easing?n.easing:"",delay:n&&n.delay?n.delay:0};f.push(l)}}else{l=c?c[e]:{path:false,attr:false};l.show=true;if(typeof d[g].paths=="undefined"){l.animation={element:d[g].element?d[g].element:false,speed:n&&n.speed?n.speed:300,easing:n&&n.easing?n.easing:"",delay:n&&n.delay?n.delay:0};if(!d[g].element){l.animation.startAttr={opacity:0}}}else{l.paths=this._stepAnimationInt(m,d[g].paths,c[e].paths,d[g].section,d[g].serie,true)}f.push(l);e++}}if(c){for(;e<c.length;e++){f.push(c[e])}}return f},startAnimation:function(e,f){for(var c=0;c<f.length;c++){if(f[c].paths||f[c].path){var d=a.areaProps(e,f[c].section,f[c].serie);if(d&&d.startAnimation){d=d.startAnimation}else{d=e.opt.features.animation.startAnimation}if(d.active){if(d.type=="simple"||f[c].section!="Series"){this.animationSimple(e,d,f[c])}if(d.type=="grow"){this.animationGrow(e,d,f[c])}if(d.type=="avg"){this.animationAvg(e,d,f[c])}if(d.type=="reg"){this.animationReg(e,d,f[c])}}}}},_animationPiece:function(d,f,e){if(d.paths){for(var c=0;c<d.paths.length;c++){this._animationPiece(d.paths[c],f,e)}}else{if(d.path){d.animation={speed:f.speed,easing:f.easing,delay:f.delay,startPath:[],startAttr:a._clone(d.attr)};if(f.propsTo){d.attr=a._mergeObjects(d.attr,f.propsTo)}if(f.propsFrom){d.animation.startAttr=a._mergeObjects(d.animation.startAttr,f.propsFrom)}if(e&&f[e.toLowerCase()+"PropsFrom"]){d.animation.startAttr=a._mergeObjects(d.animation.startAttr,f[e.toLowerCase()+"PropsFrom"])}if(typeof d.animation.startAttr.opacity!="undefined"&&typeof d.attr.opacity=="undefined"){d.attr.opacity=1}}}},animationSimple:function(e,d,c){this._animationPiece(c,d,c.subSection)},animationGrow:function(g,f,e){this._animationPiece(e,f,e.subSection);var d,h,j;switch(g.opt.type){case"line":j=g.opt.height-g.opt.margins[2];switch(e.subSection){case"Plot":if(!e.paths){h=["LINE",[],e.path[0][2]];for(d=0;d<e.path[0][1].length;d++){h[1].push([e.path[0][1][d][0],j])}e.animation.startPath.push(h)}else{for(d=0;d<e.paths.length;d++){if(e.paths[d].path){e.paths[d].animation.startPath.push(["RECT",e.paths[d].path[0][1],j,e.paths[d].path[0][3],j])}}}break;case"Fill":h=["LINEAREA",[],[],e.path[0][3]];for(d=0;d<e.path[0][1].length;d++){h[1].push([e.path[0][1][d][0],j]);h[2].push([e.path[0][2][d][0],j])}e.animation.startPath.push(h);break;case"Dot":for(d=0;d<e.paths.length;d++){if(e.paths[d].path){e.paths[d].animation.startPath.push(["CIRCLE",e.paths[d].path[0][1],j,e.paths[d].path[0][3]])}}break}break;case"pie":if(e.subSection=="Plot"){for(d=0;d<e.paths.length;d++){if(e.paths[d].path&&e.paths[d].path[0][0]=="SLICE"){e.paths[d].animation.startPath.push(["SLICE",e.paths[d].path[0][1],e.paths[d].path[0][2],e.paths[d].path[0][4]+e.paths[d].path[0][3]*0.1,e.paths[d].path[0][4],e.paths[d].path[0][5],e.paths[d].path[0][6]])}}}break;case"funnel":alert("Unsupported animation GROW for funnel");break;case"barline":var c;if(e.section=="Series"&&e.subSection=="Plot"){if(!f.subType){c=g.opt.direction!="rtl"?g.opt.margins[3]:g.opt.width-g.opt.margins[1]}else{if(f.subType==1){c=g.opt.direction!="rtl"?g.opt.width-g.opt.margins[1]:g.opt.margins[3]}}for(d=0;d<e.paths.length;d++){if(e.paths[d].path){if(!f.subType||f.subType==1){e.paths[d].animation.startPath.push(["RECT",c,e.paths[d].path[0][2],c,e.paths[d].path[0][4],e.paths[d].path[0][5]])}else{j=(e.paths[d].path[0][2]+e.paths[d].path[0][4])/2;e.paths[d].animation.startPath.push(["RECT",e.paths[d].path[0][1],j,e.paths[d].path[0][3],j,e.paths[d].path[0][5]])}}}}break}},_animationAvgXYArray:function(c){var e=[],f=0,d;for(d=0;d<c.length;d++){f+=c[d][1]}f=f/c.length;for(d=0;d<c.length;d++){e.push([c[d][0],f])}return e},animationAvg:function(g,f,e){this._animationPiece(e,f,e.subSection);var h=0,d,c;switch(g.opt.type){case"line":switch(e.subSection){case"Plot":if(!e.paths){e.animation.startPath.push(["LINE",this._animationAvgXYArray(e.path[0][1]),e.path[0][2]])}else{c=0;for(d=0;d<e.paths.length;d++){if(e.paths[d].path){c++;h+=e.paths[d].path[0][2]}}h=h/c;for(d=0;d<e.paths.length;d++){if(e.paths[d].path){e.paths[d].animation.startPath.push(["RECT",e.paths[d].path[0][1],h,e.paths[d].path[0][3],e.paths[d].path[0][4]])}}}break;case"Fill":e.animation.startPath.push(["LINEAREA",this._animationAvgXYArray(e.path[0][1]),this._animationAvgXYArray(e.path[0][2]),e.path[0][3]]);break;case"Dot":c=0;for(d=0;d<e.paths.length;d++){if(e.paths[d].path){c++;h+=e.paths[d].path[0][2]}}h=h/c;for(d=0;d<e.paths.length;d++){if(e.paths[d].path){e.paths[d].animation.startPath.push(["CIRCLE",e.paths[d].path[0][1],h,e.paths[d].path[0][3]])}}break}break;case"pie":var j=360/e.paths.length;if(e.subSection=="Plot"){for(d=0;d<e.paths.length;d++){if(e.paths[d].path&&e.paths[d].path[0][0]=="SLICE"){e.paths[d].animation.startPath.push(["SLICE",e.paths[d].path[0][1],e.paths[d].path[0][2],e.paths[d].path[0][3],e.paths[d].path[0][4],d*j,(d+1)*j])}}}break;case"funnel":alert("Unsupported animation AVG for funnel");break;case"barline":alert("Unsupported animation AVG for barline");break}},_animationRegXYArray:function(d){var g=[];var j=d.length;var h=d[0][1];var f=d[j-1][1];for(var e=0;e<d.length;e++){g.push([d[e][0],h+(f-h)/(j-1)*e])}return g},animationReg:function(j,h,g){this._animationPiece(g,h,g.subSection);var e,k,f,d;switch(j.opt.type){case"line":switch(g.subSection){case"Plot":if(!g.paths){g.animation.startPath.push(["LINE",this._animationRegXYArray(g.path[0][1]),g.path[0][2]])}else{k=g.paths.length;if(k>1){for(e=0;!g.paths[e].path&&e<g.paths.length;e++){}f=g.paths[e].path?a.getY(g.paths[e].path[0]):0;for(e=g.paths.length-1;!g.paths[e].path&&e>=0;e--){}d=g.paths[e].path?a.getY(g.paths[e].path[0]):0;for(e=0;e<g.paths.length;e++){if(g.paths[e].path){g.paths[e].animation.startPath.push(["RECT",g.paths[e].path[0][1],f+(d-f)/(k-1)*e,g.paths[e].path[0][3],g.paths[e].path[0][4]])}}}}break;case"Fill":g.animation.startPath.push(["LINEAREA",this._animationRegXYArray(g.path[0][1]),this._animationRegXYArray(g.path[0][2]),g.path[0][3]]);break;case"Dot":k=g.paths.length;if(k>1){for(e=0;!g.paths[e].path&&e<g.paths.length;e++){}f=g.paths[e].path?a.getY(g.paths[e].path[0]):0;for(e=g.paths.length-1;!g.paths[e].path&&e>=0;e--){}d=g.paths[e].path?a.getY(g.paths[e].path[0]):0;for(e=0;e<g.paths.length;e++){if(g.paths[e].path){g.paths[e].animation.startPath.push(["CIRCLE",g.paths[e].path[0][1],f+(d-f)/(k-1)*e,g.paths[e].path[0][3]])}}}break}break;case"pie":alert("Unsupported animation REG for pie");break;case"funnel":alert("Unsupported animation REG for funnel");break;case"barline":alert("Unsupported animation REG for barline");break}}};b.elycharts.featuresmanager.register(b.elycharts.animationmanager,10);b.elycharts.frameanimationmanager={beforeShow:function(c,d){if(c.opt.features.frameAnimation.active){b(c.container.get(0)).css(c.opt.features.frameAnimation.cssFrom)}},afterShow:function(c,d){if(c.opt.features.frameAnimation.active){c.container.animate(c.opt.features.frameAnimation.cssTo,c.opt.features.frameAnimation.speed,c.opt.features.frameAnimation.easing)}}};b.elycharts.featuresmanager.register(b.elycharts.frameanimationmanager,90)})(jQuery);(function(b){var a=b.elycharts.common;b.elycharts.highlightmanager={removeHighlighted:function(d,c){if(d.highlighted){while(d.highlighted.length>0){var e=d.highlighted.pop();if(e.piece){if(c){a.animationStackPush(d,e.piece,e.piece.element,a.getPieceFullAttr(d,e.piece),e.cfg.restoreSpeed,e.cfg.restoreEasing,0,true)}}else{e.element.remove()}}}},afterShow:function(c,d){if(c.highlighted&&c.highlighted.length>0){this.removeHighlighted(c,false)}c.highlighted=[]},onMouseOver:function(C,s,j,G){var r,c;for(var A=0;A<G.pieces.length;A++){if(G.pieces[A].section=="Series"&&G.pieces[A].paths&&(!s||G.pieces[A].serie==s)&&G.pieces[A].paths[j]&&G.pieces[A].paths[j].element){var e=G.pieces[A].paths[j];c=e.element;r=e.path;var u=a.getElementOriginalAttrs(c);var E=false;var f=s?G.props:a.areaProps(C,G.pieces[A].section,G.pieces[A].serie);var q,F,v;if(r&&f.highlight){if(f.highlight.scale){var I=f.highlight.scale;if(typeof I=="number"){I=[I,I]}if(r[0][0]=="RECT"){var n=r[0][3]-r[0][1];var B=r[0][4]-r[0][2];r=[["RECT",r[0][1],r[0][2]-B*(I[1]-1),r[0][3]+n*(I[0]-1),r[0][4]]];a.animationStackPush(C,e,c,a.getSVGProps(a.preparePathShow(C,r)),f.highlight.scaleSpeed,f.highlight.scaleEasing)}else{if(r[0][0]=="CIRCLE"){E={r:r[0][3]*I[0]};a.animationStackPush(C,e,c,E,f.highlight.scaleSpeed,f.highlight.scaleEasing)}else{if(r[0][0]=="SLICE"){var D=(r[0][6]-r[0][5])*(I[1]-1)/2;if(D>90){D=90}r=[["SLICE",r[0][1],r[0][1],r[0][3]*I[0],r[0][4],r[0][5]-D,r[0][6]+D]];a.animationStackPush(C,e,c,a.getSVGProps(a.preparePathShow(C,r)),f.highlight.scaleSpeed,f.highlight.scaleEasing)}else{if(C.opt.type=="funnel"){var o=(e.rect[2]-e.rect[0])*(I[0]-1)/2;var m=(e.rect[3]-e.rect[1])*(I[1]-1)/2;a.animationStackStart(C);r=[a.movePath(C,[r[0]],[-o,-m])[0],a.movePath(C,[r[1]],[+o,-m])[0],a.movePath(C,[r[2]],[+o,+m])[0],a.movePath(C,[r[3]],[-o,+m])[0],r[4]];a.animationStackPush(C,e,c,a.getSVGProps(a.preparePathShow(C,r)),f.highlight.scaleSpeed,f.highlight.scaleEasing,0,true);q=false;if(j>0){F=G.pieces[A].paths[j-1];q=F.element;v=F.path}else{F=a.findInPieces(G.pieces,"Sector","top");if(F){q=F.element;v=F.path}}if(q){v=[v[0],v[1],a.movePath(C,[v[2]],[+o,-m])[0],a.movePath(C,[v[3]],[-o,-m])[0],v[4]];a.animationStackPush(C,F,q,a.getSVGProps(a.preparePathShow(C,v)),f.highlight.scaleSpeed,f.highlight.scaleEasing,0,true);C.highlighted.push({piece:F,cfg:f.highlight})}q=false;if(j<G.pieces[A].paths.length-1){F=G.pieces[A].paths[j+1];q=F.element;v=F.path}else{F=a.findInPieces(G.pieces,"Sector","bottom");if(F){q=F.element;v=F.path}}if(q){v=[a.movePath(C,[v[0]],[-o,+m])[0],a.movePath(C,[v[1]],[+o,+m])[0],v[2],v[3],v[4]];a.animationStackPush(C,F,q,a.getSVGProps(a.preparePathShow(C,v)),f.highlight.scaleSpeed,f.highlight.scaleEasing,0,true);C.highlighted.push({piece:F,cfg:f.highlight})}a.animationStackEnd(C)}}}}}if(f.highlight.newProps){for(var H in f.highlight.newProps){if(typeof u[H]=="undefined"){u[H]=false}}a.animationStackPush(C,e,c,f.highlight.newProps)}if(f.highlight.move){var g=b.isArray(f.highlight.move)?f.highlight.move:[f.highlight.move,0];r=a.movePath(C,r,g);a.animationStackPush(C,e,c,a.getSVGProps(a.preparePathShow(C,r)),f.highlight.moveSpeed,f.highlight.moveEasing)}C.highlighted.push({piece:e,cfg:f.highlight});if(f.highlight.overlayProps){c=a.showPath(C,r);if(E){c.attr(E)}c.attr(f.highlight.overlayProps);u=false;C.highlighted.push({element:c,attr:u,cfg:f.highlight})}}}}if(C.opt.features.highlight.indexHighlight&&C.opt.type=="line"){var p=C.opt.features.highlight.indexHighlight;if(p=="auto"){p=(C.indexCenter=="bar"?"bar":"line")}var z=(C.opt.width-C.opt.margins[3]-C.opt.margins[1])/(C.opt.labels.length>0?C.opt.labels.length:1);var y=(C.opt.width-C.opt.margins[3]-C.opt.margins[1])/(C.opt.labels.length>1?C.opt.labels.length-1:1);var l=true;switch(p){case"bar":r=[["RECT",C.opt.margins[3]+j*z,C.opt.margins[0],C.opt.margins[3]+(j+1)*z,C.opt.height-C.opt.margins[2]]];break;case"line":l=false;case"barline":var k=Math.round((l?z/2:0)+C.opt.margins[3]+j*(l?z:y));r=[["M",k,C.opt.margins[0]],["L",k,C.opt.height-C.opt.margins[2]]]}if(r){c=a.showPath(C,r).attr(C.opt.features.highlight.indexHighlightProps);C.highlighted.push({element:c,attr:false,cfg:C.opt.features.highlight})}}},onMouseOut:function(e,f,d,c){this.removeHighlighted(e,true)}};b.elycharts.featuresmanager.register(b.elycharts.highlightmanager,21)})(jQuery);(function(b){var a=b.elycharts.common;b.elycharts.labelmanager={beforeShow:function(f,g){if(!a.executeIfChanged(f,["labels","values","series"])){return}if(f.opt.labels&&(f.opt.type=="pie"||f.opt.type=="funnel")){var j=false;var h;for(var d=0;d<g.length;d++){if(g[d].section=="Series"&&g[d].subSection=="Plot"){var e=a.areaProps(f,"Series",g[d].serie);if(f.emptySeries&&f.opt.series.empty){e.label=b.extend(true,e.label,f.opt.series.empty.label)}if(e&&e.label&&e.label.active){h=[];for(var c=0;c<g[d].paths.length;c++){if(g[d].paths[c].path){j=c;h.push(this.showLabel(f,g[d],g[d].paths[c],g[d].serie,c,g))}else{h.push({path:false,attr:false})}}g.push({section:g[d].section,serie:g[d].serie,subSection:"Label",paths:h})}}else{if(g[d].section=="Sector"&&g[d].serie=="bottom"&&!g[d].subSection&&j<f.opt.labels.length-1){h=[];h.push(this.showLabel(f,g[d],g[d],"Series",f.opt.labels.length-1,g));g.push({section:g[d].section,serie:g[d].serie,subSection:"Label",paths:h})}}}}},showLabel:function(n,t,s,l,o,k){var j=a.areaProps(n,"Series",l,o);if(n.opt.labels[o]||j.label.label){var h=s;var r=j.label.label?j.label.label:n.opt.labels[o];var d=a.getCenter(h,j.label.offset);if(!j.label.html){var q=j.label.props;if(j.label.frameAnchor){q=a._clone(j.label.props);q["text-anchor"]=j.label.frameAnchor[0];q["alignment-baseline"]=j.label.frameAnchor[1]}return{path:[["TEXT",r,d[0],d[1]]],attr:q}}else{var m=1;var g=a._clone(j.label.style);var f=(typeof g.opacity!="undefined");if(f){m=g.opacity;g.opacity=0}g.position="absolute";g["z-index"]=25;var i;if(typeof r=="string"){i=b("<div>"+r+"</div>").css(g).prependTo(n.container)}else{i=b(r).css(g).prependTo(n.container)}if(n.opt.features.debug.active&&i.height()==0){alert("DEBUG: Al gestore label e' stata passata una label ancora senza dimensioni, quindi ancora non disegnata. Per questo motivo il posizionamento potrebbe non essere correto.")}var e=d[0];var c=d[1];if(!j.label.frameAnchor||j.label.frameAnchor[0]=="middle"){e-=i.width()/2}else{if(j.label.frameAnchor&&j.label.frameAnchor[0]=="end"){e-=i.width()}}if(!j.label.frameAnchor||j.label.frameAnchor[1]=="middle"){c-=i.height()/2}else{if(j.label.frameAnchor&&j.label.frameAnchor[1]=="top"){c-=i.height()}}if(f){i.css({margin:c+"px 0 0 "+e+"px",opacity:m})}else{i.css({margin:c+"px 0 0 "+e+"px"})}return{path:[["DOMELEMENT",i]],attr:false}}}return false}};b.elycharts.featuresmanager.register(b.elycharts.labelmanager,5)})(jQuery);(function(b){var a=b.elycharts.common;b.elycharts.legendmanager={afterShow:function(H,e){if(!H.opt.legend||H.opt.legend.length==0){return}var c=H.opt.features.legend;if(c.x=="auto"){var A=1;c.x=0}if(c.width=="auto"){var k=1;c.width=H.opt.width}var p=[["RECT",c.x,c.y,c.x+c.width,c.y+c.height,c.r]];var B=a.showPath(H,p).attr(c.borderProps);if(A||k){B.hide()}var D=0;var s=[];var d=0;var z,K,G,o,n,m,C;for(z in H.opt.legend){if(H.opt.type!="pie"){d++}else{d+=H.opt.legend[z].length}}var F=0;for(z in H.opt.legend){if(H.opt.type!="pie"){K=[H.opt.legend[z]]}else{K=H.opt.legend[z]}for(var E=0;E<K.length;E++){var f=a.areaProps(H,"Series",z,H.opt.type=="pie"?E:false);var g=b.extend(true,{},c.dotProps);if(f.legend&&f.legend.dotProps){g=b.extend(true,g,f.legend.dotProps)}if(!g.fill&&H.opt.type=="pie"){if(f.color){g.fill=f.color}if(f.plotProps&&f.plotProps.fill){g.fill=f.plotProps.fill}}var J=f.legend&&f.legend.dotType?f.legend.dotType:c.dotType;var I=f.legend&&f.legend.dotWidth?f.legend.dotWidth:c.dotWidth;var v=f.legend&&f.legend.dotHeight?f.legend.dotHeight:c.dotHeight;var u=f.legend&&f.legend.dotR?f.legend.dotR:c.dotR;var l=f.legend&&f.legend.textProps?f.legend.textProps:c.textProps;if(!c.horizontal){G=(c.height-c.margins[0]-c.margins[2])/d;o=c.width-c.margins[1]-c.margins[3];n=Math.floor(c.x+c.margins[3]);m=Math.floor(c.y+c.margins[0]+G*F)}else{G=c.height-c.margins[0]-c.margins[2];if(!c.itemWidth||c.itemWidth=="fixed"){o=(c.width-c.margins[1]-c.margins[3])/d;n=Math.floor(c.x+c.margins[3]+o*F)}else{o=(c.width-c.margins[1]-c.margins[3])-D;n=c.x+c.margins[3]+D}m=Math.floor(c.y+c.margins[0])}if(J=="rect"){s.push(a.showPath(H,[["RECT",c.dotMargins[0]+n,m+Math.floor((G-v)/2),c.dotMargins[0]+n+I,m+Math.floor((G-v)/2)+v,u]]).attr(g));C=c.dotMargins[0]+I+c.dotMargins[1]}else{if(J=="circle"){s.push(a.showPath(H,[["CIRCLE",c.dotMargins[0]+n+u,m+(G/2),u]]).attr(g));C=c.dotMargins[0]+u*2+c.dotMargins[1]}}var r=K[E];var q=a.showPath(H,[["TEXT",r,n+C,m+Math.ceil(G/2)+(b.browser.msie?2:0)]]).attr({"text-anchor":"start"}).attr(l);s.push(q);while(q.getBBox().width>(o-C)&&q.getBBox().width>10){r=r.substring(0,r.length-1);q.attr({text:r})}q.show();if(c.horizontal&&c.itemWidth=="auto"){D+=C+q.getBBox().width+4}else{if(!c.horizontal&&k){D=q.getBBox().width+C>D?q.getBBox().width+C:D}else{D+=o}}F++}}if(k){c.width=D+c.margins[3]+c.margins[1]-1}if(A){c.x=Math.floor((H.opt.width-c.width)/2);for(F in s){if(s[F].attrs.x){s[F].attr("x",s[F].attrs.x+c.x)}else{s[F].attr("path",a.movePath(H,s[F].attrs.path,[c.x,0]))}}}if(k||A){p=[["RECT",c.x,c.y,c.x+c.width,c.y+c.height,c.r]];B.attr(a.getSVGProps(a.preparePathShow(H,p)));B.show()}}};b.elycharts.featuresmanager.register(b.elycharts.legendmanager,90)})(jQuery);(function(c){var a=c.elycharts.featuresmanager;var b=c.elycharts.common;c.elycharts.mousemanager={afterShow:function(m,g){if(!m.opt.interactive){return}if(m.mouseLayer){m.mouseLayer.remove();m.mouseLayer=null;m.mousePaper.remove();m.mousePaper=null;m.mouseTimer=null;m.mouseAreas=null}m.mouseLayer=c("<div></div>").css({position:"absolute","z-index":20,opacity:0}).prependTo(m.container);m.mousePaper=b._RaphaelInstance(m.mouseLayer.get(0),m.opt.width,m.opt.height);var f=m.mousePaper;if(m.opt.features.debug.active&&typeof DP_Debug!="undefined"){m.paper.text(m.opt.width,m.opt.height-5,"DEBUG").attr({"text-anchor":"end",stroke:"red",opacity:0.1});f.text(m.opt.width,m.opt.height-5,"DEBUG").attr({"text-anchor":"end",stroke:"red",opacity:0.1}).click(function(){DP_Debug.dump(m.opt,"",false,4)})}var k,h;m.mouseAreas=[];if(m.opt.features.mousearea.type=="single"){for(k=0;k<g.length;k++){if(g[k].mousearea){if(!g[k].paths){if(g[k].path.length>=1&&(g[k].path[0][0]=="LINE"||g[k].path[0][0]=="LINEAREA")){for(h=0;h<g[k].path[0][1].length;h++){var n=b.areaProps(m,g[k].section,g[k].serie);if(n.mouseareaShowOnNull||g[k].section!="Series"||m.opt.values[g[k].serie][h]!=null){m.mouseAreas.push({path:[["CIRCLE",g[k].path[0][1][h][0],g[k].path[0][1][h][1],10]],piece:g[k],pieces:g,index:h,props:n})}}}else{for(h=0;h<g[k].path.length;h++){m.mouseAreas.push({path:[["CIRCLE",b.getX(g[k].path[h]),b.getY(g[k].path[h]),10]],piece:g[k],pieces:g,index:h,props:b.areaProps(m,g[k].section,g[k].serie)})}}}else{if(g[k].paths){for(h=0;h<g[k].paths.length;h++){if(g[k].paths[h].path){m.mouseAreas.push({path:g[k].paths[h].path,piece:g[k],pieces:g,index:h,props:b.areaProps(m,g[k].section,g[k].serie)})}}}}}}}else{var d=m.opt.features.mousearea.indexCenter;if(d=="auto"){d=m.indexCenter}var e,p;if(d=="bar"){p=(m.opt.width-m.opt.margins[3]-m.opt.margins[1])/(m.opt.labels.length>0?m.opt.labels.length:1);e=m.opt.margins[3]}else{p=(m.opt.width-m.opt.margins[3]-m.opt.margins[1])/(m.opt.labels.length>1?m.opt.labels.length-1:1);e=m.opt.margins[3]-p/2}for(var l in m.opt.labels){m.mouseAreas.push({path:[["RECT",e+l*p,m.opt.margins[0],e+(l+1)*p,m.opt.height-m.opt.margins[2]]],piece:false,pieces:g,index:parseInt(l),props:m.opt.defaultSeries})}}var o=false;if(!m.opt.features.mousearea.syncTag){m.mouseareaenv={chartEnv:false,mouseObj:false,caller:false,inArea:-1,timer:false};o=m.mouseareaenv}else{if(!c.elycharts.mouseareaenv){c.elycharts.mouseareaenv={}}if(!c.elycharts.mouseareaenv[m.opt.features.mousearea.syncTag]){c.elycharts.mouseareaenv[m.opt.features.mousearea.syncTag]={chartEnv:false,mouseObj:false,caller:false,inArea:-1,timer:false}}o=c.elycharts.mouseareaenv[m.opt.features.mousearea.syncTag]}for(k=0;k<m.mouseAreas.length;k++){m.mouseAreas[k].area=b.showPath(m,m.mouseAreas[k].path,f).attr({stroke:"none",fill:"#fff",opacity:0});(function(s,u,t,q,j){var r=u.piece;var i=u.index;u.mouseover=function(v){u.event=v;clearTimeout(j.timer);q.onMouseOverArea(s,r,i,u);if(j.chartEnv&&j.chartEnv.id!=s.id){j.caller.onMouseExitArea(j.chartEnv,j.mouseObj.piece,j.mouseObj.index,j.mouseObj);q.onMouseEnterArea(s,r,i,u)}else{if(j.inArea!=t){if(j.inArea<0){q.onMouseEnterArea(s,r,i,u)}else{q.onMouseChangedArea(s,r,i,u)}}}j.chartEnv=s;j.mouseObj=u;j.caller=q;j.inArea=t};u.mouseout=function(v){u.event=v;clearTimeout(j.timer);q.onMouseOutArea(s,r,i,u);j.timer=setTimeout(function(){j.timer=false;q.onMouseExitArea(s,r,i,u);j.chartEnv=false;j.inArea=-1},s.opt.features.mousearea.areaMoveDelay)};c(u.area.node).mouseover(u.mouseover);c(u.area.node).mouseout(u.mouseout)})(m,m.mouseAreas[k],k,this,o)}},onMouseOverArea:function(g,f,e,d){if(g.opt.features.mousearea.onMouseOver){g.opt.features.mousearea.onMouseOver(g,d.piece?d.piece.serie:false,d.index,d)}a.onMouseOver(g,d.piece?d.piece.serie:false,d.index,d)},onMouseOutArea:function(g,f,e,d){if(g.opt.features.mousearea.onMouseOut){g.opt.features.mousearea.onMouseOut(g,d.piece?d.piece.serie:false,d.index,d)}a.onMouseOut(g,d.piece?d.piece.serie:false,d.index,d)},onMouseEnterArea:function(g,f,e,d){if(g.opt.features.mousearea.onMouseEnter){g.opt.features.mousearea.onMouseEnter(g,d.piece?d.piece.serie:false,d.index,d)}a.onMouseEnter(g,d.piece?d.piece.serie:false,d.index,d)},onMouseChangedArea:function(g,f,e,d){if(g.opt.features.mousearea.onMouseChanged){g.opt.features.mousearea.onMouseChanged(g,d.piece?d.piece.serie:false,d.index,d)}a.onMouseChanged(g,d.piece?d.piece.serie:false,d.index,d)},onMouseExitArea:function(g,f,e,d){if(g.opt.features.mousearea.onMouseExit){g.opt.features.mousearea.onMouseExit(g,d.piece?d.piece.serie:false,d.index,d)}a.onMouseExit(g,d.piece?d.piece.serie:false,d.index,d)}};c.elycharts.featuresmanager.register(c.elycharts.mousemanager,0)})(jQuery);(function(b){var a=b.elycharts.common;b.elycharts.tooltipmanager={afterShow:function(c,d){if(c.tooltipContainer){c.tooltipFrame.remove();c.tooltipFrame=null;c.tooltipFrameElement=null;c.tooltipContent.remove();c.tooltipContent=null;c.tooltipContainer.remove();c.tooltipContainer=null}if(!b.elycharts.tooltipid){b.elycharts.tooltipid=0}b.elycharts.tooltipid++;c.tooltipContainer=b('<div id="elycharts_tooltip_'+b.elycharts.tooltipid+'" style="position: absolute; top: 100; left: 100; z-index: 10; overflow: hidden; white-space: nowrap; display: none"><div id="elycharts_tooltip_'+b.elycharts.tooltipid+'_frame" style="position: absolute; top: 0; left: 0; z-index: -1"></div><div id="elycharts_tooltip_'+b.elycharts.tooltipid+'_content" style="cursor: default"></div></div>').appendTo(document.body);c.tooltipFrame=a._RaphaelInstance("elycharts_tooltip_"+b.elycharts.tooltipid+"_frame",500,500);c.tooltipContent=b("#elycharts_tooltip_"+b.elycharts.tooltipid+"_content")},_prepareShow:function(e,d,c,f){if(e.tooltipFrameElement){e.tooltipFrameElement.attr(d.frameProps)}if(d.padding){e.tooltipContent.css({padding:d.padding[0]+"px "+d.padding[1]+"px"})}e.tooltipContent.css(d.contentStyle);e.tooltipContent.html(f);var g=b(e.container).offset();if(e.opt.features.tooltip.fixedPos){g.top+=e.opt.features.tooltip.fixedPos[1];g.left+=e.opt.features.tooltip.fixedPos[0]}else{var h=this.getXY(e,d,c);if(!h[2]){g.left+=h[0];while(g.top+h[1]<0){h[1]+=20}g.top+=h[1]}else{g.left=h[0];g.top=h[1]}}return{top:g.top,left:g.left}},getXY:function(e,i,c){var l=0,k=0;if(c.path[0][0]=="RECT"){l=a.getX(c.path[0])-i.offset[1];k=a.getY(c.path[0])-i.height-i.offset[0]}else{if(c.path[0][0]=="CIRCLE"){l=a.getX(c.path[0])-i.offset[1];k=a.getY(c.path[0])-i.height-i.offset[0]}else{if(c.path[0][0]=="SLICE"){var o=c.path[0];var m=i.width&&i.width!="auto"?i.width:100;var d=i.height&&i.height!="auto"?i.height:100;var f=Math.sqrt(Math.pow(m,2)+Math.pow(d,2))/2;if(f>e.opt.r){f=e.opt.r}var n=o[5]+(o[6]-o[5])/2+180;var g=Math.PI/180;l=o[1]+f*Math.cos(-n*g)-m/2;k=o[2]+f*Math.sin(-n*g)-d/2}else{if(c.piece&&c.piece.paths&&c.index>=0&&c.piece.paths[c.index]&&c.piece.paths[c.index].rect){var j=c.piece.paths[c.index].rect;l=j[0]-i.offset[1];k=j[1]-i.height-i.offset[0]}}}}if(e.opt.features.tooltip.positionHandler){return e.opt.features.tooltip.positionHandler(e,i,c,l,k)}else{return[l,k]}},getTip:function(d,e,c){var f=false;if(d.opt.tooltips){if(typeof d.opt.tooltips=="function"){f=d.opt.tooltips(d,e,c,e&&d.opt.values[e]&&d.opt.values[e][c]?d.opt.values[e][c]:false,d.opt.labels&&d.opt.labels[c]?d.opt.labels[c]:false)}else{if(e&&d.opt.tooltips[e]&&d.opt.tooltips[e][c]){f=d.opt.tooltips[e][c]}else{if(!e&&d.opt.tooltips[c]){f=d.opt.tooltips[c]}}}}return f},onMouseEnter:function(f,g,d,c){var e=c.props.tooltip;if(f.emptySeries&&f.opt.series.empty){e=b.extend(true,e,f.opt.series.empty.tooltip)}if(!e||!e.active){return false}var h=this.getTip(f,g,d);if(!h){return this.onMouseExit(f,g,d,c)}if(e.width&&e.width!="auto"&&e.height&&e.height!="auto"){var i=e.frameProps&&e.frameProps["stroke-width"]?e.frameProps["stroke-width"]:0;f.tooltipContainer.width(e.width+i+1).height(e.height+i+1);if(!f.tooltipFrameElement&&e.frameProps){f.tooltipFrameElement=f.tooltipFrame.rect(i/2,i/2,e.width,e.height,e.roundedCorners)}}f.tooltipContainer.css(this._prepareShow(f,e,c,h)).fadeIn(f.opt.features.tooltip.fadeDelay);return true},onMouseChanged:function(f,g,d,c){var e=c.props.tooltip;if(f.emptySeries&&f.opt.series.empty){e=b.extend(true,e,f.opt.series.empty.tooltip)}if(!e||!e.active){return false}var h=this.getTip(f,g,d);if(!h){return this.onMouseExit(f,g,d,c)}f.tooltipContainer.clearQueue();f.tooltipContainer.animate(this._prepareShow(f,e,c,h),f.opt.features.tooltip.moveDelay,"linear");return true},onMouseExit:function(f,g,d,c){var e=c.props.tooltip;if(f.emptySeries&&f.opt.series.empty){e=b.extend(true,e,f.opt.series.empty.tooltip)}if(!e||!e.active){return false}f.tooltipContainer.fadeOut(f.opt.features.tooltip.fadeDelay);return true}};b.elycharts.featuresmanager.register(b.elycharts.tooltipmanager,20)})(jQuery);(function(c){var a=c.elycharts.featuresmanager;var b=c.elycharts.common;c.elycharts.line={init:function(d){},draw:function(o){if(b.executeIfChanged(o,["values","series"])){o.plots={};o.axis={x:{}};o.barno=0;o.indexCenter="line"}var A=o.opt;var O=o.plots;var B=o.axis;var g=o.paper;var Y=o.opt.values;var r=o.opt.labels;var T,p,F,C,f,n;if(b.executeIfChanged(o,["values","series"])){var W=0;var P=false;for(C in Y){f={index:W,type:false,visible:false};O[C]=f;if(Y[C]){F=b.areaProps(o,"Series",C);f.type=F.type;if(F.type=="bar"){o.indexCenter="bar"}if(F.visible){f.visible=true;if(!n||n<Y[C].length){n=Y[C].length}var J=[];for(T=0;T<Y[C].length;T++){var G=Y[C][T];if(G==null){if(F.type=="bar"){G=0}else{for(var S=T+1;S<Y[C].length&&Y[C][S]==null;S++){}var l=S<Y[C].length?Y[C][S]:null;for(var R=T-1;R>=0&&Y[C][R]==null;R--){}var I=R>=0?Y[C][R]:null;G=l!=null?(I!=null?(l*(T-R)+I*(S-T))/(S-R):l):I}}J.push(G)}if(F.stacked&&!(typeof F.stacked=="string")){F.stacked=P}if(typeof F.stacked=="undefined"||F.stacked==C||F.stacked<0||!O[F.stacked]||!O[F.stacked].visible||O[F.stacked].type!=f.type){f.ref=C;if(F.type=="bar"){f.barno=o.barno++}f.from=[];if(!F.cumulative){f.to=J}else{f.to=[];p=0;for(T=0;T<J.length;T++){f.to.push(p+=J[T])}}for(T=0;T<J.length;T++){f.from.push(0)}}else{f.ref=F.stacked;if(F.type=="bar"){f.barno=O[F.stacked].barno}f.from=O[F.stacked].stack;f.to=[];p=0;if(!F.cumulative){for(T=0;T<J.length;T++){f.to.push(f.from[T]+J[T])}}else{for(T=0;T<J.length;T++){f.to.push(f.from[T]+(p+=J[T]))}}O[F.stacked].stack=f.to}f.stack=f.to;f.max=Math.max.apply(Math,f.from.concat(f.to));f.min=Math.min.apply(Math,f.from.concat(f.to));if(F.axis){if(!B[F.axis]){B[F.axis]={plots:[]}}B[F.axis].plots.push(C);if(typeof B[F.axis].max=="undefined"){B[F.axis].max=f.max}else{B[F.axis].max=Math.max(B[F.axis].max,f.max)}if(typeof B[F.axis].min=="undefined"){B[F.axis].min=f.min}else{B[F.axis].min=Math.min(B[F.axis].min,f.min)}}P=C}}}}if(!r){r=[]}while(n>r.length){r.push(null)}n=r.length;o.opt.labels=r;if(b.executeIfChanged(o,["values","series","axis"])){for(var t in B){F=b.areaProps(o,"Axis",t);B[t].props=F;if(typeof F.max!="undefined"){B[t].max=F.max}if(typeof F.min!="undefined"){B[t].min=F.min}if(B[t].min==B[t].max){B[t].max=B[t].min+1}if(F.normalize&&F.normalize>0){var N=Math.abs(B[t].max);if(B[t].min&&Math.abs(B[t].min)>N){N=Math.abs(B[t].min)}if(N){var D=Math.floor(Math.log(N)/Math.LN10)-(F.normalize-1);D=D>=0?Math.pow(10,D):1/Math.pow(10,-D);N=Math.ceil(N/D/(A.features.grid.ny?A.features.grid.ny:1))*D*(A.features.grid.ny?A.features.grid.ny:1);N=Math.round(N/D)*D;B[t].normalizationBase=D;if(B[t].max){B[t].max=Math.ceil(B[t].max/N)*N}if(B[t].min){B[t].min=Math.floor(B[t].min/N)*N}}}if(B[t].plots){for(var K=0;K<B[t].plots.length;K++){O[B[t].plots[K]].max=B[t].max;O[B[t].plots[K]].min=B[t].min}}}}var U=[];this.grid(o,U);var u=(A.width-A.margins[3]-A.margins[1])/(r.length>1?r.length-1:1);var Q=(A.width-A.margins[3]-A.margins[1])/(r.length>0?r.length:1);for(C in Y){F=b.areaProps(o,"Series",C);f=O[C];if(F.lineCenter&&F.lineCenter=="auto"){F.lineCenter=(o.indexCenter=="bar")}else{if(F.lineCenter&&o.indexCenter=="line"){o.indexCenter="bar"}}if(Y[C]&&F.visible){var s=(A.height-A.margins[2]-A.margins[0])/(f.max-f.min);if(F.type=="line"){var E=["LINE",[],F.rounded];var h=["LINEAREA",[],[],F.rounded];var X=[];for(T=0,K=r.length;T<K;T++){if(f.to.length>T){var Z=b.areaProps(o,"Series",C,T);var V=f.to[T]>f.max?f.max:(f.to[T]<f.min?f.min:f.to[T]);var M=Math.round((F.lineCenter?Q/2:0)+A.margins[3]+T*(F.lineCenter?Q:u));var L=Math.round(A.height-A.margins[2]-s*(V-f.min));var w=f.from[T]>f.max?f.max:(f.from[T]<f.min?f.min:f.from[T]);var q=Math.round(A.height-A.margins[2]-s*(w-f.min))+(c.browser.msie?1:0);E[1].push([M,L]);if(F.fill){h[1].push([M,L]);h[2].push([M,q])}if(Z.dot){if(Y[C][T]==null&&!Z.dotShowOnNull){X.push({path:false,attr:false})}else{X.push({path:[["CIRCLE",M,L,Z.dotProps.size]],attr:Z.dotProps})}}}}if(F.fill){U.push({section:"Series",serie:C,subSection:"Fill",path:[h],attr:F.fillProps})}else{U.push({section:"Series",serie:C,subSection:"Fill",path:false,attr:false})}U.push({section:"Series",serie:C,subSection:"Plot",path:[E],attr:F.plotProps,mousearea:"pathsteps"});if(X.length){U.push({section:"Series",serie:C,subSection:"Dot",paths:X})}else{U.push({section:"Series",serie:C,subSection:"Dot",path:false,attr:false})}}else{pieceBar=[];for(T=0,K=r.length;T<K;T++){if(f.to.length>T){if(f.from[T]!=f.to[T]){var m=Math.floor((Q-A.barMargins)/o.barno);var H=m*(100-F.barWidthPerc)/200;var e=A.barMargins/2+f.barno*m;var z=Math.floor(A.margins[3]+T*Q+e+H);var ab=Math.round(A.height-A.margins[2]-s*(f.to[T]-f.min));var aa=Math.round(A.height-A.margins[2]-s*(f.from[T]-f.min));pieceBar.push({path:[["RECT",z,ab,z+m-H*2,aa]],attr:F.plotProps})}else{pieceBar.push({path:false,attr:false})}}}if(pieceBar.length){U.push({section:"Series",serie:C,subSection:"Plot",paths:pieceBar,mousearea:"paths"})}else{U.push({section:"Series",serie:C,subSection:"Plot",path:false,attr:false,mousearea:"paths"})}}}else{if(F.type=="line"){U.push({section:"Series",serie:C,subSection:"Fill",path:false,attr:false})}U.push({section:"Series",serie:C,subSection:"Plot",path:false,attr:false,mousearea:"paths"});if(F.type=="line"){U.push({section:"Series",serie:C,subSection:"Dot",path:false,attr:false})}}}a.beforeShow(o,U);b.show(o,U);a.afterShow(o,U);return U},grid:function(l,aa){if(b.executeIfChanged(l,["values","series","axis","labels","margins","width","height","features.grid"])){var C=l.opt;var I=l.opt.features.grid;var d=l.paper;var E=l.axis;var r=l.opt.labels;var w=(C.width-C.margins[3]-C.margins[1])/(r.length>1?r.length-1:1);var V=(C.width-C.margins[3]-C.margins[1])/(r.length>0?r.length:1);var Z,Y,Q,P,G,W,U,f,J,o;var L=[];var m=I.labelsCenter;if(m=="auto"){m=(l.indexCenter=="bar")}if(E.x&&E.x.props.labels){var H=false;var u=E.x.props.labelsAnchor||"auto";if(u=="auto"){u=E.x.props.labelsRotate>0?"start":(E.x.props.labelsRotate==0?"middle":"end")}var ab=E.x.props.labelsPos||"auto";if(ab=="auto"){ab=m?(E.x.props.labelsRotate==0?u:"middle"):"start"}for(Z=0;Z<r.length;Z++){if((typeof r[Z]!="boolean"&&r[Z]!=null)||r[Z]){if(!E.x.props.labelsSkip||Z>=E.x.props.labelsSkip){J=r[Z];if(E.x.props.labelsFormatHandler){J=E.x.props.labelsFormatHandler(J)}o=(E.x.props.prefix?E.x.props.prefix:"")+J+(E.x.props.suffix?E.x.props.suffix:"");W=C.margins[3]+Z*(m?V:w)+(E.x.props.labelsMargin?E.x.props.labelsMargin:0);if(ab=="middle"){W+=(m?V:w)/2}if(ab=="end"){W+=(m?V:w)}U=C.height-C.margins[2]+E.x.props.labelsDistance;f=d.text(W,U,o).attr(E.x.props.labelsProps).toBack();f.attr({"text-anchor":u});var h=false;var D=f.getBBox();var ad={x:D.x,y:D.y};var ac={x:D.x+D.width,y:D.y+D.height};var q={x:W,y:U};rotate=function(j,i){var y=j.x*Math.cos(i)-j.y*Math.sin(i),x=j.x*Math.sin(i)+j.y*Math.cos(i);return{x:y,y:x}};collide=function(j,i,ag){xor=function(ai,ah){return(ai||ah)&&!(ai&&ah)};if(j.alpha!=i.alpha){throw"collide doens't support rects with different rotations"}var ae=rotate({x:j.p1.x-ag,y:j.p1.y-ag},-j.alpha);var af=rotate({x:j.p2.x+ag,y:j.p2.y+ag},-j.alpha);var x=rotate({x:i.p1.x-ag,y:i.p1.y-ag},-i.alpha);var y=rotate({x:i.p2.x+ag,y:i.p2.y+ag},-i.alpha);return !xor(Math.min(ae.x,af.x)>Math.max(x.x,y.x),Math.max(ae.x,af.x)<Math.min(x.x,y.x))&&!xor(Math.min(ae.y,af.y)>Math.max(x.y,y.y),Math.max(ae.y,af.y)<Math.min(x.y,y.y))};rotated=function(x,i,ae){translate=function(ag,af){return{x:ag.x+af.x,y:ag.y+af.y}};negate=function(af){return{x:-af.x,y:-af.y}};var y=translate(rotate(translate(x.p1,negate(i)),ae),i);var j=translate(rotate(translate(x.p2,negate(i)),ae),i);return{p1:y,p2:j,alpha:x.alpha+ae}};D=function(y){if(y.alpha==0){return{x:y.p1.x,y:y.p1.y,width:y.p2.x-y.p1.x,height:y.p2.y-y.p1.y}}else{var j=[];j.push({x:0,y:0});j.push({x:y.p2.x-y.p1.x,y:0});j.push({x:0,y:y.p2.y-y.p1.y});j.push({x:y.p2.x-y.p1.x,y:y.p2.y-y.p1.y});var ah=[];ah.left=0;ah.right=0;ah.top=0;ah.bottom=0;for(_px=0;_px<j.length;_px++){var af=j[_px];var ag=parseInt((af.x*Math.cos(y.alpha))+(af.y*Math.sin(y.alpha)));var ae=parseInt((af.x*Math.sin(y.alpha))+(af.y*Math.cos(y.alpha)));ah.left=Math.min(ah.left,ag);ah.right=Math.max(ah.right,ag);ah.top=Math.min(ah.top,ae);ah.bottom=Math.max(ah.bottom,ae)}var x=parseInt(Math.abs(ah.right-ah.left));var i=parseInt(Math.abs(ah.bottom-ah.top));var ag=((y.p1.x+y.p2.x)/2)-x/2;var ae=((y.p1.y+y.p2.y)/2)-i/2;return{x:ag,y:ae,width:x,height:i}}};var X=Raphael.rad(E.x.props.labelsRotate);var K=rotated({p1:ad,p2:ac,alpha:0},q,X);var k=E.x.props.labelsMarginRight?E.x.props.labelsMarginRight/2:0;if(E.x.props.labelsHideCovered&&H&&collide(K,H,k)){f.hide();r[Z]=false}else{h=D(K);if(I.nx=="auto"&&(h.x<0||h.x+h.width>C.width)){f.hide();r[Z]=false}else{H=K}}if(E.x.props.labelsRotate){f.rotate(E.x.props.labelsRotate,W,U).toBack()}L.push({path:[["RELEMENT",f]],attr:false})}}}}aa.push({section:"Axis",serie:"x",subSection:"Label",paths:L});if(E.x&&E.x.props.title){Q=C.margins[3]+Math.floor((C.width-C.margins[1]-C.margins[3])/2);P=C.height-C.margins[2]+E.x.props.titleDistance*(c.browser.msie?E.x.props.titleDistanceIE:1);aa.push({section:"Axis",serie:"x",subSection:"Title",path:[["TEXT",E.x.props.title,Q,P]],attr:E.x.props.titleProps})}else{aa.push({section:"Axis",serie:"x",subSection:"Title",path:false,attr:false})}for(var z in ["l","r"]){Y=["l","r"][z];if(E[Y]&&E[Y].props.labels&&I.ny){L=[];for(Z=E[Y].props.labelsSkip?E[Y].props.labelsSkip:0;Z<=I.ny;Z++){var t=(C.height-C.margins[2]-C.margins[0])/I.ny;if(Y=="r"){W=C.width-C.margins[1]+E[Y].props.labelsDistance;if(!E[Y].props.labelsProps["text-anchor"]){E[Y].props.labelsProps["text-anchor"]="start"}}else{W=C.margins[3]-E[Y].props.labelsDistance;if(!E[Y].props.labelsProps["text-anchor"]){E[Y].props.labelsProps["text-anchor"]="end"}}if(E[Y].props.labelsAnchor&&E[Y].props.labelsAnchor!="auto"){E[Y].props.labelsProps["text-anchor"]=E[Y].props.labelsAnchor}J=(E[Y].min+(Z*((E[Y].max-E[Y].min)/I.ny)));if(E[Y].normalizationBase){J=Math.round(J/E[Y].normalizationBase)/(1/E[Y].normalizationBase)}if(E[Y].props.labelsFormatHandler){J=E[Y].props.labelsFormatHandler(J)}if(E[Y].props.labelsCompactUnits){J=b.compactUnits(J,E[Y].props.labelsCompactUnits)}o=(E[Y].props.prefix?E[Y].props.prefix:"")+J+(E[Y].props.suffix?E[Y].props.suffix:"");U=C.height-C.margins[2]-Z*t;L.push({path:[["TEXT",o,W,U+(E[Y].props.labelsMargin?E[Y].props.labelsMargin:0)]],attr:E[Y].props.labelsProps})}aa.push({section:"Axis",serie:Y,subSection:"Label",paths:L})}else{aa.push({section:"Axis",serie:Y,subSection:"Label",paths:[]})}if(E[Y]&&E[Y].props.title){if(Y=="r"){Q=C.width-C.margins[1]+E[Y].props.titleDistance*(c.browser.msie?E[Y].props.titleDistanceIE:1)}else{Q=C.margins[3]-E[Y].props.titleDistance*(c.browser.msie?E[Y].props.titleDistanceIE:1)}var B=b._clone(E[Y].props.titleProps);B.rotation=Y=="l"?270:90;aa.push({section:"Axis",serie:Y,subSection:"Title",path:[["TEXT",E[Y].props.title,Q,C.margins[0]+Math.floor((C.height-C.margins[0]-C.margins[2])/2)]],attr:B})}else{aa.push({section:"Axis",serie:Y,subSection:"Title",path:false,attr:false})}}if(I.nx||I.ny){var R=[],A=[],n=[],T=I.nx=="auto"?(m?r.length:r.length-1):I.nx,S=I.ny,g=(C.height-C.margins[2]-C.margins[0])/(S?S:1),p=(C.width-C.margins[1]-C.margins[3])/(T?T:1),O=typeof I.forceBorder=="object"?I.forceBorder[3]:I.forceBorder,N=typeof I.forceBorder=="object"?I.forceBorder[1]:I.forceBorder,v=typeof I.forceBorder=="object"?I.forceBorder[0]:I.forceBorder,s=typeof I.forceBorder=="object"?I.forceBorder[2]:I.forceBorder,M=S>0?(typeof I.draw=="object"?I.draw[0]:I.draw):false,F=T>0?typeof I.draw=="object"?I.draw[1]:I.draw:false;if(S>0){for(Z=0;Z<S+1;Z++){if(v&&Z==0||s&&Z==S||M&&Z>0&&Z<S){R.push(["M",C.margins[3]-I.extra[3],C.margins[0]+Math.round(Z*g)]);R.push(["L",C.width-C.margins[1]+I.extra[1],C.margins[0]+Math.round(Z*g)])}if(Z<S){if(Z%2==0&&I.evenHProps||Z%2==1&&I.oddHProps){A.push({path:[["RECT",C.margins[3]-I.extra[3],C.margins[0]+Math.round(Z*g),C.width-C.margins[1]+I.extra[1],C.margins[0]+Math.round((Z+1)*g)]],attr:Z%2==0?I.evenHProps:I.oddHProps})}else{A.push({path:false,attr:false})}}}}for(Z=0;Z<T+1;Z++){if(O&&Z==0||N&&Z==T||F&&((I.nx!="auto"&&Z>0&&Z<T)||(I.nx=="auto"&&(typeof r[Z]!="boolean"||r[Z])))){R.push(["M",C.margins[3]+Math.round(Z*p),C.margins[0]-I.extra[0]]);R.push(["L",C.margins[3]+Math.round(Z*p),C.height-C.margins[2]+I.extra[2]])}if(Z<T){if(Z%2==0&&I.evenVProps||Z%2==1&&I.oddVProps){n.push({path:[["RECT",C.margins[3]+Math.round(Z*p),C.margins[0]-I.extra[0],C.margins[3]+Math.round((Z+1)*p),C.height-C.margins[2]+I.extra[2],]],attr:Z%2==0?I.evenVProps:I.oddVProps})}else{n.push({path:false,attr:false})}}}aa.push({section:"Grid",path:R.length?R:false,attr:R.length?I.props:false});aa.push({section:"GridBandH",paths:A});aa.push({section:"GridBandV",paths:n});var e=[];if(I.ticks.active&&(typeof I.ticks.active!="object"||I.ticks.active[0])){for(Z=0;Z<T+1;Z++){if(I.nx!="auto"||typeof r[Z]!="boolean"||r[Z]){e.push(["M",C.margins[3]+Math.round(Z*p),C.height-C.margins[2]-I.ticks.size[1]]);e.push(["L",C.margins[3]+Math.round(Z*p),C.height-C.margins[2]+I.ticks.size[0]])}}}if(I.ticks.active&&(typeof I.ticks.active!="object"||I.ticks.active[1])){for(Z=0;Z<S+1;Z++){e.push(["M",C.margins[3]-I.ticks.size[0],C.margins[0]+Math.round(Z*g)]);e.push(["L",C.margins[3]+I.ticks.size[1],C.margins[0]+Math.round(Z*g)])}}if(I.ticks.active&&(typeof I.ticks.active!="object"||I.ticks.active[2])){for(Z=0;Z<S+1;Z++){e.push(["M",C.width-C.margins[1]-I.ticks.size[1],C.margins[0]+Math.round(Z*g)]);e.push(["L",C.width-C.margins[1]+I.ticks.size[0],C.margins[0]+Math.round(Z*g)])}}aa.push({section:"Ticks",path:e.length?e:false,attr:e.length?I.ticks.props:false})}}}}})(jQuery);(function(c){var a=c.elycharts.featuresmanager;var b=c.elycharts.common;c.elycharts.pie={init:function(d){},draw:function(E){var e=E.opt;var p=E.opt.width;var C=E.opt.height;var t=E.opt.r?E.opt.r:Math.floor((p<C?p:C)/2.5);var g=E.opt.cx?E.opt.cx:Math.floor(p/2);var f=E.opt.cy?E.opt.cx:Math.floor(C/2);var A=0,B,s,v,z,j;for(v in e.values){z={visible:false,total:0,values:[]};E.plots[v]=z;var d=b.areaProps(E,"Series",v);if(d.visible){z.visible=true;A++;z.values=e.values[v];for(B=0,s=z.values.length;B<s;B++){if(z.values[B]>0){j=b.areaProps(E,"Series",v,B);if(typeof j.inside=="undefined"||j.inside<0){z.total+=z.values[B]}}}for(B=0;B<s;B++){if(z.values[B]<z.total*e.valueThresold){z.total=z.total-z.values[B];z.values[B]=0}}}}var u=t/A;var m=-u,k=0;var n=[];for(v in e.values){z=E.plots[v];var y=[];if(z.visible){m+=u;k+=u;var F=E.opt.startAngle,D=0,l=0;if(z.total==0){E.emptySeries=true;j=b.areaProps(E,"Series","empty");y.push({path:[["CIRCLE",g,f,t]],attr:j.plotProps})}else{E.emptySeries=false;for(B=0,s=z.values.length;B<s;B++){var x=z.values[B];if(x>0){j=b.areaProps(E,"Series",v,B);if(typeof j.inside=="undefined"||j.inside<0){F+=l;D=360*x/z.total;l=D}else{D=360*values[j.inside]/z.total*x/values[j.inside]}var o=m,q=k;if(j.r){if(j.r>0){if(j.r<=1){q=m+u*j.r}else{q=m+j.r}}else{if(j.r>=-1){o=m+u*(-j.r)}else{o=m-j.r}}}if(!E.opt.clockwise){y.push({path:[["SLICE",g,f,q,o,F,F+D]],attr:j.plotProps})}else{y.push({path:[["SLICE",g,f,q,o,-F-D,-F]],attr:j.plotProps})}}else{y.push({path:false,attr:false})}}}}else{if(e.values[v]&&e.values[v].length){for(B=0,s=e.values[v].length;B<s;B++){y.push({path:false,attr:false})}}}n.push({section:"Series",serie:v,subSection:"Plot",paths:y,mousearea:"paths"})}a.beforeShow(E,n);b.show(E,n);a.afterShow(E,n);return n}}})(jQuery);


