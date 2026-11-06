# Audita la sesión de un revisor del hill-climb: la busca por su carpeta entre
# las sesiones de Claude del proyecto de revisores y comprueba que no le llegó
# nada del repositorio (rama, commits, rutas, documentos del proyecto) y que la
# memoria de ese proyecto está vacía.
#
#   nu scripts/hill-climb-auditoria.nu <carpeta-del-revisor> [--proyecto <raíz>] [--repo <checkout>]
#
# Falla si la sesión no aparece o si contiene algo de la lista.

const DELATORES = [
  "worlds-through-noise"
  "Worlds Through Noise"
  "ux/hill-climb"
  "Recent commits:"
  "docs/hill-climb"
  "wtn-hill-climb"
  "PRODUCT.md"
  "DESIGN.md"
  "EXAMPLES.md"
]

def main [
  dir: path
  --proyecto: path = "~/.cache/ui-hill-climb-revisores"
  --repo: path = "~/Repos/worlds-through-noise"
] {
  let slug = $proyecto | path expand | str replace --all --regex '[/.]' '-'
  let sesiones_claude = $env.HOME | path join .claude/projects $slug
  let memoria = $sesiones_claude | path join memory
  let recuerdos = if ($memoria | path exists) { ls --all $memoria | get name } else { [] }
  if not ($recuerdos | is-empty) {
    error make {msg: $"La memoria del proyecto de revisores no está vacía: ($recuerdos)"}
  }
  let sesiones = (^rg --files-with-matches --fixed-strings --glob "*.jsonl" $dir $sesiones_claude | lines)
  if ($sesiones | is-empty) { error make {msg: $"Ninguna sesión menciona ($dir)"} }
  # Los asuntos de los últimos commits: un revisor que los ve sabe la ronda.
  let commits = (^git -C ($repo | path expand) log --all --format=%s -n 60 | lines | where {|s| ($s | str length) > 24 })
  let delatores = $DELATORES | append $commits
  let filas = $sesiones | each {|sesion|
    let texto = open --raw $sesion
    # «hill-climb» suelto delata; «ui-hill-climb», el nombre de la skill que
    # todo agente ve en su lista, no.
    let sueltos = $texto | str replace --all "ui-hill-climb" "" | str contains "hill-climb"
    {
      sesion: $sesion
      delatores: ($delatores | where {|d| $texto | str contains $d } | append (if $sueltos { ["hill-climb"] } else { [] }))
    }
  }
  $filas | save --force ($dir | path join auditoria.json)
  let sucias = $filas | where {|f| not ($f.delatores | is-empty) }
  if not ($sucias | is-empty) { error make {msg: $"Revisión contaminada: ($sucias | to nuon)"} }
  $filas
}
