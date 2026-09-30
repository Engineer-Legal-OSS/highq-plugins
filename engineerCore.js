/* EngineerCore - HighQ plugin library

Copyright (c) 2026 Engineer-Legal-OSS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
/* ngineerCore v5.0.0 */
var $e = jQuery.noConflict();
var highqShadowRoot = document.getElementsByTagName('app-dashboard-builder')[0]?.shadowRoot;

function xmlToObj(x) {
    return engineercore_xmlToObj(x);
}
function getLink(x) {
    return engineercore_getLink(x);
}
function loadDoc(x, c) {
    engineercore_loadDoc(x, c);
}
function getLastModifiedDate(x) {
    return engineercore_getLastModifiedDate(x);
}

function engineercore_getCurrentUserName() {
    return $e('li.dropdown.userMenuBtn > a').attr('data-original-title');
}

function engineercore_getCurrentUserEmail() {
    return $e('li.dropdown.userMenuBtn > ul > li.dropdown-header').text();
}

// Function to call an EngineerLegal Plugin
function engineerLegal(options) {
    if (options.plugin) {
        let uppercasePlugin = options.plugin.charAt(0).toUpperCase() + options.plugin.substr(1);
        let pluginFunction = 'engineer' + uppercasePlugin;
        try {
            if (typeof (window[pluginFunction]()) == 'function') {
                console.log(pluginFunction + ' already loaded - initializing...');
                window[pluginFunction](options);
            }
        } catch (error) {
            engineercore_load(options.plugin).then(function () {
                window[pluginFunction](options);
            });
        }
    } else {
        throw new Error('You must include the name of a plugin to run i.e. plugin: \'table\',');
    }
}

// Async function to load an EngineerLegal library file from the manifest
async function engineercore_load(libname) {
    if (!window.engineerLegalPlugins) {
        window.engineerLegalPlugins = {};
    }
    const pluginManifest = engineercore_getPlugins();
    if (!pluginManifest[libname]) {
        throw new Error(libname + ' not present in engineerLegal-plugins.js - have a System Admin add it to continue');
    }
    let pluginLoaded = window.engineerLegalPlugins[libname];
    let pluginPromise = new Promise(function (loadResolve, loadReject) {
        if (!pluginLoaded) {
            window.engineerLegalPlugins[libname] = {};
            console.log(libname + ' library loading...');
            $e.getScript({
                url: pluginManifest[libname],
                error: function (request, status, errorThrown) {
                    console.error('engineerCore unable to load ' + libname + ', it may be incorrectly referenced in engineerLegal-plugins');
                    loadReject();
                }
            }).done(function () {
                window.engineerLegalPlugins[libname].status = 1;
                console.log(libname + ' Loaded');
                loadResolve();
            });
        } else if (pluginLoaded.status == 1) {
            loadResolve();
        } else {
            let attemptCount = 0;
            let pluginPoll = setInterval(() => {
                if (pluginLoaded.status == 1) {
                    clearInterval(pluginPoll);
                    loadResolve();
                } else {
                    console.log('Awaiting ' + libname + ' load');
                    attemptCount++;
                    if (attemptCount > 20) {
                        clearInterval(pluginPoll);
                        loadReject();
                    }
                }
            }, 50);
        }
    });
    let status = await pluginPromise;
    return status;
}

// Get EngineerLegal plugin manifest
function engineercore_getPlugins() {
    try {
        return engineerLegal_getPlugins();
    } catch (error) {
        throw new Error('Unable to locate engineerLegal-plugins file - ensure its "flag" URL is referenced in this section');
    }
}

// Get EngineerMap templates manifest
function engineercore_getMaps() {
    try {
        return engineerLegal_getMaps();
    } catch (error) {
        console.error('Unable to locate engineerLegal-plugins file - ensure its "flag" URL is referenced in this section');
    }
}

// Get data from cache
function engineercore_getCache(key) {
    try {
        let cache = window.engineerLegalPlugins.cachedData[key];
        return cache;
    } catch (error) {
        console.error('Unable to access cache - ensure engineerLegal-plugins file is properly configured with a "cachedData" object');
        return null;
    }
}

// Parse HighQ iSheet XML into JSON
function engineercore_xmlToObj(xmlDoc) {
    let tags = ['property', 'item', 'headColumn', 'row', 'column', 'lookupuser', 'choice'];
    function isArray(o) {
        return Object.prototype.toString.apply(o) === '[object Array]';
    }
    function parseNode(xmlNode, result) {
        if (xmlNode.nodeName == '#cdata-section' || xmlNode.nodeType > 2) {
            let v = '';
            for (const node of xmlNode.parentNode.childNodes) {
                v = v + node.nodeValue;
            }
            if (v.trim()) {
                result.cdata = v;
            }
            return;
        }
        let jsonNode = {};
        let existing = result[xmlNode.nodeName];
        if (existing) {
            if (!isArray(existing)) {
                result[xmlNode.nodeName] = [existing, jsonNode];
            } else {
                result[xmlNode.nodeName].push(jsonNode);
            }
        } else if (tags) {
            if (tags.indexOf(xmlNode.nodeName) != -1) {
                result[xmlNode.nodeName] = [jsonNode];
            } else {
                result[xmlNode.nodeName] = jsonNode;
            }
        }
        if (xmlNode.attributes) {
            let length = xmlNode.attributes.length;
            for (let i = 0; i < length; i++) {
                let attribute = xmlNode.attributes[i];
                jsonNode[attribute.nodeName] = attribute.nodeValue;
            }
        }
        let length = xmlNode.childNodes.length;
        for (let i = 0; i < length; i++) {
            parseNode(xmlNode.childNodes[i], jsonNode);
        }
    }
    let result = {};
    let parser = new DOMParser();
    let xml = parser.parseFromString(xmlDoc, 'text/xml');
    for (const child of xml.childNodes) {
        parseNode(child, result);
    }
    return result;
}

//Construct an iSheet XML export link from the dynamic iSheet link created in the CKEditor
function engineercore_getLink(locationId) {
    let $location = $e('#' + locationId);
    let $highqPanel = $location.closest('.ckContentArea');
    let $highqLink;
    if ($highqPanel) {
        $highqLink = $highqPanel.find('a.engineerLink');
    }
    if ($highqLink.length < 1) {
        $highqLink = $location.find('a.CKContextLink');
        if ($highqLink.length < 1) {
            $highqLink = $highqPanel.find('a.CKContextLink');
        }
    }
    if ($highqLink.attr('href')) {
        let viewLink = window.location.protocol + '//' + window.location.hostname + '/' + window.location.pathname.split('/')[1] + '/' + $highqLink.attr('href').replace('sheetHome', 'sheetViewExportXML') + '&metaData.isheetExportType=xml';
        return viewLink;
    } else {
        return null;
    }
}

//Construct an iSheet XML export link from the iSheet link denoted by a specfic class
function engineercore_getLinkByClass(classname) {
    let $highqLink;
    $highqLink = $e('a.' + classname);
    if ($highqLink.attr('href')) {
        let viewLink = window.location.protocol + '//' + window.location.hostname + '/' + window.location.pathname.split('/')[1] + '/' + $highqLink.attr('href').replace('sheetHome', 'sheetViewExportXML') + '&metaData.isheetExportType=xml';
        return viewLink;
    } else {
        return null;
    }
}

//Checks to see if the request needs to be cache cleared to work after HighQ 5.7
function engineercore_loadDoc(url, callback) {
    if (url.includes('sheetViewExportXML')) {
        engineercore_clearHighQExportCache(url, callback);
    } else {
        engineercore_getRequest(url, callback);
    }
}

//Clears HighQs cached isheet search results before attempting to get isheet xml data
function engineercore_clearHighQExportCache(url, callback) {
    let xmlLink = new URL(url.replace('sheetViewExportXML', 'isheetGrid'));
    xmlLink.searchParams.delete('metaData.isheetExportType');
    xmlLink.searchParams.append('injectSheetView', 'false');
    xmlLink.searchParams.append('metaData.itemId', '-1');
    xmlLink.searchParams.append('advanceSearch', 'false');
    engineercore_getRequest(xmlLink.toString(), function () {
        engineercore_getRequest(url, callback);
    });
}

//Open an iSheet modal and search for a value in the iSheet
function engineercore_searchiSheet(url, value, windowWidth, windowHeight) {
    if (!windowHeight) {
        windowHeight = 300;
    }
    if (!windowWidth) {
        windowWidth = 300;
    }
    let windowFeatures = 'width=' + windowWidth + ',height=' + windowHeight + ',top=100,left=100,popup';
    let xmlLink = new URL(url.replace('sheetViewExportXML', 'sheetHome'));
    xmlLink.searchParams.delete('metaData.isheetExportType');
    xmlLink.searchParams.append('injectSheetView', 'false');
    xmlLink.searchParams.append('advanceSearch', 'true');
    return window.open(xmlLink.toString() + '&allSearch=' + encodeURIComponent(value), '_blank', windowFeatures);
}


//Caches a new isheet search result before attempting to get isheet xml data containing only those results
function engineercore_preSearch(url, value, callback) {
    let searchWin = engineercore_searchiSheet(url, value, 300, 300);
    let preSearchURL = new URL(url);
    preSearchURL.searchParams.append('advanceSearch', 'true');
    let searchPoll = setInterval(() => {
        try {
            if (searchWin.$j('#gridbox_body').length > 0 || searchWin.$j('.wj-flexgrid').length > 0) {
                clearInterval(searchPoll);
                engineercore_getRequest(preSearchURL.toString(), callback);
                searchWin.close();
            }
        } catch (error) {
            console.log('Awaiting search window...');
        }
    }, 500);
}

//AJAX request that gets a document and then returns the document contents or triggers a callback if specified
function engineercore_getRequest(url, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', url, true);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            callback(xhttp.response);
        } else if (this.readyState == 4 && this.status != 200) {
            console.log('engineerCore: Unable to locate required resource - ' + this.status);
            callback();
            return;
        }
    };
    xhttp.send();
}

function engineercore_parseColorToRgb(color) {
    if (!color) return null;
    color = color.toString().trim();
    // hex formats: #RGB, #RRGGBB, #RRGGBBAA, #RGBA
    if (color[0] === '#') {
        let hex = color.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map(h => h + h).join('');
        } else if (hex.length === 4) {
            // rgba short -> ignore alpha
            hex = hex.split('').map(h => h + h).join('').slice(0, 6);
        } else if (hex.length === 8) {
            // drop alpha
            hex = hex.slice(0, 6);
        } else if (hex.length !== 6) {
            return null;
        }
        const intVal = parseInt(hex, 16);
        return { r: (intVal >> 16) & 255, g: (intVal >> 8) & 255, b: intVal & 255, a: 1 };
    }
    // rgb() or rgba()
    const rgbMatch = color.match(/rgba?\s*\(\s*([^\)]+)\)/i);
    if (rgbMatch) {
        const parts = rgbMatch[1].split(',').map(p => p.trim());
        const r = parseFloat(parts[0]);
        const g = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);
        const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
        return { r: r, g: g, b: b, a: a };
    }
    // named colors or other formats - use computed style
    try {
        const el = document.createElement('div');
        el.style.color = color;
        el.style.display = 'none';
        document.body.appendChild(el);
        const computed = getComputedStyle(el).color;
        el.remove();
        const m = computed.match(/rgba?\s*\(\s*([^\)]+)\)/i);
        if (m) {
            const parts = m[1].split(',').map(p => p.trim());
            return { r: parseFloat(parts[0]), g: parseFloat(parts[1]), b: parseFloat(parts[2]), a: parts[3] !== undefined ? parseFloat(parts[3]) : 1 };
        }
    } catch (e) { }
    return null;
}

function engineercore_getForeground(bgColor) {
    const rgb = engineercore_parseColorToRgb(bgColor || '');
    if (!rgb) return { color: '#000' };
    let r = rgb.r, g = rgb.g, b = rgb.b, a = rgb.a === undefined ? 1 : rgb.a;
    if (a < 1) {
        // blend against white for a conservative estimate
        r = Math.round((1 - a) * 255 + a * r);
        g = Math.round((1 - a) * 255 + a * g);
        b = Math.round((1 - a) * 255 + a * b);
    }
    const srgb = v => {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const R = srgb(r), G = srgb(g), B = srgb(b);
    const lum = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    const contrastWhite = 3 / lum;
    const contrastBlack = lum / 0.05;
    let fg = '#000';
    if (contrastWhite >= contrastBlack) fg = '#fff';
    return { color: fg };
}

//Takes a JavaScript object and returns the most recent last modifed date if that exists
function engineercore_getLastModifiedDate(xmlObj) {
    let lastModifiedDate;
    xmlObj.view.head.headColumn.forEach(getModifiedDateColumn);
    return lastModifiedDate;

    function getModifiedDateColumn(item, index) {
        if (item.columnValue.cdata == 'Modified date') {
            getModifiedDates(index);
            let lastModifiedDateString = lastModifiedDate.toString().split(' ');
            lastModifiedDate = lastModifiedDateString[0] + ' ' + lastModifiedDateString[1] + ' ' + lastModifiedDateString[2] + ' ' + lastModifiedDateString[3];
        }

        function getModifiedDates(column) {
            lastModifiedDate = new Date(xmlObj.view.data.item[0].column[column].rawData.cdata);
            let thisDate;
            xmlObj.view.data.item.forEach(getModifiedDate);
            function getModifiedDate(item) {
                thisDate = new Date(item.column[column].rawData.cdata);
                if (thisDate > lastModifiedDate) {
                    lastModifiedDate = thisDate;
                }
            }
        }
    }
}

//CSS class name builder
function engineercore_safeCSS(name) {
    if (name) {
        return name.replace(/[^a-z0-9]/g, function (s) {
            let c = s.charCodeAt(0);
            if (c == 32) return '-';
            if (c >= 65) if (c <= 90) return '_' + s.toLowerCase();
            return '';
        });
    }
}

// creates a modal window on the page if one doesn't already exist
// take 2 parameters, a title text string and a jQuery body Object
function engineercore_modal(modalTitleText, $bodyContent) {
    if ($e('#engineerModalContainer').length == 0) {
        let $container = $e('<div>')
            .attr('id', 'engineerModalContainer')
            .addClass('container');
        let $modal = $e('<div>')
            .attr('id', 'engineerModal')
            .attr('role', 'dialog')
            .addClass('modal')
            .css({ 'position': 'fixed', 'top': '0px', 'width': '100%' })
            .appendTo($container);
        let $modalDialog = $e('<div>')
            .addClass('modal-dialog modal-lg')
            .appendTo($modal);
        let $modalContent = $e('<div>')
            .addClass('modal-content')
            .appendTo($modalDialog);
        let $modalHeader = $e('<div>')
            .addClass('modal-header')
            .appendTo($modalContent);
        $e('<button>')
            .addClass('close')
            .text('X')
            .css('float', 'right')
            .attr({ 'data-dismiss': 'modal', 'type': 'button' })
            .appendTo($modalHeader);
        $e('<h4>')
            .attr('id', 'engineerModalHeader')
            .css('margin', '0px')
            .text(modalTitleText || '')
            .appendTo($modalHeader);
        $e('<div>')
            .addClass('modal-body')
            .css({ 'overflow': 'auto', 'maxHeight': '857px' })
            .text('Loading...')
            .appendTo($modalContent);
        let $modalFooter = $e('<div>')
            .addClass('modal-footer')
            .appendTo($modalContent);
        $e('<button>')
            .addClass('btn btn-default')
            .text('Close')
            .attr({ 'data-dismiss': 'modal', 'type': 'button' })
            .appendTo($modalFooter);
        $e('body').append($container);
    }
    $e('#engineerModal .modal-body').empty();
    if (modalTitleText) {
        $e('#engineerModalHeader').text(modalTitleText);
    }
    if ($bodyContent) {
        $e('#engineerModal .modal-body').append($bodyContent);
    }
}

/**
* jQuery custom selector that allows to find elements that contain a case insensitive text
*/
jQuery.expr[':'].icontains = function (a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

//download.js v4.2, by dandavis; 2008-2017. [MIT] see http://danml.com/download.html for tests/usage
; (function (r, l) { "function" == typeof define && define.amd ? define([], l) : "object" == typeof exports ? module.exports = l() : r.download = l() })(this, function () { return function l(a, e, k) { function q(a) { var h = a.split(/[:;,]/); a = h[1]; var h = ("base64" == h[2] ? atob : decodeURIComponent)(h.pop()), d = h.length, b = 0, c = new Uint8Array(d); for (b; b < d; ++b)c[b] = h.charCodeAt(b); return new f([c], { type: a }) } function m(a, b) { if ("download" in d) return d.href = a, d.setAttribute("download", n), d.className = "download-js-link", d.innerHTML = "downloading...", d.style.display = "none", document.body.appendChild(d), setTimeout(function () { d.click(), document.body.removeChild(d), !0 === b && setTimeout(function () { g.URL.revokeObjectURL(d.href) }, 250) }, 66), !0; if (/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) return /^data:/.test(a) && (a = "data:" + a.replace(/^data:([\w\/\-\+]+)/, "application/octet-stream")), !window.open(a) && confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.") && (location.href = a), !0; var c = document.createElement("iframe"); document.body.appendChild(c), !b && /^data:/.test(a) && (a = "data:" + a.replace(/^data:([\w\/\-\+]+)/, "application/octet-stream")), c.src = a, setTimeout(function () { document.body.removeChild(c) }, 333) } var g = window, b = k || "application/octet-stream", c = !e && !k && a, d = document.createElement("a"); k = function (a) { return String(a) }; var f = g.Blob || g.MozBlob || g.WebKitBlob || k, n = e || "download", f = f.call ? f.bind(g) : Blob; "true" === String(this) && (a = [a, b], b = a[0], a = a[1]); if (c && 2048 > c.length && (n = c.split("/").pop().split("?")[0], d.href = c, -1 !== d.href.indexOf(c))) { var p = new XMLHttpRequest; return p.open("GET", c, !0), p.responseType = "blob", p.onload = function (a) { l(a.target.response, n, "application/octet-stream") }, setTimeout(function () { p.send() }, 0), p } if (/^data:([\w+-]+\/[\w+.-]+)?[,;]/.test(a)) { if (!(2096103.424 < a.length && f !== k)) return navigator.msSaveBlob ? navigator.msSaveBlob(q(a), n) : m(a); a = q(a), b = a.type || "application/octet-stream" } else if (/([\x80-\xff])/.test(a)) { e = 0; var c = new Uint8Array(a.length), t = c.length; for (e; e < t; ++e)c[e] = a.charCodeAt(e); a = new f([c], { type: b }) } a = a instanceof f ? a : new f([a], { type: b }); if (navigator.msSaveBlob) return navigator.msSaveBlob(a, n); if (g.URL) m(g.URL.createObjectURL(a), !0); else { if ("string" == typeof a || a.constructor === k) try { return m("data:" + b + ";base64," + g.btoa(a)) } catch (h) { return m("data:" + b + "," + encodeURIComponent(a)) } b = new FileReader, b.onload = function (a) { m(this.result) }, b.readAsDataURL(a) } return !0 } });