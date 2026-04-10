export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });

export const openPrintableWindow = (title: string): Window | null => {
  const win = window.open('', '_blank', 'width=1120,height=900');

  if (!win) {
    return null;
  }

  win.document.open();
  win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title></head><body></body></html>`);
  win.document.close();

  return win;
};

export const writePrintableDocument = (
  win: Window,
  title: string,
  bodyHtml: string,
  styles = '',
): void => {
  const documentMarkup = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; color: #0f172a; }
      body {
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @page { margin: 12mm; }
      ${styles}
    </style>
  </head>
  <body>
    ${bodyHtml}
    <script>
      window.addEventListener('load', function () {
        setTimeout(function () {
          window.focus();
          window.print();
        }, 300);
      });
      window.addEventListener('afterprint', function () {
        window.close();
      });
    </script>
  </body>
</html>`;

  win.document.open();
  win.document.write(documentMarkup);
  win.document.close();
};
