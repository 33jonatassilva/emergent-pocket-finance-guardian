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
      // Remove all transactions associated with this bank when deleting
      const newTransacoes = state.transacoes.filter(t => t.bancoId !== action.payload);
      const newLancamentosFixos = state.lancamentosFixos.filter(l => l.bancoId !== action.payload);
      return { 
        ...state, 
        bancos: state.bancos.filter(b => b.id !== action.payload),
        transacoes: newTransacoes,
        lancamentosFixos: newLancamentosFixos
      };
    case 'ADD_CATEGORIA':
      return { ...state, categorias: [...state.categorias, action.payload] };
    case 'UPDATE_CATEGORIA':
      return { 
        ...state, 
        categorias: state.categorias.map(c => c.id === action.payload.id ? action.payload : c) 
      };
    case 'DELETE_CATEGORIA':
      // Remove all transactions associated with this category when deleting
      const newTransacoesAfterCat = state.transacoes.filter(t => t.categoriaId !== action.payload);
      const newLancamentosFixosAfterCat = state.lancamentosFixos.filter(l => l.categoriaId !== action.payload);
      return { 
        ...state, 
        categorias: state.categorias.filter(c => c.id !== action.payload),
        transacoes: newTransacoesAfterCat,
        lancamentosFixos: newLancamentosFixosAfterCat
      };
    case 'ADD_TRANSACAO':
      // Update bank balance when adding transaction
      const bancoToUpdate = state.bancos.find(b => b.id === action.payload.bancoId);
      let updatedBancos = state.bancos;
      
      if (bancoToUpdate) {
        const novoSaldo = action.payload.tipo === 'Entrada' 
          ? bancoToUpdate.saldoAtual + action.payload.valor
          : bancoToUpdate.saldoAtual - action.payload.valor;
        
        updatedBancos = state.bancos.map(b => 
          b.id === action.payload.bancoId 
            ? { ...b, saldoAtual: novoSaldo }
            : b
        );
      }
      
      return { 
        ...state, 
        transacoes: [...state.transacoes, action.payload],
        bancos: updatedBancos
      };
    case 'UPDATE_TRANSACAO':
      // Find old transaction to revert its effect, then apply new one
      const oldTransacao = state.transacoes.find(t => t.id === action.payload.id);
      let bancosAfterUpdate = [...state.bancos];
      
      if (oldTransacao) {
        // Revert old transaction effect
        const bancoAntigo = bancosAfterUpdate.find(b => b.id === oldTransacao.bancoId);
        if (bancoAntigo) {
          const saldoRevertido = oldTransacao.tipo === 'Entrada'
            ? bancoAntigo.saldoAtual - oldTransacao.valor
            : bancoAntigo.saldoAtual + oldTransacao.valor;
          
          bancosAfterUpdate = bancosAfterUpdate.map(b =>
            b.id === oldTransacao.bancoId
              ? { ...b, saldoAtual: saldoRevertido }
              : b
          );
        }
      }
      
      // Apply new transaction effect
      const bancoNovo = bancosAfterUpdate.find(b => b.id === action.payload.bancoId);
      if (bancoNovo) {
        const novoSaldoFinal = action.payload.tipo === 'Entrada'
          ? bancoNovo.saldoAtual + action.payload.valor
          : bancoNovo.saldoAtual - action.payload.valor;
        
        bancosAfterUpdate = bancosAfterUpdate.map(b =>
          b.id === action.payload.bancoId
            ? { ...b, saldoAtual: novoSaldoFinal }
            : b
        );
      }
      
      return { 
        ...state, 
        transacoes: state.transacoes.map(t => t.id === action.payload.id ? action.payload : t),
        bancos: bancosAfterUpdate
      };
    case 'DELETE_TRANSACAO':
      // Revert transaction effect on bank balance when deleting
      const transacaoToDelete = state.transacoes.find(t => t.id === action.payload);
      let bancosAfterDelete = [...state.bancos];
      
      if (transacaoToDelete) {
        const bancoAfetado = bancosAfterDelete.find(b => b.id === transacaoToDelete.bancoId);
        if (bancoAfetado) {
          const saldoRevertido = transacaoToDelete.tipo === 'Entrada'
            ? bancoAfetado.saldoAtual - transacaoToDelete.valor
            : bancoAfetado.saldoAtual + transacaoToDelete.valor;
          
          bancosAfterDelete = bancosAfterDelete.map(b =>
            b.id === transacaoToDelete.bancoId
              ? { ...b, saldoAtual: saldoRevertido }
              : b
          );
        }
      }
      
      return { 
        ...state, 
        transacoes: state.transacoes.filter(t => t.id !== action.payload),
        bancos: bancosAfterDelete
      };
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
