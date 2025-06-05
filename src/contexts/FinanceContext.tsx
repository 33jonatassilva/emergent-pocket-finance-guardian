import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Banco, Categoria, Transacao, LancamentoFixo, ConfiguracaoApp } from '@/types/entities';

interface FinanceState {
  bancos: Banco[];
  categorias: Categoria[];
  transacoes: Transacao[];
  lancamentosFixos: LancamentoFixo[];
  configuracoes: ConfiguracaoApp;
}

type FinanceAction = 
  | { type: 'ADD_BANCO'; payload: Banco }
  | { type: 'UPDATE_BANCO'; payload: Banco }
  | { type: 'DELETE_BANCO'; payload: string }
  | { type: 'ADD_CATEGORIA'; payload: Categoria }
  | { type: 'UPDATE_CATEGORIA'; payload: Categoria }
  | { type: 'DELETE_CATEGORIA'; payload: string }
  | { type: 'ADD_TRANSACAO'; payload: Transacao }
  | { type: 'UPDATE_TRANSACAO'; payload: Transacao }
  | { type: 'DELETE_TRANSACAO'; payload: string }
  | { type: 'ADD_LANCAMENTO_FIXO'; payload: LancamentoFixo }
  | { type: 'UPDATE_LANCAMENTO_FIXO'; payload: LancamentoFixo }
  | { type: 'DELETE_LANCAMENTO_FIXO'; payload: string }
  | { type: 'UPDATE_CONFIGURACOES'; payload: ConfiguracaoApp }
  | { type: 'LOAD_DATA'; payload: FinanceState };

const initialState: FinanceState = {
  bancos: [],
  categorias: [
    { id: '1', nome: 'Alimentação', tipo: 'Saída', cor: '#f87171' },
    { id: '2', nome: 'Transporte', tipo: 'Saída', cor: '#fb923c' },
    { id: '3', nome: 'Lazer', tipo: 'Saída', cor: '#a78bfa' },
    { id: '4', nome: 'Salário', tipo: 'Entrada', cor: '#4ade80' },
    { id: '5', nome: 'Freelance', tipo: 'Entrada', cor: '#38bdf8' }
  ],
  transacoes: [],
  lancamentosFixos: [],
  configuracoes: {
    moeda: 'BRL',
    temaEscuro: false,
    idioma: 'pt-BR',
    primeiroAcesso: true
  }
};

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'ADD_BANCO':
      return { ...state, bancos: [...state.bancos, action.payload] };
    case 'UPDATE_BANCO':
      return { 
        ...state, 
        bancos: state.bancos.map(b => b.id === action.payload.id ? action.payload : b) 
      };
    case 'DELETE_BANCO':
      return { ...state, bancos: state.bancos.filter(b => b.id !== action.payload) };
    case 'ADD_CATEGORIA':
      return { ...state, categorias: [...state.categorias, action.payload] };
    case 'UPDATE_CATEGORIA':
      return { 
        ...state, 
        categorias: state.categorias.map(c => c.id === action.payload.id ? action.payload : c) 
      };
    case 'DELETE_CATEGORIA':
      return { ...state, categorias: state.categorias.filter(c => c.id !== action.payload) };
    case 'ADD_TRANSACAO':
      return { ...state, transacoes: [...state.transacoes, action.payload] };
    case 'UPDATE_TRANSACAO':
      return { 
        ...state, 
        transacoes: state.transacoes.map(t => t.id === action.payload.id ? action.payload : t) 
      };
    case 'DELETE_TRANSACAO':
      return { ...state, transacoes: state.transacoes.filter(t => t.id !== action.payload) };
    case 'ADD_LANCAMENTO_FIXO':
      return { ...state, lancamentosFixos: [...state.lancamentosFixos, action.payload] };
    case 'UPDATE_LANCAMENTO_FIXO':
      return { 
        ...state, 
        lancamentosFixos: state.lancamentosFixos.map(l => l.id === action.payload.id ? action.payload : l) 
      };
    case 'DELETE_LANCAMENTO_FIXO':
      return { ...state, lancamentosFixos: state.lancamentosFixos.filter(l => l.id !== action.payload) };
    case 'UPDATE_CONFIGURACOES':
      return { ...state, configuracoes: action.payload };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

const FinanceContext = createContext<{
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
} | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('financeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('financeData', JSON.stringify(state));
  }, [state]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider');
  }
  return context;
}
