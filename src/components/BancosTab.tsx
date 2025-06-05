
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/alert-confirmation';
import { useFinance } from '@/contexts/FinanceContext';
import { Banco } from '@/types/entities';
import { Plus, Edit, Trash2, Building2, Palette, AlertTriangle } from 'lucide-react';

export function BancosTab() {
  const { state, dispatch } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanco, setEditingBanco] = useState<Banco | null>(null);
  
  const [bancoForm, setBancoForm] = useState({
    nome: '',
    agencia: '',
    numeroConta: '',
    tipoConta: 'Corrente' as 'Corrente' | 'Poupança' | 'Digital',
    saldoAtual: '',
    cor: '#3b82f6'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const resetForm = () => {
    setBancoForm({
      nome: '',
      agencia: '',
      numeroConta: '',
      tipoConta: 'Corrente',
      saldoAtual: '',
      cor: '#3b82f6'
    });
    setEditingBanco(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const banco: Banco = {
      id: editingBanco?.id || Date.now().toString(),
      nome: bancoForm.nome,
      agencia: bancoForm.agencia,
      numeroConta: bancoForm.numeroConta,
      tipoConta: bancoForm.tipoConta,
      saldoAtual: parseFloat(bancoForm.saldoAtual),
      cor: bancoForm.cor
    };

    if (editingBanco) {
      dispatch({ type: 'UPDATE_BANCO', payload: banco });
    } else {
      dispatch({ type: 'ADD_BANCO', payload: banco });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (banco: Banco) => {
    setEditingBanco(banco);
    setBancoForm({
      nome: banco.nome,
      agencia: banco.agencia,
      numeroConta: banco.numeroConta,
      tipoConta: banco.tipoConta,
      saldoAtual: banco.saldoAtual.toString(),
      cor: banco.cor || '#3b82f6'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_BANCO', payload: id });
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Bancos
          </CardTitle>
          <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Banco
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.bancos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhum banco cadastrado ainda.
              </p>
            ) : (
              state.bancos.map(banco => (
                <div 
                  key={banco.id} 
                  className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  style={{ borderLeft: `4px solid ${banco.cor || '#3b82f6'}` }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" 
                      style={{ backgroundColor: banco.cor || '#3b82f6' }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{banco.nome}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Agência: {banco.agencia} • Conta: {banco.numeroConta}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tipo: {banco.tipoConta} • Saldo: {formatCurrency(banco.saldoAtual)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(banco)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(banco.id)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {editingBanco ? 'Editar Banco' : 'Novo Banco'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome" className="text-gray-700 dark:text-gray-300 mb-4 block">Nome do Banco</Label>
              <Input
                id="nome"
                value={bancoForm.nome}
                onChange={(e) => setBancoForm({ ...bancoForm, nome: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="agencia" className="text-gray-700 dark:text-gray-300 mb-4 block">Agência</Label>
              <Input
                id="agencia"
                value={bancoForm.agencia}
                onChange={(e) => setBancoForm({ ...bancoForm, agencia: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="numeroConta" className="text-gray-700 dark:text-gray-300 mb-4 block">Número da Conta</Label>
              <Input
                id="numeroConta"
                value={bancoForm.numeroConta}
                onChange={(e) => setBancoForm({ ...bancoForm, numeroConta: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="tipoConta" className="text-gray-700 dark:text-gray-300 mb-4 block">Tipo de Conta</Label>
              <Select value={bancoForm.tipoConta} onValueChange={(value: 'Corrente' | 'Poupança' | 'Digital') => setBancoForm({ ...bancoForm, tipoConta: value })}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="Corrente" className="text-gray-900 dark:text-white">Corrente</SelectItem>
                  <SelectItem value="Poupança" className="text-gray-900 dark:text-white">Poupança</SelectItem>
                  <SelectItem value="Digital" className="text-gray-900 dark:text-white">Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="saldoAtual" className="text-gray-700 dark:text-gray-300 mb-4 block">Saldo Atual</Label>
              <Input
                id="saldoAtual"
                type="number"
                step="0.01"
                value={bancoForm.saldoAtual}
                onChange={(e) => setBancoForm({ ...bancoForm, saldoAtual: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="cor" className="text-gray-700 dark:text-gray-300 flex items-center pb-4">
                <Palette className="w-4 h-4 mr-2" />
                Cor do Banco
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="cor"
                  type="color"
                  value={bancoForm.cor}
                  onChange={(e) => setBancoForm({ ...bancoForm, cor: e.target.value })}
                  className="w-16 h-10 p-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <Input
                  type="text"
                  value={bancoForm.cor}
                  onChange={(e) => setBancoForm({ ...bancoForm, cor: e.target.value })}
                  className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {editingBanco ? 'Salvar Alterações' : 'Criar Banco'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
