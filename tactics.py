class TacticalEngine:
    def __init__(self):
        # [이미지 기반: 공격 설정]
        self.attack = {
            "passing_way": "very_short", "tempo": "much_lower", "width": "normal",
            "transition": "keep_formation", "creativity": "balanced",
            "time_wasting": "rarely", "set_piece": "keep_play",
            "dribble_focus": "restrain", "patience": "calm_chance", 
            "long_shot": "restrain", "cross_style": "low_cross",
            "participation": "balanced", "advance": "balanced", "passing_target": "to_feet"
        }

        # [이미지 기반: 빌드업 설정]
        self.buildup = {
            "tactic": "break_pressing", "goal_kick": "short", 
            "gk_dist_speed": "fast", "gk_dist_target": "center_back"
        }

        # [이미지 기반: 수비 설정]
        self.defense = {
            "press_line": "high_press", "defensive_line": "high", 
            "line_behavior": "step_up", "press_frequency": "extreme",
            "transition": "counter_press", "tackling": "normal",
            "press_trap": "balanced", "gk_short_dist": True,
            "block_style": "mid_block", "cross_defense": "balanced"
        }

        self.defense_priority = "Box" # Box, Zone, Man
