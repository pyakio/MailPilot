import React, { useState } from 'react';
import {
  FiZap,
  FiPlus,
  FiPlay,
  FiPause,
  FiClock,
  FiMail,
  FiUserCheck,
  FiFilter,
  FiArrowDown,
  FiMoreHorizontal,
  FiCheckCircle,
  FiTrendingUp,
} from 'react-icons/fi';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Badge from '../../../shared/ui/Badge';
import { useToast } from '../../../hooks/useToast';

const DEFAULT_WORKFLOWS = [
  {
    id: 'wf-1',
    name: 'SaaS User Onboarding Drip',
    trigger: 'When a new contact subscribes',
    status: 'ACTIVE',
    enrolledCount: 142,
    completedCount: 98,
    conversionRate: '69.0%',
    steps: [
      { id: 's1', type: 'TRIGGER', title: 'Trigger: Contact Subscribed', desc: 'Runs instantly when contact is added.' },
      { id: 's2', type: 'ACTION', title: 'Send Email: Welcome to MailPilot', desc: 'Introduces workspace features and quickstart guide.' },
      { id: 's3', type: 'DELAY', title: 'Wait 2 Days', desc: 'Delays next step by 48 hours.' },
      { id: 's4', type: 'ACTION', title: 'Send Email: Connect your Custom Domain', desc: 'Guides user through DKIM/SPF DNS verification.' },
      { id: 's5', type: 'CONDITION', title: 'Check: Sent First Campaign?', desc: 'Branches based on whether user has dispatched an email.' },
    ],
  },
  {
    id: 'wf-2',
    name: 'Re-engagement Win-Back Sequence',
    trigger: 'Inactive for > 30 days',
    status: 'PAUSED',
    enrolledCount: 45,
    completedCount: 12,
    conversionRate: '26.6%',
    steps: [
      { id: 'w1', type: 'TRIGGER', title: 'Trigger: 30 Days Inactive', desc: 'Zero opens or clicks in the past month.' },
      { id: 'w2', type: 'ACTION', title: 'Send Email: What we have built recently', desc: 'Product recap with 20% reactivation discount.' },
      { id: 'w3', type: 'DELAY', title: 'Wait 5 Days', desc: 'Pauses sequence before follow-up.' },
      { id: 'w4', type: 'ACTION', title: 'Send Email: Account Maintenance Notice', desc: 'Polite reminder before list clean-up.' },
    ],
  },
];

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(DEFAULT_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState(DEFAULT_WORKFLOWS[0]);
  const { addToast } = useToast();

  const toggleWorkflowStatus = (id) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id === id) {
          const nextStatus = wf.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          addToast({
            title: `Workflow ${nextStatus === 'ACTIVE' ? 'Activated' : 'Paused'}`,
            message: `"${wf.name}" is now ${nextStatus.toLowerCase()}.`,
            type: 'info',
          });
          return { ...wf, status: nextStatus };
        }
        return wf;
      })
    );
  };

  const handleCreateWorkflow = () => {
    const newWf = {
      id: `wf-${Date.now()}`,
      name: 'Custom Sequence #' + (workflows.length + 1),
      trigger: 'When contact tag is added',
      status: 'PAUSED',
      enrolledCount: 0,
      completedCount: 0,
      conversionRate: '0%',
      steps: [
        { id: 'n1', type: 'TRIGGER', title: 'Trigger: Tag Assigned', desc: 'Fires when specific tag is assigned.' },
        { id: 'n2', type: 'ACTION', title: 'Send Email: Target Offer', desc: 'Personalized broadcast message.' },
      ],
    };
    setWorkflows([newWf, ...workflows]);
    setSelectedWorkflow(newWf);
    addToast({ title: 'Workflow Created', message: 'New automation flow drafted.', type: 'success' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#E8A33D] text-xl">⚡</span>
            <h1 className="text-2xl font-bold font-heading text-[var(--text)]">Automation Workflows</h1>
            <Badge variant="amber">Automated Drips</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Build multi-step automated email drips, conditional delays, and subscriber lifecycle sequences.
          </p>
        </div>

        <Button
          variant="primary"
          icon={FiPlus}
          onClick={handleCreateWorkflow}
        >
          New Automation Flow
        </Button>
      </div>

      {/* Grid: Workflow List & Flow Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workflows List */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="Your Automated Sequences" subtitle={`${workflows.length} workflows configured`}>
            <div className="space-y-3">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`p-3.5 rounded-lg border transition-colors cursor-pointer ${
                    selectedWorkflow?.id === wf.id
                      ? 'bg-[var(--surface-secondary)] border-[#E8A33D]/50'
                      : 'bg-[var(--surface-card)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text)]">{wf.name}</span>
                        <Badge variant={wf.status === 'ACTIVE' ? 'success' : 'default'}>
                          {wf.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{wf.trigger}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkflowStatus(wf.id);
                      }}
                      className="p-1.5 rounded bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text)] border border-[var(--border)] transition-colors shrink-0"
                      title={wf.status === 'ACTIVE' ? 'Pause Workflow' : 'Activate Workflow'}
                    >
                      {wf.status === 'ACTIVE' ? (
                        <FiPause className="w-3.5 h-3.5 text-[#E8A33D]" />
                      ) : (
                        <FiPlay className="w-3.5 h-3.5 text-[#22C55E]" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]">
                    <span>Enrolled: <strong className="text-[var(--text)]">{wf.enrolledCount}</strong></span>
                    <span>Completed: <strong className="text-[var(--text)]">{wf.completedCount}</strong></span>
                    <span>Conversion: <strong className="text-[#22C55E] font-bold">{wf.conversionRate}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Sequence Builder Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            title={selectedWorkflow?.name || 'Sequence Canvas'}
            subtitle={`Visual step sequence & triggers (${selectedWorkflow?.steps?.length || 0} steps)`}
            action={
              <Button
                size="sm"
                variant={selectedWorkflow?.status === 'ACTIVE' ? 'outline' : 'primary'}
                onClick={() => selectedWorkflow && toggleWorkflowStatus(selectedWorkflow.id)}
                icon={selectedWorkflow?.status === 'ACTIVE' ? FiPause : FiPlay}
              >
                {selectedWorkflow?.status === 'ACTIVE' ? 'Pause Flow' : 'Activate Flow'}
              </Button>
            }
          >
            {selectedWorkflow ? (
              <div className="space-y-4 py-2">
                {selectedWorkflow.steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="p-4 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] relative group hover:border-[#E8A33D]/40 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded bg-[var(--surface-card)] border border-[var(--border)] text-[#E8A33D] shrink-0">
                            {step.type === 'TRIGGER' && <FiZap className="w-4 h-4" />}
                            {step.type === 'ACTION' && <FiMail className="w-4 h-4 text-[#3E6B70]" />}
                            {step.type === 'DELAY' && <FiClock className="w-4 h-4 text-[#F59E0B]" />}
                            {step.type === 'CONDITION' && <FiFilter className="w-4 h-4 text-[#22C55E]" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#E8A33D]">Step {idx + 1}</span>
                              <span className="text-sm font-semibold text-[var(--text)]">{step.title}</span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{step.desc}</p>
                          </div>
                        </div>

                        <Badge variant="steel">{step.type}</Badge>
                      </div>
                    </div>

                    {/* Step Connector Arrow */}
                    {idx < selectedWorkflow.steps.length - 1 && (
                      <div className="flex justify-center">
                        <div className="w-px h-6 bg-[var(--border-strong)] flex items-center justify-center">
                          <FiArrowDown className="w-3.5 h-3.5 text-[#E8A33D] -ml-[7px]" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FiPlus}
                    onClick={() => {
                      const updatedSteps = [
                        ...selectedWorkflow.steps,
                        {
                          id: `s-${Date.now()}`,
                          type: 'ACTION',
                          title: `Send Follow-up Email #${selectedWorkflow.steps.length + 1}`,
                          desc: 'Automated notification dispatched to subscriber.',
                        },
                      ];
                      const updatedWf = { ...selectedWorkflow, steps: updatedSteps };
                      setSelectedWorkflow(updatedWf);
                      setWorkflows((prev) => prev.map((w) => (w.id === updatedWf.id ? updatedWf : w)));
                      addToast({ title: 'Step Added', message: 'Added action step to sequence.', type: 'info' });
                    }}
                  >
                    Add Step to Flow
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default WorkflowsPage;
