<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
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

          .feed-url {
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

          .posts h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: hsl(0, 0%, 98%);
            font-weight: 700;
          }

          .post {
            background: hsl(270, 25%, 15%);
            border: 1px solid hsl(270, 25%, 25%);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: border-color 0.2s, transform 0.2s;
          }

          .post:hover {
            border-color: hsl(195, 100%, 65%);
            transform: translateY(-2px);
          }

          .post h3 {
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }

          .post h3 a {
            color: hsl(0, 0%, 98%);
            text-decoration: none;
            transition: color 0.2s;
          }

          .post h3 a:hover {
            color: hsl(195, 100%, 65%);
          }

          .post-meta {
            font-size: 0.875rem;
            color: hsl(270, 10%, 60%);
            margin-bottom: 0.75rem;
          }

          .post-description {
            color: hsl(270, 10%, 70%);
            line-height: 1.6;
          }

          .tags {
            margin-top: 1rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .tag {
            display: inline-block;
            background: hsl(270, 30%, 20%);
            color: hsl(195, 100%, 65%);
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.813rem;
            border: 1px solid hsl(270, 25%, 25%);
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

            .post {
              padding: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
          </div>

          <div class="info-box">
            <h2>RSS Feed</h2>
            <p>This is an RSS feed. Copy the URL below to subscribe in your favorite RSS reader.</p>
            <div class="feed-url">
              <xsl:value-of select="/rss/channel/atom:link[@rel='self']/@href"/>
            </div>
          </div>

          <div class="posts">
            <h2>Recent posts</h2>
            <xsl:for-each select="/rss/channel/item">
              <div class="post">
                <h3>
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h3>
                <div class="post-meta">
                  Published: <xsl:value-of select="pubDate"/>
                </div>
                <div class="post-description">
                  <xsl:value-of select="description"/>
                </div>
                <xsl:if test="category">
                  <div class="tags">
                    <xsl:for-each select="category">
                      <span class="tag"><xsl:value-of select="."/></span>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </div>
            </xsl:for-each>
          </div>

          <div class="footer">
            Last updated: <xsl:value-of select="/rss/channel/lastBuildDate"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
