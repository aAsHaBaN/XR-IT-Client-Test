# XR-IT - Orchestrator Frontend

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and TypeScript.

## Getting Started

First, install the dependencies:
```bash
npm install
```

Then, create a `.env.local` file at the root containing the following:
```
NEXT_PUBLIC_API_HOST=http://localhost:1194
NEXT_PUBLIC_UNREAL_DEFAULT_PORT=8764
```

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production build

```bash
npm run build
```

## Linting & formatting

This project uses [prettier](https://prettier.io/) for formatting and [eslint](https://eslint.org/) for linting.

You can run the following commands to lint and format your code:

```bash
npm run lint
```

```bash
npm run format
```

These commands are run automatically when you commit changes, thanks to a **pre-commit hook** run by [husky](https://github.com/typicode/husky).

## Libraries

- Diagrammatic Library: [React Flow](https://reactflow.dev/)
- Layout Library: [dagre](https://dagrejs.github.io/dagre/)
- Styling Library: [tailwindcss](https://tailwindcss.com/)
- Icons: [heroicons](https://heroicons.com/)
- Web Sockets: [socket.io](https://socket.io/)

