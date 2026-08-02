import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SearchBar } from '../../components/ui/SearchBar';
import { TemplatesGrid } from '../../components/tables/TemplatesGrid';
import { TemplateFormModal } from '../../components/forms/TemplateFormModal';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { templateService } from '../../services/templateService';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { FiPlus, FiFileText } from 'react-icons/fi';

export function Templates() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await templateService.getTemplates();
      setTemplates(res);
    } catch (err) {
      addToast({ title: 'Error Loading Templates', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      return (
        t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.body.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    });
  }, [templates, debouncedSearch]);

  const handleCreateTemplate = async (data) => {
    try {
      setSubmitting(true);
      await templateService.createTemplate(data);
      addToast({ title: 'Template Saved!', message: `Created "${data.title}" successfully.`, type: 'success' });
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      addToast({ title: 'Save Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        description="Reusable HTML email layouts with dynamic variables and personalization tags."
        badge={`${filteredTemplates.length} Templates`}
        actions={
          <PrimaryButton icon={FiPlus} onClick={() => setIsModalOpen(true)}>
            New Template
          </PrimaryButton>
        }
      />

      {/* Search Header */}
      <Card noPadding>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <SearchBar value={search} onChange={setSearch} placeholder="Search templates by title or content..." />
        </div>
      </Card>

      {/* Grid List */}
      {loading ? (
        <SkeletonLoader type="card" count={3} />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          title="No templates found"
          description={search ? `No templates match "${search}".` : 'Create your first email template to speed up campaign creation.'}
          actionLabel="Create Template"
          onAction={() => setIsModalOpen(true)}
          icon={FiFileText}
        />
      ) : (
        <TemplatesGrid templates={filteredTemplates} onPreview={(t) => setPreviewTemplate(t)} />
      )}

      {/* Builder Modal */}
      <TemplateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTemplate}
        loading={submitting}
      />

      {/* Preview Modal */}
      <Modal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        title={`Template Preview: ${previewTemplate?.title}`}
        maxWidth="max-w-xl"
      >
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Title / Subject Line
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {previewTemplate?.title}
            </h4>
          </div>

          <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
            {previewTemplate?.body}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Templates;
