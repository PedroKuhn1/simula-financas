import { Link } from 'react-router-dom';
import { AdSlot } from '../components/AdSlot';

const tools = [
  {
    to: '/juros-compostos',
    title: 'Juros compostos',
    text: 'Descubra quanto seu dinheiro rende com aportes mensais ao longo do tempo.',
  },
  {
    to: '/financiamento',
    title: 'Financiamento SAC e Price',
    text: 'Compare parcelas, juros totais e a evolução do saldo devedor nos dois sistemas.',
  },
  {
    to: '/reserva-de-emergencia',
    title: 'Reserva de emergência',
    text: 'Calcule quanto guardar de acordo com seu tipo de renda e em quanto tempo chega lá.',
  },
];

export function Home() {
  return (
    <>
      <section className="hero">
        <h1>Decisões financeiras com números na mão</h1>
        <p>Simuladores gratuitos, sem cadastro. Tudo é calculado no seu navegador: nenhum dado sai do seu computador.</p>
      </section>
      <section className="tools" aria-label="Simuladores disponíveis">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="tool-card">
            <h2>{tool.title}</h2>
            <p>{tool.text}</p>
            <span className="tool-cta">Simular →</span>
          </Link>
        ))}
        <AdSlot format="sidebar" />
      </section>
    </>
  );
}
