
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calculator, DollarSign } from 'lucide-react';

export function InvestimentosTab() {
  const [simulacao, setSimulacao] = useState({
    valorInicial: '',
    valorMensal: '',
    taxa: '',
    periodo: '',
    tipoInvestimento: 'CDI'
  });

  const [resultado, setResultado] = useState<{
    valorFinal: number;
    totalInvestido: number;
    lucro: number;
    rendimentoMensal: number[];
  } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularInvestimento = () => {
    const valorInicial = parseFloat(simulacao.valorInicial) || 0;
    const valorMensal = parseFloat(simulacao.valorMensal) || 0;
    const taxaAnual = parseFloat(simulacao.taxa) || 0;
    const periodoMeses = parseInt(simulacao.periodo) || 0;

    const taxaMensal = taxaAnual / 100 / 12;
    
    let saldo = valorInicial;
    const rendimentoMensal: number[] = [];
    
    for (let mes = 1; mes <= periodoMeses; mes++) {
      saldo = saldo * (1 + taxaMensal) + valorMensal;
      rendimentoMensal.push(saldo);
    }

    const totalInvestido = valorInicial + (valorMensal * periodoMeses);
    const valorFinal = saldo;
    const lucro = valorFinal - totalInvestido;

    setResultado({
      valorFinal,
      totalInvestido,
      lucro,
      rendimentoMensal
    });
  };

  const resetSimulacao = () => {
    setSimulacao({
      valorInicial: '',
      valorMensal: '',
      taxa: '',
      periodo: '',
      tipoInvestimento: 'CDI'
    });
    setResultado(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Simulação de Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="valorInicial">Valor Inicial (R$)</Label>
                <Input
                  id="valorInicial"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={simulacao.valorInicial}
                  onChange={(e) => setSimulacao({ ...simulacao, valorInicial: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="valorMensal">Aporte Mensal (R$)</Label>
                <Input
                  id="valorMensal"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={simulacao.valorMensal}
                  onChange={(e) => setSimulacao({ ...simulacao, valorMensal: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="taxa">Taxa de Juros Anual (%)</Label>
                <Input
                  id="taxa"
                  type="number"
                  step="0.01"
                  placeholder="10.5"
                  value={simulacao.taxa}
                  onChange={(e) => setSimulacao({ ...simulacao, taxa: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="periodo">Período (meses)</Label>
                <Input
                  id="periodo"
                  type="number"
                  placeholder="12"
                  value={simulacao.periodo}
                  onChange={(e) => setSimulacao({ ...simulacao, periodo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="tipoInvestimento">Tipo de Investimento</Label>
                <Select value={simulacao.tipoInvestimento} onValueChange={(value) => setSimulacao({ ...simulacao, tipoInvestimento: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="Poupança">Poupança</SelectItem>
                    <SelectItem value="CDB">CDB</SelectItem>
                    <SelectItem value="LCI/LCA">LCI/LCA</SelectItem>
                    <SelectItem value="Tesouro Direto">Tesouro Direto</SelectItem>
                    <SelectItem value="Ações">Ações</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3">
                <Button onClick={calcularInvestimento} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calcular
                </Button>
                <Button onClick={resetSimulacao} variant="outline" className="flex-1">
                  Limpar
                </Button>
              </div>
            </div>

            {resultado && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resultado da Simulação</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Valor Final</span>
                        <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                          {formatCurrency(resultado.valorFinal)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Investido</span>
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          {formatCurrency(resultado.totalInvestido)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Lucro Total</span>
                        <span className="text-lg font-bold text-green-800 dark:text-green-200">
                          {formatCurrency(resultado.lucro)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Rentabilidade</span>
                        <span className="text-lg font-bold text-purple-800 dark:text-purple-200">
                          {((resultado.lucro / resultado.totalInvestido) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {resultado && resultado.rendimentoMensal.length > 0 && (
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Evolução Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {resultado.rendimentoMensal.map((valor, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border-b dark:border-gray-600">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Mês {index + 1}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
