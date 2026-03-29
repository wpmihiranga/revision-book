import { Note } from './types';

export const SAMPLE_NOTES: Note[] = [
  {
    id: '1',
    title: 'Cell Structure and Function',
    subject: 'Biology',
    content: 'The cell is the basic structural, functional, and biological unit of all known organisms. Cells are the smallest units of life. \n\nKey components include:\n1. Nucleus: Contains genetic material.\n2. Mitochondria: Powerhouse of the cell, site of ATP production.\n3. Ribosomes: Protein synthesis.\n4. Cell Membrane: Controls entry and exit of substances.\n\nIn A\'Level Biology, we focus on the ultrastructure of eukaryotic and prokaryotic cells. Eukaryotic cells have membrane-bound organelles, while prokaryotic cells do not.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    voiceNotes: [],
    images: []
  },
  {
    id: '2',
    title: 'Periodic Table Trends',
    subject: 'Chemistry',
    content: 'Trends in the periodic table are patterns in the properties of chemical elements. \n\nAtomic Radius: Decreases across a period and increases down a group.\nElectronegativity: Increases across a period and decreases down a group.\nIonization Energy: Increases across a period and decreases down a group.\n\nUnderstanding these trends is crucial for predicting reactivity and bonding behavior in O\'Level Chemistry.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    voiceNotes: [],
    images: []
  },
  {
    id: '3',
    title: 'Newton\'s Laws of Motion',
    subject: 'Physics',
    content: '1. First Law: An object remains at rest or in uniform motion unless acted upon by a force.\n2. Second Law: F = ma. The acceleration of an object is directly proportional to the net force acting on it.\n3. Third Law: For every action, there is an equal and opposite reaction.\n\nThese laws form the foundation of classical mechanics and are essential for both O\'Level and A\'Level Physics students.',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
    voiceNotes: [],
    images: []
  },
  {
    id: '4',
    title: 'Calculus: Differentiation',
    subject: 'Combined Maths',
    content: 'Differentiation is the process of finding the derivative, or rate of change, of a function. \n\nPower Rule: d/dx(x^n) = nx^(n-1)\nProduct Rule: d/dx(uv) = u(dv/dx) + v(du/dx)\nQuotient Rule: d/dx(u/v) = (v(du/dx) - u(dv/dx)) / v^2\n\nCalculus is a major part of the A\'Level Combined Maths syllabus.',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    voiceNotes: [],
    images: []
  },
  {
    id: '5',
    title: 'The Industrial Revolution',
    subject: 'History',
    content: 'The Industrial Revolution was the transition to new manufacturing processes in Europe and the United States, in the period from about 1760 to sometime between 1820 and 1840. \n\nKey impacts:\n- Urbanization\- Rise of the middle class\n- Technological advancements like the steam engine\n- Changes in labor conditions',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 15,
    voiceNotes: [],
    images: []
  },
  {
    id: '6',
    title: 'Double Entry Bookkeeping',
    subject: 'Accounting',
    content: 'Double-entry bookkeeping is a system of recording transactions where every entry to an account requires a corresponding and opposite entry to a different account. \n\nAssets = Liabilities + Equity\n\nDebits (DR) increase assets and expenses.\nCredits (CR) increase liabilities, equity, and revenue.',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 20,
    voiceNotes: [],
    images: []
  }
];
