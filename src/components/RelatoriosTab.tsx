import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/alert-confirmation';
import { useFinance } from '@/contexts/FinanceContext';
import { Categoria } from '@/types/entities';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Edit, Trash2, Filter } from 'lucide-react';

export function RelatoriosTab() {
  const { state, dispatch } = useFinance();
  const [filtro, setFiltro] = useState<'mes' | 'semana' | 'ano'>('mes');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [isCategoriaDialogOpen, setIsCategoriaDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{
    isOpen: boolean;
    categoriaId: string;
    categoriaNome: string;
    hasTransactions: boolean;
  }>({
    isOpen: false,
    categoriaId: '',
    categoriaNome: '',
    hasTransactions: false
  });
  
  const [categoriaForm, setCategoriaForm] = useState({
    nome: '',
    tipo: 'Saída' as 'Entrada' | 'Saída',
    cor: '#64748b'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const transacoesFiltradas = useMemo(() => {
    let transacoes = [...state.transacoes];
    
    if (dataInicial && dataFinal) {
      transacoes = transacoes.filter(t => {
        const dataTransacao = new Date(t.data);
        return dataTransacao >= new Date(dataInicial) && dataTransacao <= new Date(dataFinal);
      });
    }
    
    return transacoes;
  }, [state.transacoes, dataInicial, dataFinal]);

  const dadosPorCategoria = useMemo(() => {
    const categoriaMap = new Map();
    
    transacoesFiltradas.forEach(transacao => {
      const categoria = state.categorias.find(c => c.id === transacao.categoriaId);
      if (categoria) {
        const key = categoria.nome;
        const existing = categoriaMap.get(key) || { name: categoria.nome, value: 0, color: categoria.cor };
        existing.value += transacao.valor;
        categoriaMap.set(key, existing);
      }
    });

    return Array.from(categoriaMap.values());
  }, [transacoesFiltradas, state.categorias]);

  const dadosPorPeriodo = useMemo(() => {
    const periodoMap = new Map();
    
    transacoesFiltradas.forEach(transacao => {
      const date = new Date(transacao.data);
      let chave = '';
      
      if (filtro === 'mes') {
        chave = `${date.getMonth() + 1}/${date.getFullYear()}`;
      } else if (filtro === 'semana') {
        const inicioSemana = new Date(date);
        inicioSemana.setDate(date.getDate() - date.getDay());
        chave = `${inicioSemana.getDate()}/${inicioSemana.getMonth() + 1}`;
      } else {
        chave = date.getFullYear().toString();
      }
      
      const existing = periodoMap.get(chave) || { 
        periodo: chave, 
        entradas: 0, 
        saidas: 0 
      };
      
      if (transacao.tipo === 'Entrada') {
        existing.entradas += transacao.valor;
      } else {
        existing.saidas += transacao.valor;
      }
      
      periodoMap.set(chave, existing);
    });

    return Array.from(periodoMap.values()).sort((a, b) => {
      if (filtro === 'mes') {
        const [mesA, anoA] = a.periodo.split('/');
        const [mesB, anoB] = b.periodo.split('/');
        return new Date(parseInt(anoA), parseInt(mesA) - 1).getTime() - 
               new Date(parseInt(anoB), parseInt(mesB) - 1).getTime();
      } else if (filtro === 'ano') {
        return parseInt(a.periodo) - parseInt(b.periodo);
      }
      return 0;
    });
  }, [transacoesFiltradas, filtro]);

  const dadosAnuais = useMemo(() => {
    const transacoesAno = state.transacoes.filter(t => 
      new Date(t.data).getFullYear() === parseInt(anoSelecionado)
    );

    const mesesData = Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const transacoesMes = transacoesAno.filter(t => 
        new Date(t.data).getMonth() + 1 === mes
      );

      const entradas = transacoesMes
        .filter(t => t.tipo === 'Entrada')
        .reduce((acc, t) => acc + t.valor, 0);

      const saidas = transacoesMes
        .filter(t => t.tipo === 'Saída')
        .reduce((acc, t) => acc + t.valor, 0);

      return {
        mes: mes.toString().padStart(2, '0'),
        entradas,
        saidas,
        saldo: entradas - saidas
      };
    });

    return mesesData;
  }, [state.transacoes, anoSelecionado]);

  const resumoGeral = useMemo(() => {
    const totalEntradas = transacoesFiltradas
      .filter(t => t.tipo === 'Entrada')
      .reduce((acc, t) => acc + t.valor, 0);
    
    const totalSaidas = transacoesFiltradas
      .filter(t => t.tipo === 'Saída')
      .reduce((acc, t) => acc + t.valor, 0);

    const saldoTotal = state.bancos.reduce((acc, b) => acc + b.saldoAtual, 0);

    const gastosFixos = transacoesFiltradas
      .filter(t => t.fixa && t.tipo === 'Saída')
      .reduce((acc, t) => acc + t.valor, 0);

    return {
      totalEntradas,
      totalSaidas,
      saldoTotal,
      gastosFixos,
      saldoLiquido: totalEntradas - totalSaidas
    };
  }, [transacoesFiltradas, state.bancos]);

  const handleSubmitCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoria: Categoria = {
      id: editingCategoria?.id || Date.now().toString(),
      nome: categoriaForm.nome,
      tipo: categoriaForm.tipo,
      cor: categoriaForm.cor
    };

    if (editingCategoria) {
      dispatch({ type: 'UPDATE_CATEGORIA', payload: categoria });
    } else {
      dispatch({ type: 'ADD_CATEGORIA', payload: categoria });
    }

    resetCategoriaForm();
    setIsCategoriaDialogOpen(false);
  };

  const resetCategoriaForm = () => {
    setCategoriaForm({
      nome: '',
      tipo: 'Saída',
      cor: '#64748b'
    });
    setEditingCategoria(null);
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setCategoriaForm({
      nome: categoria.nome,
      tipo: categoria.tipo,
      cor: categoria.cor
    });
    setIsCategoriaDialogOpen(true);
  };

  const handleDeleteCategoria = (categoria: Categoria) => {
    // Check if this category has any transactions
    const hasTransactions = state.transacoes.some(t => t.categoriaId === categoria.id) || 
                           state.lancamentosFixos.some(l => l.categoriaId === categoria.id);
    
    setConfirmDeleteDialog({
      isOpen: true,
      categoriaId: categoria.id,
      categoriaNome: categoria.nome,
      hasTransactions
    });
  };

  const confirmDeleteCategoria = () => {
    dispatch({ type: 'DELETE_CATEGORIA', payload: confirmDeleteDialog.categoriaId });
    setConfirmDeleteDialog({
      isOpen: false,
      categoriaId: '',
      categoriaNome: '',
      hasTransactions: false
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDeleteDialog({
      isOpen: false,
      categoriaId: '',
      categoriaNome: '',
      hasTransactions: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="filtro">Período</Label>
              <Select value={filtro} onValueChange={(value: 'mes' | 'semana' | 'ano') => setFiltro(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">Por Mês</SelectItem>
                  <SelectItem value="semana">Por Semana</SelectItem>
                  <SelectItem value="ano">Por Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dataInicial">Data Inicial</Label>
              <Input
                id="dataInicial"
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dataFinal">Data Final</Label>
              <Input
                id="dataFinal"
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ano">Ano (Relatório Anual)</Label>
              <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const ano = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={ano} value={ano.toString()}>
                        {ano}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => { setDataInicial(''); setDataFinal(''); }}
                variant="outline"
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo com cores mais suaves */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Total Entradas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {formatCurrency(resumoGeral.totalEntradas)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200 dark:border-rose-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">
              Total Saídas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-800 dark:text-rose-200">
              {formatCurrency(resumoGeral.totalSaidas)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 border-violet-200 dark:border-violet-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Saldo Líquido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              resumoGeral.saldoLiquido >= 0 ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'
            }`}>
              {formatCurrency(resumoGeral.saldoLiquido)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Gastos Fixos
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {formatCurrency(resumoGeral.gastosFixos)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório Anual */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Relatório Anual - {anoSelecionado}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dadosAnuais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="entradas" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Entradas" 
              />
              <Line 
                type="monotone" 
                dataKey="saidas" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Saídas" 
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Saldo" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPorCategoria.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Evolução {filtro === 'mes' ? 'Mensal' : filtro === 'semana' ? 'Semanal' : 'Anual'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosPorPeriodo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosPorPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="entradas" fill="#4ade80" name="Entradas" />
                  <Bar dataKey="saidas" fill="#f87171" name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gestão de Categorias */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Categorias
          </CardTitle>
          <Button onClick={() => setIsCategoriaDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.categorias.map(categoria => (
              <div key={categoria.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: categoria.cor }}
                  />
                  <div>
                    <p className="font-medium dark:text-white">{categoria.nome}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{categoria.tipo}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={() => handleEditCategoria(categoria)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCategoria(categoria)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Banco */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Resumo por Banco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-600">
                  <th className="text-left py-2 dark:text-white">Banco</th>
                  <th className="text-left py-2 dark:text-white">Tipo</th>
                  <th className="text-right py-2 dark:text-white">Saldo Atual</th>
                  <th className="text-right py-2 dark:text-white">Total Entradas</th>
                  <th className="text-right py-2 dark:text-white">Total Saídas</th>
                </tr>
              </thead>
              <tbody>
                {state.bancos.map(banco => {
                  const transacoesBanco = transacoesFiltradas.filter(t => t.bancoId === banco.id);
                  const entradas = transacoesBanco
                    .filter(t => t.tipo === 'Entrada')
                    .reduce((acc, t) => acc + t.valor, 0);
                  const saidas = transacoesBanco
                    .filter(t => t.tipo === 'Saída')
                    .reduce((acc, t) => acc + t.valor, 0);

                  return (
                    <tr key={banco.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                      <td className="py-3 font-medium dark:text-white">{banco.nome}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{banco.tipoConta}</td>
                      <td className={`py-3 text-right font-semibold ${
                        banco.saldoAtual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {formatCurrency(banco.saldoAtual)}
                      </td>
                      <td className="py-3 text-right text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(entradas)}
                      </td>
                      <td className="py-3 text-right text-rose-600 dark:text-rose-400">
                        {formatCurrency(saidas)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para categorias */}
      <Dialog open={isCategoriaDialogOpen} onOpenChange={setIsCategoriaDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCategoria} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Categoria</Label>
              <Input
                id="nome"
                value={categoriaForm.nome}
                onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={categoriaForm.tipo} onValueChange={(value: 'Entrada' | 'Saída') => setCategoriaForm({ ...categoriaForm, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Saída">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cor">Cor</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="cor"
                  type="color"
                  value={categoriaForm.cor}
                  onChange={(e) => setCategoriaForm({ ...categoriaForm, cor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={categoriaForm.cor}
                  onChange={(e) => setCategoriaForm({ ...categoriaForm, cor: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {editingCategoria ? 'Salvar Alterações' : 'Criar Categoria'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete Category */}
      <ConfirmationDialog
        isOpen={confirmDeleteDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDeleteCategoria}
        title="Confirmar Exclusão"
        description={
          confirmDeleteDialog.hasTransactions 
            ? `Tem certeza que deseja excluir a categoria "${confirmDeleteDialog.categoriaNome}"? Esta ação também removerá todas as transações e lançamentos fixos associados a esta categoria. Esta ação não pode ser desfeita.`
            : `Tem certeza que deseja excluir a categoria "${confirmDeleteDialog.categoriaNome}"? Esta ação não pode ser desfeita.`
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
