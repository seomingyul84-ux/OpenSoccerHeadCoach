from tactics import TacticalEngine
from player_ai import Player, Goalkeeper

# 1. 전술 세팅
te = TacticalEngine()

# 2. 올 75 능력치 선수들 생성
team_a = [Player(i) for i in range(1, 11)]
gk_a = Goalkeeper(0)

# 3. 가상 환경 설정 (테스트용)
mock_env = {
    'owner_id': 1, 'xg': 0.35, 'is_marked': True, 
    'teammate_has_ball': True, 'ball_owner_id': 5, 'seconds_since_loss': 2
}

# 4. 선수들의 결정 확인
print(f"필드 플레이어의 결정: {team_a[0].decide(mock_env, te)}")
print(f"골키퍼의 결정: {gk_a.decide(mock_env, te)}")
