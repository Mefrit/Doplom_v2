define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultMethodsStrategy = void 0;
    var DefaultMethodsStrategy = (function () {
        function DefaultMethodsStrategy(props) {
            var _this = this;
            this.getNeighbors = function (coord, type) {
                if (type === void 0) { type = "figter"; }
                var res = [];
                res = _this.getPointsField(coord, 2);
                res.push({ x: _this.unit.x, y: _this.unit.y });
                return res;
            };
            this.moveAutoStepStupid = function (unit, obj2go, type) {
                if (type === void 0) { type = "fighter"; }
                var pointsNear, res = { findEnime: false, enemie: obj2go, type: type };
                var current = { id: 0, x: unit.person.x, y: unit.person.y }, came_from = {}, frontier = [], cost_so_far = [], max_x, max_y, res_check, new_cost, priority, bestPoint, coefProximity = type == "archer" ? 1 : 2;
                came_from[0] = NaN;
                cost_so_far[0] = 0;
                pointsNear = _this.getNeighbors({ x: unit.person.x, y: unit.person.y }, type);
                pointsNear = _this.deleteExcessCoord(pointsNear);
                if (!obj2go.hasOwnProperty("domPerson")) {
                    pointsNear.push({
                        x: unit.x,
                        y: unit.y,
                    });
                }
                pointsNear.forEach(function (next, index, arr) {
                    next.id = unit.person.x + unit.person.y + index;
                    new_cost = cost_so_far[current.id] + 1;
                    if (cost_so_far.indexOf(next.id) == -1 || new_cost < cost_so_far[next.id]) {
                        cost_so_far[next.id] = new_cost;
                        priority = _this.heuristic({ x: obj2go.x, y: obj2go.y }, next, type, []);
                        frontier.push({ next: next, priority: priority });
                        came_from[next.id] = current;
                    }
                });
                bestPoint = frontier[0];
                frontier.forEach(function (element) {
                    if (element.priority <= bestPoint.priority) {
                        if (type == "archer") {
                            bestPoint = element;
                        }
                        else {
                            bestPoint = element;
                        }
                    }
                });
                if (frontier.length > 0) {
                    _this.moveTo(unit, bestPoint.next);
                }
                current = { id: 0, x: unit.person.x, y: unit.person.y };
                res.findEnime = _this.checkPersonNear(current, obj2go, coefProximity);
                if (res.findEnime) {
                    unit.removePrevPoint();
                }
                return res;
            };
            this.moveCarefully = function (unit, obj2go, type, cache) {
                if (cache === void 0) { cache = {}; }
                var pointsNear, res = { findEnime: false, enemie: obj2go, type: type };
                var current = { id: 0, x: unit.person.x, y: unit.person.y }, came_from = {}, frontier = [], cost_so_far = [], new_cost, priority, bestPoint, coefProximity = type == "archer" ? 1 : 2;
                came_from[0] = NaN;
                cost_so_far[0] = 0;
                pointsNear = _this.getNeighbors({ x: unit.person.x, y: unit.person.y }, type);
                pointsNear = _this.deleteExcessCoord(pointsNear);
                if (!obj2go.hasOwnProperty("domPerson")) {
                    pointsNear.push({
                        x: unit.x,
                        y: unit.y,
                    });
                }
                var enemies_near_3;
                if (cache.hasOwnProperty("enemies_near_3")) {
                    enemies_near_3 = cache.enemies_near_3;
                }
                else {
                    enemies_near_3 = _this.getEnemyInField({ x: _this.unit.x, y: _this.unit.y }, 3);
                }
                pointsNear.forEach(function (next, index, arr) {
                    next.id = unit.person.x + unit.person.y + index;
                    new_cost = cost_so_far[current.id] + 1;
                    if (cost_so_far.indexOf(next.id) == -1 || new_cost < cost_so_far[next.id]) {
                        cost_so_far[next.id] = new_cost;
                        switch (type) {
                            case "fighter":
                                priority = _this.heuristic({ x: obj2go.x, y: obj2go.y }, next, type, enemies_near_3);
                                break;
                            case "securityArcher":
                                priority = _this.heuristicSecurityArcher({ x: obj2go.x, y: obj2go.y }, next, type, obj2go.near_archer);
                                break;
                            default:
                                priority = _this.heuristicCarefully({ x: obj2go.x, y: obj2go.y }, next, type, enemies_near_3);
                                break;
                        }
                        frontier.push({ next: next, priority: priority });
                        came_from[next.id] = current;
                    }
                });
                bestPoint = frontier[0];
                frontier.forEach(function (element) {
                    if (element.priority <= bestPoint.priority) {
                        bestPoint = element;
                    }
                });
                if (frontier.length > 0) {
                    _this.moveTo(unit, bestPoint.next);
                }
                current = { id: 0, x: unit.person.x, y: unit.person.y };
                res.findEnime = _this.checkPersonNear(current, obj2go, coefProximity);
                if (res.findEnime) {
                    unit.removePrevPoint();
                }
                return res;
            };
            this.scene = props.scene;
            this.view = props.view;
            this.unit_collection = props.unit_collection;
            this.global_cache = props.global_cache;
            this.unit = props.unit;
        }
        DefaultMethodsStrategy.prototype.moveTo = function (person, coord) {
            person.setCoord(coord.x, coord.y);
            this.unit_collection.updateElement(person);
            this.scene.renderElement(person);
        };
        DefaultMethodsStrategy.prototype.findNearestArchers = function (unit) {
            var min = 1000, nearArcher = undefined, tmp_x, tmp_y, tmp_min = 1000;
            this.unit_collection.getCollection().forEach(function (element) {
                if (element.person.evil && !element.isNotDied() && element.person.class == "archer") {
                    tmp_x = unit.person.x - element.person.x;
                    tmp_y = unit.person.y - element.person.y;
                    tmp_min = Math.sqrt(tmp_x * tmp_x + tmp_y * tmp_y);
                    if (min > tmp_min && (unit.x != element.x || unit.y != element.y)) {
                        min = tmp_min;
                        nearArcher = element;
                    }
                }
            });
            return nearArcher;
        };
        DefaultMethodsStrategy.prototype.getDistanceBetweenUnits = function (unit1, unit2) {
            var tmp_x, tmp_y;
            tmp_x = unit1.x - unit2.x;
            tmp_y = unit1.y - unit2.y;
            return Math.sqrt(tmp_x * tmp_x + tmp_y * tmp_y);
        };
        DefaultMethodsStrategy.prototype.deleteBusyEnemies = function (cache_enemies, units_purpose) {
            var find = false;
            return cache_enemies.filter(function (enemies) {
                units_purpose.forEach(function (elem) {
                    if (elem.enemie.person.id == enemies.person.id) {
                        find = true;
                    }
                });
                if (find) {
                    find = false;
                    return find;
                }
                return true;
            });
        };
        DefaultMethodsStrategy.prototype.checkEnemyInCache = function (id_person, cache_busy_enemies) {
            return cache_busy_enemies.filter(function (element) {
                if (element.id == id_person && !!element.enemie) {
                    return element.enemie;
                }
            });
        };
        DefaultMethodsStrategy.prototype.findNearestEnemies = function (unit, cache_busy_enemies) {
            var _this = this;
            if (cache_busy_enemies === void 0) { cache_busy_enemies = []; }
            var min = 1000, nearEnemies = undefined, tmp_min = 1000;
            var enemy_in_cache = this.checkEnemyInCache(unit.person.id, cache_busy_enemies);
            if (enemy_in_cache.length > 0) {
                return enemy_in_cache[0];
            }
            var unit_collection = this.unit_collection.getUserCollection();
            if (cache_busy_enemies.length > 0 && this.isArchers(unit)) {
                unit_collection = this.deleteBusyEnemies(unit_collection, cache_busy_enemies);
            }
            unit_collection.forEach(function (element) {
                tmp_min = _this.getDistanceBetweenUnits(unit, element);
                if (min > tmp_min) {
                    min = tmp_min;
                    nearEnemies = element;
                }
                else {
                    if (typeof nearEnemies == "undefined") {
                        nearEnemies = element;
                    }
                }
            });
            return nearEnemies;
        };
        DefaultMethodsStrategy.prototype.deleteExcessCoord = function (cahceCoord) {
            var _this = this;
            if (cahceCoord === void 0) { cahceCoord = []; }
            return cahceCoord.filter(function (elem) {
                if (elem.x >= 0 && elem.x < 12) {
                    if (elem.y >= 0 && elem.y < 8) {
                        if (_this.unit.x == elem.x && _this.unit.y == elem.y) {
                            return elem;
                        }
                        if (_this.unit_collection.checkFreeCoord({ x: elem.x, y: elem.y })) {
                            return elem;
                        }
                    }
                }
            });
        };
        DefaultMethodsStrategy.prototype.checkCameFromEmpty = function (cameFrom, point) {
            var res = true;
            cameFrom.forEach(function (element) {
                if (element.x == point.x && element.y == point.y) {
                    res = false;
                }
            });
            return res;
        };
        DefaultMethodsStrategy.prototype.heuristic = function (a, b, type, enemies) {
            if (enemies === void 0) { enemies = []; }
            var res = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
            switch (type) {
                case "archer":
                    if (Math.abs(a.x - b.x) < 4) {
                        res += 10;
                        if (Math.abs(a.x - b.x) < 3) {
                            res += 10;
                        }
                        if (Math.abs(a.x - b.x) < 2) {
                            res += 40;
                        }
                    }
                    else {
                        if (Math.abs(a.x - b.x) > 4) {
                            res += Math.abs(a.x - b.x) + 10;
                        }
                    }
                    if (Math.abs(a.x - b.x) < 1) {
                        res += 0.5;
                    }
                    if (Math.abs(a.y - b.y) < 2) {
                        res += Math.abs(a.y - b.y);
                    }
                    if (Math.abs(a.y - b.y) < 3) {
                        res += Math.abs(a.y - b.y) + 5;
                    }
                    if (Math.abs(a.y - b.y) >= 3) {
                        res += Math.abs(a.y - b.y) + 10;
                    }
                    break;
                default:
                    res += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
                    break;
            }
            return res;
        };
        DefaultMethodsStrategy.prototype.heuristicSecurityArcher = function (a, b, type, near_archer) {
            var res = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
            res += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
            if (b.x == near_archer.x) {
                res += 20;
            }
            if (b.y == near_archer.y) {
                res += 20;
            }
            if (b.x == a.x && b.y == a.y) {
                res -= 60;
            }
            return res;
        };
        DefaultMethodsStrategy.prototype.heuristicCarefully = function (a, b, type, enemies_near_3) {
            var res = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
            switch (type) {
                case "archer":
                    if (Math.abs(a.x - b.x) < 4) {
                        res += 10;
                        if (Math.abs(a.x - b.x) < 3) {
                            res += 10;
                        }
                        if (Math.abs(a.x - b.x) < 2) {
                            res += 40;
                        }
                    }
                    else {
                        if (Math.abs(a.x - b.x) > 4) {
                            res += Math.abs(a.x - b.x) + 10;
                        }
                    }
                    if (Math.abs(a.x - b.x) < 1) {
                        res += 0.5;
                    }
                    if (a.x == b.x) {
                        res -= 10;
                    }
                    if (a.y == b.y) {
                        res -= 10;
                    }
                    if (a.x == b.x && Math.abs(a.y - b.y) > 3) {
                        res -= 10;
                    }
                    if (a.x == b.x && Math.abs(a.y - b.y) > 2) {
                        res -= 20;
                    }
                    if (a.x == b.x && Math.abs(a.y - b.y) > 1) {
                        res -= 40;
                    }
                    if (Math.abs(a.y - b.y) < 2) {
                        res += Math.abs(a.y - b.y);
                    }
                    if (Math.abs(a.y - b.y) < 3) {
                        res += Math.abs(a.y - b.y) + 5;
                    }
                    if (Math.abs(a.y - b.y) >= 3) {
                        res += Math.abs(a.y - b.y) + 10;
                    }
                    break;
                default:
                    res += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
                    enemies_near_3.forEach(function (elem) {
                        if (Math.abs(elem.y - b.y) < 2 && Math.abs(elem.x - b.x) < 2) {
                            res += 1;
                        }
                    });
                    break;
            }
            return res;
        };
        DefaultMethodsStrategy.prototype.checkArchersPosition = function () {
            var _this = this;
            var archers = this.unit_collection.getAiArchers(), result = false;
            archers.forEach(function (archer) {
                if (archer.x == _this.unit.x || _this.unit.y == archer.y) {
                    if (_this.getDistanceBetweenUnits(_this.unit, archer) < 4) {
                        result = true;
                    }
                }
            });
            return result;
        };
        DefaultMethodsStrategy.prototype.deleteExistPointIfArcherNear = function (points, enemie) {
            var _this = this;
            var archers = this.unit_collection.getAiArchers(), result = true;
            return points.filter(function (point) {
                result = true;
                archers.forEach(function (archer) {
                    if (archer.x == point.x || point.y == archer.y) {
                        if (_this.getDistanceBetweenUnits(point, archer) < 4) {
                            result = false;
                        }
                    }
                });
                if (result) {
                    if (parseInt(_this.getDistanceBetweenUnits(point, enemie).toFixed(0)) <= 1.2) {
                        return {
                            point: point,
                        };
                    }
                }
            });
        };
        DefaultMethodsStrategy.prototype.checkArcherPosition = function (enemie) {
            var _this = this;
            var res = { point: { x: enemie.x - 1, y: enemie.y }, result: false }, points = [], min_count = 1000, count_enemy = 0, tmp_res;
            if (parseInt(this.getDistanceBetweenUnits(this.unit, enemie).toFixed(0)) == 2) {
                points = this.getPointsField(this.unit, 1);
            }
            else {
                points = this.getPointsField(enemie, 1);
            }
            points = this.deleteExistPointIfArcherNear(points, enemie);
            if (points.length == 0) {
                res.result = false;
            }
            else {
                res.result = true;
            }
            points.forEach(function (elem) {
                count_enemy = _this.getEnemyInField(elem, 3).length;
                if (min_count > count_enemy) {
                    res.point = elem;
                    min_count = count_enemy;
                }
                else {
                    if (min_count == count_enemy) {
                        if (_this.getEnemyInField(elem, 2).length < _this.getEnemyInField(res.point, 2).length) {
                            res.point = elem;
                        }
                    }
                }
            });
            return res;
        };
        DefaultMethodsStrategy.prototype.checkUnitNotStatyOnArhcersAtacke = function (unit, units_purpose, cache_archers) {
            var result = false;
            units_purpose.forEach(function (element) {
                console.log("result", result);
            });
        };
        DefaultMethodsStrategy.prototype.isArchers = function (unit) {
            return unit.person.class == "archer";
        };
        DefaultMethodsStrategy.prototype.shuffle = function (array) {
            return array.sort(function () { return Math.random() - 0.5; });
        };
        DefaultMethodsStrategy.prototype.checkPersonNear = function (current, person, coefProximity) {
            return Math.abs(current.x - person.x) < coefProximity && Math.abs(current.y - person.y) < coefProximity;
        };
        DefaultMethodsStrategy.prototype.checkFreePointsArcher = function (points, type, curent_unit) {
            if (type === void 0) { type = "fighter"; }
            if (curent_unit === void 0) { curent_unit = this.unit; }
            var res = { free: true, deleteLastPoint: false, runAway: false };
            this.unit_collection.getCollection().forEach(function (unit) {
                for (var i = 0; i < points.length; i++) {
                    if (points[i].x < 0 || points[i].x > 11) {
                        res.free = false;
                    }
                    if (points[i].y < 0 || points[i].y > 8) {
                        res.free = false;
                    }
                    if (unit.x == points[i].x && points[i].y == unit.y) {
                        if (unit.person.id != curent_unit.person.id) {
                            if (!unit.person.evil && Math.abs(unit.x - points[i].x) < 3) {
                                res.runAway = true;
                            }
                            res.free = false;
                        }
                        else {
                            res.deleteLastPoint = true;
                        }
                    }
                }
            });
            return res;
        };
        DefaultMethodsStrategy.prototype.getCoordForArcher = function (unit, enemie) {
            var res_check;
            if (Math.abs(unit.y - enemie.y) <= 2) {
                res_check = this.checkFreeWay2Atack(enemie, this.unit, "x");
                if (res_check.free) {
                    return res_check.arrayPoit;
                }
            }
            if (enemie.y < 4) {
                return { x: enemie.x, y: 0 };
            }
            else {
                return { x: enemie.x, y: 7 };
            }
        };
        DefaultMethodsStrategy.prototype.getPointsField = function (coord_unit, field_step) {
            var cache_points = [];
            for (var i = -field_step; i < field_step + 1; i++) {
                for (var j = -field_step; j < field_step + 1; j++) {
                    cache_points.push({ x: coord_unit.x + i, y: coord_unit.y + j });
                }
            }
            cache_points = this.deleteExcessCoord(cache_points);
            return cache_points;
        };
        DefaultMethodsStrategy.prototype.getCoordForAtacke = function (unit, enemie, type) {
            var _this = this;
            if (type === void 0) { type = "default"; }
            var friend_2 = this.getFriendsInField(unit, 2), enemy = this.findNearestEnemies(unit, []), coord = { x: enemie.x, y: enemie.y - 1 };
            if (friend_2.length > 0) {
                friend_2.forEach(function (element) {
                    if (type == "StayForwardArcher") {
                        if (element.x == unit.x || element.y == unit.y) {
                            if (_this.unit_collection.checkFreeCoord({ x: element.x + 1, y: element.y }) &&
                                _this.getDistanceBetweenUnits({ x: element.x + 1, y: element.y }, enemy) > 1) {
                                coord = { x: element.x + 2, y: element.y };
                            }
                            else {
                                if (_this.unit_collection.checkFreeCoord({ x: element.x, y: element.y + 1 }) &&
                                    _this.getDistanceBetweenUnits({ x: element.x, y: element.y + 1 }, enemy) > 1) {
                                    coord = { x: element.x, y: element.y + 2 };
                                }
                                else {
                                    if (_this.unit_collection.checkFreeCoord({ x: element.x, y: element.y - 1 }) &&
                                        _this.getDistanceBetweenUnits({ x: element.x, y: element.y - 1 }, enemy) > 1) {
                                        coord = { x: element.x, y: element.y - 2 };
                                    }
                                }
                            }
                        }
                    }
                    else {
                        coord = { x: enemie.x + 1, y: enemie.y };
                        if (enemie.x < unit.x) {
                            coord = { x: enemie.x - 1, y: enemie.y };
                        }
                        else {
                            coord = { x: enemie.x + 1, y: enemie.y };
                        }
                    }
                });
            }
            return coord;
        };
        DefaultMethodsStrategy.prototype.getEnemyInField = function (coord_unit, field_step) {
            var _this = this;
            return this.unit_collection.getUserCollection().filter(function (elem) {
                if (_this.getDistanceBetweenUnits(coord_unit, elem) < field_step) {
                    return elem;
                }
            });
        };
        DefaultMethodsStrategy.prototype.getFriendsInField = function (coord_unit, field_step) {
            var _this = this;
            return this.unit_collection.getAICollection().filter(function (elem) {
                if (coord_unit.person.id != elem.person.id && _this.getDistanceBetweenUnits(coord_unit, elem) < field_step) {
                    return elem;
                }
            });
        };
        DefaultMethodsStrategy.prototype.getArchersInField = function (coord_unit, field_step) {
            var _this = this;
            return this.unit_collection.getAICollection().filter(function (elem) {
                if (elem.person.class == "archer") {
                    if (_this.checkPersonNear(coord_unit, elem, field_step)) {
                        return elem;
                    }
                }
            });
        };
        DefaultMethodsStrategy.prototype.randomInteger = function (min, max) {
            var rand = min - 0.5 + Math.random() * (max - min + 1);
            return Math.round(rand);
        };
        DefaultMethodsStrategy.prototype.getNearFriendsUnit = function (unit, cacheUnits) {
            var coord_min = {
                x: cacheUnits[0].x,
                y: cacheUnits[0].y,
            }, hypotenuse_min, hypotenuse_elem;
            cacheUnits.forEach(function (elem) {
                if (unit.x != elem.x && unit.y != elem.y) {
                    hypotenuse_min = coord_min.x * coord_min.x + coord_min.y * coord_min.y;
                    hypotenuse_elem = elem.x * elem.x + elem.y * elem.y;
                    if (hypotenuse_elem < hypotenuse_min) {
                        coord_min.x = elem.x;
                        coord_min.y = elem.y;
                    }
                }
            });
            return coord_min;
        };
        DefaultMethodsStrategy.prototype.checkFreeWay2Atack = function (enemie, unit, direction) {
            if (unit === void 0) { unit = this.unit; }
            if (direction === void 0) { direction = "x"; }
            var arrayPoit = [], sgn = enemie[direction] < unit[direction] ? -1 : 1, tmp, res = { free: false, arrayPoit: [], direction: direction, runAway: false }, coefI;
            tmp = Math.abs(enemie[direction] - unit[direction]);
            if (tmp <= 4) {
                coefI = tmp;
            }
            else {
                return res;
            }
            for (var i = 1; i <= coefI - 1; i++) {
                tmp = direction == "x" ? { x: enemie.x - sgn * i, y: enemie.y } : { x: enemie.x, y: enemie.y - sgn * i };
                arrayPoit.push(tmp);
            }
            tmp = this.checkFreePointsArcher(arrayPoit, "archer", unit);
            res.free = tmp.free;
            res.runAway = tmp.runAway;
            if (tmp.deleteLastPoint) {
                arrayPoit.splice(arrayPoit.length - 1, 1);
            }
            res.arrayPoit = arrayPoit;
            return res;
        };
        return DefaultMethodsStrategy;
    }());
    exports.DefaultMethodsStrategy = DefaultMethodsStrategy;
});
