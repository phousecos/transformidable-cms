export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: 'black', fontSize: '2rem' }}>Test Page Works</h1>
      <p style={{ color: '#333' }}>If you can see this, basic Next.js page rendering works.</p>

      <h2 style={{ color: 'black', marginTop: '2rem' }}>Admin Page Body Content</h2>
      <div id="body-check" style={{ color: '#333' }}>Loading...</div>

      <h2 style={{ color: 'black', marginTop: '2rem' }}>Admin Page in iframe</h2>
      <iframe
        src="/admin"
        style={{ width: '100%', height: '600px', border: '2px solid red' }}
        title="Admin Preview"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            fetch('/admin').then(r => r.text()).then(html => {
              var parser = new DOMParser();
              var doc = parser.parseFromString(html, 'text/html');
              var body = doc.body;
              var el = document.getElementById('body-check');
              el.innerHTML = '<strong>Body child elements: ' + body.children.length + '</strong>';

              // Show body innerHTML
              var pre = document.createElement('pre');
              pre.style.maxHeight = '400px';
              pre.style.overflow = 'auto';
              pre.style.background = '#f5f5f5';
              pre.style.padding = '1rem';
              pre.style.fontSize = '11px';
              pre.style.whiteSpace = 'pre-wrap';
              pre.textContent = body.innerHTML.substring(0, 5000);
              el.appendChild(pre);

              // Show all CSS files
              var links = doc.querySelectorAll('link[rel="stylesheet"]');
              var cssInfo = document.createElement('div');
              cssInfo.innerHTML = '<strong>CSS files (' + links.length + '):</strong><br>';
              links.forEach(function(link) {
                cssInfo.innerHTML += link.href + '<br>';
              });
              el.appendChild(cssInfo);
            }).catch(err => {
              document.getElementById('body-check').innerHTML =
                '<strong style="color:red">Error:</strong> ' + err.message;
            });
          `,
        }}
      />
    </div>
  )
}
