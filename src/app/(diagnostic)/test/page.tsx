export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#333' }}>
      <h1 style={{ color: 'black' }}>Error Capture Test</h1>

      <h2>1. /admin/create-first-user (direct fetch - check for RootPage error)</h2>
      <div id="cfu-body">Loading...</div>

      <h2>2. Admin iframe (check for visible error or content)</h2>
      <div id="iframe-info" style={{ color: '#333' }}>Waiting for iframe...</div>
      <iframe
        id="admin-iframe"
        src="/admin/create-first-user"
        style={{ width: '100%', height: '500px', border: '2px solid red' }}
        title="Admin Preview"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // 1. Fetch create-first-user and show the FULL body HTML
            fetch('/admin/create-first-user').then(r => r.text()).then(html => {
              var parser = new DOMParser();
              var doc = parser.parseFromString(html, 'text/html');
              var el = document.getElementById('cfu-body');

              // Check for our debug marker
              var debugMarker = doc.querySelector('[data-debug-rootpage]');
              el.innerHTML = '<strong>Debug marker found:</strong> ' + (debugMarker ? 'YES - RootPage rendered' : 'NO') + '<br>';

              // Check for red error text (our error handler)
              var errorDiv = doc.querySelector('div[style*="color: red"], div[style*="color:red"]');
              if (errorDiv) {
                el.innerHTML += '<strong style="color:red">SERVER ERROR FOUND:</strong><br>';
                el.innerHTML += '<pre style="background:#fff0f0;padding:1rem;white-space:pre-wrap">' +
                  errorDiv.textContent + '</pre>';
              }

              // Show full body HTML
              var bodyHtml = doc.body ? doc.body.innerHTML : 'NO BODY';
              el.innerHTML += '<br><strong>Full body HTML (' + bodyHtml.length + ' chars):</strong>';
              el.innerHTML += '<pre style="font-size:10px;max-height:400px;overflow:auto;background:#f5f5f5;padding:1rem;white-space:pre-wrap">' +
                bodyHtml.substring(0, 8000).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
            }).catch(err => {
              document.getElementById('cfu-body').innerHTML =
                '<strong style="color:red">Fetch error:</strong> ' + err.message;
            });

            // 2. Check iframe after 6 seconds
            var iframe = document.getElementById('admin-iframe');
            iframe.addEventListener('load', function() {
              setTimeout(function() {
                try {
                  var doc = iframe.contentDocument;
                  var el = document.getElementById('iframe-info');

                  var bodyText = doc.body ? doc.body.innerText : '';
                  el.innerHTML = '<strong>Body text length:</strong> ' + bodyText.length;

                  if (bodyText.length > 0) {
                    el.innerHTML += '<br><strong style="color:green">VISIBLE TEXT:</strong><br>';
                    el.innerHTML += '<pre style="background:#f0fff0;padding:1rem">' +
                      bodyText.substring(0, 1000) + '</pre>';
                  } else {
                    el.innerHTML += '<br><strong style="color:red">Still no visible text</strong>';
                    el.innerHTML += '<br>Body children: ' + (doc.body ? doc.body.children.length : 0);

                    // Check for our error handler output
                    var errorEl = doc.querySelector('[style*="color: red"], [style*="color:red"]');
                    if (errorEl) {
                      el.innerHTML += '<br><strong style="color:red">Error element found:</strong> ' +
                        errorEl.textContent.substring(0, 500);
                    }

                    // Check debug marker
                    var marker = doc.querySelector('[data-debug-rootpage]');
                    el.innerHTML += '<br>Debug marker: ' + (marker ? 'YES' : 'NO');
                  }
                } catch(e) {
                  document.getElementById('iframe-info').innerHTML =
                    '<strong style="color:red">Error:</strong> ' + e.message;
                }
              }, 6000);
            });
          `,
        }}
      />
    </div>
  )
}
