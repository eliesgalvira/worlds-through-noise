# Captura una lección con el banco del hill-climb y deja al lado, para el
# autor, una tira por figura (sus fotogramas en fila) y, con --antes, los
# cortes nuevos y las palabras que desaparecieron del texto visible.
#
#   nu scripts/hill-climb-captura.nu /detection <salida> [--anchos 1440,900,390] [--figuras D3,D2] [--antes <captura anterior>]
#
# Sale con error si el banco vio una petición de red, un error de consola o
# un control que no llegó a su valor (ver <salida>/fallos.txt).

def main [
  ruta: string # la ruta de la lección, por ejemplo /detection
  salida: path # carpeta nueva para esta captura
  --anchos: string = "1440,900,390"
  --figuras: string = ""
  --antes: path # una captura anterior con la que comparar
  --verificar # captura otra vez en <salida>-bis y falla si una imagen cambia
] {
  let raiz = $env.FILE_PWD | path dirname
  mkdir $salida
  let log = $salida | path join captura.log
  let r = (do { ^node ($raiz | path join scripts/hill-climb/captura.ts) --ruta $ruta --salida $salida --anchos $anchos --figuras $figuras } | complete)
  $"($r.stdout)($r.stderr)" | save --force $log
  let hojas = $salida | path join hojas
  mkdir $hojas
  let tiras = glob ($salida | path join "interaccion-*-1.png") | each {|primero|
    let base = $primero | path basename | str replace --regex '-1\.png$' ''
    let fotogramas = glob ($salida | path join $"($base)-*.png") | sort-by {|f| $f | path basename | parse --regex '-(?<n>\d+)\.png$' | get 0.n | into int }
    let tira = $hojas | path join $"($base)-tira.png"
    ^montage ...$fotogramas -tile $"($fotogramas | length)x1" -geometry +8+8 -background "#d8cdbb" $tira
    $tira
  }
  let cambios = if $antes == null { [] } else {
    glob ($salida | path join "cortes-*.txt") | each {|nuevo|
      let viejo = $antes | path join ($nuevo | path basename)
      let previos = if ($viejo | path exists) { open --raw $viejo | lines } else { [] }
      open --raw $nuevo | lines | where {|l| $l != "" and $l not-in $previos } | each {|l| {archivo: ($nuevo | path basename), nuevo: $l} }
    } | flatten
  }
  # Palabras de cuatro letras o más que estaban en una sección y ya no están:
  # una hora, un rótulo o una lectura que desaparece entera no sale en cortes.
  let perdidos = if $antes == null { [] } else {
    glob ($salida | path join "textos-*.tsv") | each {|nuevo|
      let viejo = $antes | path join ($nuevo | path basename)
      if not ($viejo | path exists) { [] } else {
        let filas = {|archivo| open --raw $archivo | lines | each {|l| $l | split row "\t" } | where {|c| ($c | length) > 1 } | each {|c| {seccion: $c.0, palabras: ($c.1 | split row " " | where {|w| ($w | str length) >= 4 } | uniq)} } }
        let ahora = do $filas $nuevo
        do $filas $viejo | each {|antes_s|
          let actual = $ahora | where seccion == $antes_s.seccion
          let quedan = if ($actual | is-empty) { [] } else { $actual | first | get palabras }
          let faltan = $antes_s.palabras | where {|w| $w not-in $quedan }
          if ($faltan | is-empty) { null } else { {archivo: ($nuevo | path basename), seccion: $antes_s.seccion, faltan: ($faltan | first 30 | str join " ")} }
        } | compact
      }
    } | flatten
  }
  $cambios | to tsv | save --force ($salida | path join cortes-nuevos.tsv)
  $perdidos | to tsv | save --force ($salida | path join palabras-perdidas.tsv)
  if $r.exit_code != 0 {
    let fallos = $salida | path join fallos.txt
    let causa = if ($fallos | path exists) { open --raw $fallos } else { $"se cayó antes de terminar, mira ($log)" }
    error make {msg: $"El banco falló: ($causa)"}
  }
  let distintas = if not $verificar { [] } else {
    let bis = $"($salida)-bis"
    let r2 = (do { ^node ($raiz | path join scripts/hill-climb/captura.ts) --ruta $ruta --salida $bis --anchos $anchos --figuras $figuras } | complete)
    if $r2.exit_code != 0 { error make {msg: $"La segunda captura falló: ($r2.stderr)"} }
    glob ($salida | path join "*.png") | where {|f|
      let otra = $bis | path join ($f | path basename)
      not ($otra | path exists) or ((open --raw $f | hash sha256) != (open --raw $otra | hash sha256))
    } | each {|f| $f | path basename }
  }
  if not ($distintas | is-empty) {
    error make {msg: $"Dos capturas seguidas no coinciden: ($distintas | str join ', ')"}
  }
  {salida: $salida, tiras: ($tiras | length), cortes_nuevos: ($cambios | length), secciones_con_perdidas: ($perdidos | length)}
}
