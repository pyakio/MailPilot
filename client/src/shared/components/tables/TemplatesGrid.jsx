import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { FiEye, FiFileText } from 'react-icons/fi';

export function TemplatesGrid({ templates, onPreview }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="flex flex-col justify-between"
          action={
            <Button
              size="sm"
              variant="outline"
              icon={FiEye}
              onClick={() => onPreview(template)}
            >
              Preview
            </Button>
          }
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-mp-sm bg-[#161C2E] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#94A3B8]">
                <FiFileText className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-[#F8FAFC] truncate">
                {template.title}
              </h4>
            </div>

            <p className="text-[11px] text-[#94A3B8] line-clamp-3 leading-relaxed font-mono bg-[#161C2E]/40 p-3 rounded-mp-sm border border-[rgba(255,255,255,0.04)]">
              {template.body}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between text-[10px] text-[#475569]">
            <span>Category: {template.category || 'General'}</span>
            <span>ID: {template.id}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default TemplatesGrid;
