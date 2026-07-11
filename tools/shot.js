/* Dev tool: drive the running app over CDP (needs --remote-debugging-port=9223).
   Usage: node tools/shot.js [--eval "js"] [--move x,y] [--click x,y] [--wait ms] [--shot out.png] ...
   Flags run in sequence. Requires Node >= 21 (global WebSocket). */
const fs = require('fs');

const PORT = 9223;

async function main() {
  const args = process.argv.slice(2);
  const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
  const target = list.find((t) => t.type === 'page' && t.url.includes('index.html'));
  if (!target) throw new Error('app page not found: ' + JSON.stringify(list.map((t) => [t.type, t.url])));

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let idc = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise((res) => {
    const id = ++idc;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await send('Page.enable');

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--eval') {
      const r = await send('Runtime.evaluate', {
        expression: args[++i], awaitPromise: true, returnByValue: true,
      });
      const res = r.result && r.result.result;
      console.log('eval:', JSON.stringify(res && 'value' in res ? res.value : res));
    } else if (a === '--move') {
      const [x, y] = args[++i].split(',').map(Number);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    } else if (a === '--click') {
      const [x, y] = args[++i].split(',').map(Number);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    } else if (a === '--pinch') {
      const [x, y, dy] = args[++i].split(',').map(Number);
      await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x, y, deltaX: 0, deltaY: dy, modifiers: 2 });
    } else if (a === '--wait') {
      await new Promise((r) => setTimeout(r, +args[++i]));
    } else if (a === '--shot') {
      const file = args[++i];
      const r = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
      console.log('saved', file);
    }
  }
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
