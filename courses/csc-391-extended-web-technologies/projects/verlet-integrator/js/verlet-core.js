(function () {
    "use strict";

    function clonePosition(position) {
        return { X: position.X, Y: position.Y };
    }

    function cloneBounds(bounds) {
        if (!bounds) {
            return null;
        }

        return {
            minimum: clonePosition(bounds.minimum),
            maximum: clonePosition(bounds.maximum)
        };
    }

    function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
    }

    function normalizeBounce(value) {
        return clamp(value ?? 0, 0, 1);
    }

    class VParticle {
        constructor(current, previous = current, options = {}) {
            const {
                radius = 5,
                mass = 1,
                pinned = false,
                bounds = null
            } = options;

            this.current = clonePosition(current);
            this.previous = clonePosition(previous ?? current);
            this.radius = radius;
            this.mass = mass > 0 ? mass : 1;
            this.pinned = Boolean(pinned);
            this.bounds = cloneBounds(bounds);
            this.isDragged = false;
        }

        isLocked() {
            return this.pinned || this.isDragged;
        }

        setPosition(position, preserveVelocity = false) {
            const next = clonePosition(position);

            if (preserveVelocity) {
                const deltaX = next.X - this.current.X;
                const deltaY = next.Y - this.current.Y;
                this.previous.X += deltaX;
                this.previous.Y += deltaY;
            } else {
                this.previous = clonePosition(next);
            }

            this.current = next;
        }

        integrate(gravity = { X: 0, Y: 0 }, dt = 1) {
            if (this.isLocked()) {
                this.previous = clonePosition(this.current);
                return;
            }

            const velocityX = this.current.X - this.previous.X;
            const velocityY = this.current.Y - this.previous.Y;
            const dtSquared = dt * dt;
            const next = {
                X: this.current.X + velocityX + (gravity.X * dtSquared),
                Y: this.current.Y + velocityY + (gravity.Y * dtSquared)
            };

            this.previous = clonePosition(this.current);
            this.current = next;
        }

        constrain(bounds = this.bounds, bounce = 0) {
            if (!bounds) {
                return;
            }

            const effectiveBounce = normalizeBounce(bounce);
            const minX = bounds.minimum.X + this.radius;
            const minY = bounds.minimum.Y + this.radius;
            const maxX = bounds.maximum.X - this.radius;
            const maxY = bounds.maximum.Y - this.radius;
            const velocityX = this.current.X - this.previous.X;
            const velocityY = this.current.Y - this.previous.Y;

            if (this.current.X < minX) {
                this.current.X = minX;
                this.previous.X = this.current.X + (velocityX * effectiveBounce);
            } else if (this.current.X > maxX) {
                this.current.X = maxX;
                this.previous.X = this.current.X + (velocityX * effectiveBounce);
            }

            if (this.current.Y < minY) {
                this.current.Y = minY;
                this.previous.Y = this.current.Y + (velocityY * effectiveBounce);
            } else if (this.current.Y > maxY) {
                this.current.Y = maxY;
                this.previous.Y = this.current.Y + (velocityY * effectiveBounce);
            }
        }
    }

    class VDistanceConstraint {
        constructor(fst, snd, options = {}) {
            this.fst = fst;
            this.snd = snd;
            this.length = options.length ??
                Math.hypot(snd.current.X - fst.current.X, snd.current.Y - fst.current.Y);
            this.stiffness = clamp(options.stiffness ?? 1, 0, 1);
            this.kind = options.kind ?? "structural";
        }

        static EPSILON = 1e-6;

        solve() {
            const dx = this.snd.current.X - this.fst.current.X;
            const dy = this.snd.current.Y - this.fst.current.Y;
            const distance = Math.hypot(dx, dy);

            if (distance < VDistanceConstraint.EPSILON) {
                return;
            }

            const correction = ((this.length - distance) / distance) * this.stiffness;
            const correctionX = dx * correction;
            const correctionY = dy * correction;
            const fstLocked = this.fst.isLocked();
            const sndLocked = this.snd.isLocked();

            if (fstLocked && sndLocked) {
                return;
            }

            if (fstLocked) {
                this.snd.current.X += correctionX;
                this.snd.current.Y += correctionY;
                return;
            }

            if (sndLocked) {
                this.fst.current.X -= correctionX;
                this.fst.current.Y -= correctionY;
                return;
            }

            this.fst.current.X -= correctionX * 0.5;
            this.fst.current.Y -= correctionY * 0.5;
            this.snd.current.X += correctionX * 0.5;
            this.snd.current.Y += correctionY * 0.5;
        }
    }

    class VerletSystem {
        constructor(options = {}) {
            const {
                gravity = { X: 0, Y: 0.0981 },
                iterations = 8,
                bounds = null,
                bounce = 0
            } = options;

            this.points = [];
            this.constraints = [];
            this.gravity = clonePosition(gravity);
            this.iterations = Math.max(1, Math.floor(iterations));
            this.bounds = cloneBounds(bounds);
            this.bounce = normalizeBounce(bounce);
        }

        addPoint(point) {
            this.points.push(point);
            return point;
        }

        addConstraint(constraint) {
            this.constraints.push(constraint);
            return constraint;
        }

        createParticle(current, previous = current, options = {}) {
            const particle = new VParticle(current, previous, {
                ...options,
                bounds: options.bounds ?? this.bounds
            });

            return this.addPoint(particle);
        }

        createDistanceConstraint(fst, snd, options = {}) {
            return this.addConstraint(new VDistanceConstraint(fst, snd, options));
        }

        setBounds(bounds) {
            this.bounds = cloneBounds(bounds);

            for (const point of this.points) {
                point.bounds = cloneBounds(bounds);
            }
        }

        setGravity(gravity) {
            this.gravity = clonePosition(gravity);
        }

        setBounce(bounce) {
            this.bounce = normalizeBounce(bounce);
        }

        clear() {
            this.points.length = 0;
            this.constraints.length = 0;
        }

        findNearestPoint(position, maxDistance = Infinity) {
            let nearest = null;
            let nearestDistanceSquared = maxDistance * maxDistance;

            for (const point of this.points) {
                const dx = point.current.X - position.X;
                const dy = point.current.Y - position.Y;
                const distanceSquared = (dx * dx) + (dy * dy);

                if (distanceSquared < nearestDistanceSquared) {
                    nearest = point;
                    nearestDistanceSquared = distanceSquared;
                }
            }

            return nearest;
        }

        step(dt = 1) {
            for (const point of this.points) {
                point.integrate(this.gravity, dt);
            }

            for (let pass = 0; pass < this.iterations; pass += 1) {
                for (const constraint of this.constraints) {
                    constraint.solve();
                }

                for (const point of this.points) {
                    point.constrain(point.bounds ?? this.bounds, this.bounce);
                }
            }
        }
    }

    window.VerletCore = {
        VParticle,
        VDistanceConstraint,
        VerletSystem
    };

    window.VParticle = VParticle;
    window.VDistanceConstraint = VDistanceConstraint;
    window.VDistanceConstraints = VDistanceConstraint;
    window.VerletSystem = VerletSystem;
}());
