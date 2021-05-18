// -если персонаж  остался 1, а по близости много врагов

import { DefaultMethodsStrategy } from "../lib/defaultMethods";
export class GoAwayIfManyEnemies extends DefaultMethodsStrategy {
    constructor(props: any) {
        super(props);
        // console.log("\n angry", props);

        this.unit = props.unit;
        // this.coordsEvil = { x: props.result.x, y: props.result.y };
    }
    getInfo() {
        return "GoAwayIfManyEnemies";
    }
    assessment(cache) {
        var result = 200, enemies;
        if (!cache.enemies_near_5) {
            enemies = this.getEnemyInField({ x: this.unit.x, y: this.unit.y }, 5);
            cache.enemies_near_5 = enemies
        }
        result += 150 * cache.enemies_near_5.length;
        console.log("result\n \n \n", Math.round(result));
        return { total: Math.round(result), cache: cache };
        // return Math.floor(Math.random() * Math.floor(100));
    }
    heuristicSave(point, near_enemies, nearest_friend) {

        var priority = 0;
        near_enemies.forEach((elem, index, arr) => {

            priority += (Math.pow(Math.abs(point.x - elem.x), 2) + Math.pow(Math.abs(point.y - elem.y), 2));
            if (Math.abs(point.x - elem.x) < 3 && point.y == elem.y) {
                priority += 10;
            }
            if (Math.abs(point.x - elem.x) < 3 && Math.abs(point.y - elem.y) < 3) {
                priority += 40;
            }
            if (Math.abs(point.x - elem.x) < 2 && Math.abs(point.y - elem.y) < 2) {
                priority += 50;
            }
            if (Math.abs(point.y - elem.y) < 2 && point.x == elem.x) {
                priority += 30;
            }
            if (Math.abs(point.x - this.unit.x) < 2 && Math.abs(point.y - this.unit.y) < 2) {
                priority += 10;
            }
            // priority += 
            // if (Math.abs(point.x - elem.x) < 2) {
            //     priority += 20;
            // }
        });

        if (Math.abs(point.x - nearest_friend.x) == 0) {
            priority -= 1000;
        }
        if (Math.abs(point.y - nearest_friend.y) == 1 && Math.abs(point.x - nearest_friend.x) == 0) {
            priority -= 100;
        }
        // console.log(point.x, "-", Math.pow(Math.abs(point.x - nearest_friend.x), 2) + Math.pow(Math.abs(point.y - nearest_friend.y), 2));
        // alert(Math.pow(Math.abs(point.x - nearest_friend.x), 2) + Math.pow(Math.abs(point.y - nearest_friend.y), 3));
        priority += Math.pow(Math.abs(point.x - nearest_friend.x), 2) + Math.pow(Math.abs(point.y - nearest_friend.y), 3) + 10;
        priority += Math.abs(point.x - nearest_friend.x) * 10;
        return priority;
    }
    // FIX ME, написать метод, позволяющий вернуться к своим самым безопасным путем
    go2friendsSafety(nearest_friend) {
        var near_enemies, points_near, best_point;
        near_enemies = this.getEnemyInField(
            {
                x: this.unit.x,
                y: this.unit.y
            }, 4);

        console.log("near_enemies", near_enemies);
        points_near = this.getNeighbors({ x: this.unit.x, y: this.unit.y });
        console.log("go2friendsSafety s", this.getNeighbors({ x: this.unit.x, y: this.unit.y }));
        points_near = this.deleteExcessCoord(points_near);

        points_near.forEach((elem, index, arr) => {
            elem.priority = this.heuristicSave(elem, near_enemies, nearest_friend);
        });
        best_point = points_near[0];
        // console.log("frontier points=> go2friendsSafety ", points_near);
        points_near.forEach(element => {

            if (element.priority <= best_point.priority) {
                // что бы искал пути, конечно это не панацея в более сложных ситуация фигурка будет тупить
                // написать по нормальному!!!!!
                // if (unit.coordPrevPoint.x != element.next.x && unit.coordPrevPoint.y != element.next.y) {
                // console.log("unit.coordPrevPoint,", unit.coordPrevPoint, element.next);
                best_point = element;
                // }

            }
        });
        console.log(" tbest_point);", best_point);
        if (points_near.length > 0) {
            console.log(" tbest_point);", best_point);
            this.moveTo(this.unit, best_point);
        }
    }
    start(cache) {
        return new Promise((resolve, reject) => {
            var near_friends = this.unit_collection.getAICollection(), nearest_friend;
            if (near_friends.length == 0) {
                //FIX ME убегать тупо
            } else {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  near_friends", near_friends);
                nearest_friend = this.getNearFriendsUnit(this.unit, near_friends);
                this.go2friendsSafety(nearest_friend);
            }
            console.log("nearest_friend", nearest_friend);
            setTimeout(() => { resolve("Promise4") }, 320);
        });
    }
}