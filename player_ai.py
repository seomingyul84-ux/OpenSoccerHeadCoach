import random

class Player:
    def __init__(self, player_id):
        self.id = player_id
        # 테스트를 위해 모든 능력치를 75로 통일
        self.stats = {stat: 75 for stat in ['vision', 'finishing', 'passing', 'aggression']}
        self.pos = [0, 0]

    def decide(self, env, te):
        has_ball = env['owner_id'] == self.id
        
        if has_ball:
            # [전술 연동] 참을성(patience) 7단계: 높을수록 xG 컷트라인이 올라감
            # 모든 선수가 75이므로, 전술 수치가 행동의 유일한 변수
            shoot_threshold = 0.5 - (te.attack['patience'] * 0.05) 
            if env['xg'] >= shoot_threshold:
                return "SHOOT"

            # [전술 연동] 드리블 자제(dribble_focus) 1단계: 낮을수록 패스 우선
            pass_prob = 1.0 - (te.attack['dribble_focus'] * 0.1)
            return "PASS" if random.random() < pass_prob else "DRIBBLE"
        
        else:
            # [수비] 게겐프레싱 7단계: 즉시 압박 실행
            if te.defense['transition'] >= 6 and env['seconds_since_loss'] < 5:
                return "COUNTER_PRESS"
            return f"DEFEND_{te.defense_priority['type']}_LEVEL_{te.defense_priority['intensity']}"

class Goalkeeper:
    def __init__(self, id):
        self.id = id
        self.stats = {stat: 75 for stat in ['reflexes', 'kicking', 'positioning']}
        
    def decide(self, env, te):
        # 유저 설계 4단계 매커니즘
        # 1. 위협 감지
        if env['xg'] >= 0.15: return "BLOCK_FACE"
        # 2. 소유 시
        if env['ball_owner_id'] == self.id: return f"PASS_{te.buildup['gk_dist_target']}"
        # 3. 아군 소유 시
        if env['teammate_has_ball']:
            # 4. 스위퍼 키퍼 가담 (라인 행동 7단계 시)
            if te.defense['line_behavior'] >= 6: return "JOIN_BUILDUP"
            return "STAY_IN_GOAL"
        return "STAY_IN_GOAL"
