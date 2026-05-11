import { createSSRApp  } from 'vue';

export function createApp() {
  const app = createSSRApp({
    data: () => ({ count: 1 }),
    template: `<button @click="count++">{{count}}</button>`
  });
  return app
}