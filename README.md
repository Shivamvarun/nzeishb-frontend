# nzeishb-frontend

## Steps to run the code

Start from this directory:

```text
C:\Users\TYP0655\OneDrive - TYPSA\Desktop\arva test\nzeishb-frontend
```

Run the following commands in this exact order:

```powershell
pnpm approve-builds
```

When prompted, select `esbuild`.

```powershell
pnpm add @babel/runtime
pnpm install
pnpm exec ng cache clean
pnpm exec ng build
```

If the build succeeds, start the development server:

```powershell
pnpm exec ng serve --open
```
