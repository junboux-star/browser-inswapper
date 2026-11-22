/* FaceMotion AI Japanese iPhone UI; original engine remains unchanged. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ids = ['upload','videoFile','findPeople','videoGo','videoDownload','videoStatus','mapping','mapList','trimmer'];
  if (ids.some(id => !$(id))) { console.error('FaceMotion: original UI changed'); return; }
  document.documentElement.lang = 'ja';
  document.title = 'FaceMotion AI | iPhone 動画フェイススワップ';
  const s = document.createElement('style');
  s.textContent = [
    'html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}',
    'body{background:linear-gradient(160deg,#153247,#0d1117 370px)}',
    'main{max-width:850px;padding:18px 16px 48px}',
    'main>header{display:none}',
    '.fm-hero{padding:22px 19px;border:1px solid #3c7181;border-radius:20px;background:linear-gradient(130deg,#204052,#172538);margin-bottom:16px}',
    '.fm-eyebrow{font-size:11px;letter-spacing:.16em;color:#a4efdf;font-weight:700}',
    '.fm-hero h1{font-size:clamp(25px,6vw,34px);margin:8px 0;line-height:1.3}',
    '.fm-hero p{font-size:13px;color:#bfccdb}',
    '.fm-tag{display:inline-block;border:1px solid #476c7c;padding:5px 8px;margin:5px 5px 0 0;border-radius:100px;font-size:11px;color:#d4e5f0}',
    '.fm-box{background:#16222f;border:1px solid #344b5d;border-radius:16px;margin:12px 0;padding:17px}',
    '.fm-box h2{font-size:16px;margin:0 0 7px}',
    '.fm-box p{font-size:13px;color:#b6c6d3;margin:5px 0 12px}',
    '.fm-btn{display:block;min-height:48px;width:100%;padding:12px;border:1px solid #557a8c;border-radius:12px;background:#2b5167;color:#f3ffff;font-size:16px;font-weight:700;touch-action:manipulation}',
    '.fm-btn:disabled{opacity:.4}',
    '.fm-primary{background:#8bd9d1;color:#122632;border:0}',
    '.fm-meta{margin-top:8px;color:#adc4d1;font-size:12px;overflow-wrap:anywhere}',
    '.fm-status{margin-top:9px;padding:10px;background:#0e1824;border:1px solid #39566a;border-radius:10px;color:#d4e6ee;font-size:12px;white-space:pre-wrap}',
    '.fm-help{border:1px solid #3c586b;padding:14px;border-radius:12px;margin:16px 0;color:#bcd1df;font-size:12px}',
    '.fm-help summary{font-weight:700;cursor:pointer}',
    '.fm-help p{margin:11px 0 0}',
    '.fm-foot{color:#9eb6c7;font-size:12px}',
    '.fm-foot a{color:#a8dcf9}',
    'button,select,label.file{-webkit-tap-highlight-color:transparent}',
    '@media(max-width:650px){.stage{display:none}#camera,#sample,#rec,#download,#backend{display:none}.row{gap:8px}#mapList canvas{width:45px;height:45px}#mapList select{max-width:100%}}'
  ].join('');
  document.head.appendChild(s);

  const hero = document.createElement('div');
  hero.className = 'fm-hero';
  hero.innerHTML = '<div class="fm-eyebrow">FACEMOTION AI · iPHONE EDITION</div>' +
    '<h1>写真の顔を、動画の人物に。</h1>' +
    '<p>AIで動画の顔を1コマずつ変換。動画や顔写真は外部サーバーにアップロードしません。</p>' +
    '<span class="fm-tag">非商用無料</span><span class="fm-tag">最大60秒</span><span class="fm-tag">音声を保持</span>';
  const flow = document.createElement('div');
  flow.innerHTML =
    '<div class="fm-box"><h2>① 交換する顔写真</h2><p>明るい正面写真を選び、顔を確認します。</p><button class="fm-btn" id="fm-photo">顔写真を選ぶ</button><div class="fm-meta" id="fm-photo-state">未登録</div><div class="fm-status" id="fm-engine" aria-live="polite">AIの読み込み待ち</div></div>' +
    '<div class="fm-box"><h2>② 元の動画</h2><p>最初は5秒の短い動画で試すのがおすすめ。</p><button class="fm-btn" id="fm-video">動画を選ぶ</button><div class="fm-meta" id="fm-video-state">未選択</div></div>' +
    '<div class="fm-box"><h2>③ 人物を検出</h2><p>人物ごとに交換する顔を指定します。</p><button class="fm-btn" id="fm-scan" disabled>動画内の人物を検出</button><div class="fm-meta" id="fm-scan-state">動画を選ぶと利用できます</div></div>' +
    '<div class="fm-box"><h2>④ AIで交換・保存</h2><p>顔の割り当てが完了したら開始できます。</p><button class="fm-btn fm-primary" id="fm-run" disabled>顔交換を開始する</button><div class="fm-status" id="fm-status" aria-live="polite">待機中</div><button class="fm-btn" id="fm-save" hidden style="margin-top:10px">完成動画を保存する</button></div>' +
    '<details class="fm-help"><summary>顔を自然にするコツ・iPhoneの対応条件</summary><p>正面写真に加え、左右20〜30度向いた同じ人の写真も追加すると横顔に対応しやすくなります。顔が明るく鮮明な素材を選んでください。</p><p>初回は約300MBのAIを取得します。Wi-Fi推奨。iOS 26 / Safari 26以降のWebGPU対応環境が必要になることがあり、機種によっては処理・書き出しが失敗します。</p><p>InSwapper-128系のモデルのため、本人に必ずそっくりになる保証はありません。</p></details>' +
    '<button class="fm-btn" id="fm-diagnostic">エラー診断情報をコピー</button>' +
    '<p class="fm-foot">AIエンジン：<a href="https://github.com/robert-schmidt/browser-inswapper" target="_blank" rel="noopener noreferrer">browser-inswapper</a>。元のライセンスを尊重し、非商用で、許可のある顔や動画だけを扱ってください。共有するときはAI加工を明示してください。</p>';
  const main = document.querySelector('main');
  main.prepend(flow);
  main.prepend(hero);
  const setLabel = (id,text) => { if ($(id)) $(id).textContent = text; };
  setLabel('photoUse','この顔を使う');
  setLabel('photoCancel','キャンセル');
  setLabel('photoTitle','この顔を使いますか？');
  setLabel('photoPick','複数の顔があります。使う顔を選んでください。');
  setLabel('videoTitle','動画と人物の詳細設定');
  setLabel('findPeople','動画の人物を検出');
  setLabel('videoGo','動画の顔を交換する');
  setLabel('videoCancel','キャンセル');
  setLabel('trimPlay','選択した区間を再生');
  if ($('mapping').querySelector('p')) $('mapping').querySelector('p').textContent = '人物ごとに交換する顔を指定：';
  const section = $('videoTitle')?.closest('section');
  if (section?.querySelector('p')) section.querySelector('p').textContent = '動画から区間を選び、交換したい顔を指定してください。';
  let fileName = '';
  $('fm-photo').onclick = () => $('upload').click();
  $('fm-video').onclick = () => $('videoFile').click();
  $('fm-scan').onclick = () => { $('findPeople').click(); $('videoTitle').scrollIntoView({behavior:'smooth'}); };
  $('fm-run').onclick = () => { $('videoGo').click(); $('videoTitle').scrollIntoView({behavior:'smooth'}); };
  $('fm-save').onclick = () => $('videoDownload').click();
  $('videoFile').addEventListener('change',e => {
    fileName = e.target.files?.[0]?.name || '';
    update();
  },true);
  $('upload').addEventListener('change',() => {
    $('fm-photo-state').textContent = '解析中。顔の確認画面で「この顔を使う」を押してください。';
  },true);
  function localizeMapping() {
    for (const li of $('mapList').children) {
      for (const node of li.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && /^Person \d+/.test(node.textContent.trim()))
          node.textContent = node.textContent.replace('Person ','人物');
      }
      for (const span of li.querySelectorAll('span'))
        if (span.textContent === 'becomes') span.textContent = '→';
      for (const opt of li.querySelectorAll('option'))
        if (opt.textContent === 'Keep as is') opt.textContent = 'この人物は変更しない';
    }
  }
  function update() {
    const photos = document.querySelectorAll('.faces button.face:not([data-face])').length;
    if (photos) $('fm-photo-state').textContent = photos + '枚の顔写真を登録済み';
    $('fm-video-state').textContent = fileName || '未選択';
    $('fm-scan').disabled = !fileName || $('trimmer').hidden || $('findPeople').disabled;
    $('fm-run').disabled = $('videoGo').disabled;
    $('fm-scan-state').textContent = !$('mapping').hidden ? '人物を検出済み。下の詳細設定で交換する顔を確認してください。' : fileName ? '動画を解析しています。' : '動画を選ぶと利用できます';
    const done = !$('videoDownload').hidden;
    $('fm-save').hidden = !done;
    let previousCrash = '';
    try {
      const stage = localStorage.getItem('facemotion:ai-start-stage');
      if (stage) previousCrash = '前回AI初期化が完了せず再読み込みされた可能性があります。直前: ' + stage + '\\n';
    } catch { /* storage unavailable */ }
    $('fm-status').textContent = done ? '変換完了。完成した動画を保存できます。' : previousCrash + ($('videoStatus').textContent.trim() || '人物の検出と割り当てを待っています。');
    const engineText = $('status')?.textContent?.trim() || 'AIを起動していません';
    const errText = $('log')?.textContent?.trim() || '';
    const bar = $('progress');
    const percent = bar && !bar.hidden && bar.max > 0 ? ' / ' + Math.round(bar.value / bar.max * 100) + '%' : '';
    $('fm-engine').textContent = 'AIの状態：' + engineText + percent + (errText ? '\n詳細：' + errText : '');
    localizeMapping();
  }
  for (const id of ['videoGo','findPeople','mapping','videoDownload','videoStatus','trimmer','mapList','status','log','progress']) {
    new MutationObserver(update).observe($(id),{attributes:true,childList:true,characterData:true,subtree:true});
  }
  new MutationObserver(update).observe(document.querySelector('.faces'),{childList:true});
  $('fm-diagnostic').onclick = async () => {
    const d = ['FaceMotion AI 診断','AI: '+($('status')?.textContent||''),'UserAgent: '+navigator.userAgent,'HTTPS: '+isSecureContext,
      'WebGPU: '+('gpu' in navigator),'VideoEncoder: '+('VideoEncoder' in window),
      'File: '+(fileName||'none'),'Status: '+$('videoStatus').textContent,
      'Error: '+($('log')?.textContent||'')].join('\n');
    try { await navigator.clipboard.writeText(d); $('fm-diagnostic').textContent='コピーしました'; }
    catch { prompt('診断情報をコピー',d); }
  };
  // A reload after the model reaches 100% may be a Safari process kill.
  // Read the persisted startup marker; the engine clears it on successful startup.
  try {
    const stage = localStorage.getItem('facemotion:ai-start-stage');
    if (stage) {
      $('fm-status').textContent = '前回、AI起動中にページが再読み込みされた可能性があります。直前の段階: ' + stage;
      $('fm-photo-state').textContent = '前回のAI起動は完了していません。Safariのメモリ制限が考えられます。';
    }
  } catch { /* storage unavailable */ }
  update();
})();