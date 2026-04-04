# Photo Sharing v1

This project contains both the React frontend and the Express backend in the same folder.

## Run in CodeSandbox

Open two terminals inside the `photo-sharing-v1` folder.

### Terminal 1 - backend

```bash
npm install
npm run server
```

### Terminal 2 - frontend

```bash
npm start
```

## API endpoints

The backend runs on port `3001` and exposes:

- `/test/info`
- `/user/list`
- `/user/:id`
- `/photosOfUser/:id`

The React dev server uses CRA proxy, so the frontend can fetch these routes with relative URLs.
