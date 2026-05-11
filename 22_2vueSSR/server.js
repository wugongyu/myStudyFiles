import express from 'express';
import {createApp} from './app.js';
import { renderToString } from 'vue/server-renderer';

const server = express();

server.get('/', (req, res) => {
  const app = createApp();
  renderToString(app).then((html) => {
    res.send(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>VUE SSR example</title>
        </head>
        <script type="importmap">
          {
            "imports": {
              "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
            }
          }
        </script>
        <script type="module" src="/client.js"></script>
        <body>
          <div id="app">
            ${html}
          </div>
        </body>
      </html>`
    )
  })
});

server.use(express.static('.'));

server.listen(3000, () => {
  console.log('server ready');
});