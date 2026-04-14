import urllib.request, json, ssl
ssl._create_default_https_context = ssl._create_unverified_context
files = []
files += [f'Wands{str(i).zfill(2)}.jpg' for i in range(1, 15)]
files += [f'Cups{str(i).zfill(2)}.jpg' for i in range(1, 15)]
files += [f'Swords{str(i).zfill(2)}.jpg' for i in range(1, 15)]
files += [f'Pents{str(i).zfill(2)}.jpg' for i in range(1, 15)]

res_dict = {}
for i in range(0, len(files), 50):
    batch = files[i:i+50]
    titles = '|'.join(['File:' + f for f in batch])
    url = f'https://en.wikipedia.org/w/api.php?action=query&titles={titles}&prop=imageinfo&iiprop=url&format=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    for page_id, page_info in data['query']['pages'].items():
        if 'imageinfo' in page_info:
            res_dict[page_info['title'].replace('File:', '')] = page_info['imageinfo'][0]['url']

for k, v in res_dict.items():
    print(f"'{k}': '{v.replace('https://upload.wikimedia.org/wikipedia/commons/', '')}'")
