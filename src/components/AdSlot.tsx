interface AdSlotProps {
  format: 'banner' | 'sidebar';
}

// Espaço reservado para anúncios ou conteúdo patrocinado (monetização prevista,
// não implementada). Nenhum script de terceiros é carregado.
export function AdSlot({ format }: AdSlotProps) {
  return (
    <aside className={`ad-slot ad-${format}`} aria-label="Espaço publicitário" data-testid="ad-slot">
      <span>Publicidade</span>
      <small>Anuncie aqui</small>
    </aside>
  );
}
