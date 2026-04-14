import hashlib, re

def g(f): m = hashlib.md5(f.encode('utf-8')).hexdigest(); return f'{m[0]}/{m[0:2]}/{f}'

w = [g(f'Wands{str(i).zfill(2)}.jpg') for i in range(1, 15)]
c = [g(f'Cups{str(i).zfill(2)}.jpg') for i in range(1, 15)]
s = [g(f'Swords{str(i).zfill(2)}.jpg') for i in range(1, 15)]
p = [g(f'Pents{str(i).zfill(2)}.jpg') for i in range(1, 15)]

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

minor_js = ""
for i in range(14):
    name = f"지팡이 {'Ace' if i==0 else 'Page' if i==10 else 'Knight' if i==11 else 'Queen' if i==12 else 'King' if i==13 else i+1}"
    minor_js += f'            {{ id: {22+i}, name: "{name}", keyword: "열정, 야망, 에너지", isMajor: false, img: "{w[i]}" }},\n'
for i in range(14):
    name = f"컵 {'Ace' if i==0 else 'Page' if i==10 else 'Knight' if i==11 else 'Queen' if i==12 else 'King' if i==13 else i+1}"
    minor_js += f'            {{ id: {36+i}, name: "{name}", keyword: "감정, 관계, 직관", isMajor: false, img: "{c[i]}" }},\n'
for i in range(14):
    name = f"검 {'Ace' if i==0 else 'Page' if i==10 else 'Knight' if i==11 else 'Queen' if i==12 else 'King' if i==13 else i+1}"
    minor_js += f'            {{ id: {50+i}, name: "{name}", keyword: "이성, 도전, 갈등", isMajor: false, img: "{s[i]}" }},\n'
for i in range(14):
    name = f"펜타클 {'Ace' if i==0 else 'Page' if i==10 else 'Knight' if i==11 else 'Queen' if i==12 else 'King' if i==13 else i+1}"
    minor_js += f'            {{ id: {64+i}, name: "{name}", keyword: "물질, 안정, 결과", isMajor: false, img: "{p[i]}" }},\n'

pattern = r"// Minor Arcana \(Wands, Cups, Swords, Pentacles\).*?\];"
replacement = f"// Minor Arcana (Wands, Cups, Swords, Pentacles)\n{minor_js}        ];"

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Done!")
