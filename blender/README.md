# Bilderna i spelet

Arenabilderna, startskärmens bakgrund, appikonen och pokalerna är renderade i Blender.
Skripten bygger modellerna från grunden, så det finns inga .blend-filer att hålla ordning på.

```
pip install bpy pillow            # Blender som Python-modul (kräver Python 3.11)
python arena.py ut                # sex arenor, dag och kväll (tolv bilder)
python arena.py ut --hero         # startskärmens bakgrund
python props.py ut                # appikon och pokaler
python till-webp.py ut ../flodljus-spel/img
```

Lägg till `--preview` för en snabb, grynig provbild. När bilder byts ut: höj numret i
`CACHE` i `flodljus-spel/sw.js`, annars visar installerade spel de gamla bilderna.
