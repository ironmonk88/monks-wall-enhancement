import { registerSettings } from "./settings.js";

export let debug = (...args) => {
    if (debugEnabled > 1) console.log("DEBUG: monks-wall-enhancement | ", ...args);
};
export let log = (...args) => console.log("monks-wall-enhancement | ", ...args);
export let warn = (...args) => console.warn("monks-wall-enhancement | ", ...args);
export let error = (...args) => console.error("monks-wall-enhancement | ", ...args);
export let i18n = key => {
    return game.i18n.localize(key);
};
export let setting = key => {
    return game.settings.get("monks-wall-enhancement", key);
};

export class MonksWallEnhancement {
    
    static init() {
        log("initializing");

        MonksWallEnhancement.angleTollerance = 0.4;
        MonksWallEnhancement.distanceCheck = 10;

        MonksWallEnhancement.SOCKET = "module.monks-wall-enhancement";

        registerSettings();

        //Drag points together
        let wallDragStart = function (wrapped, ...args) {
            let result = wrapped(...args);

            let event = args[0];

            let dragtogether = ui.controls.control.tools.find(t => { return t.name == "toggledragtogether" });
            if (dragtogether != undefined && dragtogether.active) {
                MonksWallEnhancement.dragpoints = [];
                let fixed = event.data.fixed;
                let oldcoord = (fixed ? this.coords.slice(0, 2) : this.coords.slice(2, 4));
                if (oldcoord != null) {
                    this.scene.data.walls.forEach(w => {
                        if (w.id != this.id) {
                            if (w.data.c[0] == oldcoord[0] && w.data.c[1] == oldcoord[1])
                                //scene.updateEmbeddedEntity("Wall", { c: [oldcoord[2], oldcoord[3], w.c[2], w.c[3]], _id: w._id }, { ignore: true });
                                MonksWallEnhancement.dragpoints.push({ wall: w.object, fixed: 1 });
                            else if (w.data.c[2] == oldcoord[0] && w.data.c[3] == oldcoord[1])
                                //scene.updateEmbeddedEntity("Wall", { c: [w.c[0], w.c[1], oldcoord[2], oldcoord[3]], _id: w._id }, { ignore: true });
                                MonksWallEnhancement.dragpoints.push({ wall: w.object, fixed: 0 });
                        }
                    });
                }
            }

            return result;
        }
        if (game.modules.get("lib-wrapper")?.active) {
            libWrapper.register("monks-wall-enhancement", "Wall.prototype._onDragLeftStart", wallDragStart, "WRAPPER");
        } else {
            const oldWallDragStart = Wall.prototype._onDragLeftStart;
            Wall.prototype._onDragLeftStart = function (event) {
                return wallDragStart.call(this, oldWallDragStart.bind(this), ...arguments);
            }
        }

        let wallDragMove = function (wrapped, ...args) {
            let event = args[0];
            const { clones, destination, fixed, origin, originalEvent } = event.data;

            let dragtogether = ui.controls.control.tools.find(t => { return t.name == "toggledragtogether" });
            if (dragtogether != undefined && dragtogether.active && MonksWallEnhancement.dragpoints?.length > 0 && clones.length === 1) {
                for (let dragpoint of MonksWallEnhancement.dragpoints) {
                    const w = dragpoint.wall;
                    const pt = [destination.x, destination.y];
                    w.data.c = dragpoint.fixed ? pt.concat(w.coords.slice(2, 4)) : w.coords.slice(0, 2).concat(pt);
                    w._hover = false;
                    w.refresh();
                }
            }

            return wrapped(...args);
        }

        if (game.modules.get("lib-wrapper")?.active) {
            libWrapper.register("monks-wall-enhancement", "Wall.prototype._onDragLeftMove", wallDragMove, "WRAPPER");
        } else {
            const oldWallDragMove = Wall.prototype._onDragLeftMove;
            Wall.prototype._onDragLeftMove = function (event) {
                return wallDragMove.call(this, oldWallDragMove.bind(this), ...arguments);
            }
        }

        let wallDragDrop = function (wrapped, ...args) {
            let result = wrapped(...args);

            let event = args[0];

            const { clones, destination, fixed, originalEvent } = event.data;
            const layer = this.layer;
            const snap = layer._forceSnap || !originalEvent.shiftKey;

            const pt = this.layer._getWallEndpointCoordinates(destination, { snap });

            if (clones.length === 1 && MonksWallEnhancement.dragpoints?.length > 0) {
                for (let dragpoint of MonksWallEnhancement.dragpoints) {
                    const p0 = dragpoint.fixed ? dragpoint.wall.coords.slice(2, 4) : dragpoint.wall.coords.slice(0, 2);
                    const coords = dragpoint.fixed ? pt.concat(p0) : p0.concat(pt);
                    if ((coords[0] === coords[2]) && (coords[1] === coords[3])) {
                        return dragpoint.wall.document.delete(); // If we collapsed the wall, delete it
                    }
                    dragpoint.wall.document.update({ c: coords });
                }
                MonksWallEnhancement.dragpoints = [];
            }

            return result;
        }

        if (game.modules.get("lib-wrapper")?.active) {
            libWrapper.register("monks-wall-enhancement", "Wall.prototype._onDragLeftDrop", wallDragDrop, "WRAPPER");
        } else {
            const oldWallDragDrop = Wall.prototype._onDragLeftDrop;
            Wall.prototype._onDragLeftDrop = function (event) {
                return wallDragDrop.call(this, oldWallDragDrop.bind(this), ...arguments);
            }
        }

        //Freehand draw wall
        let wallLayerLeftClick = async function (wrapped, ...args) {
            let event = args[0];
            const { createState, origin, destination, originalEvent, preview } = event.data;

            let drawwall = ui.controls.control.tools.find(t => { return t.name == "toggledrawwall" });
            let findwall = ui.controls.control.tools.find(t => { return t.name == "findwall" });

            if (drawwall.active && ui.controls.control.activeTool != 'select') {
                if (MonksWallEnhancement.freehandPts == undefined) {
                    MonksWallEnhancement.freehandPts = [{ x: origin.x, y: origin.y }];

                    if (MonksWallEnhancement.gr == undefined) {
                        MonksWallEnhancement.gr = new PIXI.Graphics();
                        this.addChild(MonksWallEnhancement.gr);
                    }
                    //MonksWallEnhancement.gr.beginFill(0xff0000).drawCircle(origin.x, origin.y, 4).endFill();
                } 
            } //else if (findwall.active)
              //  MonksWallEnhancement.createLine(origin);    //Find wall from colour
            else
                return wrapped(...args);
        }

        if (game.modules.get("lib-wrapper")?.active) {
            libWrapper.register("monks-wall-enhancement", "WallsLayer.prototype._onClickLeft", wallLayerLeftClick, "MIXED");
        } else {
            const oldWallLeftClick = WallsLayer.prototype._onClickLeft;
            WallsLayer.prototype._onClickLeft = function (event) {
                return wallLayerLeftClick.call(this, oldWallLeftClick.bind(this), ...arguments);
            }
        }

        let wallLayerDragMove = async function (wrapped, ...args) {
            let event = args[0];
            const { createState, origin, destination, originalEvent, preview } = event.data;

			let drawwall = ui.controls.control.tools.find(t => { return t.name == "toggledrawwall" });
            if (drawwall.active) {
                this.preview.removeChild(preview);
				if (MonksWallEnhancement.freehandPts == undefined) {
                    MonksWallEnhancement.freehandPts = [{ x: origin.x, y: origin.y }];

                    if (MonksWallEnhancement.gr == undefined) {
                        MonksWallEnhancement.gr = new PIXI.Graphics();
                        this.addChild(MonksWallEnhancement.gr);
                    }
					//MonksWallEnhancement.gr.beginFill(0xff0000).drawCircle(origin.x, origin.y, 4).endFill();
					
				} else {
					//log(MonksWallEnhancement.freehandPts, destination);
                    let prevPt = MonksWallEnhancement.freehandPts[MonksWallEnhancement.freehandPts.length - 1];
                    let dist = Math.sqrt(Math.pow(prevPt.x - destination.x, 2) + Math.pow(prevPt.y - destination.y, 2));
					if (dist > MonksWallEnhancement.distanceCheck) {
                        MonksWallEnhancement.freehandPts.push({ x: destination.x, y: destination.y });
                        MonksWallEnhancement.gr.lineStyle(2, 0xff0000).moveTo(prevPt.x, prevPt.y).lineTo(destination.x, destination.y);
					}
				}
			}else
                return wrapped(...args);
        }

        if (game.modules.get("lib-wrapper")?.active) {
            libWrapper.register("monks-wall-enhancement", "WallsLayer.prototype._onDragLeftMove", wallLayerDragMove, "MIXED");
        } else {
            const oldWallDragLeftMove = WallsLayer.prototype._onDragLeftMove;
            WallsLayer.prototype._onDragLeftMove = function () {
                return wallLayerDragMove.call(this, oldWallDragLeftMove.bind(this), ...arguments);
            }
        }

        let wallLayerDragLeftDrop = async function (wrapped, ...args) {
            let event = args[0];
            const { createState, destination, originalEvent, preview } = event.data;

			let drawwall = ui.controls.control.tools.find(t => { return t.name == "toggledrawwall" });
            if (drawwall.active){
                let wallpoints = MonksWallEnhancement.simplify(MonksWallEnhancement.freehandPts, 25);
				const cls = getDocumentClass(this.constructor.documentName);
				const snap = this._forceSnap || !originalEvent.shiftKey;
				let docs = [];

				for (let i = 0; i < wallpoints.length - 1; i++) {
					//const gr = new PIXI.Graphics();
					//gr.beginFill(0x00ff00).drawCircle(wallpoints[i].x, wallpoints[i].y, 4).endFill();
					
					if (i < wallpoints.length - 1) {
						let src = this._getWallEndpointCoordinates({ x: wallpoints[i].x, y: wallpoints[i].y }, { snap });
						let dest = this._getWallEndpointCoordinates({ x: wallpoints[i + 1].x, y: wallpoints[i + 1].y }, { snap });
						let coords = src.concat(dest);
						preview.data.c = coords;

						if ((coords[0] === coords[2]) && (coords[1] === coords[3])) continue;

						//await cls.create(preview.data.toObject(false), { parent: canvas.scene });
						docs.push(preview.data.toObject(false));
					}
				}

				await cls.createDocuments(docs, { parent: canvas.scene });

				this.preview.removeChild(preview);

				return this._onDragLeftCancel(event);
			}else
                return wrapped(...args);
        }

        if (game.modules.get("lib-wrapper")?.active) {
            libWrapper.register("monks-wall-enhancement", "WallsLayer.prototype._onDragLeftDrop", wallLayerDragLeftDrop, "MIXED");
        } else {
            const oldWallDragLeftDrop = WallsLayer.prototype._onDragLeftDrop;
            WallsLayer.prototype._onDragLeftDrop = function () {
                return wallLayerDragLeftDrop.call(this, oldWallDragLeftDrop.bind(this), ...arguments);
            }
        }

        let wallLayerDragLeftCancel = async function (wrapped, ...args) {
            if (MonksWallEnhancement.freehandPts && MonksWallEnhancement.freehandPts.length > 0) {
                MonksWallEnhancement.freehandPts = null;
                this.removeChild(MonksWallEnhancement.gr);
                MonksWallEnhancement.gr = null;
            }
            return wrapped(...args);
        }

        if (game.modules.get("lib-wrapper")?.active) {
            libWrapper.register("monks-wall-enhancement", "WallsLayer.prototype._onDragLeftCancel", wallLayerDragLeftCancel, "MIXED");
        } else {
            const oldWallDragLeftCancel = WallsLayer.prototype._onDragLeftCancel;
            WallsLayer.prototype._onDragLeftCancel = function () {
                return wallLayerDragLeftCancel.call(this, oldWallDragLeftCancel.bind(this), ...arguments);
            }
        }

        //Double-click to split wall
        let wallLayerClickLeft2 = async function (wrapped, ...args) {
            let event = args[0];
            const { createState, origin, destination, originalEvent, preview } = event.data;

            if (setting('allow-doubleclick') && origin) {
                //check to see that I'm somewhere on the line
                let hasWall = false;
                for (let wall of this.controlled) {
                    let a = { x: wall.coords[0], y: wall.coords[1] };
                    let b = { x: wall.coords[2], y: wall.coords[3] };

                    var atob = { x: b.x - a.x, y: b.y - a.y };
                    var atop = { x: origin.x - a.x, y: origin.y - a.y };
                    var len = atob.x * atob.x + atob.y * atob.y;
                    var dot = atop.x * atob.x + atop.y * atob.y;
                    var t = Math.min(1, Math.max(0, dot / len));

                    //dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
                    let point = { x: a.x + atob.x * t, y: a.y + atob.y * t };

                    let dist = Math.sqrt(Math.pow(point.x - origin.x, 2) + Math.pow(point.y - origin.y, 2));

                    log(a, b, origin, point, dist);

                    //log(wall.coords, d1, d2, d, x, y, dist)
                    if (dist < 7) {
                        //split the wall
                        hasWall = true;
                        const cls = getDocumentClass(this.constructor.documentName);
                        let newwall = duplicate(wall.data);
                        delete newwall._id;
                        newwall.c = [point.x, point.y].concat(newwall.c.slice(2, 4));
                        await wall.update({ c: wall.coords.slice(0, 2).concat([point.x, point.y]) });
                        await cls.createDocuments([newwall], { parent: canvas.scene });
                    }
                }
                if(!hasWall)
                    return wrapped(...args);
            } else
                return wrapped(...args);
        }

        if (game.modules.get("lib-wrapper")?.active) {
            libWrapper.register("monks-wall-enhancement", "WallsLayer.prototype._onClickLeft2", wallLayerClickLeft2, "MIXED");
        } else {
            const oldWallLayerClickLeft2 = WallsLayer.prototype._onClickLeft2;
            WallsLayer.prototype._onClickLeft2 = function () {
                return wallLayerClickLeft2.call(this, oldWallLayerClickLeft2.bind(this), ...arguments);
            }
        }
    }

    static simplify(points, tolerance = 20) {
        if (points.length <= 2) return points;

        let getSqSegDist = function(p, p1, p2) {

            var x = p1.x,
                y = p1.y,
                dx = p2.x - x,
                dy = p2.y - y;

            if (dx !== 0 || dy !== 0) {

                var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = p2.x;
                    y = p2.y;

                } else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }

            dx = p.x - x;
            dy = p.y - y;

            return dx * dx + dy * dy;
        }

        let simplifyDPStep = function (points, first, last, sqTolerance, simplified) {
            var maxSqDist = sqTolerance,
                index;

            for (var i = first + 1; i < last; i++) {
                var sqDist = getSqSegDist(points[i], points[first], points[last]);

                if (sqDist > maxSqDist) {
                    index = i;
                    maxSqDist = sqDist;
                }
            }

            if (maxSqDist > sqTolerance) {
                if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
                simplified.push(points[index]);
                if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
            }
        }

        var last = points.length - 1;

        var simplified = [points[0]];
        simplifyDPStep(points, 0, last, tolerance, simplified);
        simplified.push(points[last]);

        return simplified;
    }

    static joinPoints() {
        let findClosePoints = function (point, tollerance = 10) {
            let result = [];
            for (let wall of canvas.walls.controlled) {
                if (wall.coords[0] == point.x && wall.coords[1] == point.y)
                    result.push({ id: wall.id, fixed: true, x: wall.coords[0], y: wall.coords[1], c: wall.coords });
                else if (wall.coords[2] == point.x && wall.coords[3] == point.y)
                    result.push({ id: wall.id, fixed: false, x: wall.coords[2], y: wall.coords[3], c: wall.coords });
                else {
                    let dist = Math.sqrt(Math.pow(point.x - wall.coords[0], 2) + Math.pow(point.y - wall.coords[1], 2));
                    if (dist <= tollerance)
                        result.push({ id: wall.id, fixed: true, x: wall.coords[0], y: wall.coords[1], c: wall.coords });
                    else {
                        dist = Math.sqrt(Math.pow(point.x - wall.coords[2], 2) + Math.pow(point.y - wall.coords[3], 2));
                        if (dist <= tollerance)
                            result.push({ id: wall.id, fixed: false, x: wall.coords[2], y: wall.coords[3], c: wall.coords });
                    }
                }
            }

            return result;
        }

        let allTheSame = function (point, points) {
            for (let pt of points) {
                if (pt.x != point.x || pt.y != point.y)
                    return false;
            }
            return true;
        }

        //join points that are close to each other
        const cls = getDocumentClass(canvas.walls.constructor.documentName);
        for (let wall of canvas.walls.controlled) {
            for (let i = 0; i < 2; i++) {
                let pt = { x: wall.coords[i * 2], y: wall.coords[(i * 2) + 1] };

                //find all points close to this point
                let points = findClosePoints(pt);
                if (points.length > 1) {
                    //if all the points are the same, then ignore this spot
                    if (!allTheSame(pt, points)) {
                        //find the average x and the average y
                        let avgX = 0;
                        let avgY = 0;

                        for (let point of points) {
                            avgX += point.x;
                            avgY += point.y;
                        }

                        let change = [avgX / points.length, avgY / points.length];
                        let updates = [];
                        for (let point of points) {
                            updates.push({ _id: point.id, c: (point.fixed ? change.concat(point.c.slice(2, 4)) : point.c.slice(0, 2).concat(change)) });
                        }

                        cls.updateDocuments(updates, { parent: wall.document.parent });
                    }
                }
            }
        }
    }

    static rgbToHex(r, g, b) {
        var componentToHex = function (c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    static createPixelArray(imgData, width, height) {
        const pixels = imgData;
        const pixelArray = [];

        let offset, r, g, b, a;
        for (let j = 0; j < height; j++) {
            let row = [];
            pixelArray.push(row);
            for (let i = 0; i < width; i++) {
                offset = (j * width * 4) + (i * 4);
                r = pixels[offset + 0];
                g = pixels[offset + 1];
                b = pixels[offset + 2];
                a = pixels[offset + 3];

                row.push({ r: r, g: g, b: b });
            }
        }
        return pixelArray;
    }

    static createLine(pt) {
        let colorDistance = function (a, b) {

            var diffR, diffG, diffB;

            // distance to color
            diffR = (a.r - b.r);
            diffG = (a.g - b.g);
            diffB = (a.b - b.b);
            return (Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB));

        };

        let width = 0;
        let height = 0;
        let toCheck = [];
        let checkedPts = {};
        let checkPoint = function (x, y) {
            if (checkedPts[x] == undefined)
                checkedPts[x] = {};
            checkedPts[x][y] = true;
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    let tx = x + i;
                    let ty = y + j;
                    if (!(tx < 0 || ty < 0 || tx >= width || ty >= height)) {
                        if (pixelArray[ty][tx] == 1) {
                            pixelArray[ty][tx] = 2;
                            if (checkedPts[tx] == undefined || checkedPts[tx][ty] == undefined) {   //don't check it if it's already been checked
                                if (toCheck.find(p => p.x == tx && p.y == ty) == undefined)  //only add it to the list once
                                    toCheck.push({ x: tx, y: ty });
                            }
                        }
                    }
                }
            }
        }

        MonksWallEnhancement.gr = new PIXI.Graphics();
        canvas.walls.addChild(MonksWallEnhancement.gr);

        let offsetX = canvas.scene.dimensions.shiftX - canvas.scene.dimensions.paddingX;
        let offsetY = canvas.scene.dimensions.shiftY - canvas.scene.dimensions.paddingY;
        pt.x = (parseInt(pt.x) + offsetX);
        pt.y = (parseInt(pt.y) + offsetY);
        
        let pixelArray;
        let img = canvas.scene.img;
        if (img != undefined) {
            loadTexture(img).then((texture) => {
                if (texture != undefined) {
                    let sprite = new PIXI.Sprite(texture);
                    let pixels = canvas.app.renderer.plugins.extract.pixels(sprite);

                    width = texture.width;
                    height = texture.height;

                    pixelArray = MonksWallEnhancement.createPixelArray(pixels, texture.width, texture.height, 1);

                    sprite.destroy();

                    //find all pixels that are "close" to the requested pixel colour
                    let color = pixelArray[pt.y][pt.x];

                    for (let i = 0; i < width; i++) {
                        for (let j = 0; j < height; j++) {
                            let cDist = colorDistance(color, pixelArray[j][i]);

                            pixelArray[j][i] = (cDist < 8 ? 1 : 0);

                            //if (cDist < 10)
                            //    MonksWallEnhancement.gr.beginFill(0x00ff00).drawCircle(i - offsetX, j - offsetY, 4).endFill();
                        }
                    }

                    //find all pixels that are attached
                    pixelArray[pt.y][pt.x] = 2;
                    checkedPts[pt.x] = {};
                    checkedPts[pt.x][pt.y] = true;
                    checkPoint(pt.x, pt.y);
                    while (toCheck.length > 0) {
                        let point = toCheck.pop();
                        checkPoint(point.x, point.y);
                    }

                    for (let i = 0; i < width; i++) {
                        for (let j = 0; j < height; j++) {
                            if (pixelArray[j][i] == 1)
                                pixelArray[j][i] = 0;

                            if (pixelArray[j][i] == 2)
                                //MonksWallEnhancement.gr.beginFill(0xff0000).drawCircle(i - offsetX, j - offsetY, 4).endFill();
                                MonksWallEnhancement.gr.beginFill(0xff0000).drawRect(i - offsetX, j - offsetY, 1, 1).endFill();
                        }
                    }

                    //start at the original point, and try and walk the path
                    let points = [{ x: pt.x, y: pt.y }];
                    //find possible paths


                }
            })
        }
    }

    static ready() {
        
    }
}
Hooks.once('init', async function () {
    MonksWallEnhancement.init();
});

Hooks.on("ready", MonksWallEnhancement.ready);

Hooks.on("getSceneControlButtons", (controls) => {
    if (game.settings.get('monks-wall-enhancement', 'show-drag-points-together')) {
        const dragtogetherTools = [
            {
                name: "toggledragtogether",
                title: "Drag points together",
                icon: "fas fa-project-diagram",
                toggle: true,
                active: true
            },
            {
                name: "toggledrawwall",
                title: "Freehand Draw Wall",
                icon: "fas fa-signature",
                toggle: true,
                active: false
            },
            {
                name: "joinwallpoints",
                title: "Join Wall Points",
                icon: "fas fa-broom",
                button: true,
                onClick: () => {
                    MonksWallEnhancement.joinPoints();
                }
            }/*,
            {
                name: "findwall",
                title: "Find wall from Point",
                icon: "fas fa-ruler",
                toggle: true,
                active: false
            }*/
		];
        let wallTools = controls.find(control => control.name === "walls").tools;
        wallTools.splice(wallTools.findIndex(e => e.name === 'clone') + 1, 0, ...dragtogetherTools);
    }
});