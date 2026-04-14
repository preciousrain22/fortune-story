import re

with open('script.js', 'r', encoding='utf-8') as f:
    text = f.read()

targets = [
    "[ 오행(五行) 분포도 ]",
    "[ 명식(命式)과 십신(十神) ]",
    "[천명(天命)]",
    "[ 타고난 기운 분석 ]",
    "[운의 흐름(時運)]",
    "[비책(秘策)]",
    "[시간대별 운의 흐름]",
    "[영역별 세부 운세]",
    "[ 오늘의 행운 포인트 (Lucky Point) ]",
    "[가정/부부운]",
    "[애정/연애운]",
    "[재물운]",
    "[직업/사업운]",
    "[건강운]",
    "[현재 부부 관계의 기운]",
    "[지혜로운 대처법]",
    "[ 애정 화합도 분석 ]",
    "[현재 나의 애정 기운]",
    "[관계를 지키는 지혜]",
    "[ 새로운 인연의 기운 ]",
    "[학업과 성취의 기운]",
    "[합격을 향한 지혜와 비책]",
    "[ 학업과 합격 기운 ]"
]

for t in targets:
    replacement = t.replace("[", "").replace("]", "").strip()
    text = text.replace(t, replacement)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
