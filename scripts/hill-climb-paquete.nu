# Prepara la carpeta de un revisor del hill-climb: `mktemp -d` en /tmp, fuera
# de cualquier repo, con la rúbrica, las capturas elegidas con nombres neutros,
# las referencias `producto-*` y su brief. Nada se comparte entre revisores ni
# entre rondas, y ningún nombre dice la ronda ni el producto.
#
#   nu scripts/hill-climb-paquete.nu <capturas> <rubrica.md> <referencias> <plantilla-brief.md> <reglas.md> --secciones cabecera,vista,d3,d2,cuaderno --figuras d3,d2
#
# Devuelve {dir, hoja}: la carpeta y una hoja de contacto de lo que recibe el
# revisor, que queda en <capturas>/hojas, nunca en la carpeta del revisor.

const PERMITIDO = '^(?:rubrica\.md|brief\.md|leccion-(?:1440|900|390)-(?:inicial|extremo|resuelto)-[a-z0-9]+-\d+\.png|interaccion-[a-z0-9]+-(?:1440|900|390)-\d+\.png|interaccion-[a-z0-9]+\.txt|producto-[a-z]\.png)$'

def lista [texto: string] { $texto | split row "," | compact --empty }

def main [
  capturas: path # la salida de hill-climb-captura.nu
  rubrica: path # la rúbrica de la pantalla, igual en todas sus rondas
  referencias: path # solo producto-a.png…, con el logotipo tapado
  plantilla: path # el brief, con <dir>, <n> y <m> por rellenar
  reglas: path # las reglas de sesión de los revisores, que van enteras
  --anchos: string = "1440,900,390"
  --estados: string = "inicial,extremo,resuelto"
  --secciones: string = "" # secciones de leccion-*, separadas por comas; vacío: todas
  --figuras: string = "" # interacciones; vacío: todas
  --estados-por-seccion: string = "" # p. ej. "cuaderno=inicial+resuelto,vista=inicial"
] {
  let anchos = lista $anchos
  let estados = lista $estados
  let secciones = lista $secciones
  let figuras = lista $figuras
  let por_seccion = lista $estados_por_seccion | each {|par|
    let p = $par | split row "="
    {seccion: $p.0, estados: ($p.1 | split row "+")}
  }
  let refs = ls --all $referencias | get name
  let ajenas = $refs | path basename | where {|f| $f !~ '^producto-[a-z]\.png$' }
  if ($refs | is-empty) or not ($ajenas | is-empty) {
    error make {msg: $"($referencias) debe tener solo producto-a.png…: sobra ($ajenas)"}
  }
  let dir = (mktemp --directory)
  if (do { ^git -C $dir rev-parse --git-dir } | complete).exit_code == 0 {
    error make {msg: $"($dir) está dentro de un repositorio git"}
  }
  let todas = ls $capturas | get name | path basename
  let lecciones = $todas | where {|f|
    let m = $f | parse --regex '^leccion-(?<ancho>\d+)-(?<estado>[a-z]+)-(?<seccion>[a-z0-9]+)-\d+\.png$'
    if ($m | is-empty) { false } else {
      let c = $m | first
      let propios = $por_seccion | where seccion == $c.seccion
      let estados = if ($propios | is-empty) { $estados } else { $propios | first | get estados }
      ($c.ancho in $anchos) and ($c.estado in $estados) and (($secciones | is-empty) or ($c.seccion in $secciones))
    }
  }
  let interacciones = $todas | where {|f|
    let m = $f | parse --regex '^interaccion-(?<figura>[a-z0-9]+)(?:-(?<ancho>\d+)-\d+\.png|\.txt)$'
    if ($m | is-empty) { false } else {
      let c = $m | first
      (($figuras | is-empty) or ($c.figura in $figuras)) and ((($c.ancho | default "") == "") or $c.ancho in $anchos)
    }
  }
  let elegidas = $lecciones | append $interacciones
  for f in $elegidas { cp ($capturas | path join $f) ($dir | path join $f) }
  for ref in $refs { cp $ref ($dir | path join ($ref | path basename)) }
  # Lo que va antes de la primera línea «---» es para el autor (cuándo se fijó,
  # cómo se usa) y diría al revisor que hay rondas.
  let partes = open --raw $rubrica | split row "\n---\n"
  if ($partes | length) < 2 { error make {msg: $"($rubrica) no tiene la línea --- que separa la cabecera del autor"} }
  $partes | skip 1 | str join "\n---\n" | str trim | save ($dir | path join rubrica.md)
  let n = $elegidas | where {|f| $f ends-with ".png" } | length
  open --raw $plantilla
  | str replace --all "<dir>" $dir
  | str replace --all "<n>" ($n | into string)
  | str replace --all "<m>" ($refs | length | into string)
  | str replace --all "<reglas>" (open --raw $reglas | str trim)
  | save ($dir | path join brief.md)
  let ajenos = ls --all $dir | get name | path basename | where {|f| $f !~ $PERMITIDO }
  if not ($ajenos | is-empty) { error make {msg: $"Archivos no permitidos en ($dir): ($ajenos)"} }
  let hojas = $capturas | path join hojas
  mkdir $hojas
  let hoja = $hojas | path join $"paquete-($dir | path basename).png"
  let pngs = glob ($dir | path join "*.png") | sort
  ^montage ...$pngs -tile 8x -geometry 300x300+4+4 -background "#ffffff" $hoja
  let resultado = {dir: $dir, hoja: $hoja, imagenes: $n, referencias: ($refs | length)}
  $resultado | to json | save --force ($capturas | path join $"paquete-($dir | path basename).json")
  $resultado
}
