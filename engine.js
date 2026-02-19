// 1. 전술 데이터 초기화
window.tactics = {
    attack: { passing_way: 1, tempo: 1, width: 4, transition: 1, creativity: 4, time_wasting: 2, set_piece: 1, dribble_focus: 1, patience: 7, long_shot: 1, cross_style: 1, participation: 4, advance: 4, passing_target: 1 },
    buildup: { tactic_intensity: 7, goal_kick_length: 1, gk_dist_speed: 7 },
    defense: { press_line: 6, defensive_line: 6, line_behavior: 7, press_frequency: 7, transition: 7, tackling: 4, press_trap: 4, gk_short_dist: 7, cross_defense: 4, block_style_level: 4 },
    defense_priority: { type: "Box", intensity: 7 }
};

// 2. 에러 해결용 전역 함수 (updatePriorityInt 등)
window.updateVal = (cat, key, val) => {
    window.tactics[cat][key] = parseInt(val);
    const el = document.getElementById(`${cat}-${key}-val`);
    if(el) el.innerText = val;
};
window.updatePriorityType = (val) => { window.tactics.defense_priority.type = val; };
window.updatePriorityInt = (val) => { window.tactics.defense_priority.intensity = parseInt(val); };

// 3. 물리 엔진 변수
let ball = { x: 350, y: 225, vx: 2, vy: 2 };
let players = [];

class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id;
        this.homeX = x; // 원래 위치
        this.homeY = y;
        this.x = x;
        this.y = y;
        this.team = team;
        this.isGK = isGK;
    }

    update() {
        const distToBall = Math.hypot(ball.x - this.x, ball.y - this.y);
        const distToHome = Math.hypot(this.homeX - this.x, this.homeY - this.y);

        // [진형 유지 시스템] 공이 멀면 집으로 돌아가려는 힘
        const homeForce = distToHome * 0.05;
        this.x += (this.homeX - this.x) * 0.05;
        this.y += (this.homeY - this.y) * 0.05;

        // [압박 시스템] 전술 수치에 따른 공 추적
        const pressLimit = window.tactics.defense.press_line * 35;
        if (distToBall < pressLimit && !this.isGK) {
            const speed = (window.tactics.defense.press_frequency / 7) * 1.5;
            this.x += (ball.x - this.x) * 0.02 * speed;
            this.y += (ball.y - this.y) * 0.02 * speed;
        }

        // [충돌 방지] 선수들끼리 겹치지 않게 밀어내기 (한 점으로 모이는 것 방지)
        players.forEach(other => {
            if (other.id !== this.id) {
                const d = Math.hypot(this.x - other.x, this.y - other.y);
                if (d < 20) { // 20px 이내면 서로 밀어냄
                    this.x += (this.x - other.x) * 0.1;
                    this.y += (this.y - other.y) * 0.1;
                }
            }
        });

        // 공 차기
        if (distToBall < 15) {
            ball.vx = (Math.random() - 0.5) * 15;
            ball.vy = (Math.random() - 0.5) * 15;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isGK ? "#FFD700" : (this.team === 'A' ? "#2196F3" : "#F44336");
        ctx.beginPath(); ctx.arc(this.x, this.y, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "white"; ctx.font = "10px Arial";
        ctx.fillText(this.isGK ? "GK" : "75", this.x-7, this.y-12);
    }
}

// 4. 초기화 및 루프
function setup() {
    players = [];
    // A팀 (파란색)
    players.push(new Player(0, 50, 225, 'A', true));
    for(let i=1; i<=10; i++) players.push(new Player(i, 150 + (i%3)*50, 40*i, 'A'));
    // B팀 (빨간색)
    players.push(new Player(11, 650, 225, 'B', true));
    for(let i=1; i<=10; i++) players.push(new Player(i+11, 550 - (i%3)*50, 40*i, 'B'));
}

const canvas = document.getElementById('field');
if(canvas) {
    const ctx = canvas.getContext('2d');
    function loop() {
        ctx.fillStyle = "#2c5e2e"; ctx.fillRect(0,0,700,450);
        ctx.strokeStyle = "white"; ctx.strokeRect(0,0,700,450);
        
        ball.x += ball.vx; ball.y += ball.vy;
        if(ball.x < 0 || ball.x > 700) ball.vx *= -1;
        if(ball.y < 0 || ball.y > 450) ball.vy *= -1;
        ball.vx *= 0.98; ball.vy *= 0.98;

        ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2); ctx.fill();
        players.forEach(p => { p.update(); p.draw(ctx); });
        requestAnimationFrame(loop);
    }
    setup(); loop();
}
