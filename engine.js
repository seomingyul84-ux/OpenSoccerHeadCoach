// 1. 전술 데이터 (기본값 설정)
const tactics = {
    attack: { passing_way: 1, tempo: 1, width: 4, transition: 1, creativity: 4, time_wasting: 2, set_piece: 1, dribble_focus: 1, patience: 7, long_shot: 1, cross_style: 1, participation: 4, advance: 4, passing_target: 1 },
    buildup: { tactic_intensity: 7, goal_kick_length: 1, gk_dist_speed: 7 },
    defense: { press_line: 6, defensive_line: 6, line_behavior: 7, press_frequency: 7, transition: 7, tackling: 4, press_trap: 4, gk_short_dist: 7, cross_defense: 4, block_style_level: 4 },
    defense_priority: { type: "Box", intensity: 7 }
};

// 2. UI 컨트롤 함수 (에러 해결)
window.updateVal = function(cat, key, val) {
    tactics[cat][key] = parseInt(val);
    const display = document.getElementById(`${cat}-${key}-val`);
    if (display) display.innerText = val;
};

window.updatePriorityType = function(val) { tactics.defense_priority.type = val; };
window.updatePriorityInt = function(val) { tactics.defense_priority.intensity = parseInt(val); };

// 3. 환경 설정
let ball = { x: 350, y: 225, speedX: 1, speedY: 1 };
let players = [];

// 4. 선수 클래스 (진형 유지 로직 추가)
class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id;
        this.originX = x; // 원래 자기 자리 (Home Position)
        this.originY = y;
        this.x = x;
        this.y = y;
        this.team = team;
        this.isGK = isGK;
    }

    update() {
        let distToBall = Math.hypot(ball.x - this.x, ball.y - this.y);
        let distToHome = Math.hypot(this.originX - this.x, this.originY - this.y);

        // [핵심] 한 점으로 모이지 않게 하는 로직
        // 공이 내 '압박 범위' 안에 있을 때만 공을 쫓고, 아니면 내 자리로 돌아감
        let pressRange = tactics.defense.press_line * 30; 

        if (distToBall < pressRange && !this.isGK) {
            // 공 쫓기 (압박 강도 반영)
            let speed = (tactics.defense.press_frequency / 7) * 2;
            this.x += (ball.x - this.x) * 0.03 * speed;
            this.y += (ball.y - this.y) * 0.03 * speed;
        } else {
            // 자기 자리로 복귀 (진형 유지)
            this.x += (this.originX - this.x) * 0.05;
            this.y += (this.originY - this.y) * 0.05;
        }

        // 공과 접촉 시 (공 차기)
        if (distToBall < 12) {
            ball.speedX = (Math.random() - 0.5) * 12;
            ball.speedY = (Math.random() - 0.5) * 12;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isGK ? "#ffeb3b" : (this.team === 'A' ? "#2196F3" : "#f44336");
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText(this.isGK ? "GK" : "75", this.x - 7, this.y - 12);
    }
}

// 5. 초기화 및 루프
function initMatch() {
    players = [];
    // A팀 (파란색) - 4-4-2 진형 예시
    players.push(new Player(0, 50, 225, 'A', true)); // GK
    const formationA = [
        [150, 100], [150, 200], [150, 300], [150, 400], // DF
        [300, 100], [300, 200], [300, 300], [300, 400], // MF
        [450, 150], [450, 300] // FW
    ];
    formationA.forEach((pos, i) => players.push(new Player(i+1, pos[0], pos[1], 'A')));

    // B팀 (빨간색) - 대칭 진형
    players.push(new Player(11, 650, 225, 'B', true)); // GK
    formationA.forEach((pos, i) => players.push(new Player(i+12, 700 - pos[0], pos[1], 'B')));
}

const canvas = document.getElementById('field');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function loop() {
        ctx.fillStyle = "#2c5e2e";
        ctx.fillRect(0, 0, 700, 450);
        ctx.strokeStyle = "white";
        ctx.strokeRect(0, 0, 700, 450);

        ball.x += ball.speedX; ball.y += ball.speedY;
        if(ball.x < 0 || ball.x > 700) ball.speedX *= -1;
        if(ball.y < 0 || ball.y > 450) ball.speedY *= -1;
        ball.speedX *= 0.98; ball.speedY *= 0.98; // 마찰력

        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2); ctx.fill();

        players.forEach(p => { p.update(); p.draw(ctx); });
        requestAnimationFrame(loop);
    }

    // 6. UI 슬라이더 생성 실행
    window.onload = () => {
        const createControls = (category, containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            for (let key in tactics[category]) {
                const div = document.createElement('div');
                div.className = 'control';
                div.innerHTML = `
                    <label>${key} <span id="${category}-${key}-val">${tactics[category][key]}</span></label>
                    <input type="range" min="1" max="7" value="${tactics[category][key]}" 
                           oninput="updateVal('${category}', '${key}', this.value)">
                `;
                container.appendChild(div);
            }
        };
        createControls('attack', 'attack-controls');
        createControls('buildup', 'buildup-controls');
        createControls('defense', 'defense-controls');
        initMatch();
        loop();
    };
}
