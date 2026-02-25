export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#333' }}>
      <h1 style={{ color: 'black' }}>Admin Diagnostic</h1>

      <h2>1. API Check</h2>
      <div id="api-check">Testing /api/users...</div>

      <h2>2. CSS Check</h2>
      <div id="css-check">Testing CSS files...</div>

      <h2>3. JS Chunk Check</h2>
      <div id="js-check">Testing JS files...</div>

      <h2>4. Create-First-User Page</h2>
      <div id="cfu-check">Testing /admin/create-first-user...</div>

      <h2>5. Admin iframe (with error capture)</h2>
      <div id="iframe-errors" style={{ color: 'red' }}></div>
      <iframe
        id="admin-iframe"
        src="/admin"
        style={{ width: '100%', height: '400px', border: '2px solid red' }}
        title="Admin Preview"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // 1. Check API
            fetch('/api/users').then(r => r.json()).then(data => {
              document.getElementById('api-check').innerHTML =
                '<strong style="color:green">API works!</strong> Response: <pre>' +
                JSON.stringify(data, null, 2).substring(0, 500) + '</pre>';
            }).catch(err => {
              document.getElementById('api-check').innerHTML =
                '<strong style="color:red">API Error:</strong> ' + err.message;
            });

            // 2. Check CSS files load
            fetch('/admin').then(r => r.text()).then(html => {
              var parser = new DOMParser();
              var doc = parser.parseFromString(html, 'text/html');
              var links = doc.querySelectorAll('link[rel="stylesheet"]');
              var el = document.getElementById('css-check');
              el.innerHTML = '<strong>Found ' + links.length + ' CSS files. Testing each...</strong><br>';

              links.forEach(function(link) {
                var href = link.getAttribute('href');
                fetch(href).then(function(r) {
                  el.innerHTML += (r.ok ? '✅' : '❌ ' + r.status) + ' ' + href.substring(0, 80) + '<br>';
                }).catch(function(e) {
                  el.innerHTML += '❌ FAILED: ' + href.substring(0, 80) + ' - ' + e.message + '<br>';
                });
              });

              // 3. Check JS chunks
              var scripts = doc.querySelectorAll('script[src]');
              var jsEl = document.getElementById('js-check');
              jsEl.innerHTML = '<strong>Found ' + scripts.length + ' JS files. Testing each...</strong><br>';

              scripts.forEach(function(script) {
                var src = script.getAttribute('src');
                fetch(src).then(function(r) {
                  jsEl.innerHTML += (r.ok ? '✅' : '❌ ' + r.status) + ' ' + src.substring(0, 80) + '<br>';
                }).catch(function(e) {
                  jsEl.innerHTML += '❌ FAILED: ' + src.substring(0, 80) + ' - ' + e.message + '<br>';
                });
              });
            });

            // 4. Check create-first-user
            fetch('/admin/create-first-user').then(r => {
              document.getElementById('cfu-check').innerHTML =
                '<strong>Status:</strong> ' + r.status + ' ' + r.statusText +
                '<br><strong>URL:</strong> ' + r.url +
                '<br><strong>Redirected:</strong> ' + r.redirected;
              return r.text();
            }).then(html => {
              var parser = new DOMParser();
              var doc = parser.parseFromString(html, 'text/html');
              var title = doc.title;
              var bodyText = doc.body ? doc.body.innerText.substring(0, 500) : 'NO BODY';
              document.getElementById('cfu-check').innerHTML +=
                '<br><strong>Title:</strong> ' + title +
                '<br><strong>Body text:</strong> ' + (bodyText || '(empty)');
            });

            // 5. Capture iframe errors
            var iframe = document.getElementById('admin-iframe');
            iframe.addEventListener('load', function() {
              var errEl = document.getElementById('iframe-errors');
              try {
                var iframeWin = iframe.contentWindow;
                var iframeDoc = iframe.contentDocument;

                // Check for visible content
                var bodyText = iframeDoc.body ? iframeDoc.body.innerText : '';
                errEl.innerHTML += '<br><strong>Iframe body text length:</strong> ' + bodyText.length;
                if (bodyText.length > 0) {
                  errEl.innerHTML += '<br><strong>First 200 chars:</strong> ' + bodyText.substring(0, 200);
                } else {
                  errEl.innerHTML += '<br><strong style="color:red">Body is EMPTY - no visible text</strong>';
                }

                // Check for existing console errors by overriding console.error
                var origError = iframeWin.console.error;
                var errors = [];
                iframeWin.console.error = function() {
                  errors.push(Array.from(arguments).map(String).join(' '));
                  origError.apply(iframeWin.console, arguments);
                };

                // Listen for future errors
                iframeWin.addEventListener('error', function(e) {
                  errEl.innerHTML += '<br><strong style="color:red">JS Error:</strong> ' +
                    e.message + ' at ' + e.filename + ':' + e.lineno;
                });
                iframeWin.addEventListener('unhandledrejection', function(e) {
                  errEl.innerHTML += '<br><strong style="color:red">Unhandled Promise:</strong> ' +
                    (e.reason ? (e.reason.message || String(e.reason)) : 'unknown');
                });

                // Check again after 5 seconds
                setTimeout(function() {
                  var bodyText2 = iframeDoc.body ? iframeDoc.body.innerText : '';
                  errEl.innerHTML += '<br><br><strong>After 5s:</strong>';
                  errEl.innerHTML += '<br>Body text length: ' + bodyText2.length;
                  errEl.innerHTML += '<br>Body children: ' + (iframeDoc.body ? iframeDoc.body.children.length : 0);
                  if (bodyText2.length > 0) {
                    errEl.innerHTML += '<br>Text: ' + bodyText2.substring(0, 300);
                  }
                  if (errors.length > 0) {
                    errEl.innerHTML += '<br><br><strong style="color:red">Console errors captured:</strong>';
                    errors.forEach(function(e) {
                      errEl.innerHTML += '<br>' + e.substring(0, 200);
                    });
                  }

                  // List all elements with display:none or visibility:hidden or opacity:0
                  var hidden = iframeDoc.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [style*="opacity: 0"], [hidden]');
                  errEl.innerHTML += '<br><br><strong>Hidden elements:</strong> ' + hidden.length;
                  hidden.forEach(function(el) {
                    errEl.innerHTML += '<br>  ' + el.tagName + '#' + el.id + ' hidden=' + el.hidden +
                      ' style="' + (el.getAttribute('style') || '') + '"';
                  });
                }, 5000);
              } catch(e) {
                errEl.innerHTML += '<br><strong style="color:red">Cross-origin error:</strong> ' + e.message;
              }
            });
          `,
        }}
      />
    </div>
  )
}
