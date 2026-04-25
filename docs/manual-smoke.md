# Manual Smoke Path

1. Run `npm run build`.
2. Run `npm start`.
3. Open `http://localhost:3000` and confirm the Angular university overview renders the campus map, identity image, and university cards.
4. Open `http://localhost:3000/api/health` and confirm it returns `{"status":"ok","stack":"angular-nest"}`.
5. Open `http://localhost:3000/api/universities` and confirm it returns the JSON-backed university list.
