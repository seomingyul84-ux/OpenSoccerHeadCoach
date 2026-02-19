// 1. 유저님의 TacticalEngine을 JS로 이식
const tactics = {
    attack: {
        passing_way: 1, tempo: 1, width: 4, transition: 1, creativity: 4,
        time_wasting: 2, set_piece: 1, dribble_focus: 1, patience: 7,
        long_shot: 1, cross_style: 1, participation: 4, advance: 4, passing_target: 1
    },
    buildup: {
        tactic_intensity: 7, goal_kick_length: 1, gk_dist_speed: 7
    },
    defense: {
        press_line: 6, defensive_line: 6, line_behavior: 7, press_frequency: 7,
        transition: 7, tackling: 4, press_trap: 4, gk_short_dist: 7,
        cross_defense: 4, block_style_level: 4
    },
    defense_priority: { type: "Box", intensity: 7 }
};

// 2. UI 자동 생성 로직
function createSliders() {
    for (let category in tactics) {
        if (category === 'defense_priority') continue;
        const container = document.getElementById(`${category}-controls`);
        for (let key in tactics[category]) {
            if (typeof tactics[category][key] !== 'number') continue;
            
            const div = document.createElement('div');
            div.className = 'control';
            div.innerHTML = `
                <label>${key} <span id="${category}-${key}-val">${tactics[category][key]}</span></label>
                <input type="range" min="1" max="7" value="${tactics[category][key]}" 
                       oninput="updateVal('${category}', '${key}', this.value)">
            `;
            container.appendChild(div);
        }
    }
}

function updateVal(cat, key, val) {
    tactics[cat][key] = parseInt(val);
    document.getElementById(`${cat}-${key}-val`).innerText = val;
}

function updatePriorityType(val) { tactics.defense_priority.type = val; }
function updatePriorityInt(val) { tactics.defense_priority.intensity = parseInt(val); }

// 3. 선수 AI 및 렌더링 (모든 스탯 75)
class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id; this.x = x; this.y = y; this.team = team; this.isGK = isGK;
        this.baseStat = 75;
    }

    update() {
        // [유저 설계 로직 연동 예시]
        // 압박 빈도가 높으면(7단계) 공 근처로 더 빠르게 이동
        const speed = 0.5 + (tactics.defense.press_frequency * 0.2);
        this.x += (Math.random() - 0.5) * speed;
        this.y += (Math.random() - 0.5) * speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.isGK ? "#ffeb3b" : (this.team === 'A' ? "#2196F3" : "#f44336");
        ctx.beginPath(); ctx.arc(this.x, this.y, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "white"; ctx.font = "10px Arial";
        ctx.fillText(this.isGK ? "GK" : "75", this.x-5, this.y-12);
    }
}

// 초기화 및 루프
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const players = [new Player(0, 50, 225, 'A', true)]; // GK
for(let i=1; i<11; i++) players.push(new Player(i, 100 + i*50, 100 + (i%3)*100, 'A'));

function animate() {
    ctx.clearRect(0, 0, 700, 450);
    // 중앙선/박스 그리기
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath(); ctx.moveTo(350,0); ctx.lineTo(350,450); ctx.stroke();
    
    players.forEach(p => { p.update(); p.draw(ctx); });
    requestAnimationFrame(animate);
}

createSliders();
animate();
