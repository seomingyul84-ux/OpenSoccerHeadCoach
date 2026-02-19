// 1. 환경 객체 (공의 상태)
let ball = {
    x: 350, y: 225, 
    speedX: 0, speedY: 0,
    owner: null,
    xg: 0 // 골키퍼가 판단할 xG 수치
};

// 2. 선수 생성 (우리 팀 A, 적 팀 B)
let players = [];

function initMatch() {
    // 우리 팀 (파란색) + 골키퍼
    players.push(new Player(0, 50, 225, 'A', true)); // GK
    for(let i=1; i<=10; i++) players.push(new Player(i, 200, 40 * i + 20, 'A'));

    // 적 팀 (빨간색) + 적 골키퍼
    players.push(new Player(11, 650, 225, 'B', true)); // Enemy GK
    for(let i=1; i<=10; i++) players.push(new Player(i+11, 500, 40 * i + 20, 'B'));
}

// 3. Player 클래스의 update 로직 (공과 적에 반응)
Player.prototype.update = function() {
    // [공 추적 로직]
    // 전술의 'press_frequency(압박 빈도)'가 높을수록 공에 더 집착함
    let targetX = ball.x;
    let targetY = ball.y;

    // 만약 적 팀이라면 우리 골대 쪽으로 공을 몰고 옴
    if (this.team === 'B') {
        this.x -= 0.5; // 기본적으로 왼쪽(우리 골대)으로 전진
    }

    // 공과의 거리 계산
    let dx = targetX - this.x;
    let dy = targetY - this.y;
    let dist = Math.hypot(dx, dy);

    // 수비 전술: press_line(압박 라인) 단계에 따라 반응 범위 결정
    let reactionLimit = tactics.defense.press_line * 50; 

    if (dist < reactionLimit) {
        // 공을 향해 이동 (능력치 75 반영하여 속도 조절)
        let speed = (75 / 100) * (tactics.defense.press_frequency * 0.5);
        this.x += (dx / dist) * speed;
        this.y += (dy / dist) * speed;
    }

    // [골키퍼 전용 4단계 로직 적용]
    if (this.isGK) {
        // 1단계: 공이 우리 진영으로 오고 xG가 높을 때 (가상 xG 계산)
        ball.xg = (this.team === 'A' && ball.x < 150) ? 0.2 : 0.01;
        
        if (ball.xg >= 0.15) {
            // 적의 정면을 막기 위해 y축 정렬
            this.y += (ball.y - this.y) * 0.1;
        }
    }
};

// 4. 애니메이션 루프에 공 그리기 추가
function draw() {
    ctx.clearRect(0, 0, 700, 450);
    
    // 경기장 선
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(0, 0, 700, 450);

    // 선수들 그리기
    players.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    // 공 그리기
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2);
    ctx.fill();

    // 공의 무작위 움직임 (테스트용)
    ball.x += (Math.random() - 0.5) * 2;
    ball.y += (Math.random() - 0.5) * 2;

    requestAnimationFrame(draw);
}

initMatch();
draw();
