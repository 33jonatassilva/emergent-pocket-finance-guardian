export interface Banco {
  id: string;
  nome: string;
  agencia: string;
  numeroConta: string;
  tipoConta: 'Corrente' | 'Poupança' | 'Digital';
  saldoAtual: number;
  cor: string;
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'Entrada' | 'Saída';
  cor: string;
}

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: 'Entrada' | 'Saída';
  categoriaId: string;
  bancoId: string;
  fixa: boolean;
  repeticaoMensal: boolean;
}

export interface LancamentoFixo {
  id: string;
  descricao: string;
  valor: number;
  diaVencimento: number;
  tipo: 'Entrada' | 'Saída';
  categoriaId: string;
  bancoId: string;
  ativo: boolean;
}

export interface ResumoMensal {
  mes: number;
  ano: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
}

export interface ConfiguracaoApp {
  moeda: string;
  temaEscuro: boolean;
  idioma: string;
  primeiroAcesso: boolean;
}

export interface BackupLocal {
  id: string;
  dataCriacao: string;
  dados: {
    bancos: Banco[];
    categorias: Categoria[];
    transacoes: Transacao[];
    lancamentosFixos: LancamentoFixo[];
    configuracoes: ConfiguracaoApp;
  };
}
