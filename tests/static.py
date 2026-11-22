"""Check a finished static build, including the English-only Neocities build."""
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from urllib.parse import parse_qs, unquote, urljoin, urlsplit
from xml.etree import ElementTree

root = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
errors = set()


class Links(HTMLParser):
  def __init__(self, page):
    super().__init__()
    self.page = page
    self.json_script = False

  def handle_starttag(self, tag, attrs):
    attrs = dict(attrs)
    if tag == "script":
      self.json_script = attrs.get("type") in {"application/json", "application/ld+json"}
    for key in ("href", "src", "action"):
      value = attrs.get(key)
      if not value:
        continue
      base = "https://build.invalid/" + self.page.relative_to(root).as_posix()
      url = urlsplit(urljoin(base, value))
      if url.hostname == "build.invalid" and url.path == "/.netlify/images":
        # The CDN transforms a source asset at request time.
        sources = parse_qs(url.query).get("url")
        if not sources:
          errors.add(f"{self.page.relative_to(root)} has a CDN image without a source")
          continue
        url = urlsplit(urljoin("https://build.invalid/", sources[0]))
      if url.hostname == "build.invalid":
        check_path(unquote(url.path), self.page)

  def handle_data(self, data):
    if self.json_script:
      json.loads(data)

  def handle_endtag(self, tag):
    if tag == "script":
      self.json_script = False


def check_path(path, source):
  target = root / path.lstrip("/")
  if target.is_dir():
    target /= "index.html"
  if not target.is_file():
    errors.add(f"{source.relative_to(root)} links to missing {path}")


pages = list(root.rglob("*.html"))
if not (root / "index.html").is_file():
  sys.exit(f"Missing build at {root}")
for page in pages:
  parser = Links(page)
  parser.feed(page.read_text())
  parser.close()

for name in ("rss.xml", "atom.xml", "feed.json"):
  feed = root / name
  for path in [feed, *(root / feed.stem).glob("*" + feed.suffix)]:
    if path.suffix == ".json":
      assert isinstance(json.loads(path.read_text())["items"], list), path
    else:
      assert ElementTree.parse(path).getroot().tag in {"rss", "{http://www.w3.org/2005/Atom}feed"}, path

sitemap = root / "sitemap.xml"
for loc in ElementTree.parse(sitemap).iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
  check_path(unquote(urlsplit(loc.text).path), sitemap)
if errors:
  sys.exit("\n".join(sorted(errors)))
print(f"Checked local links and embedded JSON in {len(pages)} HTML files, all feeds, and the sitemap.")
