import math
import random

class Player:
    def __init__(self, id, name, stats):
        self.id = id
        self.name = name
        self.stats = stats # FC26 데이터 연결
        self.pos = [0, 0]

    def decide(self, env, te):
        """필드 플레이어 의사결정 (xG 판단 -> 마킹 확인 -> 확률 행동)"""
        has_ball = env['owner_id'] == self.id
        if has_ball:
            # 1. xG 0.25 이상 슈팅 판단
            if self._calculate_xg(env) >= 0.25:
                # 전술 '참을성' 반영
                shoot_prob = 0.6 if te.attack['patience'] == "calm_chance" else 0.95
                if random.random() < shoot_prob: return "SHOOT"
            # 2. 패스/드리블 판단
            pass_prob = 0.9 if te.attack['dribble_focus'] == "restrain" else 0.5
            return "PASS" if random.random() < pass_prob else "DRIBBLE"
        return "DEFEND"

class Goalkeeper:
    def __init__(self, id, name, stats):
        self.id = id
        self.name = name
        self.stats = stats
        self.pos = [5, 34]

    def decide(self, env, te):
        """유저 설계 골키퍼 매커니즘 (위협 -> 소유 -> 아군소유 여부)"""
        # 1. 근처 xG 0.15 이상 선수가 있는가?
        if self._find_danger(env, 0.15): return "BLOCK_FACE"
        # 2. 내가 볼을 가졌는가?
        if env['ball_owner_id'] == self.id: return "TACTICAL_PASS"
        # 3. 아군이 볼을 가졌는가?
        if env['teammate_has_ball']:
            # 4. 스위퍼 키퍼 여부 (라인 행동과 연동)
            if te.defense['line_behavior'] == 'step_up': return "JOIN_BUILDUP"
            return "STAY_IN_GOAL"
        return "STAY_IN_GOAL"
