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

        let oldWallDragMove = WallsLayer.prototype._onDragLeftMove;
        WallsLayer.prototype._onDragLeftMove = async function (event) {
            const { createState, origin, destination, originalEvent, preview } = event.data;

			let drawwall = ui.controls.control.tools.find(t => { return t.name == "toggledrawwall" });
			if(drawwal){
				if (MonksWallEnhancement.lastWall == undefined) {
					MonksWallEnhancement.lastWall = [{ x: origin.x, y: origin.y }];

					MonksWallEnhancement.gr = new PIXI.Graphics();
					this.addChild(MonksWallEnhancement.gr);
					MonksWallEnhancement.gr.beginFill(0xff0000).drawCircle(origin.x, origin.y, 4).endFill();
					
				} else {
					//log(MonksWallEnhancement.lastWall, destination);
					let dist = Math.sqrt(Math.pow(MonksWallEnhancement.lastWall[MonksWallEnhancement.lastWall.length - 1].x - destination.x, 2) + Math.pow(MonksWallEnhancement.lastWall[MonksWallEnhancement.lastWall.length - 1].y - destination.y, 2));
					if (dist > MonksWallEnhancement.distanceCheck) {
						MonksWallEnhancement.lastWall.push({ x: destination.x, y: destination.y });
						MonksWallEnhancement.gr.beginFill(0xff0000).drawCircle(destination.x, destination.y, 4).endFill();
					}
				}
			}else
				return oldWallDragMove.call(this, event);
        }

        let oldWallDragDrop = WallsLayer.prototype._onDragLeftDrop;
        WallsLayer.prototype._onDragLeftDrop = async function (event) {
            const { createState, destination, originalEvent, preview } = event.data;

			let drawwall = ui.controls.control.tools.find(t => { return t.name == "toggledrawwall" });
			if(drawwal){
				let wallpoints = MonksWallEnhancement.simplify(MonksWallEnhancement.lastWall, 25);
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

				MonksWallEnhancement.lastWall = null;
				this.removeChild(MonksWallEnhancement.gr);
				return this._onDragLeftCancel(event);
			}else
				return oldWallDragDrop.call(this, event);
        }

        //WallsLayer.prototype._onClickLeft2 = function (event) {
        //
        //}
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
            icon: "fas fa-angle-double-right",
            toggle: true,
            active: true
        },
		{
            name: "toggledrawwall",
            title: "Freehand Draw Wall",
            icon: "fas fa-edit",
            toggle: true,
            active: true
        }
		];
        let wallTools = controls.find(control => control.name === "walls").tools;
        wallTools.splice(wallTools.findIndex(e => e.name === 'clone') + 1, 0, ...dragtogetherTools);
    }
});