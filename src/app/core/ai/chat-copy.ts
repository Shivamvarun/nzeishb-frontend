import { ActiveView } from '../models/app.models';
import { STATIC_IFC } from './static-ifc';

export interface ChatSuggestion {
  readonly label: string;
  readonly query: string;
}

export function welcomeForView(view: ActiveView): string {
  if (view === 'bim') {
    return `I am AVRA AI. This tab uses ${STATIC_IFC.fileName} as the only IFC/BIM context. Ask me about ${STATIC_IFC.fileName}.`;
  }
  const byView: Record<Exclude<ActiveView, 'bim'>, string> = {
    spatial: 'I am AVRA AI. Ask me about the current plot, spatial constraints or available normative context.',
    catalog: 'I am AVRA AI. Ask me about catalog assemblies, industrialised systems or typical solutions.',
    scenario: 'I am AVRA AI. Ask me about the current design scenario, VPO criteria or normative context.',
    optimization: 'I am AVRA AI. Ask me about the optimisation run, candidate variants or trade-offs.',
    solutions: 'I am AVRA AI. Ask me about the current solutions, comparison or documented performance.',
    reports: 'I am AVRA AI. Ask me about reports, budgets or the normative basis of the current design.'
  };
  return byView[view];
}

export function suggestionsForView(view: ActiveView): readonly ChatSuggestion[] {
  if (view === 'bim') {
    return [
      { label: `What storeys are defined in ${STATIC_IFC.fileName}?`, query: `What building storeys are defined in ${STATIC_IFC.fileName}?` },
      { label: `Summarise the building in ${STATIC_IFC.fileName}`, query: `Summarise the building, structure and spaces in ${STATIC_IFC.fileName}.` }
    ];
  }
  const byView: Record<Exclude<ActiveView, 'bim'>, readonly ChatSuggestion[]> = {
    spatial: [
      { label: '¿Cuál es el máximo edificable en este terreno?', query: '¿Cuál es el máximo edificable en este terreno?' },
      { label: '¿Qué tipología de vivienda es la más eficiente?', query: '¿Qué tipología de vivienda es la más eficiente?' }
    ],
    catalog: [
      { label: 'Which facade systems fit this scenario?', query: 'Which facade systems in the catalog fit this scenario?' },
      { label: 'Compare industrialised wet cores', query: 'Compare the industrialised wet cores available in the catalog.' }
    ],
    scenario: [
      { label: 'Explain the current VPO criteria', query: 'Explain the current VPO criteria for this scenario.' },
      { label: 'What normative limits apply here?', query: 'What normative limits apply to this design scenario?' }
    ],
    optimization: [
      { label: 'Why is this variant preferred?', query: 'Why is the selected variant preferred in this optimisation?' },
      { label: 'What are the main trade-offs?', query: 'What are the main cost, energy and industrialisation trade-offs?' }
    ],
    solutions: [
      { label: 'Compare the two selected solutions', query: 'Compare the two selected solutions.' },
      { label: 'Which solution is closer to nZEB?', query: 'Which selected solution is closer to nZEB compliance?' }
    ],
    reports: [
      { label: 'What should the regulatory report include?', query: 'What should the regulatory report include for this design?' },
      { label: 'How is the budget structured?', query: 'How is the budget structured for the selected solution?' }
    ]
  };
  return byView[view];
}

export function placeholderForView(view: ActiveView): string {
  return view === 'bim' ? `Ask about ${STATIC_IFC.fileName}` : 'Escribe un mensaje';
}
