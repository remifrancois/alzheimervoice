import json, sys
with open('/tmp/vercel-demo-logs.json') as f:
    content = f.read().strip()
for line in content.split('\n'):
    if not line.strip():
        continue
    try:
        d = json.loads(line)
        txt = d.get('text', '')
        if txt:
            print(txt[:300])
    except:
        pass
