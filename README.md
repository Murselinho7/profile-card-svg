# Profile Card SVG

![Node](https://img.shields.io/badge/node-%3E%3D16-339933?logo=node.js&logoColor=white)
![SVG](https://img.shields.io/badge/output-svg-FFB13B)
![Dependencies](https://img.shields.io/badge/dependencies-zero-success)
![License](https://img.shields.io/badge/license-MIT-blue)

A small Node script that reads `config.json` and writes `profile-card.svg`. The card is plain SVG: rectangles, circles, gradients, and text. No canvas library and no SVG package.

## Generate

Edit `config.json`, then:

```bash
node generate.js
```

A different config file is optional. The SVG is written next to that file.

```bash
node generate.js C:\path\to\config.json
```

`name` is required. `title`, `bio`, `skills`, and `socials` are optional. Skills are short labels. Each social entry has a `label` and a `handle` (the text you want visible, such as `your-handle`).

```json
{
  "name": "Mürsel",
  "title": "Student",
  "bio": "Building small tools, games, and interfaces.",
  "skills": ["Python", "JavaScript", "HTML", "CSS", "Algorithms"],
  "socials": [
    { "label": "GitHub", "handle": "your-handle" },
    { "label": "Portfolio", "handle": "your-site.dev" }
  ]
}
```

Open `profile-card.svg` in a browser to check the layout. The card uses a dark glass panel, a gradient accent, skill pills, and a social line. Text is escaped so a name that contains `<` or `&` cannot break the markup.

## Show it in a GitHub README

Commit `profile-card.svg` next to the README and embed it:

```markdown
![Mürsel profile card](profile-card.svg)
```

The same link form keeps a way in when the thumbnail cannot be painted:

```markdown
[![Mürsel profile card](profile-card.svg)](profile-card.svg)
```

GitHub's README image proxy often refuses SVG responses, so the thumbnail in the markdown preview can stay blank. The file view still renders the SVG. Opening the image link, or clicking the file in the repository, shows the card. That is why the markup above points at the file itself.

The SVG stays intact in that view because it has no script, no `foreignObject`, no external images, and no event handlers. Colors and text are normal SVG attributes and a local gradient.

GitHub Pages will also render it if this folder is the site root:

```html
<img src="profile-card.svg" width="920" alt="Mürsel profile card" />
```

## Sample

![Mürsel profile card](profile-card.svg)

Regenerate after every config edit. The checked-in SVG is whatever `node generate.js` wrote last.

## License

Released under the MIT License.
