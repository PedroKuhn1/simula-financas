# Política de segurança

## Versões suportadas

Apenas a versão publicada mais recente (branch `main`) recebe correções.

## Como reportar uma vulnerabilidade

Não abra uma issue pública. Use o formulário privado
[**Report a vulnerability**](https://github.com/PedroKuhn1/simula-financas/security/advisories/new)
na aba _Security_ do repositório. A resposta inicial ocorre em até 7 dias.

## Controles automatizados

| Controle                          | Ferramenta                                            | Quando roda                            |
| --------------------------------- | ----------------------------------------------------- | -------------------------------------- |
| SAST (código e workflows)         | CodeQL (`security-extended`)                          | todo PR, push na `main` e semanalmente |
| Vulnerabilidades em dependências  | `npm audit` e Dependency Review                       | todo PR, push na `main` e semanalmente |
| Integridade dos pacotes           | `npm audit signatures`                                | todo PR e push na `main`               |
| Segredos no código e no histórico | Gitleaks e GitHub secret scanning com push protection | todo push                              |
| Atualização de dependências       | Dependabot (versões e alertas de segurança)           | semanalmente                           |
