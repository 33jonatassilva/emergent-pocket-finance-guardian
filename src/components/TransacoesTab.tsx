import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useFinance } from '@/contexts/FinanceContext';
import { Transacao } from '@/types/entities';
import { Plus, Edit, Trash2, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TransacoesTab() {
  const { state, dispatch } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'Saída' as 'Entrada' | 'Saída',
    categoriaId: '',
    bancoId: '',
    fixa: false,
    repeticaoMensal: false
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: 'Todos' as 'Todos' | 'Entrada' | 'Saída',
    categoria: 'Todas',
    banco: 'Todos',
    dataInicio: '',
    dataFim: '',
    fixas: 'Todas' as 'Todas' | 'Sim' | 'Não'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Transações filtradas
  const transacoesFiltradas = useMemo(() => {
    return state.transacoes.filter(transacao => {
      // Filtro de busca
      if (filtros.busca && !transacao.descricao.toLowerCase().includes(filtros.busca.toLowerCase())) {
        return false;
      }

      // Filtro de tipo
      if (filtros.tipo !== 'Todos' && transacao.tipo !== filtros.tipo) {
        return false;
      }

      // Filtro de categoria
      if (filtros.categoria !== 'Todas' && transacao.categoriaId !== filtros.categoria) {
        return false;
      }

      // Filtro de banco
      if (filtros.banco !== 'Todos' && transacao.bancoId !== filtros.banco) {
        return false;
      }

      // Filtro de data
      if (filtros.dataInicio && new Date(transacao.data) < new Date(filtros.dataInicio)) {
        return false;
      }

      if (filtros.dataFim && new Date(transacao.data) > new Date(filtros.dataFim)) {
        return false;
      }

      // Filtro de transações fixas
      if (filtros.fixas === 'Sim' && !transacao.fixa) {
        return false;
      }

      if (filtros.fixas === 'Não' && transacao.fixa) {
        return false;
      }

      return true;
    });
  }, [state.transacoes, filtros]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transacao: Transacao = {
      id: editingTransacao?.id || Date.now().toString(),
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: formData.data,
      tipo: formData.tipo,
      categoriaId: formData.categoriaId,
      bancoId: formData.bancoId,
      fixa: formData.fixa,
      repeticaoMensal: formData.repeticaoMensal
    };

    if (editingTransacao) {
      dispatch({ type: 'UPDATE_TRANSACAO', payload: transacao });
    } else {
      dispatch({ type: 'ADD_TRANSACAO', payload: transacao });
      
      // Atualizar saldo do banco
      const banco = state.bancos.find(b => b.id === formData.bancoId);
      if (banco) {
        const novoSaldo = formData.tipo === 'Entrada' 
          ? banco.saldoAtual + parseFloat(formData.valor)
          : banco.saldoAtual - parseFloat(formData.valor);
        
        dispatch({ 
          type: 'UPDATE_BANCO', 
          payload: { ...banco, saldoAtual: novoSaldo } 
        });
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      tipo: 'Saída',
      categoriaId: '',
      bancoId: '',
      fixa: false,
      repeticaoMensal: false
    });
    setEditingTransacao(null);
  };

  const handleEdit = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setFormData({
      descricao: transacao.descricao,
      valor: transacao.valor.toString(),
      data: transacao.data,
      tipo: transacao.tipo,
      categoriaId: transacao.categoriaId,
      bancoId: transacao.bancoId,
      fixa: transacao.fixa,
      repeticaoMensal: transacao.repeticaoMensal
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACAO', payload: id });
  };

  const getCategoriaName = (id: string) => {
    return state.categorias.find(c => c.id === id)?.nome || 'Categoria não encontrada';
  };

  const getBancoName = (id: string) => {
    return state.bancos.find(b => b.id === id)?.nome || 'Banco não encontrado';
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      tipo: 'Todos',
      categoria: 'Todas',
      banco: 'Todos',
      dataInicio: '',
      dataFim: '',
      fixas: 'Todas'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="busca"
                  placeholder="Buscar por descrição..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tipo-filtro">Tipo</Label>
              <Select value={filtros.tipo} onValueChange={(value: 'Todos' | 'Entrada' | 'Saída') => setFiltros({ ...filtros, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Entrada">Entradas</SelectItem>
                  <SelectItem value="Saída">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="categoria-filtro">Categoria</Label>
              <Select value={filtros.categoria} onValueChange={(value) => setFiltros({ ...filtros, categoria: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  {state.categorias.map(categoria => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="banco-filtro">Banco</Label>
              <Select value={filtros.banco} onValueChange={(value) => setFiltros({ ...filtros, banco: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {state.bancos.map(banco => (
                    <SelectItem key={banco.id} value={banco.id}>
                      {banco.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="fixas-filtro">Transações Fixas</Label>
              <Select value={filtros.fixas} onValueChange={(value: 'Todas' | 'Sim' | 'Não') => setFiltros({ ...filtros, fixas: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="Sim">Apenas Fixas</SelectItem>
                  <SelectItem value="Não">Apenas Variáveis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={limparFiltros} variant="outline" className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Transações ({transacoesFiltradas.length})
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTransacao ? 'Editar Transação' : 'Nova Transação'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="descricao" className="mb-4 block pt-5">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="valor" className="mb-4 block">Valor</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="data" className="mb-4 block">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipo" className="mb-4 block">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value: 'Entrada' | 'Saída') => setFormData({ ...formData, tipo: value })}>
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
                  <Label htmlFor="categoria" className="mb-4 block">Categoria</Label>
                  <Select value={formData.categoriaId} onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.categorias
                        .filter(c => c.tipo === formData.tipo)
                        .map(categoria => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="banco" className="mb-4 block">Banco</Label>
                  <Select value={formData.bancoId} onValueChange={(value) => setFormData({ ...formData, bancoId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.bancos.map(banco => (
                        <SelectItem key={banco.id} value={banco.id}>
                          {banco.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fixa"
                    checked={formData.fixa}
                    onCheckedChange={(checked) => setFormData({ ...formData, fixa: checked as boolean })}
                  />
                  <Label htmlFor="fixa">Gasto fixo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="repeticao"
                    checked={formData.repeticaoMensal}
                    onCheckedChange={(checked) => setFormData({ ...formData, repeticaoMensal: checked as boolean })}
                  />
                  <Label htmlFor="repeticao">Repetição mensal</Label>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {editingTransacao ? 'Salvar Alterações' : 'Criar Transação'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transacoesFiltradas.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma transação encontrada com os filtros aplicados.
              </p>
            ) : (
              transacoesFiltradas
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map(transacao => (
                  <div key={transacao.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          transacao.tipo === 'Entrada' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{transacao.descricao}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getCategoriaName(transacao.categoriaId)} • {getBancoName(transacao.bancoId)}
                            {transacao.fixa && ' • Fixa'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`font-semibold ${
                        transacao.tipo === 'Entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transacao.tipo === 'Entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(transacao)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(transacao.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
