(function () {
    "use strict";

    if (!window.VerletCore) {
        throw new Error("VerletCore must load before builders.js");
    }

    const { VerletSystem } = window.VerletCore;

    function buildChainScene(options = {}) {
        const {
            width = 800,
            height = 600,
            gravity = { X: 0, Y: 0.0981 },
            iterations = 8,
            bounce = 0.35,
            particleRadius = 9,
            segmentCount = 14,
            segmentLength = 24,
            startX = 140,
            startY = 72
        } = options;

        const system = new VerletSystem({
            gravity,
            iterations,
            bounce,
            bounds: {
                minimum: { X: 0, Y: 0 },
                maximum: { X: width, Y: height }
            }
        });

        let previousPoint = null;

        for (let index = 0; index < segmentCount; index += 1) {
            const position = {
                X: startX + (index * segmentLength),
                Y: startY
            };

            const point = system.createParticle(position, position, {
                radius: particleRadius,
                pinned: index === 0
            });

            if (previousPoint) {
                system.createDistanceConstraint(previousPoint, point, {
                    length: segmentLength,
                    kind: "structural"
                });
            }

            previousPoint = point;
        }

        return system;
    }

    function buildClothScene(options = {}) {
        const {
            width = 800,
            height = 600,
            gravity = { X: 0, Y: 0.0981 },
            iterations = 10,
            bounce = 0.12,
            particleRadius = 4,
            columns = 14,
            rows = 10,
            spacing = 28,
            startY = 70
        } = options;

        const clothWidth = (columns - 1) * spacing;
        const startX = (width - clothWidth) * 0.5;
        const system = new VerletSystem({
            gravity,
            iterations,
            bounce,
            bounds: {
                minimum: { X: 0, Y: 0 },
                maximum: { X: width, Y: height }
            }
        });
        const grid = [];

        for (let row = 0; row < rows; row += 1) {
            const currentRow = [];

            for (let column = 0; column < columns; column += 1) {
                const position = {
                    X: startX + (column * spacing),
                    Y: startY + (row * spacing)
                };

                const point = system.createParticle(position, position, {
                    radius: particleRadius,
                    pinned: row === 0
                });

                currentRow.push(point);

                if (column > 0) {
                    system.createDistanceConstraint(currentRow[column - 1], point, {
                        length: spacing,
                        kind: "structural"
                    });
                }

                if (row > 0) {
                    system.createDistanceConstraint(grid[row - 1][column], point, {
                        length: spacing,
                        kind: "structural"
                    });
                }

                if (row > 0 && column > 0) {
                    system.createDistanceConstraint(grid[row - 1][column - 1], point, {
                        length: Math.hypot(spacing, spacing),
                        kind: "shear",
                        stiffness: 0.85
                    });
                }

                if (row > 0 && column < columns - 1) {
                    system.createDistanceConstraint(grid[row - 1][column + 1], point, {
                        length: Math.hypot(spacing, spacing),
                        kind: "shear",
                        stiffness: 0.85
                    });
                }
            }

            grid.push(currentRow);
        }

        return system;
    }

    window.VerletBuilders = {
        buildChainScene,
        buildClothScene
    };
}());
