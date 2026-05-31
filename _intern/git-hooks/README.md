# Git-Hooks (versioniert)

Diese Hooks liegen im Repo, werden aber von Git nur genutzt, wenn `core.hooksPath`
auf diesen Ordner zeigt. Das ist eine **lokale** Einstellung und muss nach einem
frischen `git clone` einmalig gesetzt werden:

```sh
git config core.hooksPath _intern/git-hooks
```

## pre-commit

Führt vor jedem Commit `_intern/validate-jsonld.ps1` aus und blockiert den Commit,
falls ein `<script type="application/ld+json">`-Block ungültiges JSON enthält
(typischer Fall: gerades Anführungszeichen `"` als deutsches Schlusszeichen in
einem `description`-Feld). Das verhindert die GSC-Meldung „Strukturierte Daten,
für die kein Parsen möglich ist".

Notfall-Umgehung (nur wenn bewusst gewollt):

```sh
git commit --no-verify
```
