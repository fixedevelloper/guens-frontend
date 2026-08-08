<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Sitemap - Guen's Travel &amp; Tours</title>
        <style>
          :root { color-scheme: light; }
          body {
            margin: 0;
            padding: 2.5rem 1.5rem;
            background: #f8fafc;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .wrap { max-width: 960px; margin: 0 auto; }
          h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.25rem; }
          .subtitle { color: #64748b; font-size: 0.875rem; margin: 0 0 1.5rem; }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          }
          thead th {
            text-align: left;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #64748b;
            background: #f1f5f9;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e2e8f0;
          }
          tbody td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.875rem;
            vertical-align: top;
          }
          tbody tr:last-child td { border-bottom: none; }
          tbody tr:hover { background: #f8fafc; }
          a { color: #0c6b99; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
          .lang-badge {
            display: inline-block;
            font-size: 0.7rem;
            font-weight: 600;
            color: #0c6b99;
            background: #e6f4fa;
            border-radius: 6px;
            padding: 0.1rem 0.4rem;
            margin: 0 0.2rem 0.2rem 0;
          }
          .muted { color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>XML Sitemap</h1>
          <p class="subtitle">
            <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> URL(s) - generated for search engines.
            This human-readable view is produced client-side by an XSLT stylesheet; the underlying document is
            plain, valid sitemap XML.
          </p>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Languages</th>
                <th>Priority</th>
                <th>Change frequency</th>
                <th>Last modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a>
                  </td>
                  <td>
                    <xsl:for-each select="xhtml:link[@hreflang != 'x-default']">
                      <span class="lang-badge"><xsl:value-of select="@hreflang" /></span>
                    </xsl:for-each>
                  </td>
                  <td><xsl:value-of select="sitemap:priority" /></td>
                  <td><xsl:value-of select="sitemap:changefreq" /></td>
                  <td class="muted"><xsl:value-of select="substring(sitemap:lastmod, 1, 10)" /></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
