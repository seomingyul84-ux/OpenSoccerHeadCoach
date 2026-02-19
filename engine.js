// 1. 전술 데이터 초기화
window.tactics = {
    attack: { patience: 7, creativity: 4, passing_way: 1, tempo: 1, width: 4 },
    defense: { press_line: 6, press_frequency: 7, defensive_line: 6 },
    buildup: { tactic_intensity: 7, gk_dist_speed: 7 },
    priority: { type: "Box", intensity: 7 }
};

// 슬라이더 연동 함수
window.updateVal = (cat, key, val) => {
    if (window.tactics[cat]) {
        window.tactics[cat][key] = parseInt(val);
        const label = document.getElementById(`${cat}-${key}-val`);
        if (label) label.innerText = val;
    }
};
window.updatePriorityType = (val) => { window.tactics.priority.type = val; };
window.updatePriorityInt = (val) => { window.tactics.priority.intensity = parseInt(val); };

// 2. 물리 환경
const FIELD = { w: 700, h: 450 };
let ball = { x: 350, y: 225, vx: 0, vy: 0, owner: null };
let players = [];

class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id;
        this.homeX = x; this.homeY = y;
        this.x = x; this.y = y;
        this.team = team; this.isGK = isGK;
        this.stats = { vision: 75, finishing: 75, passing: 75 }; 
    }

    update() {
        if (ball.owner === this) {
            this.handlePossessionAI(); 
        } else {
            this.handleDefensiveAI();
        }

        this.x = Math.max(20, Math.min(FIELD.w - 20, this.x));
        this.y = Math.max(20, Math.min(FIELD.h - 20, this.y));
        
        const d = Math.hypot(ball.x - this.x, ball.y - this.y);
        if (d < 12 && !ball.owner) ball.owner = this;

        players.forEach(p => {
            if (p.id !== this.id) {
                const pd = Math.hypot(this.x - p.x, this.y - p.y);
                if (pd < 25) {
                    this.x += (this.x - p.x) * 0.1;
                    this.y += (this.y - p.y) * 0.1;
                }
            }
        });
    }

    handlePossessionAI() {
        const currentXG = this.calculateXG();
        if (currentXG >= 0.25) {
            let shootProb = 85 - (window.tactics.attack.patience * 5);
            if (Math.random() * 100 < shootProb) {
                this.performAction("SHOOT");
                return;
            }
        }

        if (this.isMarked()) {
            let target = this.findTeammate(true);
            if (target) {
                this.decidePassOrDribble(target, 85);
            } else {
                target = this.findTeammate(false);
                if (target) this.decidePassOrDribble(target, 70);
                else Math.random() > 0.5 ? this.performAction("DRIBBLE") : this.performAction("PASS_RANDOM");
            }
        } else {
            this.performAction("DRIBBLE");
        }
    }

    handleDefensiveAI() {
        const d = Math.hypot(ball.x - this.x, ball.y - this.y);
        const pressLimit = window.tactics.defense.press_line * 35;
        if (d < pressLimit && !this.isGK) {
            const speed = (window.tactics.defense.press_frequency / 7) * 1.5;
            this.x += (ball.x - this.x) * 0.03 * speed;
            this.y += (ball.y - this.y) * 0.03 * speed;
        } else {
            this.x += (this.homeX - this.x) * 0.05;
            this.y += (this.homeY - this.y) * 0.05;
        }
    }

    calculateXG() {
        const dist = this.team === 'A' ? (FIELD.w - this.x) : this.x;
        return dist < 120 ? 0.3 : 0.1;
    }

    isMarked() {
        return players.some(p => p.team !== this.team && Math.hypot(this.x - p.x, this.y - p.y) < 40);
    }

    findTeammate(forwardOnly) {
        return players.find(p => {
            if (p.team !== this.team || p === this || p.isMarked()) return false;
            if (forwardOnly) return this.team === 'A' ? p.x > this.x : p.x < this.x;
            return true;
        });
    }

    decidePassOrDribble(target, prob) {
        if (Math.random() * 100 < prob - (window.tactics.attack.creativity * 2)) this.performAction("PASS", target);
        else this.performAction("DRIBBLE");
    }

    performAction(type, target = null) {
        ball.owner = null;
        if (type === "SHOOT") {
            ball.vx = this.team === 'A' ? 10 : -10;
            ball.vy = (Math.random() - 0.5) * 4;
        } else if (type === "PASS") {
            const dx = target.x - this.x, dy = target.y - this.y;
            const dist = Math.hypot(dx, dy);
            ball.vx = (dx / dist) * 7; ball.vy = (dy / dist) * 7;
        } else if (type === "DRIBBLE") {
            ball.owner = this;
            this.x += this.team === 'A' ? 1.5 : -1.5;
        } else {
            ball.vx = this.team === 'A' ? 6 : -6;
            ball.vy = (Math.random() - 0.5) * 6;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isGK ? "#FFD700" : (this.team === 'A' ? "#2196F3" : "#F44336");
        ctx.beginPath(); ctx.arc(this.x, this.y, 10, 0, Math.PI*2); ctx.fill();
        if (ball.owner === this) { ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke(); }
    }
}

// 4. 초기화 및 루프
const canvas = document.getElementById('field');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function setup() {
        players = [];
        // 팀 A
        players.push(new Player(0, 50, 225, 'A', true));
        for(let i=1; i<=10; i++) players.push(new Player(i, 150 + Math.floor((i-1)/4)*80, 50 + ((i-1)%4)*110, 'A'));
        // 팀 B
        players.push(new Player(11, 650, 225, 'B', true));
        for(let i=1; i<=10; i++) players.push(new Player(i+11, 550 - Math.floor((i-1)/4)*80, 50 + ((i-1)%4)*110, 'B'));
    }

    function loop() {
        ctx.fillStyle = "#2c5e2e"; ctx.fillRect(0, 0, FIELD.w, FIELD.h);
        ctx.strokeStyle = "white"; ctx.strokeRect(0, 0, FIELD.w, FIELD.h);
        
        if (ball.owner) { ball.x = ball.owner.x; ball.y = ball.owner.y; }
        else {
            ball.x += ball.vx; ball.y += ball.vy;
            ball.vx *= 0.98; ball.vy *= 0.98;
            if (ball.x < 0 || ball.x > FIELD.w) ball.vx *= -1;
            if (ball.y < 0 || ball.y > FIELD.h) ball.vy *= -1;
        }

        ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI*2); ctx.fill();
        players.forEach(p => { p.update(); p.draw(ctx); });
        requestAnimationFrame(loop);
    }
    setup(); 
    loop();
}
