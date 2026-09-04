import { ActiveView } from '../models/app.models';
import { STATIC_IFC } from './static-ifc';

export interface ChatSuggestion {
  readonly label: string;
  readonly query: string;
}

interface ViewCopy {
  readonly welcome: string;
  readonly placeholder: string;
  readonly suggestions: readonly ChatSuggestion[];
}

function suggestion(text: string): ChatSuggestion {
  return { label: text, query: text };
}

const COPY: Record<ActiveView, ViewCopy> = {
  bim: {
    welcome: `I am AVRA AI. This tab uses ${STATIC_IFC.fileName} as the only IFC/BIM context. Ask me about ${STATIC_IFC.fileName}.`,
    placeholder: `Ask about ${STATIC_IFC.fileName}`,
    suggestions: [
      suggestion(`What building storeys are defined in ${STATIC_IFC.fileName}?`),
      { label: `Summarise the building in ${STATIC_IFC.fileName}`, query: `Summarise the building, structure and spaces in ${STATIC_IFC.fileName}.` }
    ]
  },
  spatial: {
    welcome: 'I am AVRA AI. Ask me about the current plot, spatial constraints or available normative context.',
    placeholder: 'Escribe un mensaje',
    suggestions: [
      suggestion('¿Cuál es el máximo edificable en este terreno?'),
      suggestion('¿Qué tipología de vivienda es la más eficiente?')
    ]
  },
  catalog: {
    welcome: 'I am AVRA AI. Ask me about catalog assemblies, industrialised systems or typical solutions.',
    placeholder: 'Escribe un mensaje',
    suggestions: [
      suggestion('Which facade systems in the catalog fit this scenario?'),
      suggestion('Compare the industrialised wet cores available in the catalog.')
    ]
  },
  scenario: {
    welcome: 'I am AVRA AI. Ask me about the current design scenario, VPO criteria or normative context.',
    placeholder: 'Escribe un mensaje',
    suggestions: [
      suggestion('Explain the current VPO criteria for this scenario.'),
      suggestion('What normative limits apply to this design scenario?')
    ]
  },
  optimization: {
    welcome: 'I am AVRA AI. Ask me about the optimisation run, candidate variants or trade-offs.',
    placeholder: 'Escribe un mensaje',
    suggestions: [
      suggestion('Why is the selected variant preferred in this optimisation?'),
      suggestion('What are the main cost, energy and industrialisation trade-offs?')
    ]
  },
  solutions: {
    welcome: 'I am AVRA AI. Ask me about the current solutions, comparison or documented performance.',
    placeholder: 'Escribe un mensaje',
    suggestions: [
      suggestion('Compare the two selected solutions.'),
      suggestion('Which selected solution is closer to nZEB compliance?')
    ]
  },
  reports: {
    welcome: 'I am AVRA AI. Ask me about reports, budgets or the normative basis of the current design.',
    placeholder: 'Escribe un mensaje',
    suggestions: [
      suggestion('What should the regulatory report include for this design?'),
      suggestion('How is the budget structured for the selected solution?')
    ]
  }
};

export function welcomeForView(view: ActiveView): string {
  return COPY[view].welcome;
}

export function suggestionsForView(view: ActiveView): readonly ChatSuggestion[] {
  return COPY[view].suggestions;
}

export function placeholderForView(view: ActiveView): string {
  return COPY[view].placeholder;
}
