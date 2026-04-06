
- Nuxtのメモリ制限。
  - Nuxtがメモリを食いつぶしてFastAPIなどでスワップが起きてしまう可能性がある。

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```
