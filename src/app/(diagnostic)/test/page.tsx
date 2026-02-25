export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#333' }}>
      <h1 style={{ color: 'black' }}>Server-Side Diagnostic</h1>

      <h2>1. Payload Server State (/api/diag)</h2>
      <div id="diag">Loading...</div>

      <h2>2. /admin Redirect Check</h2>
      <div id="redirect-check">Loading...</div>

      <h2>3. /admin/create-first-user Redirect Check</h2>
      <div id="cfu-redirect">Loading...</div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // 1. Server diagnostic
            fetch('/api/diag').then(r => r.json()).then(data => {
              document.getElementById('diag').innerHTML =
                '<pre style="font-size:12px;background:#f5f5f5;padding:1rem;max-height:400px;overflow:auto">' +
                JSON.stringify(data, null, 2) + '</pre>';
            }).catch(err => {
              document.getElementById('diag').innerHTML =
                '<strong style="color:red">Error:</strong> ' + err.message;
            });

            // 2. Check /admin redirect behavior (manual = don't follow redirects)
            fetch('/admin', { redirect: 'manual' }).then(r => {
              document.getElementById('redirect-check').innerHTML =
                '<strong>Status:</strong> ' + r.status + ' ' + r.statusText +
                '<br><strong>Type:</strong> ' + r.type +
                '<br><strong>Location header:</strong> ' + (r.headers.get('location') || '(none)') +
                '<br><strong>URL:</strong> ' + r.url;
            }).catch(err => {
              document.getElementById('redirect-check').innerHTML =
                '<strong style="color:red">Error:</strong> ' + err.message;
            });

            // 3. Check /admin/create-first-user
            fetch('/admin/create-first-user', { redirect: 'manual' }).then(r => {
              document.getElementById('cfu-redirect').innerHTML =
                '<strong>Status:</strong> ' + r.status + ' ' + r.statusText +
                '<br><strong>Type:</strong> ' + r.type +
                '<br><strong>Location header:</strong> ' + (r.headers.get('location') || '(none)') +
                '<br><strong>URL:</strong> ' + r.url;
            }).catch(err => {
              document.getElementById('cfu-redirect').innerHTML =
                '<strong style="color:red">Error:</strong> ' + err.message;
            });
          `,
        }}
      />
    </div>
  )
}
