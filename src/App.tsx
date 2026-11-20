import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { useFinanceStore } from './hooks/useFinanceStore';
import { MobileFrame } from './components/MobileFrame';
import { DesktopSidebar } from './components/DesktopSidebar';
import { HeaderBar } from './components/HeaderBar';
import { ModulePillBar } from './components/ModulePillBar';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineBanner } from './components/OfflineBanner';
import { TransactionModal } from './components/TransactionModal';
import { ModulesModal } from './components/ModulesModal';
import { InstallGuideModal } from './components/InstallGuideModal';
import { ActivationGateModal } from './components/ActivationGateModal';
import { OwnerPanelModal } from './components/OwnerPanelModal';
import {
  LicenseState,
  loadLicenseState,
  saveActivatedLicense,
  clearActivatedLicense,
  verifyActivationCode,
} from './utils/licensing';
import { playSuccessSound, playTapSound } from './utils/sound';

// Views
import { WelcomeView } from './views/WelcomeView';
import { DashboardView } from './views/DashboardView';
import { PlanningView } from './views/PlanningView';
import { IncomesView } from './views/IncomesView';
import { ExpensesView } from './views/ExpensesView';
import { CardsView } from './views/CardsView';
import { GoalsView } from './views/GoalsView';
import { AnnualView } from './views/AnnualView';
import { SettingsView } from './views/SettingsView';

const MODULE_NAMES: Record<ActiveTab, string> = {
  welcome: '1. Comece Aqui • Guia Prático',
  dashboard: '2. Painel Financeiro • KPIs',
  planning: '3. Planejamento • Orçamento',
  incomes: '4. Entradas & Rendas',
  expenses: '5. Despesas & Pagamentos',
  cards: '6. Cartão de Crédito',
  goals: '7. Metas & Reserva',
  annual: '8. Resumo Anual (Jan - Dez)',
  settings: '9. Configurações & Parâmetros',
};

const VALID_TABS: ActiveTab[] = [
  'welcome',
  'dashboard',
  'planning',
  'incomes',
  'expenses',
  'cards',
  'goals',
  'annual',
  'settings',
];

export default function App() {
  const store = useFinanceStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Local Pix R$ 5,00 Licensing & Owner Panel State
  const [license, setLicense] = useState<LicenseState>(() => loadLicenseState());
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationReason, setActivationReason] = useState<string | null>(null);
  const [isOwnerPanelOpen, setIsOwnerPanelOpen] = useState(false);
  const [activationBanner, setActivationBanner] = useState<string | null>(null);

  // Support Android & iOS Home Screen App Shortcuts (/?action=new, /?tab=expenses)
  // and 1-tap auto-unlock links (/?ativar=MDO-XXXX-YYYY)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab | null;
    const actionParam = params.get('action');
    const activateParam = params.get('ativar');

    if (activateParam && verifyActivationCode(activateParam)) {
      const next = saveActivatedLicense(activateParam);
      setLicense(next);
      playSuccessSound(store.settings.soundEnabled);
      setActivationBanner('Acesso completo ativado com sucesso! Bom controle financeiro.');
      setTimeout(() => setActivationBanner(null), 5000);
    }

    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    if (actionParam === 'new') {
      const currentLic = activateParam && verifyActivationCode(activateParam)
        ? { isActivated: true }
        : loadLicenseState();
      if (currentLic.isActivated) {
        setIsAddModalOpen(true);
      } else {
        setActivationReason('O pagamento único de R$ 5,00 no Pix já libera todo o sistema na palma da sua mão.');
        setIsActivationModalOpen(true);
      }
    }
    if (tabParam || actionParam || activateParam) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [store.settings.soundEnabled]);

  const handleOpenActivation = (reason?: string) => {
    setActivationReason(reason || null);
    setIsActivationModalOpen(true);
  };

  const handleRequestAddTransaction = () => {
    if (!license.isActivated) {
      handleOpenActivation(
        'O pagamento único de R$ 5,00 no Pix já libera todo o sistema na palma da sua mão para seus lançamentos.'
      );
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleActivateWithCode = (code: string) => {
    const next = saveActivatedLicense(code);
    setLicense(next);
    setActivationBanner('Acesso completo ativado! Todos os recursos estão liberados.');
    setTimeout(() => setActivationBanner(null), 5000);
  };

  const handleResetToDemo = () => {
    const next = clearActivatedLicense();
    setLicense(next);
  };

  const togglePreviewMode = () => {
    store.updateSettings({
      previewDevice:
        store.settings.previewDevice === 'mobile_mockup'
          ? 'full_responsive'
          : 'mobile_mockup',
    });
  };

  const handleSelectMonthAndNavigate = (monthKey: string) => {
    store.setSelectedMonth(monthKey);
    setActiveTab('dashboard');
  };

  const isDesktopSidebarActive = store.settings.previewDevice === 'full_responsive';

  return (
    <MobileFrame
      previewMode={store.settings.previewDevice}
      onTogglePreviewMode={togglePreviewMode}
      onOpenInstallModal={() => setIsInstallModalOpen(true)}
      sidebar={
        <DesktopSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAddModal={handleRequestAddTransaction}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onSwitchToMobilePreview={togglePreviewMode}
          onOpenActivationModal={() => handleOpenActivation()}
          license={license}
          soundEnabled={store.settings.soundEnabled}
        />
      }
    >
      {/* Offline Toast */}
      <OfflineBanner />

      {/* PWA Install Notification */}
      <PWAInstallBanner
        onOpenGuideModal={() => setIsInstallModalOpen(true)}
        soundEnabled={store.settings.soundEnabled}
      />

      {/* Responsive App Header */}
      <HeaderBar
        selectedMonth={store.selectedMonth}
        onMonthChange={store.setSelectedMonth}
        privacyMode={store.settings.privacyMode}
        onTogglePrivacy={() =>
          store.updateSettings({ privacyMode: !store.settings.privacyMode })
        }
        soundEnabled={store.settings.soundEnabled}
        onToggleSound={() =>
          store.updateSettings({ soundEnabled: !store.settings.soundEnabled })
        }
        theme={store.settings.theme}
        onToggleTheme={() =>
          store.updateSettings({
            theme: store.settings.theme === 'light' ? 'dark' : 'light',
          })
        }
        currentModuleName={MODULE_NAMES[activeTab]}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        hasDesktopSidebar={isDesktopSidebarActive}
      />

      {/* 9 Modules Horizontal Pill Bar (hidden on lg+ PC mode because DesktopSidebar shows all 9 modules) */}
      <div className={isDesktopSidebarActive ? 'lg:hidden' : ''}>
        <ModulePillBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          soundEnabled={store.settings.soundEnabled}
        />
      </div>

      {/* Main Centered Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto pb-16 lg:pb-8">
        {/* Activation Confirmation Toast */}
        {activationBanner && (
          <div className="mx-4 @3xl:mx-6 mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{activationBanner}</span>
          </div>
        )}

        {/* Non-sticky Demo Mode Activation Strip (Pix R$ 5,00) */}
        {!license.isActivated && (
          <div className="mx-4 @3xl:mx-6 mt-3 p-3 @3xl:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-between gap-3 shadow-xs">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                R$ 5,00 no Pix libera todo o sistema
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Pagamento único · Todos os 9 módulos no celular e no computador
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playTapSound(store.settings.soundEnabled);
                handleOpenActivation();
              }}
              className="min-h-[40px] px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap transition active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Ativar</span>
            </button>
          </div>
        )}

        {/* Content View Switching */}
        {activeTab === 'welcome' && (
          <WelcomeView
            onNavigate={setActiveTab}
            onOpenAddModal={handleRequestAddTransaction}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            soundEnabled={store.settings.soundEnabled}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            store={store}
            onNavigate={setActiveTab}
            onOpenAddModal={handleRequestAddTransaction}
          />
        )}

        {activeTab === 'planning' && <PlanningView store={store} />}

        {activeTab === 'incomes' && (
          <IncomesView
            store={store}
            onOpenAddModal={handleRequestAddTransaction}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            store={store}
            onOpenAddModal={handleRequestAddTransaction}
          />
        )}

        {activeTab === 'cards' && (
          <CardsView
            store={store}
            onOpenAddModal={handleRequestAddTransaction}
          />
        )}

        {activeTab === 'goals' && <GoalsView store={store} />}

        {activeTab === 'annual' && (
          <AnnualView
            store={store}
            onSelectMonthAndNavigate={handleSelectMonthAndNavigate}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            store={store}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            license={license}
            onOpenActivationModal={handleOpenActivation}
            onOpenOwnerPanel={() => setIsOwnerPanelOpen(true)}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (hidden on lg+ when DesktopSidebar is active) */}
      <div className={isDesktopSidebarActive ? 'lg:hidden' : ''}>
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAddModal={handleRequestAddTransaction}
          onOpenModulesMenu={() => setIsModulesModalOpen(true)}
          soundEnabled={store.settings.soundEnabled}
          previewMode={store.settings.previewDevice}
        />
      </div>

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={store.addTransaction}
        categories={store.categories}
        cards={store.cards}
        soundEnabled={store.settings.soundEnabled}
      />

      {/* All 9 Modules Full Launcher Modal */}
      <ModulesModal
        isOpen={isModulesModalOpen}
        onClose={() => setIsModulesModalOpen(false)}
        activeTab={activeTab}
        onSelectModule={setActiveTab}
        soundEnabled={store.settings.soundEnabled}
      />

      {/* Full Multi-Platform Install Guide Modal (Android, iOS & QR Code) */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        soundEnabled={store.settings.soundEnabled}
      />

      {/* Pix R$ 5,00 Payment & Activation Gate Modal */}
      <ActivationGateModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        onActivate={handleActivateWithCode}
        onOpenOwnerPanel={() => {
          setIsActivationModalOpen(false);
          setIsOwnerPanelOpen(true);
        }}
        soundEnabled={store.settings.soundEnabled}
        reason={activationReason}
      />

      {/* Owner Activation Code Generator & Sales Panel */}
      <OwnerPanelModal
        isOpen={isOwnerPanelOpen}
        onClose={() => setIsOwnerPanelOpen(false)}
        license={license}
        onActivateThisDevice={handleActivateWithCode}
        onResetThisDeviceToDemo={handleResetToDemo}
        soundEnabled={store.settings.soundEnabled}
      />
    </MobileFrame>
  );
}
