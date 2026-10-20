import React, { useState, useMemo, useEffect } from 'react';
import { AtmNet } from './components/AtmNet';
import { ParseResult } from './types';
import { calculateRunway } from './utils/runwayCalculator';
import { calculateCategoryBreakdown, calculateSavingsRate } from './utils/categories';
import { generateDemoStatements } from './utils/demoData';
import { I18nProvider, useI18n } from './utils/i18n';
import { getStoredUserName, SavedAudit } from './utils/userMemoryStore';
import { Header } from './components/Header';
import { GlobalLiquidityInput } from './components/GlobalLiquidityInput';
import { UniversalDropzone } from './components/UniversalDropzone';
import { RunwayMetrics } from './components/RunwayMetrics';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { Budget503020Card } from './components/Budget503020Card';
import { RecurringExpensesCard } from './components/RecurringExpensesCard';
import { PersonalizedTips } from './components/PersonalizedTips';
import { FinancialStressSimulator } from './components/FinancialStressSimulator';
import { SavingsGoalsTracker } from './components/SavingsGoalsTracker';
import { OpportunityCostCard } from './components/OpportunityCostCard';
import { UnifiedTransactionsTable } from './components/UnifiedTransactionsTable';
import { MemoryVaultModal } from './components/MemoryVaultModal';
import './styles/savings.css';

const SavingsMainContent: React.FC = () => {
  const { t } = useI18n();

  // Estado del usuario y memoria
  const [userName, setUserName] = useState<string>('');
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);

  // Estado 100% volátil en memoria RAM (Zero-Knowledge)
  const [totalLiquidity, setTotalLiquidity] = useState<number>(0);
  const [parseResults, setParseResults] = useState<ParseResult[]>([]);

  useEffect(() => {
    const stored = getStoredUserName();
    if (stored) setUserName(stored);

    // Auto-detect ecosystem SSO session from localStorage (Zero Workers)
    try {
      const localUserStr = localStorage.getItem('trujillo_ai_user') || localStorage.getItem('auth_user') || localStorage.getItem('atm_user');
      if (localUserStr) {
        const u = JSON.parse(localUserStr);
        if (u?.name) {
          setStoredUserName(u.name);
          setUserName(u.name);
        }
      }
    } catch (e) {}
  }, []);

  const handleAddResults = (newResults: ParseResult[]) => {
    setParseResults((prev) => {
      const existingNames = new Set(newResults.map((r) => r.fileName));
      const filtered = prev.filter((r) => !existingNames.has(r.fileName));
      return [...filtered, ...newResults];
    });
  };

  const handleRemoveResult = (fileName: string) => {
    setParseResults((prev) => prev.filter((r) => r.fileName !== fileName));
  };

  const handleLoadDemo = () => {
    const demoStatements = generateDemoStatements();
    setParseResults(demoStatements);
    if (totalLiquidity === 0) {
      setTotalLiquidity(20000); // 20.000 € de colchón de muestra
    }
  };

  const handleReset = () => {
    setTotalLiquidity(0);
    setParseResults([]);
  };

  const handleLoadAudit = (audit: SavedAudit) => {
    setTotalLiquidity(audit.totalLiquidity);
    setParseResults(audit.parseResults);
  };

  // Consolidación de análisis financiero
  const runwayAnalysis = useMemo(() => {
    return calculateRunway(totalLiquidity, parseResults);
  }, [totalLiquidity, parseResults]);

  // Lista plana de transacciones para la tabla y módulos
  const allTransactions = useMemo(() => {
    const list = parseResults.flatMap((r) => r.transactions);
    list.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
    return list;
  }, [parseResults]);

  // Desglose de categorías y tasa de ahorro
  const categories = useMemo(() => {
    return calculateCategoryBreakdown(allTransactions, runwayAnalysis.monthsSpanned);
  }, [allTransactions, runwayAnalysis.monthsSpanned]);

  const savingsRate = useMemo(() => {
    return calculateSavingsRate(runwayAnalysis.monthlyIncome, runwayAnalysis.monthlyExpenses);
  }, [runwayAnalysis.monthlyIncome, runwayAnalysis.monthlyExpenses]);

  const hasData = parseResults.length > 0 || totalLiquidity > 0;

  return (
    <div className="savings-app-wrapper">
      <Header
        onReset={handleReset}
        hasData={hasData}
        onOpenVault={() => setIsVaultOpen(true)}
        userName={userName}
        onUpdateUserName={setUserName}
      />

      <main className="savings-main">
        {/* Paso 1: Liquidez Global */}
        <GlobalLiquidityInput
          value={totalLiquidity}
          onChange={setTotalLiquidity}
        />

        {/* Paso 2: Carga Multibanco de Extractos */}
        <UniversalDropzone
          parseResults={parseResults}
          onAddResults={handleAddResults}
          onRemoveResult={handleRemoveResult}
          onLoadDemo={handleLoadDemo}
        />

        {/* Funciones Avanzadas de Auditoría Financiera */}
        {parseResults.length > 0 && (
          <>
            {/* 1. Métricas Centrales de Runway y Supervivencia */}
            <RunwayMetrics analysis={runwayAnalysis} />

            {/* 2. Salud Presupuestaria · Regla 50/30/20 */}
            <Budget503020Card
              categories={categories}
              averageIncome={runwayAnalysis.monthlyIncome}
              averageExpenses={runwayAnalysis.monthlyExpenses}
            />

            {/* 3. Desglose de Gastos por Categoría */}
            <CategoryBreakdown
              transactions={allTransactions}
              runwayAnalysis={runwayAnalysis}
            />

            {/* 4. Detector de Gastos Fijos y Cuotas Recurrentes */}
            <RecurringExpensesCard transactions={allTransactions} />

            {/* 5. Recomendaciones Financieras Personalizadas */}
            <PersonalizedTips
              runwayAnalysis={runwayAnalysis}
              categories={categories}
              savingsRate={savingsRate}
              transactions={allTransactions}
            />

            {/* 6. Simulador de Estrés Financiero (Crisis, ERTE, Inflación) */}
            <FinancialStressSimulator
              totalLiquidity={totalLiquidity}
              averageIncome={runwayAnalysis.monthlyIncome}
              averageExpenses={runwayAnalysis.monthlyExpenses}
            />

            {/* 7. Rastreador de Metas de Ahorro Familiar */}
            <SavingsGoalsTracker
              monthlySavingsCapacity={Math.max(0, runwayAnalysis.monthlyIncome - runwayAnalysis.monthlyExpenses)}
              totalLiquidity={totalLiquidity}
            />

            {/* 8. Proyección y Coste de Oportunidad al 7% */}
            <OpportunityCostCard
              detectedMonthlyLeak={runwayAnalysis.leakMonthlyEstimate}
            />

            {/* 9. Tabla Unificada con Exportador Excel Formateado y PDF */}
            <UnifiedTransactionsTable
              transactions={allTransactions}
              topExpenses={runwayAnalysis.topExpenses}
              runwayAnalysis={runwayAnalysis}
            />
          </>
        )}
      </main>

      <footer className="savings-footer">
        <div className="savings-footer-inner">
          <div className="footer-privacy-box">
            <svg
              className="tool-ic"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Procesamiento 100% en memoria volátil RAM del navegador. Ningún dato bancario viaja a ningún servidor externo.</span>
          </div>

        </div>
        <AtmNet current="savings" />
      </footer>

      {/* Modal de Bóveda y Memoria Local */}
      <MemoryVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        currentLiquidity={totalLiquidity}
        currentParseResults={parseResults}
        onLoadAudit={handleLoadAudit}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <SavingsMainContent />
    </I18nProvider>
  );
};

export default App;
