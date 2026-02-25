export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: 'black', fontSize: '2rem' }}>Test Page Works</h1>
      <p style={{ color: '#333' }}>If you can see this text, basic Next.js page rendering is working.</p>
      <p style={{ color: '#333' }}>
        Now try visiting <a href="/admin" style={{ color: 'blue' }}>/admin</a>
      </p>
      <div id="admin-check" style={{ marginTop: '1rem', color: '#333' }}>
        Checking /admin response...
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            fetch('/admin').then(r => {
              document.getElementById('admin-check').innerHTML =
                '<strong>/admin response:</strong> HTTP ' + r.status + ' ' + r.statusText +
                '<br>Content-Type: ' + r.headers.get('content-type') +
                '<br>Content-Length: ' + (r.headers.get('content-length') || 'chunked');
              return r.text();
            }).then(html => {
              var pre = document.createElement('pre');
              pre.style.maxHeight = '300px';
              pre.style.overflow = 'auto';
              pre.style.background = '#f5f5f5';
              pre.style.padding = '1rem';
              pre.style.fontSize = '12px';
              pre.textContent = html.substring(0, 3000);
              document.getElementById('admin-check').appendChild(pre);
            }).catch(err => {
              document.getElementById('admin-check').innerHTML =
                '<strong style="color:red">Error fetching /admin:</strong> ' + err.message;
            });
          `,
        }}
      />
    </div>
  )
}
