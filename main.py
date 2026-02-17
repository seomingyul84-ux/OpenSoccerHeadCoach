from tactics import TacticalEngine
from player_ai import Player, Goalkeeper
import json

# 전술과 선수 데이터 로드
te = TacticalEngine()
with open('fc26_players_data.json', 'r') as f:
    players_data = json.load(f)

# 여기에 경기 시뮬레이션 루프 작성...
print("시스템 가동 준비 완료!")
