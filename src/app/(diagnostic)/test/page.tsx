export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#333' }}>
      <h1 style={{ color: 'black' }}>Admin DOM Inspector</h1>

      <h2>1. Iframe DOM Tree (after 5s)</h2>
      <div id="dom-tree" style={{ color: '#333' }}>Loading iframe...</div>

      <h2>2. Computed Styles on Key Elements</h2>
      <div id="computed-styles" style={{ color: '#333' }}>Waiting...</div>

      <h2>3. CSS Variable Check</h2>
      <div id="css-vars" style={{ color: '#333' }}>Waiting...</div>

      <h2>4. Iframe Preview</h2>
      <iframe
        id="admin-iframe"
        src="/admin"
        style={{ width: '100%', height: '400px', border: '2px solid red' }}
        title="Admin Preview"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            var iframe = document.getElementById('admin-iframe');
            iframe.addEventListener('load', function() {
              setTimeout(function() {
                try {
                  var doc = iframe.contentDocument;
                  var body = doc.body;
                  var domEl = document.getElementById('dom-tree');
                  var stylesEl = document.getElementById('computed-styles');
                  var varsEl = document.getElementById('css-vars');

                  // 1. Dump DOM tree (first 3 levels)
                  function dumpEl(el, depth) {
                    if (depth > 3 || !el) return '';
                    var tag = el.tagName || '';
                    var id = el.id ? '#' + el.id : '';
                    var cls = el.className && typeof el.className === 'string'
                      ? '.' + el.className.split(' ').slice(0, 3).join('.')
                      : '';
                    var text = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
                      ? ' text="' + el.textContent.substring(0, 30) + '"'
                      : '';
                    var hidden = el.hidden ? ' [HIDDEN]' : '';
                    var ds = el.getAttribute ? (el.getAttribute('style') || '') : '';
                    var style = ds ? ' style="' + ds.substring(0, 60) + '"' : '';
                    var indent = '  '.repeat(depth);
                    var line = indent + '<' + tag + id + cls + hidden + style + text + '>';
                    line += ' (' + el.children.length + ' children)';

                    // Check if visible
                    var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
                    if (rect) {
                      line += ' [' + Math.round(rect.width) + 'x' + Math.round(rect.height) + ']';
                    }
                    line += '\\n';

                    for (var i = 0; i < el.children.length && i < 10; i++) {
                      line += dumpEl(el.children[i], depth + 1);
                    }
                    if (el.children.length > 10) {
                      line += indent + '  ... +' + (el.children.length - 10) + ' more\\n';
                    }
                    return line;
                  }

                  var htmlEl = doc.documentElement;
                  var tree = 'HTML data-theme="' + (htmlEl.getAttribute('data-theme') || '') + '"\\n';
                  tree += dumpEl(body, 0);
                  domEl.innerHTML = '<pre style="font-size:11px;max-height:600px;overflow:auto;background:#f5f5f5;padding:1rem;white-space:pre-wrap">' +
                    tree.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';

                  // 2. Find first non-hidden div with children and check computed styles
                  var allDivs = body.querySelectorAll('div:not([hidden])');
                  var info = '';
                  var checked = 0;
                  for (var i = 0; i < allDivs.length && checked < 5; i++) {
                    var d = allDivs[i];
                    if (d.offsetHeight > 0 || d.children.length > 2) {
                      var cs = iframe.contentWindow.getComputedStyle(d);
                      info += '<strong>&lt;div' + (d.id ? '#' + d.id : '') + (d.className ? '.' + String(d.className).split(' ')[0] : '') + '&gt;</strong>\\n';
                      info += '  color: ' + cs.color + '\\n';
                      info += '  background: ' + cs.backgroundColor + '\\n';
                      info += '  display: ' + cs.display + '\\n';
                      info += '  visibility: ' + cs.visibility + '\\n';
                      info += '  opacity: ' + cs.opacity + '\\n';
                      info += '  position: ' + cs.position + '\\n';
                      info += '  overflow: ' + cs.overflow + '\\n';
                      info += '  width: ' + cs.width + ', height: ' + cs.height + '\\n';
                      info += '  font-size: ' + cs.fontSize + '\\n\\n';
                      checked++;
                    }
                  }
                  stylesEl.innerHTML = '<pre style="font-size:11px;background:#f5f5f5;padding:1rem">' + info + '</pre>';

                  // 3. Check CSS custom properties on :root / html
                  var rootCS = iframe.contentWindow.getComputedStyle(htmlEl);
                  var varNames = [
                    '--theme-bg', '--theme-text',
                    '--color-base-0', '--color-base-50', '--color-base-100',
                    '--color-base-500', '--color-base-800', '--color-base-1000',
                    '--theme-elevation-0', '--theme-elevation-50', '--theme-elevation-100',
                    '--theme-elevation-150', '--theme-elevation-200',
                    '--color-text', '--color-warning-500', '--color-success-500'
                  ];
                  var varsInfo = 'data-theme: ' + (htmlEl.getAttribute('data-theme') || 'NONE') + '\\n\\n';
                  varNames.forEach(function(name) {
                    var val = rootCS.getPropertyValue(name);
                    varsInfo += name + ': ' + (val || '(not set)') + '\\n';
                  });
                  varsEl.innerHTML = '<pre style="font-size:11px;background:#f5f5f5;padding:1rem">' + varsInfo + '</pre>';

                } catch(e) {
                  domEl.innerHTML = '<strong style="color:red">Error: ' + e.message + '</strong>';
                }
              }, 5000);
            });
          `,
        }}
      />
    </div>
  )
}
