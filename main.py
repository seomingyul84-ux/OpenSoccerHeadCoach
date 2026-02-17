import random
import math

class TacticalEngine:
    """이미지 속 모든 전술 설정을 실시간으로 조작하는 클래스"""
    def __init__(self):
        # [이미지 1: 공격 설정 전체]
        self.attack = {
            "passing_way": "very_short",     # 패스 방식: 아주 짧게
            "tempo": "much_lower",           # 템포: 더욱 낮게
            "width": "normal",               # 공격 폭: 보통
            "transition": "keep_formation",  # 공격 전환: 진형 유지
            "creativity": "balanced",        # 창조성: 균형
            "time_wasting": "rarely",        # 시간 보내기: 덜 자주
            "set_piece": "keep_play",        # 세트피스 유도: 인플레이 유지
            "dribble": "restrain",           # 드리블: 자제
            "patience": "calm_chance",       # 참을성: 침착하게 골 찬스 생성
            "long_shot": "restrain",         # 중거리 슛: 자제
            "cross": "low_cross",            # 크로스 스타일: 낮은 크로스
            "participation": "balanced",     # 공격 가담: 균형
            "advance": "balanced",           # 전진: 균형
            "passing_target": "to_feet"      # 패스 스타일: 발밑으로 패스
        }
        # [이미지 1 하단: 빌드업 설정]
        self.buildup = {
            "tactic": "break_pressing",      # 빌드업 전술: 압박 돌파
            "goal_kick": "short",            # 골킥: 짧게
            "gk_speed": "fast",              # 배급 속도: 빠르게
            "gk_target": "center_back"       # 배급 대상: 센터백
        }
        # [이미지 2: 수비 설정 전체]
        self.defense = {
            "press_line": "high_press",      # 압박 기준선: 강한 압박
            "defensive_line": "high",        # 수비 라인: 높게
            "line_behavior": "step_up",      # 라인 행동: 더 높은 위치로
            "press_freq": "extreme",         # 압박 실행: 훨씬 더 자주
            "transition": "counter_press",   # 수비 전환: 역압박(게겐프레싱)
            "tackling": "normal",            # 태클: 보통
            "press_trap": "balanced",        # 압박 트랩: 평정심
            "block_style": "mid_block"       # 블록: 중간 블록
        }
        # [유저 추가 요청: 수비 우선순위]
        self.priority = "Box" # Box, Zone, Man 중 선택 가능

class Player:
    def __init__(self, id, name, vision, finishing):
        self.id = id
        self.name = name
        self.attr = {"vision": vision, "finishing": finishing}
        self.pos = [0, 0] # x, y 좌표

    def decide(self, env, te):
        """유저 설계: 확률 기반 의사결정 로직"""
        has_ball = env['owner_id'] == self.id
        xg = self._calc_xg()

        if has_ball:
            # 1. xG 0.25 이상 슈팅 결정
            if xg >= 0.25:
                # 전술 '참을성' 반영: 침착하게 면 확률 낮춤(더 좋은 기회 탐색)
                s_prob = 0.6 if te.attack['patience'] == "calm_chance" else 0.95
                if random.random() < s_prob: return "SHOOT"
            
            # 2. 마크 확인
            if env['is_marked']:
                # 3. 전방 노마크 동료 찾기
                target = self._find_unmarked(env, forward=True)
                if target:
                    # 전술 '드리블 자제' 반영: 확률적으로 패스 선택
                    p_prob = 0.95 if te.attack['dribble'] == "restrain" else 0.6
                    return f"PASS to {target}" if random.random() < p_prob else "DRIBBLE"
                
                # 4. 전체 노마크 동료 찾기
                target = self._find_unmarked(env, forward=False)
                if target: return f"PASS to {target}"
                
                # 5. 랜덤 선택
                return random.choice(["PASS", "DRIBBLE"])
            else:
                return "DRIBBLE_TO_SPACE"
        else:
            # 수비 로직: 게겐프레싱(역압박) 및 우선순위
            if te.defense['transition'] == "counter_press" and env['time_since_loss'] < 5:
                return "INSTANT_PRESS"
            return f"DEFEND_{te.priority}"

    def _calc_xg(self):
        # 단순 거리 기반 xG 계산식
        dist = math.sqrt((105 - self.pos[0])**2 + (34 - self.pos[1])**2)
        return max(0.01, 0.6 - (dist * 0.01))

    def _find_unmarked(self, env, forward):
        # 시야 능력치를 반영하여 노마크 동료 탐색
        cands = [p for p in env['teammates'] if not p['is_marked']]
        if forward: cands = [p for p in cands if p['pos'][0] > self.pos[0]]
        
        if cands and random.randint(1, 20) <= self.attr['vision']:
            return random.choice(cands)['id']
        return None

# --- 실행 예시 ---
te = TacticalEngine()
p1 = Player(7, "Son", vision=18, finishing=19)
p1.pos = [90, 34] # 골대 앞

# 가상 상황 데이터
env = {
    'owner_id': 7, 'is_marked': True, 'time_since_loss': 10,
    'teammates': [{'id': 17, 'pos': [95, 20], 'is_marked': False}]
}

print(f"[{p1.name}]의 결정: {p1.decide(env, te)}")
