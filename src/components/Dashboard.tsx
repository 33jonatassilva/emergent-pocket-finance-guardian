
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/contexts/FinanceContext';
import { BancosTab } from './BancosTab';
import { TransacoesTab } from './TransacoesTab';
import { RelatoriosTab } from './RelatoriosTab';
import { ConfiguracoesTab } from './ConfiguracoesTab';
import { InvestimentosTab } from './InvestimentosTab';
import { Building2, Receipt, BarChart3, Settings, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { state } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const saldoTotal = state.bancos.reduce((acc, banco) => acc + banco.saldoAtual, 0);
  const totalTransacoes = state.transacoes.length;
  const totalBancos = state.bancos.length;
  const totalCategorias = state.categorias.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header com Logo */}
        <div className="mb-8 flex items-center space-x-4">
          <img 
            src="/lovable-uploads/97b19e3b-958c-4d43-9b4e-3e2b5fc60787.png" 
            alt="Logo" 
            className="w-12 h-12"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Electron
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas finanças pessoais de forma simples e eficiente
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-gray-800 shadow-lg">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="bancos" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Bancos</span>
            </TabsTrigger>
            <TabsTrigger value="transacoes" className="flex items-center space-x-2">
              <Receipt className="w-4 h-4" />
              <span>Transações</span>
            </TabsTrigger>
            <TabsTrigger value="investimentos" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Investimentos</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Saldo Total
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    saldoTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(saldoTotal)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Soma de todos os bancos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Bancos
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalBancos}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bancos cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Transações
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalTransacoes}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Transações registradas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Categorias
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {totalCategorias}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Categorias ativas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo dos Bancos */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Resumo dos Bancos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.bancos.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Nenhum banco cadastrado ainda. Comece adicionando seus bancos na aba "Bancos".
                  </p>
                ) : (
                  <div className="space-y-4">
                    {state.bancos.map(banco => (
                      <div key={banco.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{banco.nome}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {banco.tipoConta} • Ag: {banco.agencia} • CC: {banco.numeroConta}
                          </p>
                        </div>
                        <div className={`text-lg font-semibold ${
                          banco.saldoAtual >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(banco.saldoAtual)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bancos">
            <BancosTab />
          </TabsContent>

          <TabsContent value="transacoes">
            <TransacoesTab />
          </TabsContent>

          <TabsContent value="investimentos">
            <InvestimentosTab />
          </TabsContent>

          <TabsContent value="relatorios">
            <RelatoriosTab />
          </TabsContent>

          <TabsContent value="configuracoes">
            <ConfiguracoesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
