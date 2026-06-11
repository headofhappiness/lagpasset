#!/usr/bin/env node
/*
 * build_demo.js — genererar admin_demo.html från admin.html (LagPasset)
 * 
 * KÖRS efter varje admin.html-ändring:  node build_demo.js
 */

const fs = require('fs');
const SRC = 'admin.html';
const OUT = 'admin_demo.html';

function die(msg){ console.error('\n❌ BYGGFEL: ' + msg + '\n   (admin_demo.html INTE skriven)'); process.exit(1); }
function must(cond, msg){ if(!cond) die(msg); }

let html = fs.readFileSync(SRC, 'utf8');

// 1. IS_DEMO: false → true
must(html.includes('const IS_DEMO = false;'), 'hittade inte "const IS_DEMO = false;"');
html = html.replace('const IS_DEMO = false;', 'const IS_DEMO = true;');

// 2. Ta bort live-redirect, ersätt med demo-redirect
const liveRedirect = `const _needsRedirect = _isLiveMode && (!_eventParam || _eventParam === DEMO_EVENT_ID);
if(_needsRedirect){ window.location.href = 'events.html'; }
const EVENT_ID = _needsRedirect ? DEMO_EVENT_ID : (_eventParam || DEMO_EVENT_ID);`;

must(html.includes(liveRedirect), 'hittade inte live-redirect-blocket');
html = html.replace(liveRedirect,
`// Demo: om inget event-ID valt, gå till demo-väljaren
if(!_eventParam && !_demoName){ window.location.href = 'events_demo.html'; }
const EVENT_ID = _eventParam || DEMO_EVENT_ID;`);

// 3. init() alltid i demo (ta bort if(!_needsRedirect)-skyddet)
must(html.includes("if(!_needsRedirect){ init(); }"), 'hittade inte guarded init()-anropet');
html = html.replace("if(!_needsRedirect){ init(); }", "init();");

// 4. Visa demo-banner i demoBlock (istället för .active-klass i live)
// demo-banner visas redan korrekt via demoBlock() som sätter .active

// 5. Verifiera
must(html.includes('const IS_DEMO = true;'), 'IS_DEMO är inte true i output');
must(!html.includes('const IS_DEMO = false;'), 'IS_DEMO = false finns kvar i output');
must(!html.includes('_needsRedirect'), 'live-redirect finns kvar i output');

fs.writeFileSync(OUT, html);
console.log('✓ ' + OUT + ' byggd från ' + SRC);
console.log('  IS_DEMO = true, live-redirect borttagen');
