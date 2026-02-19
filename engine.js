/**
 * FC26 Tactical Engine - User-Defined AI Logic
 */

// 1. 전술 데이터 (7단계 슬라이더 연동용)
window.tactics = {
    attack: { patience: 7, creativity: 4, passing_way: 1, tempo: 1, width: 4 },
    defense: { press_line: 6, press_frequency: 7, defensive_line: 6 },
    buildup: { tactic_intensity: 7, gk_dist_speed: 7 }
};

// UI 업데이트 전역 함수
window.updateVal = (cat, key, val) => {
    window.tactics[cat][key] = parseInt(val);
    const label = document.getElementById(`${cat}-${key}-val`);
    if(label) label.innerText = val;
};
window.updatePriorityInt = (val) => { window.tactics.defense_priority_intensity = parseInt(val); };
window.updatePriorityType = (val) => { window.tactics.defense_priority_type = val; };

// 2. 환경 및 물리 변수
const FIELD = { w: 700, h: 450 };
let ball = { x: 350, y: 225, vx: 0, vy: 0, owner: null };
let players = [];

// 3. 선수 클래스
class Player {
    constructor(id, x, y, team, isGK = false) {
        this.id = id;
        this.homeX = x; this.homeY = y;
        this.x = x; this.y = y;
        this.team = team; this.isGK = isGK;
        // 기본 스탯 75 고정
        this.stats = { vision: 75, finishing: 75, passing: 75, dribbling: 75 };
    }

    update() {
        if (ball.owner === this) {
            this.handlePossessionAI(); // 유저 설계 로직 실행
        } else {
            this.handleDefensiveAI();
        }

        // 공통: 가출 방지 및 위치 제한
        this.x = Math.max(20, Math.min(FIELD.w - 20, this.x));
        this.y = Math.max(20, Math.min(FIELD.h - 20, this.y));

        // 소유권 판정
        const d = Math.hypot(ball.x - this.x, ball.y - this.y);
        if (d < 12 && !ball.owner) ball.owner = this;

        // 선수 간 겹침 방지 (Social Distancing)
        players.forEach(p => {
            if (p.id === this.id) return;
            const pd = Math.hypot(this.x - p.x, this.y - p.y);
            if (pd < 22) {
                this.x += (this.x - p.x) * 0.1;
                this.y += (this.y - p.y) * 0.1;
            }
        });
    }

    // --- [유저 설계 핵심 AI 로직] ---
    handlePossessionAI() {
        const goalX = this.team === 'A' ? FIELD.w : 0;
        const currentXG = this.getSampleXG();

        // 1. xG 0.25 이상의 슈팅을 날릴 수 있는가?
        if (currentXG >= 0.25) {
            // 참을성(patience) 수치가 높을수록 슛을 아낌 (확률 보정)
            let shootThreshold = 40 + (window.tactics.attack.patience * 5); 
            if (Math.random() * 100 > shootThreshold) {
                this.performAction("SHOOT");
                return;
            }
            // No라고 대답한 것으로 치고 다음 단계(마크 확인)로 진행
        }

        // 2. 본인에게 마크가 있는가?
        const isMarked = this.checkIsMarked();

        if (isMarked) {
            // 2-1. 본인보다 상대 골대에 가까운 마크 없는 선수가 있는가?
            let target = this.findTeammate(true); // forward only
            if (target) {
                this.decidePassOrDribble(target, 80); // 80% 확률 패스
            } else {
                // 2-2. 어디든 마크 없는 선수가 있는가?
                target = this.findTeammate(false);
                if (target) {
                    this.decidePassOrDribble(target, 70);
                } else {
                    // 2-3. 랜덤 선택
                    Math.random() > 0.5 ? this.performAction("DRIBBLE") : this.performAction("PASS_LOB");
                }
            }
        } else {
            // 3. 마크가 없다면 근처 빈 공간으로 돌파
            this.performAction("DRIBBLE");
        }
    }

    // 수비 및 복귀 로직
    handleDefensiveAI() {
        const distToBall = Math.hypot(ball.x - this.x, ball.y - this.y);
        const pressRange = window.tactics.defense.press_line * 35;

        if (distToBall < pressRange && !this.isGK) {
            let speed = (window.tactics.defense.press_frequency / 7) * 1.5;
            this.x += (ball.x - this.x) * 0.03 * speed;
            this.y += (ball.y - this.y) * 0.03 * speed;
        } else {
            this.x += (this.homeX - this.x) * 0.05;
            this.y += (this.homeY - this.y) * 0.05;
        }
    }

    // 보조 판단 함수들
    decidePassOrDribble(target, baseProb) {
        // 창의성(creativity)이 높으면 약속된 패스 대신 드리블 돌발 행동 증가
        let prob = baseProb - (window.tactics.attack.creativity * 3);
        if (Math.random() * 100 < prob) this.performAction("PASS", target);
        else this.performAction("DRIBBLE");
    }

    getSampleXG() {
        // 골대와의 거리에 따른 단순 xG 계산
        const distToGoal = this.team === 'A' ? (FIELD.w - this.x) : this.x;
        if (distToGoal < 150) return 0.3;
        if (distToGoal < 250) return 0.1;
        return 0.05;
    }

    checkIsMarked() {
        // 주변 40px 내에 적군이 있는지 확인
        return players.some(p => p.team !== this.team && Math.hypot(this.x - p.x, this.y - p.y) < 45);
    }

    findTeammate(forwardOnly) {
        return players.find(p => {
            if (p.team !== this.team || p === this || p.isGK) return false;
            if (p.checkIsMarked()) return false;
            if (forwardOnly) {
                return this.team === 'A' ? p.x > this.x + 20 : p.x < this.x - 20;
            }
            return true;
        });
    }

    performAction(type, target = null) {
        if (type === "SHOOT") {
            ball.owner = null;
            ball.vx = this.team === 'A' ? 12 : -12;
            ball.vy = (Math.random() - 0.5) * 4;
        } else if (type === "PASS") {
            ball.owner = null;
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const d = Math.hypot(dx, dy);
            ball.vx = (dx / d) * 8;
            ball.vy = (dy / d) * 8;
        } else if (type === "DRIBBLE") {
            this.x += this.team === 'A' ? 1.2 : -1.2;
            this.y += (Math.random() - 0.5) * 2;
        } else { // 랜덤 패스 등
            ball.owner = null;
            ball.vx = (this.team === 'A' ? 6 : -6);
            ball.vy = (Math.random() - 0.5) * 10;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isGK ? "#FFD700" : (this.team === 'A' ? "#2196F3" : "#F44336");
        ctx.beginPath(); ctx.arc(this.x, this.y, 10, 0, Math.PI*2); ctx.fill();
        if (ball.owner === this) {
            ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.stroke();
        }
        // 이름 대신 능력치 표시
        ctx.fillStyle = "white"; ctx.font = "10px Arial";
        ctx.fillText("75", this.x-6, this.y-12);
    }
}

// 4. 초기화 및 루프 실행
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');

function setup() {
    players = [];
    // 팀 A 진형
    players.push(new Player(0, 50, 225, 'A', true));
    for(let i=1; i<=10; i++) players.push(new Player(i, 150 + Math.floor((i-1)/4)*100, 80 + ((i-1)%4)*95, 'A'));
    // 팀 B 진형
    players.push(new Player(11, 650, 225, 'B', true));
    for(let i=1; i<=10; i++) players.push(new Player(i+11, 550 - Math.floor((i-1)/4)*100, 80 + ((i-1)%4)*95, 'B'));
}

function loop() {
    ctx.fillStyle = "#2c5e2e"; ctx.fillRect(0,0,FIELD.w,FIELD.h);
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.strokeRect(0,0,FIELD.w,FIELD.h);
    
    // 중앙선
    ctx.beginPath(); ctx.moveTo(350,0); ctx.lineTo(350,450); ctx.stroke();

    if (ball.owner) {
        ball.x = ball.owner.x; ball.y = ball.owner.y;
    } else {
        ball.x += ball.vx; ball.y += ball.vy;
        ball.vx *= 0.98; ball.vy *= 0.98;
        if(ball.x < 0 || ball.x > FIELD.w) ball.vx *= -1;
        if(ball.y < 0 || ball.y > FIELD.h) ball.vy *= -1;
    }

    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI*2); ctx.fill();
    players.forEach(p => { p.update(); p.draw(ctx); });
    requestAnimationFrame(loop);
}

setup(); loop();
}
