"""Browser smoke test with source inlined: network navigation is unavailable in this runner.
This tests the whole UI state machine but NOT internet multiplayer or native iOS Safari.
Requires python-playwright and Chromium.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
b=Path(__file__).resolve().parents[1]
roles=['quasar','gnarly','kagen','bryndis','vespera']
stones=[1,0,2,1,0]
patterns=['S L S S L','L S S L S','L L S S S','S L S S L','L S L L S','L S L L S']
def inline():
 html=(b/'index.html').read_text();engine=(b/'src/engine.js').read_bytes();app=(b/'src/app.js').read_text()
 app=app.replace("'./engine.js'","'data:text/javascript;base64,"+base64.b64encode(engine).decode()+"'")
 html=html.replace('<link rel="stylesheet" href="./src/styles.css">','<style>'+(b/'src/styles.css').read_text()+'</style>')
 html=html.replace('<script src="./src/config.js"></script>','<script>'+(b/'src/config.js').read_text()+'</script>')
 html=html.replace('<script type="module" src="./src/app.js"></script>','<script type="module">'+app+'</script>')
 html=html.replace('<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">','')
 return html

def run():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':860});errs=[]
  page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(inline(),wait_until='domcontentloaded')
  page.wait_for_selector('[data-act="create"]')
  page.evaluate('''() => {window.__store={};const s={getItem(k){return window.__store[k]||null},setItem(k,v){window.__store[k]=v},removeItem(k){delete window.__store[k]}};Object.defineProperty(window,'localStorage',{configurable:true,value:s});Object.defineProperty(window,'sessionStorage',{configurable:true,value:s})}''')
  page.screenshot(path='/mnt/data/az_sahar_landing_desktop.png',full_page=True)
  page.click('[data-act="create"]');page.wait_for_selector('.dm-layout')
  page.screenshot(path='/mnt/data/az_sahar_dm_desktop.png',full_page=True)
  page.click('[data-act="start"]')
  def as_role(r):
   page.evaluate('(r) => location.hash=`play=demo&token=demo-${r}&role=${r}`',r)
  for i,r in enumerate(roles):
   as_role(r);page.wait_for_selector(f'[data-act="stone-{stones[i]}"]')
   if i==0:page.screenshot(path='/mnt/data/az_sahar_room_desktop.png',full_page=True)
   page.click(f'[data-act="stone-{stones[i]}"]');page.wait_for_timeout(60)
  for i,r in enumerate(['quasar','gnarly','kagen','bryndis','vespera','quasar']):
   as_role(r);page.wait_for_selector('[data-act="hear"]')
   for x in patterns[i].split(' '):page.click('[data-act="short"]' if x=='S' else '[data-act="long"]')
   page.click('[data-act="submit"]');page.wait_for_timeout(80)
  for r in roles:
   as_role(r);page.wait_for_selector('[data-act="seal"]');page.click('[data-act="seal"]');page.wait_for_timeout(60)
  page.wait_for_selector('text=DE POORTEN ZIJN OPEN')
  page.evaluate('location.hash="dm=demo&token=demo-master"');page.wait_for_selector('[data-act="reveal"]')
  page.click('[data-act="reveal"]')
  page.evaluate('location.hash="play=demo&token=demo-quasar&role=quasar"');page.wait_for_selector('.reveal-panel')
  page.screenshot(path='/mnt/data/az_sahar_reveal_desktop.png',full_page=True)
  page.evaluate('location.hash="screen=demo&token=demo-screen"');page.wait_for_selector('.center-screen')
  page.screenshot(path='/mnt/data/az_sahar_cinema_desktop.png',full_page=True)
  page.evaluate('location.hash=""');page.set_viewport_size({'width':390,'height':844});page.wait_for_selector('[data-act="create"]')
  page.screenshot(path='/mnt/data/az_sahar_mobile_preview.png',full_page=True)
  assert not errs,errs
  print('BROWSER UI SMOKE PASS: DM, five rooms, six signal submissions, five seals, reveal, cinema and mobile viewport.')
  browser.close()
if __name__=='__main__':run()
