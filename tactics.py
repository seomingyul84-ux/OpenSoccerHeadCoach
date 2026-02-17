class TacticalEngine:
    def __init__(self):
        # --- [공격 및 빌드업 설정: 7단계 조절] ---
        self.attack = {
            # 기본 정보
            "passing_way": 1,        # 1(아주짧게) ~ 7(아주길게)
            "tempo": 1,              # 1(더욱낮게) ~ 7(더욱높게)
            "width": 4,              # 1(매우좁게) ~ 7(매우넓게)
            "transition": 1,         # 1(진형유지) ~ 7(즉시역습)
            "creativity": 4,         # 1(매우규율적) ~ 7(매우자유로운)
            "time_wasting": 2,       # 1(전혀안함) ~ 7(매우심함)
            "set_piece": 1,          # 1(인플레이유지) ~ 7(박스안투입)
            
            # 상대팀 진형 & 전진
            "dribble_focus": 1,      # 1(자제) ~ 7(매우자주)
            "patience": 7,           # 1(보이자마자슛) ~ 7(침착하게찬스생성)
            "long_shot": 1,          # 1(자제) ~ 7(자주)
            "cross_style": 1,        # 1(낮게) ~ 4(보통) ~ 7(높고길게)
            "participation": 4,      # 1(수비중심) ~ 7(전원공격)
            "advance": 4,            # 1(매우천천히) ~ 7(매우빠르게)
            "passing_target": 1      # 1(발밑으로) ~ 7(공간으로)
        }

        self.buildup = {
            "tactic_intensity": 7,   # 압박돌파 강도 1~7
            "goal_kick_length": 1,   # 1(짧게) ~ 7(길게)
            "gk_dist_speed": 7,      # 1(매우느리게) ~ 7(매우빠르게)
            "gk_dist_target": "CB"   # 배급 대상 (CB/FB/DM/ST 등)
        }

        # --- [수비 설정: 7단계 조절] ---
        self.defense = {
            "press_line": 6,         # 1(매우낮게) ~ 7(최전방압박)
            "defensive_line": 6,     # 1(매우깊게) ~ 7(매우높게)
            "line_behavior": 7,      # 라인 유지 강도 (1: 뒤로물러남 ~ 7: 오프사이드트랩)
            "press_frequency": 7,    # 1(전혀안함) ~ 7(미친듯한압박)
            "transition": 7,         # 1(진형복귀) ~ 7(게겐프레싱)
            "tackling": 4,           # 1(매우신중함) ~ 7(매우거침)
            
            # 높은 압박 / 중간 블록 / 낮은 블록 상세
            "press_trap": 4,         # 압박 트랩 강도 1~7
            "gk_short_dist": 7,      # 상대 GK 짧은 배급 방해 강도 1~7
            "cross_defense": 4,      # 1(측면봉쇄) ~ 7(중앙밀집)
            "block_style_level": 4   # 블록의 견고함 1~7
        }
        
        # 수비 우선순위 매커니즘 (Box, Zone, Man 각각 7단계 선택지)
        self.defense_priority = {
            "type": "Box",           # Box / Zone / Man 선택
            "intensity": 7           # 해당 방식의 몰입 강도 (1~7)
        }
