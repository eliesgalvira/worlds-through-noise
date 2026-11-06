# Captura una lección con el banco del hill-climb y deja al lado, para el
# autor, una tira por figura (sus fotogramas en fila) y, con --antes, lo que
# apareció nuevo en los cortes y lo que desapareció del texto visible.
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
    ^magick montage ...$fotogramas -tile $"($fotogramas | length)x1" -geometry +8+8 -background "#d8cdbb" $tira
    $tira
  }
  let cambios = if $antes == null { [] } else {
    glob ($salida | path join "cortes-*.txt") | each {|nuevo|
      let viejo = $antes | path join ($nuevo | path basename)
      let previos = if ($viejo | path exists) { open --raw $viejo | lines } else { [] }
      open --raw $nuevo | lines | where {|l| $l != "" and $l not-in $previos } | each {|l| {archivo: ($nuevo | path basename), nuevo: $l} }
    } | flatten
  }
  let perdidos = if $antes == null { [] } else {
    glob ($salida | path join "textos-*.tsv") | each {|nuevo|
      let viejo = $antes | path join ($nuevo | path basename)
      if not ($viejo | path exists) { [] } else {
        let ahora = open --raw $nuevo | lines | each {|l| $l | split row "\t" } | where {|c| ($c | length) > 1 } | each {|c| {seccion: $c.0, texto: $c.1} }
        open --raw $viejo | lines | each {|l| $l | split row "\t" } | where {|c| ($c | length) > 1 } | each {|c|
          let actual = $ahora | where seccion == $c.0
          if ($actual | is-empty) { {archivo: ($nuevo | path basename), seccion: $c.0, falta: "la sección entera"} } else { null }
        } | compact
      }
    } | flatten
  }
  $cambios | to tsv | save --force ($salida | path join cortes-nuevos.tsv)
  $perdidos | to tsv | save --force ($salida | path join secciones-perdidas.tsv)
  if $r.exit_code != 0 {
    error make {msg: $"El banco falló: (open --raw ($salida | path join fallos.txt))"}
  }
  {salida: $salida, tiras: ($tiras | length), cortes_nuevos: ($cambios | length), secciones_perdidas: ($perdidos | length)}
}
