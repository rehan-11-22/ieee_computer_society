/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const html = fs.readFileSync('C:/Users/PC/Downloads/index.html', 'utf8');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  const css = '@import "tailwindcss";\n' + styleMatch[1];
  fs.writeFileSync('src/app/globals.css', css);
  console.log('CSS extracted successfully');
} else {
  console.log('No style tag found');
}
