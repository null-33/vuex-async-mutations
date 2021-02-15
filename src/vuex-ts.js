"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var vue_1 = __importDefault(require("vue"));
var lodash_1 = __importDefault(require("lodash"));
var vuex_1 = __importStar(require("vuex"));
vue_1["default"].use(vuex_1["default"]);
var createModule = function (proxy, options) {
    var actions = Object.keys(options.actions || {}).reduce(function (acts, key) {
        var _a;
        return (__assign(__assign({}, acts), (_a = {}, _a[key] = function (context, payload) {
            if (payload === void 0) { payload = []; }
            return options.actions[key].apply(proxy, payload);
        }, _a)));
    }, {});
    var mutations = Object.keys(options.mutations || {}).reduce(function (muts, key) {
        var _a;
        return (__assign(__assign({}, muts), (_a = {}, _a[key] = function (state, payload) {
            if (payload === void 0) { payload = []; }
            return options.mutations[key].apply(proxy, payload);
        }, _a)));
    }, {});
    var getters = Object.keys(options.getters || {}).reduce(function (gets, key) {
        var _a;
        return (__assign(__assign({}, gets), (_a = {}, _a[key] = function () { return options.getters[key].apply(proxy); }, _a)));
    }, {});
    var mutationsAsync = Object.keys(options.mutationsAsync || {}).reduce(function (muts, key) {
        var _a;
        return (__assign(__assign({}, muts), (_a = {}, _a[key + ":pending"] = function (state, payload) {
            if (payload === void 0) { payload = []; }
            var _a;
            return (_a = options.mutationsAsync[key].pending) === null || _a === void 0 ? void 0 : _a.apply(proxy, payload);
        }, _a[key + ":resolved"] = function (state, payload) {
            if (payload === void 0) { payload = []; }
            var _a;
            return (_a = options.mutationsAsync[key].resolved) === null || _a === void 0 ? void 0 : _a.apply(proxy, payload);
        }, _a[key + ":rejected"] = function (state, payload) {
            if (payload === void 0) { payload = []; }
            var _a;
            return (_a = options.mutationsAsync[key].rejected) === null || _a === void 0 ? void 0 : _a.apply(proxy, payload);
        }, _a[key + ":finally"] = function (state, payload) {
            if (payload === void 0) { payload = []; }
            var _a;
            return (_a = options.mutationsAsync[key]["finally"]) === null || _a === void 0 ? void 0 : _a.apply(proxy, payload);
        }, _a)));
    }, {});
    return {
        state: options.state,
        getters: getters,
        namespaced: true,
        mutations: __assign(__assign({}, mutations), mutationsAsync),
        actions: actions
    };
};
var store;
var injectPath = function (path, modules) {
    if (modules === void 0) { modules = {}; }
    Object.keys(modules).forEach(function (key) {
        if (!modules[key].path) {
            modules[key].path = __spreadArrays(path, [key]);
            injectPath(__spreadArrays(path, [key]), modules[key].modules);
        }
    });
};
var commitAsync = function (mutation, promise, meta) { return __awaiter(void 0, void 0, void 0, function () {
    var r, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mutation.pending(meta);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, promise];
            case 2:
                r = _a.sent();
                mutation.resolved(r, meta);
                return [3 /*break*/, 5];
            case 3:
                e_1 = _a.sent();
                mutation.rejected(e_1, meta);
                return [3 /*break*/, 5];
            case 4:
                mutation["finally"](meta);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/, promise];
        }
    });
}); };
var extend = function (options) {
    var state = options.state || {};
    var mutations = options.mutations || {};
    var mutationsAsync = options.mutationsAsync || {};
    var modules = options.modules || {};
    var getters = options.getters || {};
    var actions = options.actions || {};
    var proxy = __assign({ path: options.path, modules: modules }, modules);
    Object.keys(getters).forEach(function (key) {
        Object.defineProperty(proxy, key, {
            get: function () {
                return store.getters[__spreadArrays(proxy.path, [key]).join('/')];
            }
        });
    });
    Object.keys(state).forEach(function (key) {
        Object.defineProperty(proxy, key, {
            get: function () {
                return lodash_1["default"].get(store.state, __spreadArrays(proxy.path, [key]));
            },
            set: function (val) {
                vue_1["default"].set(proxy.path.length ? lodash_1["default"].get(store.state, proxy.path) : store.state, key, val);
            }
        });
    });
    Object.keys(actions).forEach(function (key) {
        Object.defineProperty(proxy, key, {
            value: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return store.dispatch(__spreadArrays(proxy.path, [key]).join('/'), args);
            }
        });
    });
    Object.keys(mutations).forEach(function (key) {
        Object.defineProperty(proxy, key, {
            value: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return store.commit(__spreadArrays(proxy.path, [key]).join('/'), args);
            }
        });
    });
    Object.keys(mutationsAsync).forEach(function (key) {
        Object.defineProperty(proxy, key, {
            value: {
                pending: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return store.commit(__spreadArrays(proxy.path, [key + ":pending"]).join('/'), args);
                },
                resolved: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return store.commit(__spreadArrays(proxy.path, [key + ":resolved"]).join('/'), args);
                },
                rejected: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return store.commit(__spreadArrays(proxy.path, [key + ":rejected"]).join('/'), args);
                },
                "finally": function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return store.commit(__spreadArrays(proxy.path, [key + ":finally"]).join('/'), args);
                }
            }
        });
    });
    Object.defineProperty(proxy, '$store', {
        get: function () {
            return store;
        }
    });
    Object.defineProperty(proxy, 'commitAsync', {
        get: function () {
            return commitAsync;
        }
    });
    Object.assign(proxy, createModule(proxy, options));
    if (options.path) {
        injectPath(options.path, modules);
    }
    return proxy;
};
var rootModule = extend({
    state: {
        propA: "propA",
        propB: "propB",
        propC: []
    },
    modules: {
        moduleA: extend({
            state: {
                propA: 'moduleA.propA',
                propB: "moduleA.propB"
            },
            modules: {
                moduleB: extend({
                    getters: {
                        getterA: function () {
                            return 'moduleA.moduleB.getterA';
                        }
                    },
                    actions: {
                        actionA: function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    console.log('moduleA.moduleB.actionA()');
                                    return [2 /*return*/];
                                });
                            });
                        }
                    }
                })
            },
            getters: {
                getterA: function () {
                    return 'moduleA.getterA';
                }
            },
            actions: {
                actionA: function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, this.propA];
                        });
                    });
                }
            }
        })
    },
    mutations: {
        mutationA: function () {
            this.propA = "blarp";
        },
        asyncMutationA: function (a, id) {
            this.propA = a;
        }
    },
    mutationsAsync: {
        asyncMutationB: {
            pending: function (_a) {
                var b = _a[0], c = _a[1];
                //
            },
            resolved: function (a, _a) {
                var b = _a[0], c = _a[1];
                console.log(this.propA);
                // this.propA = a;
            }
        },
        asyncMutationC: {
            rejected: function (e) {
                //
            }
        }
    },
    getters: {
        getterA: function () {
            return 'asdfasdf:' + scopedStore.root.propA;
            // return this.moduleA.getterA;
        },
        getterB: function () {
            return this.getterC;
        },
        getterC: function () {
            return this.propA;
        }
    },
    actions: {
        actionA: function (x, y) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, { x: x, y: y }];
                });
            });
        },
        actionB: function (x, y) {
            var result = this.commitAsync(this.asyncMutationB, Promise.resolve("result of the promise"), ["asdf", 3]);
            console.log(result);
            var r = this.$store.dispatch('rootModule/actionA', [x, y]);
            return r;
        }
    }
});
function createStore(rootModule) {
    var root = extend(rootModule);
    return {
        store: new vuex_1.Store(__assign(__assign({}, root), { plugins: rootModule.plugins })),
        root: root
    };
}
exports.createStore = createStore;
var scopedStore = createStore({
    state: {
        propA: 'root.propA',
        propB: {
            fieldA: 'asdf',
            fieldB: {
                fieldC: 'asdf',
                fieldD: {
                    fieldE: 'asdf'
                }
            }
        }
    },
    modules: {
        rootModule: rootModule
    },
    path: [],
    getters: {
        getterA: function () {
            return this.propA;
        }
    },
    mutationsAsync: {
        asyncMutationB: {
            pending: function (_a) {
                var b = _a[0], c = _a[1];
                //
            },
            resolved: function (a, _a) {
                var b = _a[0], c = _a[1];
                console.log(this.propA);
                this.propA = a;
            }
        }
    },
    actions: {
        actionA: function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log('root.actionA()');
                            return [4 /*yield*/, this.commitAsync(this.asyncMutationB, Promise.resolve("result of the promise"), ["asdf", 3])];
                        case 1:
                            result = _a.sent();
                            console.log(result);
                            console.log(this.propA, this.getterA);
                            return [2 /*return*/];
                    }
                });
            });
        }
    },
    plugins: [
        function (sstore) { return store = sstore; }
    ]
});
scopedStore.root.actionA();
var result = rootModule.actionB(5, 7);
