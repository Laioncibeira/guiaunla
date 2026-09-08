# Cómo activar la verificación automática

`ci.yml` corre las pruebas, el cotejo de los planes contra la web y el build en cada push.
No se pudo subir a `.github/workflows/` porque el token de GitHub de esta máquina no tiene el
permiso `workflow`. Para activarla:

```bash
gh auth refresh -s workflow
mkdir -p .github/workflows && git mv tools/ci/ci.yml .github/workflows/ci.yml
git commit -m "Activa la verificacion automatica" && git push
```
