// ============================================================
// FUJA DO FEDER — Game Engine
// ============================================================
(() => {
    'use strict';

    // ─── CONSTANTS ──────────────────────────────────────────────
    const CELL = 32;
    const COLS = 21;
    const ROWS = 22;
    const HDR = 70;
    const FTR = 50;
    const CW = COLS * CELL;
    const CH = ROWS * CELL + HDR + FTR;

    const WALL = 1, DOT = 2, POWER = 3, GHOST_ZONE = 4, DOOR = 5, TUNNEL = 6;
    const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3, NONE = -1;
    const DX = [0, 1, 0, -1];
    const DY = [-1, 0, 1, 0];
    const OPP = [2, 3, 0, 1];
    const DIR_ANGLE = [1.5 * Math.PI, 0, 0.5 * Math.PI, Math.PI];

    const PLAYER_START = { col: 10, row: 16 };
    const TEACHER_HOME = [
        { col: 10, row: 8, delay: 0 },
        { col: 9, row: 10, delay: 3 },
        { col: 10, row: 10, delay: 6 },
        { col: 11, row: 10, delay: 9 }
    ];
    const SCATTER_CORNERS = [
        { col: COLS - 2, row: 1 },
        { col: 1, row: 1 },
        { col: COLS - 2, row: ROWS - 2 },
        { col: 1, row: ROWS - 2 }
    ];
    const T_COLORS = ['#cc2244', '#2255cc', '#228844', '#aa6622'];
    const T_NAMES = ['Feder Vermelho', 'Feder Azul', 'Feder Verde', 'Feder Laranja'];

    const SCORES = { DOT: 10, POWER: 50, TEACHER: [200, 400, 800, 1600] };
    const POWER_TIME = 8;
    const EXTRA_LIFE_AT = 10000;

    const MAZE_TPL = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 3, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 3, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 5, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1],
        [6, 0, 0, 0, 0, 2, 0, 0, 1, 4, 4, 4, 1, 0, 0, 2, 0, 0, 0, 0, 6],
        [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        [1, 3, 2, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 2, 3, 1],
        [1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    // ─── AUDIO MANAGER ──────────────────────────────────────────
    class Audio {
        constructor() { this.ctx = null; }
        init() {
            if (this.ctx) return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        _play(freq, dur, type = 'sine', vol = 0.08) {
            if (!this.ctx) return;
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.connect(g); g.connect(this.ctx.destination);
            o.type = type; o.frequency.value = freq;
            g.gain.setValueAtTime(vol, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
            o.start(); o.stop(this.ctx.currentTime + dur);
        }
        dot() { this._play(587, 0.08, 'sine', 0.06); }
        power() {
            this._play(440, 0.15, 'square', 0.07);
            setTimeout(() => this._play(660, 0.15, 'square', 0.07), 80);
            setTimeout(() => this._play(880, 0.2, 'square', 0.07), 160);
        }
        eatTeacher() {
            this._play(300, 0.1, 'sawtooth', 0.06);
            setTimeout(() => this._play(600, 0.1, 'sawtooth', 0.06), 60);
            setTimeout(() => this._play(900, 0.15, 'sawtooth', 0.06), 120);
        }
        die() {
            for (let i = 0; i < 8; i++)
                setTimeout(() => this._play(500 - i * 50, 0.15, 'sawtooth', 0.06), i * 100);
        }
        levelUp() {
            const notes = [523, 659, 784, 1047];
            notes.forEach((n, i) => setTimeout(() => this._play(n, 0.2, 'square', 0.06), i * 120));
        }
    }

    // ─── PARTICLE SYSTEM ────────────────────────────────────────
    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y; this.color = color;
            const a = Math.random() * Math.PI * 2;
            const spd = 40 + Math.random() * 80;
            this.vx = Math.cos(a) * spd;
            this.vy = Math.sin(a) * spd;
            this.life = 0.4 + Math.random() * 0.4;
            this.maxLife = this.life;
            this.r = 1.5 + Math.random() * 2.5;
        }
        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 60 * dt;
            this.life -= dt;
        }
        draw(c) {
            const a = Math.max(0, this.life / this.maxLife);
            c.globalAlpha = a;
            c.shadowColor = this.color;
            c.shadowBlur = 8;
            c.fillStyle = this.color;
            c.beginPath();
            c.arc(this.x, this.y, this.r * a, 0, Math.PI * 2);
            c.fill();
            c.shadowBlur = 0;
            c.globalAlpha = 1;
        }
    }

    class Particles {
        constructor() { this.list = []; }
        emit(x, y, color, n = 12) {
            for (let i = 0; i < n; i++) this.list.push(new Particle(x, y, color));
        }
        update(dt) {
            for (let i = this.list.length - 1; i >= 0; i--) {
                this.list[i].update(dt);
                if (this.list[i].life <= 0) this.list.splice(i, 1);
            }
        }
        draw(c) { this.list.forEach(p => p.draw(c)); }
    }

    // ─── HELPER: pixel <-> grid ─────────────────────────────────
    function px(col) { return col * CELL + CELL / 2; }
    function py(row) { return row * CELL + CELL / 2 + HDR; }
    function toCol(x) { return Math.floor(x / CELL); }
    function toRow(y) { return Math.floor((y - HDR) / CELL); }
    function dist2(a, b) { return (a.col - b.col) ** 2 + (a.row - b.row) ** 2; }

    function isWalkable(maze, col, row, allowDoor = false, avoidGhostArea = false) {
        if (row < 0 || row >= ROWS) return false;
        // tunnel wrap
        if (col < 0 || col >= COLS) {
            if (row === 10) return true;
            return false;
        }
        const v = maze[row][col];
        if (v === WALL) return false;
        if (v === GHOST_ZONE) return false;
        if (v === DOOR) return allowDoor;
        // block 0-value cells in ghost house area for normal enemies
        if (avoidGhostArea && v === 0 && row >= 7 && row <= 13 && col >= 6 && col <= 14) return false;
        return true;
    }

    // ─── PLAYER CLASS ───────────────────────────────────────────
    class Player {
        constructor() { this.reset(); }
        reset() {
            this.col = PLAYER_START.col;
            this.row = PLAYER_START.row;
            this.x = px(this.col);
            this.y = py(this.row);
            this.dir = NONE;
            this.nextDir = NONE;
            this.speed = 0;
            this.mouthAngle = 0;
            this.mouthDir = 1;
            this.moving = false;
        }
        update(dt, maze, baseSpeed) {
            this.speed = baseSpeed * CELL;
            // mouth animation
            this.mouthAngle += this.mouthDir * dt * 8;
            if (this.mouthAngle > 0.35) { this.mouthAngle = 0.35; this.mouthDir = -1; }
            if (this.mouthAngle < 0.02) { this.mouthAngle = 0.02; this.mouthDir = 1; }

            // try queued direction at tile center
            const cx = px(this.col), cy = py(this.row);
            const atCenter = Math.abs(this.x - cx) < 3 && Math.abs(this.y - cy) < 3;
            if (atCenter && this.nextDir !== NONE) {
                const nc = this.col + DX[this.nextDir];
                const nr = this.row + DY[this.nextDir];
                if (isWalkable(maze, nc, nr)) {
                    this.dir = this.nextDir;
                    this.nextDir = NONE;
                    this.x = cx; this.y = cy;
                }
            }
            if (this.dir === NONE) { this.moving = false; return; }

            // move
            const mx = DX[this.dir] * this.speed * dt;
            const my = DY[this.dir] * this.speed * dt;
            const nx = this.x + mx;
            const ny = this.y + my;

            // next tile check
            const nextCol = this.col + DX[this.dir];
            const nextRow = this.row + DY[this.dir];
            const nextCx = px(nextCol);
            const nextCy = py(nextRow);

            if (!isWalkable(maze, nextCol, nextRow)) {
                // stop at cell center
                this.x = cx; this.y = cy;
                this.moving = false;
                return;
            }
            this.moving = true;
            this.x = nx; this.y = ny;

            // crossed into next cell?
            const distOld = (cx - this.x) ** 2 + (cy - this.y) ** 2;
            const distNew = (nextCx - this.x) ** 2 + (nextCy - this.y) ** 2;
            if (distNew <= distOld || Math.abs(this.x - nextCx) < 2 && Math.abs(this.y - nextCy) < 2) {
                this.col = nextCol;
                this.row = nextRow;
                // tunnel wrap
                if (this.col < 0) { this.col = COLS - 1; this.x = px(this.col); }
                else if (this.col >= COLS) { this.col = 0; this.x = px(this.col); }
            }
        }
        draw(c, powered, time) {
            c.save();
            c.translate(this.x, this.y);
            const r = CELL * 0.44;
            const t = time || 0;
            const walkCycle = this.moving ? Math.sin(t * 14) : 0;
            const bodyBob = this.moving ? Math.sin(t * 28) * 1.2 : 0;
            const facing = this.dir === LEFT ? -1 : 1;
            const glowCol = powered ? '#00ffff' : '#ffcc00';
            c.translate(0, bodyBob);
            // legs (dark trousers)
            c.fillStyle = powered ? '#005566' : '#2a2a3a';
            c.fillRect(-r * 0.3, r * 0.4, r * 0.24, r * 0.55 + walkCycle * 3);
            c.fillRect(r * 0.08, r * 0.4, r * 0.24, r * 0.55 - walkCycle * 3);
            // shoes
            c.fillStyle = powered ? '#003344' : '#111';
            c.fillRect(-r * 0.35, r * 0.9 + walkCycle * 3, r * 0.34, r * 0.18);
            c.fillRect(r * 0.05, r * 0.9 - walkCycle * 3, r * 0.34, r * 0.18);
            // body — white lab coat
            c.shadowColor = glowCol;
            c.shadowBlur = powered ? 16 : 8;
            c.fillStyle = powered ? '#00ccbb' : '#f0f0f0';
            c.beginPath();
            c.roundRect(-r * 0.5, -r * 0.25, r * 1.0, r * 0.72, 5);
            c.fill();
            c.shadowBlur = 0;
            // coat lapels
            if (!powered) {
                c.strokeStyle = '#ccc'; c.lineWidth = 1.5;
                c.beginPath();
                c.moveTo(-r * 0.08, -r * 0.25);
                c.lineTo(-r * 0.2, r * 0.15);
                c.moveTo(r * 0.08, -r * 0.25);
                c.lineTo(r * 0.2, r * 0.15);
                c.stroke();
                // pocket with pen
                c.strokeStyle = '#bbb';
                c.strokeRect(r * 0.12, r * 0.12, r * 0.22, r * 0.18);
                c.fillStyle = '#3366ff';
                c.fillRect(r * 0.2, r * 0.04, 2, r * 0.12);
                c.fillStyle = '#ff3333';
                c.fillRect(r * 0.26, r * 0.06, 2, r * 0.1);
            }
            // head
            c.fillStyle = '#ffcc88';
            c.shadowColor = glowCol;
            c.shadowBlur = 8;
            c.beginPath();
            c.arc(0, -r * 0.58, r * 0.42, 0, Math.PI * 2);
            c.fill();
            c.shadowBlur = 0;
            // hair (professor style — receding/short)
            c.fillStyle = powered ? '#00aacc' : '#555';
            c.beginPath();
            c.ellipse(0, -r * 0.86, r * 0.38, r * 0.16, 0, 0, Math.PI, true);
            c.fill();
            c.fillRect(-r * 0.38, -r * 0.82, r * 0.1, r * 0.12);
            c.fillRect(r * 0.28, -r * 0.82, r * 0.1, r * 0.12);
            // glasses
            c.strokeStyle = powered ? '#00ddff' : '#ffd700';
            c.lineWidth = 2;
            c.beginPath(); c.arc(-r * 0.16, -r * 0.58, r * 0.16, 0, Math.PI * 2); c.stroke();
            c.beginPath(); c.arc(r * 0.16, -r * 0.58, r * 0.16, 0, Math.PI * 2); c.stroke();
            c.beginPath(); c.moveTo(-r * 0.16 + r * 0.16, -r * 0.58); c.lineTo(r * 0.16 - r * 0.16, -r * 0.58); c.stroke();
            c.beginPath(); c.moveTo(-r * 0.32, -r * 0.58); c.lineTo(-r * 0.42, -r * 0.54); c.stroke();
            c.beginPath(); c.moveTo(r * 0.32, -r * 0.58); c.lineTo(r * 0.42, -r * 0.54); c.stroke();
            // eyes (behind glasses)
            const eyeDir = this.dir >= 0 ? this.dir : RIGHT;
            const eOff = DX[eyeDir] * 1.8;
            c.fillStyle = '#fff';
            c.beginPath(); c.ellipse(-r * 0.16 + eOff, -r * 0.58, 3.5, 4, 0, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.ellipse(r * 0.16 + eOff, -r * 0.58, 3.5, 4, 0, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#111';
            c.beginPath(); c.arc(-r * 0.16 + eOff + DX[eyeDir] * 1.2, -r * 0.58 + DY[eyeDir], 2, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(r * 0.16 + eOff + DX[eyeDir] * 1.2, -r * 0.58 + DY[eyeDir], 2, 0, Math.PI * 2); c.fill();
            // mouth
            c.strokeStyle = powered ? '#006666' : '#884422';
            c.lineWidth = 1.5;
            c.beginPath();
            if (powered) {
                c.arc(0, -r * 0.42, r * 0.14, 0, Math.PI);
            } else {
                c.moveTo(-r * 0.1, -r * 0.42);
                c.lineTo(r * 0.1, -r * 0.44);
            }
            c.stroke();
            // mustache
            if (!powered) {
                c.fillStyle = '#555';
                c.fillRect(-r * 0.12, -r * 0.47, r * 0.24, 2.5);
            }
            c.restore();
        }
    }

    // ─── TEACHER (ENEMY) CLASS ──────────────────────────────────
    class Teacher {
        constructor(idx) {
            this.idx = idx;
            this.color = T_COLORS[idx];
            this.name = T_NAMES[idx];
            this.reset();
        }
        reset() {
            const home = TEACHER_HOME[this.idx];
            this.col = home.col;
            this.row = home.row;
            this.x = px(this.col);
            this.y = py(this.row);
            this.dir = UP;
            this.mode = 'wait'; // wait, scatter, chase, frightened, eaten
            this.waitTimer = home.delay;
            this.modeTimer = 0;
            this.frightTimer = 0;
            this.target = { col: this.col, row: this.row };
            this.speed = 0;
        }
        update(dt, maze, player, baseSpeed, level) {
            if (this.mode === 'wait') {
                this.waitTimer -= dt;
                if (this.waitTimer <= 0) {
                    this.mode = 'scatter';
                    this.modeTimer = Math.max(3, 7 - level);
                    // teleport to main maze path (left or right side)
                    if (this.idx % 2 === 0) {
                        this.col = 5; this.row = 8;
                    } else {
                        this.col = 15; this.row = 8;
                    }
                    this.x = px(this.col); this.y = py(this.row);
                    this.dir = UP;
                    this.speed = baseSpeed * CELL * (1 + level * 0.05);
                }
                return;
            }
            const spdMul = this.mode === 'frightened' ? 0.5 : (this.mode === 'eaten' ? 1.8 : 1 + level * 0.05);
            this.speed = baseSpeed * CELL * spdMul;
            // mode timers
            if (this.mode === 'scatter') {
                this.modeTimer -= dt;
                if (this.modeTimer <= 0) { this.mode = 'chase'; this.modeTimer = 20 + level * 2; }
            } else if (this.mode === 'chase') {
                this.modeTimer -= dt;
                if (this.modeTimer <= 0) { this.mode = 'scatter'; this.modeTimer = Math.max(3, 7 - level); }
            } else if (this.mode === 'frightened') {
                this.frightTimer -= dt;
                if (this.frightTimer <= 0) this.mode = 'chase';
            } else if (this.mode === 'eaten') {
                // heading back to ghost house
                if (this.col === 10 && this.row === 8) {
                    this.mode = 'scatter';
                    this.modeTimer = 5;
                    // teleport to main path so we don't get stuck
                    if (this.idx % 2 === 0) {
                        this.col = 5; this.row = 8;
                    } else {
                        this.col = 15; this.row = 8;
                    }
                    this.x = px(this.col); this.y = py(this.row);
                    this.dir = UP;
                }
            }
            // target selection
            this._pickTarget(player);
            // movement
            this._move(dt, maze);
        }
        _pickTarget(player) {
            if (this.mode === 'scatter') {
                this.target = SCATTER_CORNERS[this.idx];
            } else if (this.mode === 'chase') {
                if (this.idx === 0) {
                    // chase player directly
                    this.target = { col: player.col, row: player.row };
                } else if (this.idx === 1) {
                    // target 4 tiles ahead
                    this.target = {
                        col: Math.max(0, Math.min(COLS - 1, player.col + DX[player.dir >= 0 ? player.dir : RIGHT] * 4)),
                        row: Math.max(0, Math.min(ROWS - 1, player.row + DY[player.dir >= 0 ? player.dir : RIGHT] * 4))
                    };
                } else if (this.idx === 2) {
                    // alternate: chase when far, scatter when close
                    const d = dist2(this, player);
                    this.target = d > 64 ? { col: player.col, row: player.row } : SCATTER_CORNERS[this.idx];
                } else {
                    // patrol: random-ish
                    if (dist2(this, player) > 36) {
                        this.target = { col: player.col, row: player.row };
                    } else {
                        this.target = SCATTER_CORNERS[this.idx];
                    }
                }
            } else if (this.mode === 'eaten') {
                this.target = { col: 10, row: 8 };
            }
        }
        _move(dt, maze) {
            // Simple tile-snap movement: move toward next cell center, pick direction on arrival
            const cx = px(this.col), cy = py(this.row);
            const dx = this.x - cx, dy = this.y - cy;
            const distToCenter = Math.sqrt(dx * dx + dy * dy);
            const ghostBlock = this.mode !== 'eaten';

            if (distToCenter < 1.5 || this.dir === NONE) {
                // Snap to center
                this.x = cx; this.y = cy;

                // Pick best direction
                let best = NONE, bestDist = Infinity;
                const dirs = [UP, RIGHT, DOWN, LEFT];
                for (const d of dirs) {
                    // Don't reverse unless frightened
                    if (d === OPP[this.dir] && this.mode !== 'frightened' && this.dir !== NONE) continue;
                    const nc = this.col + DX[d], nr = this.row + DY[d];
                    const allowDoor = this.mode === 'eaten';
                    if (!isWalkable(maze, nc, nr, allowDoor, ghostBlock)) continue;
                    if (this.mode === 'frightened') {
                        if (Math.random() < 0.3 || best === NONE) { best = d; bestDist = Math.random(); }
                    } else {
                        const dd = (nc - this.target.col) ** 2 + (nr - this.target.row) ** 2;
                        if (dd < bestDist) { bestDist = dd; best = d; }
                    }
                }
                // Fallback: allow all directions including reverse
                if (best === NONE) {
                    for (const d of dirs) {
                        const nc = this.col + DX[d], nr = this.row + DY[d];
                        if (isWalkable(maze, nc, nr, true, false)) { best = d; break; }
                    }
                }
                if (best !== NONE) this.dir = best;
                else return; // truly stuck, shouldn't happen
            }

            // Move in current direction
            const step = this.speed * dt;
            this.x += DX[this.dir] * step;
            this.y += DY[this.dir] * step;

            // Check if we crossed into the next cell
            const nextCol = this.col + DX[this.dir];
            const nextRow = this.row + DY[this.dir];
            // Tunnel wrap
            if (nextCol < 0) { this.col = COLS - 1; this.x = px(this.col); return; }
            if (nextCol >= COLS) { this.col = 0; this.x = px(this.col); return; }
            const ncx = px(nextCol), ncy = py(nextRow);
            const newDistToNext = Math.sqrt((ncx - this.x) ** 2 + (ncy - this.y) ** 2);
            const cellDist = Math.sqrt((ncx - cx) ** 2 + (ncy - cy) ** 2);
            if (newDistToNext <= cellDist * 0.5) {
                this.col = nextCol;
                this.row = nextRow;
            }
        }
        scare(duration) {
            if (this.mode === 'eaten' || this.mode === 'wait') return;
            this.mode = 'frightened';
            this.frightTimer = duration;
            this.dir = OPP[this.dir];
        }
        eat() {
            this.mode = 'eaten';
        }
        draw(c, time) {
            const r = CELL * 0.44;
            c.save();
            c.translate(this.x, this.y);
            const walkCycle = Math.sin(time * 12) * 3;
            const bodyBob = Math.sin(time * 24) * 1.5;
            const armSwing = Math.sin(time * 12) * 0.15;
            const tremble = this.mode === 'frightened' ? Math.sin(time * 30) * 2 : 0;
            c.translate(tremble, bodyBob);
            const isScared = this.mode === 'frightened';
            const isGone = this.mode === 'eaten';
            const flash = isScared && this.frightTimer < 2 && Math.sin(time * 12) > 0;
            const suitColor = isGone ? 'rgba(255,255,255,0.12)' :
                isScared ? (flash ? '#aaaaff' : '#2244aa') : '#1a1a2e';
            const tieColor = isGone ? 'transparent' :
                isScared ? '#6666cc' : this.color;
            const glowColor = isGone ? 'transparent' :
                isScared ? '#4466ff' : this.color;
            // legs (suit trousers)
            if (!isGone) {
                c.fillStyle = isScared ? '#1a1a44' : '#1a1a2e';
                c.fillRect(-r * 0.3, r * 0.4, r * 0.24, r * 0.52 + walkCycle);
                c.fillRect(r * 0.08, r * 0.4, r * 0.24, r * 0.52 - walkCycle);
                c.fillStyle = isScared ? '#111133' : '#0a0a0a';
                c.fillRect(-r * 0.34, r * 0.88 + walkCycle, r * 0.32, r * 0.18);
                c.fillRect(r * 0.05, r * 0.88 - walkCycle, r * 0.32, r * 0.18);
            }
            // arms swinging
            if (!isGone) {
                c.save();
                c.fillStyle = isScared ? '#2244aa' : '#1a1a2e';
                // left arm
                c.save();
                c.translate(-r * 0.5, -r * 0.1);
                c.rotate(-armSwing);
                c.fillRect(-r * 0.12, 0, r * 0.14, r * 0.45);
                c.restore();
                // right arm
                c.save();
                c.translate(r * 0.5, -r * 0.1);
                c.rotate(armSwing);
                c.fillRect(-r * 0.02, 0, r * 0.14, r * 0.45);
                c.restore();
                c.restore();
            }
            // body — suit jacket
            c.shadowColor = glowColor;
            c.shadowBlur = isGone ? 0 : 14;
            c.fillStyle = suitColor;
            c.beginPath();
            c.roundRect(-r * 0.48, -r * 0.25, r * 0.96, r * 0.72, 5);
            c.fill();
            c.shadowBlur = 0;
            // shirt + tie
            if (!isScared && !isGone) {
                // white shirt strip
                c.fillStyle = '#eee';
                c.fillRect(-r * 0.08, -r * 0.25, r * 0.16, r * 0.65);
                // tie
                c.fillStyle = tieColor;
                c.beginPath();
                c.moveTo(0, -r * 0.22);
                c.lineTo(-r * 0.06, -r * 0.08);
                c.lineTo(0, r * 0.35);
                c.lineTo(r * 0.06, -r * 0.08);
                c.closePath();
                c.fill();
                // lapels
                c.fillStyle = '#111122';
                c.beginPath();
                c.moveTo(-r * 0.08, -r * 0.25);
                c.lineTo(-r * 0.28, r * 0.15);
                c.lineTo(-r * 0.08, r * 0.15);
                c.closePath(); c.fill();
                c.beginPath();
                c.moveTo(r * 0.08, -r * 0.25);
                c.lineTo(r * 0.28, r * 0.15);
                c.lineTo(r * 0.08, r * 0.15);
                c.closePath(); c.fill();
            }
            // head
            c.fillStyle = isGone ? 'rgba(255,255,255,0.1)' :
                isScared ? (flash ? '#ccccff' : '#8888cc') : '#ffcc88';
            c.shadowColor = glowColor;
            c.shadowBlur = isGone ? 0 : 8;
            c.beginPath();
            c.arc(0, -r * 0.58, r * 0.42, 0, Math.PI * 2);
            c.fill();
            c.shadowBlur = 0;
            // hair (slicked back)
            if (!isGone) {
                const hairColors = ['#333', '#1a1a1a', '#443322', '#554433'];
                c.fillStyle = isScared ? '#333366' : hairColors[this.idx];
                c.beginPath();
                c.ellipse(0, -r * 0.85, r * 0.4, r * 0.18, 0, 0, Math.PI, true);
                c.fill();
                // sideburns
                c.fillRect(-r * 0.4, -r * 0.78, r * 0.08, r * 0.15);
                c.fillRect(r * 0.32, -r * 0.78, r * 0.08, r * 0.15);
            }
            // eyes
            if (!isGone) {
                const pd = this.dir >= 0 ? this.dir : RIGHT;
                const eOff = DX[pd] * 1.5;
                if (isScared) {
                    c.fillStyle = '#fff';
                    c.beginPath(); c.arc(-r * 0.16, -r * 0.58, 4, 0, Math.PI * 2); c.fill();
                    c.beginPath(); c.arc(r * 0.16, -r * 0.58, 4, 0, Math.PI * 2); c.fill();
                    c.fillStyle = '#111';
                    c.beginPath(); c.arc(-r * 0.16, -r * 0.58, 2.2, 0, Math.PI * 2); c.fill();
                    c.beginPath(); c.arc(r * 0.16, -r * 0.58, 2.2, 0, Math.PI * 2); c.fill();
                    c.strokeStyle = flash ? '#fff' : '#aaa';
                    c.lineWidth = 1.5;
                    c.beginPath(); c.arc(0, -r * 0.4, r * 0.12, 0, Math.PI); c.stroke();
                } else {
                    // menacing eyes
                    c.fillStyle = '#fff';
                    c.beginPath(); c.ellipse(-r * 0.16 + eOff, -r * 0.58, 3.5, 4, 0, 0, Math.PI * 2); c.fill();
                    c.beginPath(); c.ellipse(r * 0.16 + eOff, -r * 0.58, 3.5, 4, 0, 0, Math.PI * 2); c.fill();
                    c.fillStyle = '#111';
                    c.beginPath(); c.arc(-r * 0.16 + eOff + DX[pd] * 1.2, -r * 0.58 + DY[pd], 2.2, 0, Math.PI * 2); c.fill();
                    c.beginPath(); c.arc(r * 0.16 + eOff + DX[pd] * 1.2, -r * 0.58 + DY[pd], 2.2, 0, Math.PI * 2); c.fill();
                    // frown eyebrows
                    c.strokeStyle = '#333'; c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(-r * 0.28, -r * 0.72); c.lineTo(-r * 0.06, -r * 0.68);
                    c.stroke();
                    c.beginPath();
                    c.moveTo(r * 0.28, -r * 0.72); c.lineTo(r * 0.06, -r * 0.68);
                    c.stroke();
                    // grimace
                    c.strokeStyle = '#884422'; c.lineWidth = 1.5;
                    c.beginPath();
                    c.moveTo(-r * 0.1, -r * 0.4);
                    c.lineTo(r * 0.1, -r * 0.42);
                    c.stroke();
                }
            } else {
                const pd = this.dir >= 0 ? this.dir : RIGHT;
                c.fillStyle = 'rgba(100,100,255,0.5)';
                c.beginPath(); c.arc(-r * 0.16 + DX[pd], -r * 0.58 + DY[pd], 3, 0, Math.PI * 2); c.fill();
                c.beginPath(); c.arc(r * 0.16 + DX[pd], -r * 0.58 + DY[pd], 3, 0, Math.PI * 2); c.fill();
            }
            c.restore();
        }
        // suit outfit is drawn inline in draw()
    }

    // ─── BONUS ITEM ─────────────────────────────────────────────
    const BONUS_TYPES = [
        { name: 'Livro', emoji: '📖', color: '#ff6699', points: 100 },
        { name: 'Lâmpada', emoji: '💡', color: '#ffdd44', points: 200 },
        { name: 'Caderno', emoji: '📓', color: '#66ccff', points: 300 },
        { name: 'Diploma', emoji: '🎓', color: '#cc66ff', points: 500 }
    ];

    class BonusItem {
        constructor(col, row, level) {
            this.col = col; this.row = row;
            this.x = px(col); this.y = py(row);
            this.type = BONUS_TYPES[Math.min(level, BONUS_TYPES.length - 1)];
            this.timer = 10;
            this.active = true;
            this.pulse = 0;
        }
        update(dt) {
            this.timer -= dt;
            this.pulse += dt * 4;
            if (this.timer <= 0) this.active = false;
        }
        draw(c) {
            if (!this.active) return;
            const s = 1 + Math.sin(this.pulse) * 0.15;
            c.save();
            c.translate(this.x, this.y);
            c.scale(s, s);
            c.shadowColor = this.type.color;
            c.shadowBlur = 16;
            c.font = `${CELL * 0.7}px serif`;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(this.type.emoji, 0, 0);
            c.shadowBlur = 0;
            c.restore();
        }
    }

    // ─── FLOATING SCORE TEXT ────────────────────────────────────
    class FloatText {
        constructor(x, y, text, color) {
            this.x = x; this.y = y; this.text = text; this.color = color;
            this.life = 1; this.maxLife = 1;
        }
        update(dt) { this.y -= 30 * dt; this.life -= dt; }
        draw(c) {
            const a = Math.max(0, this.life / this.maxLife);
            c.globalAlpha = a;
            c.font = 'bold 13px "Press Start 2P"';
            c.fillStyle = this.color;
            c.shadowColor = this.color;
            c.shadowBlur = 8;
            c.textAlign = 'center';
            c.fillText(this.text, this.x, this.y);
            c.shadowBlur = 0;
            c.globalAlpha = 1;
        }
    }

    // ─── MAIN GAME ──────────────────────────────────────────────
    class Game {
        constructor(canvas) {
            this.cvs = canvas;
            this.c = canvas.getContext('2d');
            this.cvs.width = CW;
            this.cvs.height = CH;
            this.audio = new Audio();
            this.particles = new Particles();
            this.floats = [];
            this.state = 'start';
            this.score = 0;
            this.lives = 3;
            this.level = 0;
            this.dotsLeft = 0;
            this.dotsTotal = 0;
            this.powered = false;
            this.powerTimer = 0;
            this.teachersEaten = 0;
            this.time = 0;
            this.stateTimer = 0;
            this.maze = [];
            this.player = new Player();
            this.teachers = [0, 1, 2, 3].map(i => new Teacher(i));
            this.bonus = null;
            this.bonusTimer = 0;
            this.extraLifeGiven = false;
            this.rankings = JSON.parse(localStorage.getItem('pacfelipe_rank') || '[]');
            this.titlePulse = 0;
            this.stars = Array.from({ length: 60 }, () => ({
                x: Math.random() * CW, y: Math.random() * CH,
                r: 0.5 + Math.random() * 1.5, s: 0.5 + Math.random() * 2
            }));
            // Load feder images
            this.federImg = new Image();
            this.federImg.src = 'feder.jpg';
            this.federImgLoaded = false;
            this.federImg.onload = () => { this.federImgLoaded = true; };
            this.federStartImg = new Image();
            this.federStartImg.src = 'feder_start.jpg';
            this.federStartImgLoaded = false;
            this.federStartImg.onload = () => { this.federStartImgLoaded = true; };
        }

        loadLevel(n) {
            this.maze = MAZE_TPL.map(r => [...r]);
            this.dotsLeft = 0;
            this.dotsTotal = 0;
            for (let r = 0; r < ROWS; r++)
                for (let cc = 0; cc < COLS; cc++)
                    if (this.maze[r][cc] === DOT || this.maze[r][cc] === POWER) { this.dotsLeft++; this.dotsTotal++; }
            this.player.reset();
            this.teachers.forEach(t => t.reset());
            this.powered = false;
            this.powerTimer = 0;
            this.teachersEaten = 0;
            this.bonus = null;
            this.bonusTimer = 15 + Math.random() * 10;
        }

        startGame() {
            this.audio.init();
            this.score = 0;
            this.lives = 3;
            this.level = 0;
            this.extraLifeGiven = false;
            this.loadLevel(0);
            this.state = 'playing';
        }

        update(dt) {
            this.time += dt;
            if (this.state === 'start') {
                this.titlePulse += dt;
                this.stars.forEach(s => { s.y += s.s * dt * 20; if (s.y > CH) s.y = 0; });
                return;
            }
            if (this.state === 'dying') {
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.state = 'gameover';
                        this._saveRanking();
                    } else {
                        this.player.reset();
                        this.teachers.forEach(t => t.reset());
                        this.powered = false;
                        this.powerTimer = 0;
                        this.state = 'playing';
                    }
                }
                return;
            }
            if (this.state === 'levelcomplete') {
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.level++;
                    this.loadLevel(this.level);
                    this.state = 'playing';
                }
                return;
            }
            if (this.state === 'gameover') return;
            if (this.state !== 'playing') return;

            const spd = 3.5 + this.level * 0.2;
            this.player.update(dt, this.maze, spd);
            this.teachers.forEach(t => t.update(dt, this.maze, this.player, spd * 0.95, this.level));
            this.particles.update(dt);
            this.floats = this.floats.filter(f => { f.update(dt); return f.life > 0; });

            // power timer
            if (this.powered) {
                this.powerTimer -= dt;
                if (this.powerTimer <= 0) { this.powered = false; this.teachersEaten = 0; }
            }
            // bonus item
            if (!this.bonus) {
                this.bonusTimer -= dt;
                if (this.bonusTimer <= 0) this._spawnBonus();
            } else {
                this.bonus.update(dt);
                if (!this.bonus.active) this.bonus = null;
            }
            // collision: dots
            this._checkDots();
            // collision: bonus
            this._checkBonus();
            // collision: teachers
            this._checkTeachers();
            // extra life
            if (!this.extraLifeGiven && this.score >= EXTRA_LIFE_AT) {
                this.extraLifeGiven = true;
                this.lives++;
            }
        }

        _checkDots() {
            const { col, row } = this.player;
            if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
            const v = this.maze[row][col];
            if (v === DOT) {
                this.maze[row][col] = 0;
                this.score += SCORES.DOT;
                this.dotsLeft--;
                this.audio.dot();
                this.particles.emit(this.player.x, this.player.y, '#00ffcc', 6);
                this.floats.push(new FloatText(this.player.x, this.player.y - 10, '+10', '#00ffcc'));
                if (this.dotsLeft <= 0) {
                    this.state = 'levelcomplete';
                    this.stateTimer = 2.5;
                    this.audio.levelUp();
                }
            } else if (v === POWER) {
                this.maze[row][col] = 0;
                this.score += SCORES.POWER;
                this.dotsLeft--;
                this.powered = true;
                this.powerTimer = POWER_TIME;
                this.teachersEaten = 0;
                this.audio.power();
                this.particles.emit(this.player.x, this.player.y, '#ffff00', 20);
                this.floats.push(new FloatText(this.player.x, this.player.y - 10, 'CORAGEM!', '#ffff00'));
                this.teachers.forEach(t => t.scare(POWER_TIME));
                if (this.dotsLeft <= 0) {
                    this.state = 'levelcomplete';
                    this.stateTimer = 2.5;
                    this.audio.levelUp();
                }
            }
        }

        _checkBonus() {
            if (!this.bonus || !this.bonus.active) return;
            if (this.player.col === this.bonus.col && this.player.row === this.bonus.row) {
                this.score += this.bonus.type.points;
                this.particles.emit(this.bonus.x, this.bonus.y, this.bonus.type.color, 18);
                this.floats.push(new FloatText(this.bonus.x, this.bonus.y - 10, `+${this.bonus.type.points}`, this.bonus.type.color));
                this.audio.power();
                this.bonus = null;
            }
        }

        _checkTeachers() {
            const p = this.player;
            for (const t of this.teachers) {
                if (t.mode === 'wait' || t.mode === 'eaten') continue;
                const d = (p.x - t.x) ** 2 + (p.y - t.y) ** 2;
                if (d < (CELL * 0.6) ** 2) {
                    if (this.powered && t.mode === 'frightened') {
                        const pts = SCORES.TEACHER[Math.min(this.teachersEaten, 3)];
                        this.score += pts;
                        this.teachersEaten++;
                        t.eat();
                        this.audio.eatTeacher();
                        this.particles.emit(t.x, t.y, t.color, 15);
                        this.floats.push(new FloatText(t.x, t.y - 10, `+${pts}`, '#fff'));
                    } else {
                        this.state = 'dying';
                        this.stateTimer = 3;
                        this.audio.die();
                    }
                }
            }
        }

        _spawnBonus() {
            // find a random dot position
            const positions = [];
            for (let r = 0; r < ROWS; r++)
                for (let cc = 0; cc < COLS; cc++)
                    if (this.maze[r][cc] === DOT) positions.push({ col: cc, row: r });
            if (positions.length > 0) {
                const p = positions[Math.floor(Math.random() * positions.length)];
                this.bonus = new BonusItem(p.col, p.row, this.level);
            }
            this.bonusTimer = 20 + Math.random() * 15;
        }

        _saveRanking() {
            this.rankings.push({ score: this.score, level: this.level + 1, date: new Date().toLocaleDateString('pt-BR') });
            this.rankings.sort((a, b) => b.score - a.score);
            this.rankings = this.rankings.slice(0, 10);
            localStorage.setItem('pacfelipe_rank', JSON.stringify(this.rankings));
        }

        // ─── DRAWING ────────────────────────────────────────────
        draw() {
            const c = this.c;
            c.clearRect(0, 0, CW, CH);
            c.fillStyle = '#05061a';
            c.fillRect(0, 0, CW, CH);

            if (this.state === 'start') { this._drawStart(c); return; }
            if (this.state === 'gameover') { this._drawGameOver(c); return; }
            this._drawHUD(c);
            this._drawMaze(c);
            if (this.bonus) this.bonus.draw(c);
            this.particles.draw(c);
            this.floats.forEach(f => f.draw(c));
            if (this.state !== 'dying') {
                this.player.draw(c, this.powered, this.time);
            } else {
                // death animation: shrinking player
                const t = 1 - this.stateTimer / 3;
                c.save();
                c.globalAlpha = 1 - t;
                c.translate(this.player.x, this.player.y);
                c.scale(1 - t, 1 - t);
                c.translate(-this.player.x, -this.player.y);
                this.player.draw(c, false, this.time);
                c.restore();
                // death message based on remaining lives
                if (t > 0.15) {
                    c.save();
                    const alpha = Math.min(1, (t - 0.15) * 2.5);
                    // full dark overlay
                    c.globalAlpha = alpha * 0.75;
                    c.fillStyle = '#000';
                    c.fillRect(0, 0, CW, CH);
                    // text
                    c.globalAlpha = alpha;
                    c.font = '26px "Press Start 2P"';
                    c.textAlign = 'center';
                    c.strokeStyle = '#000';
                    c.lineWidth = 4;
                    c.fillStyle = '#ff2244';
                    c.shadowColor = '#ff2244';
                    c.shadowBlur = 30 + Math.sin(this.time * 6) * 15;
                    let msg1, msg2;
                    if (this.lives === 3) { msg1 = 'Você não cumpriu'; msg2 = 'a meta!'; }
                    else if (this.lives === 2) { msg1 = 'Você perdeu'; msg2 = 'as abonadas!'; }
                    else { msg1 = 'Você está'; msg2 = 'exonerado!'; }
                    c.strokeText(msg1, CW / 2, CH / 2 - 20);
                    c.fillText(msg1, CW / 2, CH / 2 - 20);
                    c.strokeText(msg2, CW / 2, CH / 2 + 22);
                    c.fillText(msg2, CW / 2, CH / 2 + 22);
                    c.shadowBlur = 0;
                    c.restore();
                }
            }
            this.teachers.forEach(t => t.draw(c, this.time));
            if (this.powered) this._drawEnergyBar(c);
            if (this.state === 'levelcomplete') {
                c.fillStyle = 'rgba(0,0,0,0.4)';
                c.fillRect(0, 0, CW, CH);
                c.font = '18px "Press Start 2P"';
                c.fillStyle = '#00ff88';
                c.shadowColor = '#00ff88'; c.shadowBlur = 20;
                c.textAlign = 'center';
                c.fillText(`FASE ${this.level + 1} COMPLETA!`, CW / 2, CH / 2);
                c.shadowBlur = 0;
            }
        }

        _drawStart(c) {
            // stars
            c.fillStyle = '#fff';
            this.stars.forEach(s => {
                c.globalAlpha = 0.3 + Math.sin(this.time * s.s) * 0.3;
                c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill();
            });
            c.globalAlpha = 1;
            // title
            const glow = 10 + Math.sin(this.titlePulse * 2) * 8;
            c.font = '24px "Press Start 2P"';
            c.textAlign = 'center';
            c.fillStyle = '#ffe100';
            c.shadowColor = '#ffe100'; c.shadowBlur = glow;
            c.fillText('FUJA DO', CW / 2, CH * 0.20);
            c.font = '36px "Press Start 2P"';
            c.fillStyle = '#ff2244';
            c.shadowColor = '#ff2244';
            c.fillText('FEDER', CW / 2, CH * 0.28);
            c.shadowBlur = 0;
            // start screen image
            if (this.federStartImgLoaded) {
                const imgH = CH * 0.35;
                const imgW = imgH * (this.federStartImg.width / this.federStartImg.height);
                c.drawImage(this.federStartImg, CW / 2 - imgW / 2, CH * 0.28, imgW, imgH);
            }
            // characters preview
            const previewY = CH * 0.74;
            // draw student preview
            this.player.x = CW / 2 - 80; this.player.y = previewY;
            this.player.dir = RIGHT;
            this.player.moving = true;
            this.player.mouthAngle = 0.15 + Math.sin(this.time * 6) * 0.1;
            this.player.draw(c, false, this.time);
            // draw teacher previews using their humanoid draw
            for (let i = 0; i < 4; i++) {
                const t = this.teachers[i];
                const savedX = t.x, savedY = t.y, savedMode = t.mode, savedDir = t.dir;
                t.x = CW / 2 - 20 + i * 40;
                t.y = previewY;
                t.mode = 'chase';
                t.dir = LEFT;
                t.draw(c, this.time);
                t.x = savedX; t.y = savedY; t.mode = savedMode; t.dir = savedDir;
            }
            // instructions
            c.font = '10px "Press Start 2P"';
            c.fillStyle = '#aaa';
            c.textAlign = 'center';
            c.fillText('Setas ou WASD para mover', CW / 2, CH * 0.80);
            c.fillText('Colete conhecimentos!', CW / 2, CH * 0.84);
            // blink "press start"
            if (Math.sin(this.time * 3) > 0) {
                c.font = '13px "Press Start 2P"';
                c.fillStyle = '#ff66aa';
                c.shadowColor = '#ff66aa'; c.shadowBlur = 12;
                c.fillText('PRESS ENTER', CW / 2, CH * 0.90);
                c.shadowBlur = 0;
            }
            // ranking
            if (this.rankings.length > 0) {
                c.font = '9px "Press Start 2P"';
                c.fillStyle = '#888';
                c.fillText('─── RANKING ───', CW / 2, CH * 0.87);
                for (let i = 0; i < Math.min(5, this.rankings.length); i++) {
                    const r = this.rankings[i];
                    c.fillStyle = i === 0 ? '#ffd700' : '#666';
                    c.fillText(`${i + 1}. ${r.score} pts  Fase ${r.level}`, CW / 2, CH * 0.91 + i * 16);
                }
            }
        }

        _drawGameOver(c) {
            c.fillStyle = 'rgba(5,6,26,0.92)';
            c.fillRect(0, 0, CW, CH);
            c.font = '24px "Press Start 2P"';
            c.textAlign = 'center';
            c.fillStyle = '#ff2244';
            c.shadowColor = '#ff2244'; c.shadowBlur = 20;
            c.fillText('GAME OVER', CW / 2, CH * 0.25);
            c.shadowBlur = 0;
            // feder image
            if (this.federImgLoaded) {
                const imgH = CH * 0.35;
                const imgW = imgH * (this.federImg.width / this.federImg.height);
                c.drawImage(this.federImg, CW / 2 - imgW / 2, CH * 0.26, imgW, imgH);
            }
            c.font = '12px "Press Start 2P"';
            c.fillStyle = '#fff';
            c.fillText(`Pontos: ${this.score}`, CW / 2, CH * 0.55);
            c.fillText(`Fase: ${this.level + 1}`, CW / 2, CH * 0.60);
            // ranking
            c.font = '10px "Press Start 2P"';
            c.fillStyle = '#ffaa00';
            c.fillText('─── RANKING ───', CW / 2, CH * 0.68);
            for (let i = 0; i < Math.min(10, this.rankings.length); i++) {
                const r = this.rankings[i];
                c.fillStyle = i === 0 ? '#ffd700' : '#aaa';
                c.fillText(`${i + 1}. ${r.score} pts  Fase ${r.level}`, CW / 2, CH * 0.72 + i * 18);
            }
            if (Math.sin(this.time * 3) > 0) {
                c.font = '11px "Press Start 2P"';
                c.fillStyle = '#00ffcc';
                c.shadowColor = '#00ffcc'; c.shadowBlur = 10;
                c.fillText('PRESS ENTER', CW / 2, CH * 0.92);
                c.shadowBlur = 0;
            }
        }

        _drawHUD(c) {
            // score
            c.font = '12px "Press Start 2P"';
            c.fillStyle = '#fff';
            c.textAlign = 'left';
            c.fillText(`PONTOS`, 10, 24);
            c.fillStyle = '#00ffcc';
            c.fillText(`${this.score}`, 10, 44);
            // level
            c.textAlign = 'center';
            c.fillStyle = '#fff';
            c.fillText(`FASE ${this.level + 1}`, CW / 2, 24);
            // lives
            c.textAlign = 'right';
            c.fillStyle = '#fff';
            c.fillText('VIDAS', CW - 10, 24);
            for (let i = 0; i < this.lives; i++) {
                const lx = CW - 20 - i * 22;
                c.fillStyle = '#ffe100';
                c.shadowColor = '#ffe100'; c.shadowBlur = 6;
                c.beginPath();
                c.arc(lx, 42, 8, 0.2 * Math.PI, 1.8 * Math.PI);
                c.lineTo(lx, 42);
                c.fill();
                c.shadowBlur = 0;
            }
            // separator line
            c.strokeStyle = 'rgba(0,255,247,0.2)';
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(0, HDR - 6);
            c.lineTo(CW, HDR - 6);
            c.stroke();
        }

        _drawEnergyBar(c) {
            const barY = ROWS * CELL + HDR + 10;
            const barW = CW - 40;
            const pct = Math.max(0, this.powerTimer / POWER_TIME);
            // bg
            c.fillStyle = 'rgba(255,255,255,0.08)';
            c.fillRect(20, barY, barW, 16);
            // fill
            const grad = c.createLinearGradient(20, 0, 20 + barW * pct, 0);
            grad.addColorStop(0, '#00ffcc');
            grad.addColorStop(1, '#ffff00');
            c.fillStyle = grad;
            c.shadowColor = '#00ffcc'; c.shadowBlur = 8;
            c.fillRect(20, barY, barW * pct, 16);
            c.shadowBlur = 0;
            // label
            c.font = '8px "Press Start 2P"';
            c.fillStyle = '#fff';
            c.textAlign = 'center';
            c.fillText('⚡ CORAGEM ⚡', CW / 2, barY + 12);
        }

        _drawMaze(c) {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const v = this.maze[row][col];
                    const cx = px(col), cy = py(row);
                    if (v === WALL) {
                        this._drawWall(c, col, row);
                    } else if (v === DOT) {
                        c.fillStyle = '#66ddff';
                        c.shadowColor = '#66ddff'; c.shadowBlur = 4;
                        c.beginPath();
                        c.arc(cx, cy, 2.5, 0, Math.PI * 2);
                        c.fill();
                        c.shadowBlur = 0;
                    } else if (v === POWER) {
                        const s = 3.5 + Math.sin(this.time * 4) * 1.5;
                        c.fillStyle = '#ffdd44';
                        c.shadowColor = '#ffdd44'; c.shadowBlur = 12;
                        c.beginPath();
                        c.arc(cx, cy, s, 0, Math.PI * 2);
                        c.fill();
                        c.shadowBlur = 0;
                    } else if (v === DOOR) {
                        c.fillStyle = '#ff88aa';
                        c.shadowColor = '#ff88aa'; c.shadowBlur = 4;
                        c.fillRect(cx - CELL / 2, cy - 1, CELL, 3);
                        c.shadowBlur = 0;
                    }
                }
            }
        }

        _drawWall(c, col, row) {
            const x = col * CELL, y = row * CELL + HDR;
            const s = CELL;
            // determine which edges face a non-wall
            const top = row > 0 && this.maze[row - 1][col] !== WALL;
            const bottom = row < ROWS - 1 && this.maze[row + 1][col] !== WALL;
            const left = col > 0 && this.maze[row][col - 1] !== WALL;
            const right = col < COLS - 1 && this.maze[row][col + 1] !== WALL;

            const levelHue = (200 + this.level * 40) % 360;
            const wallColor = `hsl(${levelHue}, 80%, 45%)`;
            const glowColor = `hsl(${levelHue}, 90%, 55%)`;

            c.strokeStyle = wallColor;
            c.shadowColor = glowColor;
            c.shadowBlur = 6;
            c.lineWidth = 2;

            const m = 3; // margin
            if (top) { c.beginPath(); c.moveTo(x + m, y + m); c.lineTo(x + s - m, y + m); c.stroke(); }
            if (bottom) { c.beginPath(); c.moveTo(x + m, y + s - m); c.lineTo(x + s - m, y + s - m); c.stroke(); }
            if (left) { c.beginPath(); c.moveTo(x + m, y + m); c.lineTo(x + m, y + s - m); c.stroke(); }
            if (right) { c.beginPath(); c.moveTo(x + s - m, y + m); c.lineTo(x + s - m, y + s - m); c.stroke(); }
            c.shadowBlur = 0;
        }

        handleKey(key) {
            if (this.state === 'start' || this.state === 'gameover') {
                if (key === 'Enter' || key === ' ') { this.startGame(); }
                return;
            }
            if (this.state !== 'playing') return;
            switch (key) {
                case 'ArrowUp': case 'w': case 'W': this.player.nextDir = UP; break;
                case 'ArrowDown': case 's': case 'S': this.player.nextDir = DOWN; break;
                case 'ArrowLeft': case 'a': case 'A': this.player.nextDir = LEFT; break;
                case 'ArrowRight': case 'd': case 'D': this.player.nextDir = RIGHT; break;
            }
        }
    }

    // ─── INIT ───────────────────────────────────────────────────
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    let lastTime = 0;

    function loop(ts) {
        const dt = Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts;
        game.update(dt);
        game.draw();
        requestAnimationFrame(loop);
    }

    document.addEventListener('keydown', e => {
        game.handleKey(e.key);
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    });

    requestAnimationFrame(ts => { lastTime = ts; loop(ts); });

})();
