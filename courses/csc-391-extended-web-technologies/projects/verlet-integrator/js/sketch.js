const { buildChainScene, buildClothScene } = window.VerletBuilders;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DRAG_DISTANCE = 24;

const scenes = {
    chain: {
        label: "Chain",
        builder() {
            return buildChainScene({
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT
            });
        }
    },
    cloth: {
        label: "Cloth",
        builder() {
            return buildClothScene({
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT
            });
        }
    }
};

const state = {
    sceneKey: "chain",
    debugEnabled: false,
    draggingPoint: null
};

let system = null;

function isPointerInsideCanvas() {
    return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function rebuildScene() {
    releaseDraggedPoint();
    system = scenes[state.sceneKey].builder();
}

function pointerPosition() {
    return { X: mouseX, Y: mouseY };
}

function moveDraggedPointToPointer() {
    if (!state.draggingPoint) {
        return;
    }

    state.draggingPoint.setPosition(pointerPosition());
    state.draggingPoint.constrain(system.bounds, 0);
}

function releaseDraggedPoint() {
    if (!state.draggingPoint) {
        return;
    }

    state.draggingPoint.isDragged = false;
    state.draggingPoint.setPosition(state.draggingPoint.current);
    state.draggingPoint = null;
}

function drawConstraint(constraint) {
    if (!state.debugEnabled && constraint.kind === "shear") {
        return;
    }

    if (constraint.kind === "shear") {
        stroke(120, 144, 178, 140);
        strokeWeight(1);
    } else if (state.sceneKey === "cloth") {
        stroke(46, 111, 145);
        strokeWeight(1.7);
    } else {
        stroke(31, 41, 51);
        strokeWeight(3);
    }

    line(
        constraint.fst.current.X,
        constraint.fst.current.Y,
        constraint.snd.current.X,
        constraint.snd.current.Y
    );
}

function drawConstraints(activeSystem) {
    for (const constraint of activeSystem.constraints) {
        drawConstraint(constraint);
    }
}

function shouldDrawPoint(point) {
    if (state.debugEnabled) {
        return true;
    }

    if (state.sceneKey === "cloth") {
        return point.pinned || point.isDragged;
    }

    return true;
}

function drawParticles(activeSystem) {
    stroke(31, 41, 51);
    strokeWeight(1.2);

    for (const point of activeSystem.points) {
        if (!shouldDrawPoint(point)) {
            continue;
        }

        if (point.isDragged) {
            fill(240, 91, 74);
        } else if (point.pinned) {
            fill(248, 180, 74);
        } else if (state.sceneKey === "cloth") {
            fill(244, 248, 250);
        } else {
            fill(255);
        }

        circle(point.current.X, point.current.Y, point.radius * 2);
    }
}

function drawOverlay() {
    noStroke();
    fill(17, 24, 39, 185);
    rect(14, 14, 280, 76, 12);

    fill(255);
    textAlign(LEFT, TOP);
    textSize(16);
    text(`Scene: ${scenes[state.sceneKey].label}`, 28, 28);
    textSize(12);
    text("Drag points with the mouse", 28, 52);
    text("1 Chain  2 Cloth  R Reset  D Debug", 28, 68);

    if (state.debugEnabled) {
        fill(248, 180, 74);
        text("Debug view enabled", 190, 28);
    }
}

function setup() {
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent("canvas-container");
    rebuildScene();
}

function draw() {
    background(224, 236, 255);

    moveDraggedPointToPointer();
    system.step();
    drawConstraints(system);
    drawParticles(system);
    drawOverlay();
}

function mousePressed() {
    if (!isPointerInsideCanvas()) {
        return true;
    }

    const point = system.findNearestPoint(pointerPosition(), DRAG_DISTANCE);

    if (!point) {
        return true;
    }

    state.draggingPoint = point;
    state.draggingPoint.isDragged = true;
    moveDraggedPointToPointer();
    return false;
}

function mouseDragged() {
    if (!state.draggingPoint) {
        return true;
    }

    moveDraggedPointToPointer();
    return false;
}

function mouseReleased() {
    if (!state.draggingPoint) {
        return true;
    }

    releaseDraggedPoint();
    return false;
}

function keyPressed() {
    const lowerKey = key.toLowerCase();

    if (lowerKey === "r") {
        rebuildScene();
        return false;
    }

    if (lowerKey === "d") {
        state.debugEnabled = !state.debugEnabled;
        return false;
    }

    if (key === "1") {
        state.sceneKey = "chain";
        rebuildScene();
        return false;
    }

    if (key === "2") {
        state.sceneKey = "cloth";
        rebuildScene();
        return false;
    }

    return true;
}
