import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ConfirmationDialog } from '@/components/ui/alert-confirmation';
import { useFinance } from '@/contexts/FinanceContext';
import { Download, Upload, Trash2 } from 'lucide-react';

export function ConfiguracoesTab() {
  const { state, dispatch } = useFinance();
  const [backupData, setBackupData] = useState('');

  const handleConfigUpdate = (key: keyof typeof state.configuracoes, value: any) => {
    dispatch({
      type: 'UPDATE_CONFIGURACOES',
      payload: {
        ...state.configuracoes,
        [key]: value
      }
    });
  };

  const handleExportData = () => {
    const exportData = {
      bancos: state.bancos,
      categorias: state.categorias,
      transacoes: state.transacoes,
      lancamentosFixos: state.lancamentosFixos,
      configuracoes: state.configuracoes,
      dataExportacao: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    try {
      const parsedData = JSON.parse(backupData);
      
      if (parsedData.bancos && parsedData.categorias && parsedData.transacoes) {
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            bancos: parsedData.bancos,
            categorias: parsedData.categorias,
            transacoes: parsedData.transacoes,
            lancamentosFixos: parsedData.lancamentosFixos || [],
            configuracoes: parsedData.configuracoes || state.configuracoes
          }
        });
        setBackupData('');
        alert('Dados importados com sucesso!');
      } else {
        alert('Formato de backup inválido!');
      }
    } catch (error) {
      alert('Erro ao importar dados. Verifique o formato do arquivo.');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      dispatch({
        type: 'LOAD_DATA',
        payload: {
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
          configuracoes: state.configuracoes
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="moeda">Moeda</Label>
            <Select 
              value={state.configuracoes.moeda} 
              onValueChange={(value) => handleConfigUpdate('moeda', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real (BRL)</SelectItem>
                <SelectItem value="USD">Dólar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="idioma">Idioma</Label>
            <Select 
              value={state.configuracoes.idioma} 
              onValueChange={(value) => handleConfigUpdate('idioma', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="tema-escuro" className="text-gray-900 dark:text-white">Tema Escuro</Label>
            <Switch
              id="tema-escuro"
              checked={state.configuracoes.temaEscuro}
              onCheckedChange={(checked) => handleConfigUpdate('temaEscuro', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Backup e Restauração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={handleExportData} className="w-full bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-data">Importar Dados (JSON)</Label>
            <textarea
              id="backup-data"
              className="w-full h-32 p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Cole aqui o conteúdo do arquivo de backup..."
              value={backupData}
              onChange={(e) => setBackupData(e.target.value)}
            />
            <Button 
              onClick={handleImportData} 
              disabled={!backupData.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Dados
            </Button>
          </div>

          <div>
            <Button 
              onClick={handleClearAllData} 
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{state.bancos.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bancos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{state.categorias.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Categorias</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{state.transacoes.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{state.lancamentosFixos.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lançamentos Fixos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
