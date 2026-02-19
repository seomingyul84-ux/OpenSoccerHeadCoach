// 1. 전술 데이터 (기존 7단계 설정 유지)
const tactics = {
    attack: { passing_way: 1, tempo: 1, width: 4, patience: 7, dribble_focus: 1 },
    buildup: { tactic_intensity: 7, gk_dist_speed: 7, gk_dist_target: "CB" },
    defense: { press_line: 6, defensive_line: 6, line_behavior: 7, press_frequency: 7, transition: 7 },
    defense_priority: { type: "Box", intensity: 7 }
};

// 2. 경기 환경 설정 (공과 물리 엔진)
let ball = {
    x: 400, y: 225, 
    speedX: (Math.random() - 0.5) * 4, 
    speedY: (Math.random() - 0.5) * 4,
    xg: 0
};

// 3. 선수 클래스
class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.team = team;
        this.isGK = isGK;
        this.stats = 75; // 올 75 스탯
    }

    update() {
        // 공과의 거리 계산
        let dx = ball.x - this.x;
        let dy = ball.y - this.y;
        let dist = Math.hypot(dx, dy);

        if (this.isGK) {
            // [유저 설계 GK 4단계 로직]
            // 1. xG 위협 감지 (공이 골대 근처일 때)
            let xg = (this.team === 'A' && ball.x < 150) ? 0.2 : 0;
            if (xg >= 0.15) {
                this.y += (ball.y - this.y) * 0.1; // 정면 방어
            } 
            // 4. 스위퍼 키퍼 가담
            else if (tactics.defense.line_behavior >= 6 && ball.x > 300) {
                this.x += (150 - this.x) * 0.01; 
            }
        } else {
            // [필드 플레이어 AI]
            // 전술 수치(press_line)에 따라 반응
            let reactionLimit = tactics.defense.press_line * 60;
            if (dist < reactionLimit) {
                let speed = 1.5 * (tactics.defense.press_frequency / 7);
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
            }
        }

        // 공과 부딪히면 튕겨내기 (간이 물리)
        if (dist < 10) {
            ball.speedX = (Math.random() - 0.5) * 10;
            ball.speedY = (Math.random() - 0.5) * 10;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isGK ? "#FFD700" : (this.team === 'A' ? "#007bff" : "#ff4d4d");
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.fillText(this.isGK ? "GK" : "75", this.x - 7, this.y - 12);
    }
}

// 4. 팀 생성 및 실행
let players = [];
function setup() {
    // 우리 팀 A (파란색)
    players.push(new Player(0, 40, 225, 'A', true)); // GK
    for(let i=0; i<10; i++) players.push(new Player(i+1, 200 + Math.random()*100, 50 + i*35, 'A'));

    // 적 팀 B (빨간색)
    players.push(new Player(11, 760, 225, 'B', true)); // 적 GK
    for(let i=0; i<10; i++) players.push(new Player(i+12, 500 + Math.random()*100, 50 + i*35, 'B'));
}

const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

function loop() {
    // 경기장 배경
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(0, 0, 800, 450);
    
    // 골대 라인 시각화
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(0, 0, 800, 450);

    // 공 업데이트 및 그리기
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    if (ball.x < 0 || ball.x > 800) ball.speedX *= -1;
    if (ball.y < 0 || ball.y > 450) ball.speedY *= -1;
    ball.speedX *= 0.99; ball.speedY *= 0.99; // 마찰력

    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2); ctx.fill();

    // 선수 업데이트 및 그리기
    players.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    requestAnimationFrame(loop);
}

setup();
loop();
