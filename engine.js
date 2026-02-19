// 1. 전술 데이터 (window 전역 객체로 확실히 고정)
window.tactics = {
    attack: { passing_way: 1, tempo: 1, width: 4, transition: 1, creativity: 4, time_wasting: 2, set_piece: 1, dribble_focus: 1, patience: 7, long_shot: 1, cross_style: 1, participation: 4, advance: 4, passing_target: 1 },
    buildup: { tactic_intensity: 7, goal_kick_length: 1, gk_dist_speed: 7 },
    defense: { press_line: 6, defensive_line: 6, line_behavior: 7, press_frequency: 7, transition: 7, tackling: 4, press_trap: 4, gk_short_dist: 7, cross_defense: 4, block_style_level: 4 },
    defense_priority: { type: "Box", intensity: 7 }
};

// UI 업데이트 함수 (ReferenceError 방지)
window.updateVal = (cat, key, val) => { window.tactics[cat][key] = parseInt(val); document.getElementById(`${cat}-${key}-val`).innerText = val; };
window.updatePriorityInt = (val) => { window.tactics.defense_priority.intensity = parseInt(val); };
window.updatePriorityType = (val) => { window.tactics.defense_priority.type = val; };

// 2. 물리 및 환경
let ball = { x: 350, y: 225, vx: 0, vy: 0, owner: null };
let players = [];

class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id; this.homeX = x; this.homeY = y;
        this.x = x; this.y = y; this.team = team; this.isGK = isGK;
        this.stats = { vision: 75, passing: 75, aggression: 75 }; // 올 75
    }

    update() {
        const distToBall = Math.hypot(ball.x - this.x, ball.y - this.y);
        const distToHome = Math.hypot(this.homeX - this.x, this.homeY - this.y);

        // [AI 판단 로직]
        if (ball.owner === this) {
            this.handlePossession();
        } else {
            // 자석 현상 방지: 공이 내 압박 사거리(전술 수치 반영) 안에 있을 때만 추적
            const myZone = 100 + (window.tactics.defense.press_line * 15); 
            if (distToBall < myZone && !this.isGK) {
                const speed = (window.tactics.defense.press_frequency / 7) * 2;
                this.moveTowards(ball.x, ball.y, 0.03 * speed);
            } else {
                // 내 구역이 아니면 집으로 돌아감 (매우 중요!)
                this.moveTowards(this.homeX, this.homeY, 0.05);
            }
        }

        // [물리적 거리 유지] 선수들이 겹쳐서 한 점이 되는 것을 강제로 막음
        players.forEach(p => {
            if (p.id !== this.id) {
                const d = Math.hypot(this.x - p.x, this.y - p.y);
                if (d < 25) { // 최소 25px 거리 유지
                    const angle = Math.atan2(this.y - p.y, this.x - p.x);
                    this.x += Math.cos(angle) * 2;
                    this.y += Math.sin(angle) * 2;
                }
            }
        });

        // 공 소유 판정
        if (distToBall < 12 && !ball.owner) {
            ball.owner = this;
            ball.vx = 0; ball.vy = 0;
        }
    }

    handlePossession() {
        // 맥 알리스터식 판단: patience(참을성)가 높으면 패스, 낮으면 돌파/슛
        const decision = Math.random() * 100;
        if (decision < 2) { // 낮은 확률로 패스 시도
            this.pass();
        } else {
            // 전진 드리블
            this.x += (this.team === 'A' ? 1.5 : -1.5);
            // 경기장 밖으로 나가면 패스
            if (this.x > 680 || this.x < 20) this.pass();
        }
    }

    pass() {
        ball.owner = null;
        ball.vx = (this.team === 'A' ? 8 : -8);
        ball.vy = (Math.random() - 0.5) * 6;
    }

    moveTowards(tx, ty, ease) {
        this.x += (tx - this.x) * ease;
        this.y += (ty - this.y) * ease;
    }

    draw(ctx) {
        ctx.fillStyle = this.isGK ? "#FFD700" : (this.team === 'A' ? "#2196F3" : "#F44336");
        ctx.beginPath(); ctx.arc(this.x, this.y, 10, 0, Math.PI*2); ctx.fill();
        if (ball.owner === this) {
            ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
        }
    }
}

// 3. 실행부
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

function setup() {
    players = [];
    // 팀 A 진형
    players.push(new Player(0, 50, 225, 'A', true));
    for(let i=1; i<=10; i++) players.push(new Player(i, 150 + Math.floor((i-1)/4)*100, 80 + ((i-1)%4)*90, 'A'));
    // 팀 B 진형
    players.push(new Player(11, 650, 225, 'B', true));
    for(let i=1; i<=10; i++) players.push(new Player(i+11, 550 - Math.floor((i-1)/4)*100, 80 + ((i-1)%4)*90, 'B'));
}

function loop() {
    ctx.fillStyle = "#2c5e2e"; ctx.fillRect(0,0,700,450);
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.strokeRect(0,0,700,450);

    if (ball.owner) {
        ball.x = ball.owner.x; ball.y = ball.owner.y;
    } else {
        ball.x += ball.vx; ball.y += ball.vy;
        ball.vx *= 0.98; ball.vy *= 0.98;
        if (ball.x < 0 || ball.x > 700) ball.vx *= -1;
        if (ball.y < 0 || ball.y > 450) ball.vy *= -1;
    }

    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI*2); ctx.fill();
    players.forEach(p => { p.update(); p.draw(ctx); });
    requestAnimationFrame(loop);
}

setup(); loop();
