# glow-props

A static site that delivers fetchable text files.

## Structure

```
index.html          Landing page listing available texts
texts/              Directory of text files
  hello.txt         Sample text
```

## Usage

1. Add `.txt` or `.md` files to `texts/`.
2. Link them from `index.html`.
3. Deploy to any static host (GitHub Pages, Netlify, etc.).

### GitHub Pages

Enable Pages in your repo settings, set source to the branch you want, and root `/`. Your texts will be available at `https://<user>.github.io/glow-props/texts/<filename>`.