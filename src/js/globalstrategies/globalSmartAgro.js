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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define(["require", "exports", "../lib/defaultGlobalStrategiesMethods", "../strategies/cacheUnitSingleStrategy"], function (require, exports, defaultGlobalStrategiesMethods_1, cacheUnitSingleStrategy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SmartAgro = (function (_super) {
        __extends(SmartAgro, _super);
        function SmartAgro(props) {
            var _this = _super.call(this, props) || this;
            _this.ai_units = [];
            _this.unit_collection = props.unit_collection;
            _this.ai_units = props.ai_units;
            _this.scene = props.scene;
            _this.global_cache = {};
            _this.view = props.view;
            return _this;
        }
        SmartAgro.prototype.choseTurnUnits = function (ai_units) {
            var _this = this;
            var friends, reverse = false;
            ai_units.forEach(function (element) {
                if (_this.isArchers(element)) {
                    friends = _this.getFriendsInField(element, 2);
                    friends.forEach(function (near_friend) {
                        if (!_this.isArchers(near_friend) && (near_friend.y == element.y)) {
                            reverse = true;
                        }
                    });
                }
            });
            return reverse ? __spreadArrays(ai_units).reverse() : ai_units;
        };
        SmartAgro.prototype.assessment = function (cache) {
            var _this = this;
            if (cache === void 0) { cache = {}; }
            var result = 1000, min_health = 200, enemies_near_4, enemies_near_3, best_enemie, cache_enemies;
            this.ai_units.forEach(function (curent_unit) {
                if (curent_unit.person.health < 30) {
                    result -= 400;
                }
                if (curent_unit.person.health < 20) {
                    result -= 700;
                }
                result += (5 - _this.unit_collection.getCountEnemy()) * 300;
                enemies_near_4 = _this.getEnemyInField({ x: curent_unit.x, y: curent_unit.y }, 6);
                enemies_near_4.forEach(function (enemie) {
                    if (enemie.person.class == "archer") {
                        result += 500;
                    }
                    else {
                        result += 300;
                    }
                    if (curent_unit.person.class == "archer") {
                        result += 10 * Math.abs(80 - enemie.person.health);
                    }
                    else {
                        result += 8 * Math.abs(80 - enemie.person.health);
                    }
                });
                enemies_near_3 = _this.getEnemyInField({ x: curent_unit.x, y: curent_unit.y }, 6);
                if (curent_unit.isArchers()) {
                    cache_enemies = _this.getEnemyInField({
                        x: curent_unit.person.x,
                        y: curent_unit.person.y
                    }, 5);
                    if (cache_enemies.length > 0) {
                        cache_enemies = _this.deleteEqualEnemyFromCache(cache_enemies, cache.units_purpose);
                        if (cache_enemies.length > 0) {
                            best_enemie = _this.getBestEnemie(cache_enemies, curent_unit);
                        }
                        else {
                            best_enemie = _this.findNearestEnemies(curent_unit);
                        }
                    }
                    else {
                        best_enemie = _this.findNearestEnemies(curent_unit);
                    }
                    console.log("countEnemyWnenMoveToEnemy => ", _this.countEnemyWnenMoveToEnemy(curent_unit, best_enemie));
                    result += 200 * _this.countEnemyWnenMoveToEnemy(curent_unit, best_enemie);
                    cache.units_purpose.push({ enemie: best_enemie, id: curent_unit.person.id });
                }
                else {
                    if (enemies_near_3.length > 0) {
                        best_enemie = _this.getBestEnemie(enemies_near_3, curent_unit);
                        cache.units_purpose.push({ enemie: best_enemie, id: curent_unit.person.id });
                        if (_this.getDistanceBetweenUnits(best_enemie, curent_unit) < 3) {
                            result += 500;
                        }
                        else {
                            console.log("countEnemyWnenMoveToEnemy => ", _this.getAllDangersEnemyBetweenUnits(curent_unit, best_enemie));
                            result -= 200 * _this.getAllDangersEnemyBetweenUnits(curent_unit, best_enemie);
                        }
                        if (best_enemie.person.health > curent_unit.person.health) {
                            result -= 300;
                        }
                        else {
                            result += 300;
                        }
                    }
                }
            });
            console.log("Smart Agro", Math.round(result));
            return { total: Math.round(result), cache: cache };
        };
        SmartAgro.prototype.startMove = function (cache_unit, index) {
            var _this = this;
            var unit = cache_unit[index];
            var cache_enemies = [], best_enemie = {}, ChoosenStrategy;
            best_enemie = this.getEnemieFromCachePurpose(this.global_cache.units_purpose, unit.person.id);
            if (!best_enemie) {
                cache_enemies = this.getEnemyInField({
                    x: unit.person.x,
                    y: unit.person.y
                }, 5);
                if (cache_enemies.length > 0) {
                    best_enemie = this.getBestEnemie(cache_enemies, unit);
                }
                else {
                    best_enemie = this.findNearestEnemies(unit);
                }
            }
            else {
                best_enemie = best_enemie.enemie;
            }
            if (cache_unit[index].person.class == "fighter") {
                ChoosenStrategy = this.getStrategyByName(cacheUnitSingleStrategy_1.cacheFighterAI, "FightIfYouCan");
            }
            else {
                ChoosenStrategy = this.getStrategyByName(cacheUnitSingleStrategy_1.cacheArcherAI, "AtackTheArcher");
            }
            var ai = new ChoosenStrategy({
                scene: this.scene,
                view: this.view,
                unit_collection: this.unit_collection,
                unit: unit,
                global_cache: this.global_cache
            });
            ai.atackeChosenUnit(cache_unit, best_enemie).then(function () {
                if (index < cache_unit.length - 1) {
                    _this.startMove(cache_unit, index + 1);
                }
            });
        };
        SmartAgro.prototype.start = function (cache) {
            this.global_cache = cache;
            this.ai_units = this.sortArchersFirst(this.ai_units);
            this.ai_units = this.choseTurnUnits(this.ai_units);
            this.startMove(this.ai_units, 0);
        };
        return SmartAgro;
    }(defaultGlobalStrategiesMethods_1.DefaultGlobalMethodsStrategy));
    exports.SmartAgro = SmartAgro;
});
