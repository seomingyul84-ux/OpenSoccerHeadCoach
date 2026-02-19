// 1. 전술 데이터 (이미지 기반 7단계)
const tactics = {
    attack: { passing_way: 1, tempo: 1, width: 4, transition: 1, creativity: 4, time_wasting: 2, set_piece: 1, dribble_focus: 1, patience: 7, long_shot: 1, cross_style: 1, participation: 4, advance: 4, passing_target: 1 },
    buildup: { tactic_intensity: 7, goal_kick_length: 1, gk_dist_speed: 7 },
    defense: { press_line: 6, defensive_line: 6, line_behavior: 7, press_frequency: 7, transition: 7, tackling: 4, press_trap: 4, gk_short_dist: 7, cross_defense: 4, block_style_level: 4 },
    defense_priority: { type: "Box", intensity: 7 }
};

// 2. 객체 초기화
let ball = { x: 350, y: 225, speedX: 2, speedY: 1.5 }; // 공 소환
let players = [];

class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id; this.x = x; this.y = y; this.team = team; this.isGK = isGK;
    }

    update() {
        // 공과의 거리
        let dist = Math.hypot(ball.x - this.x, ball.y - this.y);
        
        // [압박 로직] 공이 압박 기준선 안에 들어오면 추적
        let limit = tactics.defense.press_line * 50;
        if (dist < limit) {
            let speed = (tactics.defense.press_frequency / 7) * 2;
            this.x += (ball.x - this.x) * 0.02 * speed;
            this.y += (ball.y - this.y) * 0.02 * speed;
        }

        // 공과 접촉 시 튕기기
        if (dist < 12) {
            ball.speedX = (Math.random() - 0.5) * 10;
            ball.speedY = (Math.random() - 0.5) * 10;
        }
    }

    draw(ctx) {
        // 팀별 색상: 아군(Blue), 적군(Red), 골키퍼(Yellow)
        ctx.fillStyle = this.isGK ? "#ffeb3b" : (this.team === 'A' ? "#2196F3" : "#f44336");
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        // 텍스트 출력
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText(this.isGK ? "GK" : "75", this.x - 7, this.y - 12);
    }
}

// 3. 팀 구성 (적군 11명 확실히 추가)
function initMatch() {
    players = [];
    // 우리 팀 (A) - 왼쪽
    players.push(new Player(0, 50, 225, 'A', true)); 
    for(let i=1; i<=10; i++) players.push(new Player(i, 150 + Math.random()*100, 40*i, 'A'));

    // 적 팀 (B) - 오른쪽 (확실히 생성!)
    players.push(new Player(11, 650, 225, 'B', true)); 
    for(let i=1; i<=10; i++) players.push(new Player(i+11, 450 + Math.random()*100, 40*i, 'B'));
}

// 4. 메인 루프
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

function loop() {
    // 배경 초기화
    ctx.fillStyle = "#2c5e2e";
    ctx.fillRect(0, 0, 700, 450);
    
    // 경기장 라인
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, 700, 450);

    // 공 업데이트 및 그리기
    ball.x += ball.speedX; ball.y += ball.speedY;
    if(ball.x < 0 || ball.x > 700) ball.speedX *= -1;
    if(ball.y < 0 || ball.y > 450) ball.speedY *= -1;
    
    ctx.fillStyle = "white"; // 공은 흰색
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2); ctx.fill();

    // 모든 선수(적군 포함) 업데이트 및 그리기
    players.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    requestAnimationFrame(loop);
}

// 실행
initMatch();
loop();
