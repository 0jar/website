<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>XML Sitemap - jarema.me</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: hsl(0, 0%, 95%);
            background: hsl(270, 30%, 10%);
            min-height: 100vh;
            padding: 2rem 1rem;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
          }

          .header {
            padding: 2rem 0;
            text-align: center;
            border-bottom: 1px solid hsl(270, 25%, 25%);
            margin-bottom: 2rem;
          }

          .header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
            color: hsl(0, 0%, 98%);
          }

          .header p {
            opacity: 0.8;
            font-size: 1rem;
            color: hsl(270, 10%, 70%);
          }

          .info-box {
            background: hsl(270, 25%, 15%);
            border: 1px solid hsl(270, 25%, 25%);
            border-left: 3px solid hsl(195, 100%, 65%);
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-radius: 8px;
          }

          .info-box h2 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            color: hsl(195, 100%, 65%);
            font-weight: 600;
          }

          .info-box p {
            color: hsl(270, 10%, 70%);
            font-size: 0.95rem;
          }

          .sitemap-url {
            background: hsl(270, 30%, 12%);
            border: 1px solid hsl(270, 25%, 25%);
            padding: 0.75rem;
            border-radius: 6px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.85rem;
            word-break: break-all;
            margin-top: 0.75rem;
            color: hsl(195, 100%, 75%);
          }

          .stats {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .stat-card {
            background: hsl(270, 25%, 15%);
            border: 1px solid hsl(270, 25%, 25%);
            border-radius: 8px;
            padding: 1rem 1.5rem;
            flex: 1;
            min-width: 150px;
          }

          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: hsl(195, 100%, 65%);
            margin-bottom: 0.25rem;
          }

          .stat-label {
            font-size: 0.875rem;
            color: hsl(270, 10%, 60%);
          }

          .urls h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: hsl(0, 0%, 98%);
            font-weight: 700;
          }

          .url-group {
            margin-bottom: 2rem;
          }

          .url-group h3 {
            font-size: 1.1rem;
            color: hsl(195, 100%, 65%);
            margin-bottom: 1rem;
            font-weight: 600;
          }

          .url-item {
            background: hsl(270, 25%, 15%);
            border: 1px solid hsl(270, 25%, 25%);
            border-radius: 8px;
            padding: 1rem 1.5rem;
            margin-bottom: 0.75rem;
            transition: border-color 0.2s, transform 0.2s;
          }

          .url-item:hover {
            border-color: hsl(195, 100%, 65%);
            transform: translateX(4px);
          }

          .url-item a {
            color: hsl(0, 0%, 98%);
            text-decoration: none;
            display: block;
            transition: color 0.2s;
          }

          .url-item a:hover {
            color: hsl(195, 100%, 65%);
          }

          .url-loc {
            font-size: 1rem;
            margin-bottom: 0.25rem;
          }

          .url-meta {
            font-size: 0.813rem;
            color: hsl(270, 10%, 60%);
            font-family: 'Monaco', 'Courier New', monospace;
          }

          .footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid hsl(270, 25%, 25%);
            text-align: center;
            color: hsl(270, 10%, 60%);
            font-size: 0.875rem;
          }

          @media (max-width: 600px) {
            body {
              padding: 1rem 0.5rem;
            }

            .header h1 {
              font-size: 1.5rem;
            }

            .info-box {
              padding: 1rem;
            }

            .url-item {
              padding: 0.75rem 1rem;
            }

            .stat-card {
              padding: 0.75rem 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XML Sitemap</h1>
            <p>All pages indexed on jarema.me</p>
          </div>

          <div class="info-box">
            <h2>What is this?</h2>
            <p>This is an XML Sitemap used by search engines to discover and index pages on this website. It lists all publicly accessible URLs and helps search engines crawl the site more efficiently.</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
              </div>
              <div class="stat-label">Total URLs</div>
            </div>
          </div>

          <div class="urls">
            <h2>All Pages</h2>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <xsl:sort select="sitemap:loc"/>
              <div class="url-item">
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="sitemap:loc"/>
                  </xsl:attribute>
                  <div class="url-loc">
                    <xsl:value-of select="sitemap:loc"/>
                  </div>
                  <xsl:if test="sitemap:lastmod">
                    <div class="url-meta">
                      Last modified: <xsl:value-of select="sitemap:lastmod"/>
                    </div>
                  </xsl:if>
                </a>
              </div>
            </xsl:for-each>
          </div>

          <div class="footer">
            Generated automatically • <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> pages indexed
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>