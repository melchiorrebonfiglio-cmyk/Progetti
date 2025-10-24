import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { RiferimentoSede } from '../types';

interface AddProjectFormProps {
  onAddProject: (crq: string, ragioneSociale: string, via: string, citta: string, riepilogo: string, riferimentoSede: RiferimentoSede) => void;
}

/**
 * Extracts project details from a raw text string using regular expressions.
 * This local function replaces the remote Gemini API call.
 * @param text The text to parse.
 * @returns An object with the extracted project details.
 */
const extractProjectDetailsFromText = (text: string) => {
  const extract = (keywords: string[], customRegex?: RegExp) => {
    if (customRegex) {
        const match = text.match(customRegex);
        if (match && match[1]) return match[1].trim();
    }
    
    for (const line of text.split('\n')) {
        for (const keyword of keywords) {
            // Regex to match keyword at the beginning of a line, followed by ':' and the value
            const regex = new RegExp(`^\\s*${keyword.replace('.', '\\.')}[\\s:]*(.+)$`, 'i');
            const match = line.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
    }
    return '';
  };

  const crq = extract(['CRQ', 'Rif.', 'Riferimento'], /(?:CRQ|Rif\.|Riferimento)[\s:.-]*([A-Z0-9\-/]+)/i);
  const ragioneSociale = extract(['Ragione Sociale', 'Cliente', 'Società', 'Ditta']);
  const riepilogo = extract(['Oggetto', 'Riepilogo', 'Descrizione']);
  let via = extract(['Via']);
  let citta = extract(['Città', "Citta'"]);
  const referente = extract(['Referente', 'Contatto', 'Att.ne', 'Attn']);
  const tel = extract(['Tel', 'Telefono', 'Cellulare', 'Cell'], /(?:Tel|Telefono|Cell)[\s:]*([0-9\s/+-]{8,})/i);

  // Address logic if not found with simple keywords
  if (!via && !citta) {
      const indirizzo = extract(['Indirizzo', 'Sede']);
      if(indirizzo) {
          const parts = indirizzo.split(/,\s*(?=\d{5})/); // Split before a 5-digit ZIP code
          if (parts.length > 1) {
              via = parts[0].trim();
              citta = parts.slice(1).join(', ').trim();
          } else {
              via = indirizzo;
          }
      }
  }

  return {
      crq,
      ragioneSociale,
      riepilogo,
      via,
      citta,
      referente,
      tel,
  };
};


const AddProjectForm: React.FC<AddProjectFormProps> = ({ onAddProject }) => {
  const [inputText, setInputText] = useState('');
  const [crq, setCrq] = useState('');
  const [ragioneSociale, setRagioneSociale] = useState('');
  const [via, setVia] = useState('');
  const [citta, setCitta] = useState('');
  const [riepilogo, setRiepilogo] = useState('');
  const [referente, setReferente] = useState('');
  const [tel, setTel] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = () => {
    if (!inputText.trim()) return;

    setIsExtracting(true);
    setError(null);
    setCrq('');
    setRagioneSociale('');
    setVia('');
    setCitta('');
    setRiepilogo('');
    setReferente('');
    setTel('');

    // Use a short timeout to provide visual feedback that extraction is happening
    setTimeout(() => {
        try {
            const result = extractProjectDetailsFromText(inputText);
            const { crq: extractedCrq, ragioneSociale: extractedRagioneSociale, via: extractedVia, citta: extractedCitta, riepilogo: extractedRiepilogo, referente: extractedReferente, tel: extractedTel } = result;

            if (extractedCrq && extractedRagioneSociale) {
                onAddProject(extractedCrq, extractedRagioneSociale, extractedVia, extractedCitta, extractedRiepilogo, { referente: extractedReferente, tel: extractedTel });
                
                setInputText('');
                setCrq('');
                setRagioneSociale('');
                setVia('');
                setCitta('');
                setRiepilogo('');
                setReferente('');
                setTel('');
                setError(null);
            } else {
                setCrq(extractedCrq);
                setRagioneSociale(extractedRagioneSociale);
                setRiepilogo(extractedRiepilogo);
                setVia(extractedVia);
                setCitta(extractedCitta);
                setReferente(extractedReferente);
                setTel(extractedTel);
                setError("Estrazione parziale. Completa i campi mancanti e aggiungi il progetto manually.");
            }
        } catch (err) {
            console.error('Extraction failed:', err);
            setError('Estrazione fallita. Assicurati che il testo contenga le informazioni necessarie e riprova.');
        } finally {
            setIsExtracting(false);
        }
    }, 300); // 300ms delay for UX
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crq.trim() || !ragioneSociale.trim()) return;
    onAddProject(crq, ragioneSociale, via, citta, riepilogo, { referente, tel });
    setCrq('');
    setRagioneSociale('');
    setVia('');
    setCitta('');
    setRiepilogo('');
    setReferente('');
    setTel('');
    setInputText('');
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Aggiungi Nuovo Progetto da Testo</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="text-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Incolla il testo da analizzare
          </label>
          <textarea
            id="text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Incolla qui il testo contenente CRQ, Ragione Sociale, Riepilogo, Indirizzo e contatti del referente..."
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition h-28"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={handleExtract}
            disabled={isExtracting || !inputText.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition duration-200 ease-in-out shadow-sm disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="h-5 w-5" />
            <span>{isExtracting ? 'Estrazione in corso...' : 'Estrai e Aggiungi alla Lista'}</span>
          </button>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="crq-output" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Numero CRQ</label>
                    <input
                        id="crq-output"
                        type="text"
                        value={crq}
                        onChange={(e) => setCrq(e.target.value)}
                        placeholder="CRQ estratto..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                <div>
                    <label htmlFor="ragione-sociale-output" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ragione Sociale</label>
                    <input
                        id="ragione-sociale-output"
                        type="text"
                        value={ragioneSociale}
                        onChange={(e) => setRagioneSociale(e.target.value)}
                        placeholder="Ragione Sociale estratta..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="riepilogo-output" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Riepilogo</label>
                 <textarea
                    id="riepilogo-output"
                    value={riepilogo}
                    onChange={(e) => setRiepilogo(e.target.value)}
                    placeholder="Riepilogo estratto..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label htmlFor="via-output" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Via</label>
                    <input
                        id="via-output"
                        type="text"
                        value={via}
                        onChange={(e) => setVia(e.target.value)}
                        placeholder="Via estratta..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                 <div>
                    <label htmlFor="citta-output" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Città</label>
                    <input
                        id="citta-output"
                        type="text"
                        value={citta}
                        onChange={(e) => setCitta(e.target.value)}
                        placeholder="Città estratta..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                <div>
                    <label htmlFor="referente-output" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Referente</label>
                    <input
                        id="referente-output"
                        type="text"
                        value={referente}
                        onChange={(e) => setReferente(e.target.value)}
                        placeholder="Referente estratto (opzionale)..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                 <div>
                    <label htmlFor="tel-output" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefono Referente</label>
                    <input
                        id="tel-output"
                        type="tel"
                        value={tel}
                        onChange={(e) => setTel(e.target.value)}
                        placeholder="Telefono estratto (opzionale)..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <button
                type="submit"
                disabled={!crq.trim() || !ragioneSociale.trim() || isExtracting}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition duration-200 ease-in-out shadow-sm disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
              >
                Aggiungi Progetto Manualmente
              </button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Aggiungi un progetto manulamente compilando i campi sopra
              </span>
            </div>
        </div>
      </form>
    </div>
  );
};

export default AddProjectForm;