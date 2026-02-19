// 1. 전술 및 스탯 설정
window.tactics = {
    attack: { passing_way: 1, tempo: 1, width: 4, transition: 1, creativity: 4, time_wasting: 2, set_piece: 1, dribble_focus: 1, patience: 7, long_shot: 1, cross_style: 1, participation: 4, advance: 4, passing_target: 1 },
    buildup: { tactic_intensity: 7, goal_kick_length: 1, gk_dist_speed: 7 },
    defense: { press_line: 6, defensive_line: 6, line_behavior: 7, press_frequency: 7, transition: 7, tackling: 4, press_trap: 4, gk_short_dist: 7, cross_defense: 4, block_style_level: 4 },
    defense_priority: { type: "Box", intensity: 7 }
};

// 모든 선수 기본 스탯 (유저 요청: 75 고정)
const BASE_STATS = { vision: 75, passing: 75, finishing: 75, positioning: 75, aggression: 75 };

// 2. UI 연결 (window에 확실히 바인딩)
window.updateVal = (cat, key, val) => {
    window.tactics[cat][key] = parseInt(val);
    const label = document.getElementById(`${cat}-${key}-val`);
    if(label) label.innerText = val;
};
window.updatePriorityInt = (val) => { window.tactics.defense_priority.intensity = parseInt(val); };
window.updatePriorityType = (val) => { window.tactics.defense_priority.type = val; };

// 3. 물리 엔진
let ball = { x: 350, y: 225, vx: 0, vy: 0, owner: null };
let players = [];

class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id; this.homeX = x; this.homeY = y;
        this.x = x; this.y = y; this.team = team; this.isGK = isGK;
        this.state = "IDLE";
    }

    // [맥 알리스터 예시 스탯 기반 AI 로직]
    decide() {
        const distToBall = Math.hypot(ball.x - this.x, ball.y - this.y);
        
        // 1. 내가 공을 가졌을 때 (공격 AI)
        if (ball.owner === this) {
            // 참을성(patience)이 높으면 슛보다 패스 길을 더 찾음
            const shootChance = Math.random() * 100;
            const shootThreshold = 95 - (window.tactics.attack.patience * 2);

            if (this.x > 500 && shootChance > shootThreshold) {
                this.action("SHOOT");
            } else {
                this.action("PASS");
            }
        } 
        // 2. 수비 시 (수비 AI)
        else {
            const pressLimit = window.tactics.defense.press_line * 40;
            if (distToBall < pressLimit) {
                this.state = "PRESSING";
            } else {
                this.state = "RETURNING";
            }
        }
    }

    action(type) {
        if (type === "PASS") {
            ball.owner = null;
            ball.vx = (this.team === 'A' ? 5 : -5) + (Math.random() - 0.5) * 4;
            ball.vy = (Math.random() - 0.5) * 4;
        } else if (type === "SHOOT") {
            ball.owner = null;
            ball.vx = (this.team === 'A' ? 12 : -12);
            ball.vy = (Math.random() - 0.5) * 2;
        }
    }

    update() {
        this.decide();

        if (this.state === "PRESSING") {
            this.x += (ball.x - this.x) * 0.04;
            this.y += (ball.y - this.y) * 0.04;
        } else {
            // 자기 자리로 돌아가기 (경직 해제를 위해 부드럽게 복귀)
            this.x += (this.homeX - this.x) * 0.02;
            this.y += (this.homeY - this.y) * 0.02;
        }

        // 공 소유 판정
        const distToBall = Math.hypot(ball.x - this.x, ball.y - this.y);
        if (distToBall < 10) ball.owner = this;

        // 선수 간 충돌 방지 (겹침 해결)
        players.forEach(p => {
            if(p === this) return;
            const d = Math.hypot(this.x - p.x, this.y - p.y);
            if(d < 15) {
                this.x += (this.x - p.x) * 0.1;
                this.y += (this.y - p.y) * 0.1;
            }
        });
    }

    draw(ctx) {
        ctx.fillStyle = this.isGK ? "#FFD700" : (this.team === 'A' ? "#2196F3" : "#F44336");
        ctx.beginPath(); ctx.arc(this.x, this.y, 8, 0, Math.PI*2); ctx.fill();
        if (ball.owner === this) { // 공 가진 선수 표시
            ctx.strokeStyle = "yellow"; ctx.lineWidth = 3; ctx.stroke();
        }
    }
}

// 4. 메인 루프 및 초기화
function setup() {
    players = [];
    // A팀 진형 (4-4-2)
    players.push(new Player(0, 50, 225, 'A', true));
    const formA = [[150,100],[150,200],[150,300],[150,400],[300,100],[300,200],[300,300],[300,400],[500,150],[500,300]];
    formA.forEach((pos, i) => players.push(new Player(i+1, pos[0], pos[1], 'A')));
    
    // B팀 진형 (대칭)
    players.push(new Player(11, 650, 225, 'B', true));
    formA.forEach((pos, i) => players.push(new Player(i+12, 700-pos[0], pos[1], 'B')));
}

const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

function loop() {
    ctx.fillStyle = "#2c5e2e"; ctx.fillRect(0,0,700,450);
    ctx.strokeStyle = "white"; ctx.strokeRect(0,0,700,450);

    if (!ball.owner) {
        ball.x += ball.vx; ball.y += ball.vy;
        ball.vx *= 0.98; ball.vy *= 0.98;
        if(ball.x<0 || ball.x>700) ball.vx *= -1;
        if(ball.y<0 || ball.y>450) ball.vy *= -1;
    } else {
        ball.x = ball.owner.x; ball.y = ball.owner.y;
    }

    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2); ctx.fill();
    players.forEach(p => { p.update(); p.draw(ctx); });
    requestAnimationFrame(loop);
}

setup(); loop();
