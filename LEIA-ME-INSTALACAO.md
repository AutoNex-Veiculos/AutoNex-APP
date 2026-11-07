# AutoNex-APP: como aplicar este pacote

1. Extraia o zip e copie o conteúdo da pasta `AutoNex-APP` por cima do seu projeto, sobrescrevendo.
   O zip não traz `.env`, `package-lock.json`, `assets/`, `node_modules/` nem `.git/`: os seus continuam como estão.
2. Se ainda não tem `.env`, copie `.env.example` para `.env`.
3. Na raiz do projeto:

```bash
npm install
npx expo start -c
```

   O `npm install` adiciona as duas fontes novas, tira o Zustand (não é mais usado) e atualiza o `package-lock.json`.
4. Com o servidor rodando, em outro terminal, confira os tipos: `npx tsc --noEmit`.
5. Para parar de versionar o `.env` (o `.gitignore` novo já o ignora): `git rm --cached .env`.

Entre pelos botões de acesso rápido da tela de login para ver cada perfil.
Antes de publicar, apague `components/ui/DevQuickLogin.tsx` e `constants/devProfiles.ts` e tire o `<DevQuickLogin />` de `app/(auth)/login.tsx`.
