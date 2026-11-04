#!/usr/bin/env bash
# Verifica se a aplicação publicada está disponível e funcional.
#
# Uso: scripts/smoke-test.sh <url> [commit-esperado]
#
# Checagens:
#   1. a página responde HTTP 200;
#   2. o HTML contém o título e o elemento raiz da SPA;
#   3. o bundle JavaScript referenciado no HTML também responde 200
#      (pega erros de caminho base, que deixariam a página em branco);
#   4. /version.json existe e, se informado, aponta para o commit esperado.
#
# Tenta novamente (RETRIES vezes, a cada DELAY segundos) antes de declarar falha,
# para tolerar a propagação do deploy e instabilidades momentâneas.
set -euo pipefail

URL="${1:?informe a URL da aplicação}"
URL="${URL%/}/"
EXPECTED_COMMIT="${2:-}"
RETRIES="${RETRIES:-5}"
DELAY="${DELAY:-15}"
EXPECTED_TITLE='<title>SimulaFinanças</title>'

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

fail() {
  echo "::error::$1"
  return 1
}

# Imprime o código HTTP e grava o corpo no arquivo informado.
fetch() {
  curl --silent --show-error --location --max-time 20 \
    --output "$2" --write-out '%{http_code}' "$1" || echo 000
}

check_once() {
  local status asset_path asset_status

  status="$(fetch "$URL" "$WORKDIR/index.html")"
  [[ "$status" == 200 ]] || fail "página respondeu HTTP $status" || return 1
  grep -qF "$EXPECTED_TITLE" "$WORKDIR/index.html" || fail 'título esperado não encontrado no HTML' || return 1
  grep -qF '<div id="root">' "$WORKDIR/index.html" || fail 'elemento raiz da SPA não encontrado' || return 1

  asset_path="$(grep -oE 'src="[^"]+\.js"' "$WORKDIR/index.html" | head -n1 | sed -E 's/^src="(.*)"$/\1/')"
  [[ -n "$asset_path" ]] || fail 'nenhum bundle JavaScript referenciado no HTML' || return 1
  asset_status="$(fetch "$(origin_of "$URL")$asset_path" /dev/null)"
  [[ "$asset_status" == 200 ]] || fail "bundle $asset_path respondeu HTTP $asset_status" || return 1

  status="$(fetch "${URL}version.json" "$WORKDIR/version.json")"
  [[ "$status" == 200 ]] || fail "version.json respondeu HTTP $status" || return 1
  if [[ -n "$EXPECTED_COMMIT" ]]; then
    grep -qF "\"commit\": \"$EXPECTED_COMMIT\"" "$WORKDIR/version.json" ||
      fail "versão no ar não é a do commit $EXPECTED_COMMIT" || return 1
  fi
}

# https://exemplo.com/caminho/ -> https://exemplo.com
origin_of() {
  echo "$1" | sed -E 's#^(https?://[^/]+).*#\1#'
}

for attempt in $(seq 1 "$RETRIES"); do
  echo "Tentativa $attempt/$RETRIES: $URL"
  if check_once; then
    echo "OK: aplicação disponível"
    cat "$WORKDIR/version.json"
    exit 0
  fi
  [[ "$attempt" -lt "$RETRIES" ]] && sleep "$DELAY"
done

echo "FALHA: aplicação indisponível após $RETRIES tentativas"
exit 1
