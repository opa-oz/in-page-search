;(function (document) {
    if (!document) {
        console.error('Page search needs `document` object');
        return;
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global === 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self === 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports = typeof exports === 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && typeof module === 'object' && module && !module.nodeType && module;

// -----------------------------------------------------------------------
    function run(input, insensitive, onlyFirst, async) {
        var excludedNodeNames = ['SCRIPT', 'CANVAS', 'STYLE', 'OBJECT', 'AUDIO', 'VIDEO', '#comment'];
        var targetNodeName = '#text';
        var escapeRegex = /[|\\{}()[\]^$+*?.]/g;
        var _searchFunc = new Function('return false');

        insensitive = !!insensitive;
        onlyFirst = !!onlyFirst;
        async = !!async;

        if (typeof input === 'string') {
            if (insensitive) {
                input = new RegExp(input.replace(escapeRegex, '\\$&'), 'i');
            }

            _searchFunc = byString;
        }

        if (Object.prototype.toString.call(input) === '[object RegExp]') {
            _searchFunc = byRegex;
        }

        return new Promise(function (resolve) {
            var entries = [];
            var _self = this;
            var timeout = null;
            var execFunc = async ? _execAsync : _execInstantly;

            exploreElement(document.body);

            if (!async) {
                return awaitResolve();
            }

            /**
             * Iterate through all child nodes
             * @param {Element} element
             * @returns {*}
             */
            function exploreElement(element) {
                if (onlyFirst && entries.length) {
                    return awaitResolve();
                }

                Array.prototype
                    .slice
                    .call(element.childNodes)
                    .filter(_filterFunc)
                    .forEach(_eachFunc);
            }

            /**
             * Filter iteratee
             * @param {Element} element
             * @returns {boolean}
             * @private
             */
            function _filterFunc(element) {
                return !~excludedNodeNames.indexOf(element.nodeName);
            }

            /**
             * Iteratee
             * @param {Element} element
             * @returns {*}
             * @private
             */
            function _eachFunc(element) {
                if (element.nodeName === targetNodeName && _searchFunc(element.textContent)) {
                    return entries.push(element);
                }

                return execFunc(exploreElement.bind(_self, element));
            }

            /**
             * Resolve promise
             * @returns {*}
             */
            function awaitResolve() {
                return resolve(entries);
            }

            /**
             * Sync executor
             * @param {Function} func
             * @returns {*}
             * @private
             */
            function _execInstantly(func) {
                return func();
            }

            /**
             * Async executor
             * @param {Function} func
             * @returns {number} timeout id
             * @private
             */
            function _execAsync(func) {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(awaitResolve, 100);

                return setTimeout(func, 0);
            }
        });

        /**
         * Check if `text` contains input string
         * @param {string} text
         * @returns {boolean}
         */
        function byString(text) {
            return !!~text.indexOf(input);
        }

        /**
         * Check if `text` match input regexp
         * @param text
         * @returns {boolean}
         */
        function byRegex(text) {
            return input.test(text);
        }
    }

    var search = {
        run: run,
        runAsync: function () {
            return run.call(Array.prototype
                .slice
                .call(arguments, 0, 3)
                .concat(true)
            )
        }
    };


// Some AMD build optimizers, like r.js, check for condition patterns like:
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        // Expose Lodash on the global object to prevent errors when Lodash is
        // loaded by a script tag in the presence of an AMD loader.
        // See http://requirejs.org/docs/errors.html#mismatch for more details.
        // Use `_.noConflict` to remove Lodash from the global object.
        root._search = search;

        // Define as an anonymous module so, through path mapping, it can be
        // referenced as the "underscore" module.
        define(function () {
            return search;
        });
    }
// Check for `exports` after `define` in case a build optimizer adds it.
    else if (freeModule) {
        // Export for Node.js.
        (freeModule.exports = _search)._search = search;
        // Export for CommonJS support.
        freeExports._search = search;
    }
    else {
        // Export to the global object.
        root._search = search;
    }
}).call(this, document);
