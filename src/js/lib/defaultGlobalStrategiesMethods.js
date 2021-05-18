var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./defaultMethods"], function (require, exports, defaultMethods_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultGlobalMethodsStrategy = void 0;
    var DefaultGlobalMethodsStrategy = (function (_super) {
        __extends(DefaultGlobalMethodsStrategy, _super);
        function DefaultGlobalMethodsStrategy(props) {
            return _super.call(this, props) || this;
        }
        DefaultGlobalMethodsStrategy.prototype.checkConnection = function () {
            alert("connction");
        };
        DefaultGlobalMethodsStrategy.prototype.deleteBusyEnemies = function (cache_enemies, archers_purpose) {
            var find = false;
            return cache_enemies.filter(function (enemies) {
                archers_purpose.forEach(function (archers_enemies) {
                    if (archers_enemies.person.id == enemies.person.id) {
                        find = true;
                    }
                });
                if (find) {
                    find = false;
                    return false;
                }
                return true;
            });
        };
        DefaultGlobalMethodsStrategy.prototype.getStrategyByName = function (cache_ai, name) {
            var result = {};
            for (var key in cache_ai) {
                if (key == name) {
                    result = cache_ai[key];
                }
            }
            return result;
        };
        DefaultGlobalMethodsStrategy.prototype.sortArchersFirst = function (cacheAi) {
            return cacheAi.sort(function (prev, next) {
                if (prev.person.class == "archer") {
                    return -1;
                }
                else {
                    return 1;
                }
            });
        };
        return DefaultGlobalMethodsStrategy;
    }(defaultMethods_1.DefaultMethodsStrategy));
    exports.DefaultGlobalMethodsStrategy = DefaultGlobalMethodsStrategy;
});
