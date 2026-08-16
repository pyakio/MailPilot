import React, { useState } from 'react';

export function getTemplateImageSrc(tmpl) {
  if (!tmpl) return '/templates/tmpl_01.svg';

  // 1. Direct valid thumbnail URL if present
  if (tmpl.thumbnail && typeof tmpl.thumbnail === 'string' && tmpl.thumbnail.includes('.svg')) {
    return tmpl.thumbnail;
  }

  // 2. Direct ID match (tmpl_01 to tmpl_20)
  if (tmpl.id && typeof tmpl.id === 'string') {
    const directMatch = tmpl.id.match(/tmpl_(\d{2})/);
    if (directMatch) {
      return `/templates/tmpl_${directMatch[1]}.svg`;
    }
  }

  const title = (tmpl.title || '').toLowerCase();
  const category = (tmpl.category || '').toLowerCase();
  const subject = (tmpl.subject || '').toLowerCase();
  const text = `${title} ${category} ${subject}`;

  // 3. Keyword / Use-Case Mapping
  if (text.includes('magic') || text.includes('verify') || text.includes('otp')) return '/templates/tmpl_02.svg';
  if (text.includes('founder') || text.includes('letter') || text.includes('personal')) return '/templates/tmpl_03.svg';
  if (text.includes('changelog') || text.includes('release') || text.includes('update')) return '/templates/tmpl_04.svg';
  if (text.includes('ai') || text.includes('copilot') || text.includes('studio') || text.includes('robot')) return '/templates/tmpl_05.svg';
  if (text.includes('maintenance') || text.includes('advisory') || text.includes('downtime')) return '/templates/tmpl_06.svg';
  if (text.includes('webinar') || text.includes('masterclass') || text.includes('secrets')) return '/templates/tmpl_07.svg';
  if (text.includes('summit') || text.includes('conference') || text.includes('keynote')) return '/templates/tmpl_08.svg';
  if (text.includes('milestone') || text.includes('celebration') || text.includes('gift') || text.includes('10m')) return '/templates/tmpl_09.svg';
  if (text.includes('growth') || text.includes('digest') || text.includes('issue')) return '/templates/tmpl_10.svg';
  if (text.includes('benchmark') || text.includes('stats') || text.includes('report')) return '/templates/tmpl_11.svg';
  if (text.includes('trial') || text.includes('expire') || text.includes('48h') || text.includes('warning')) return '/templates/tmpl_12.svg';
  if (text.includes('black friday') || text.includes('cyber') || text.includes('50%') || text.includes('sale')) return '/templates/tmpl_13.svg';
  if (text.includes('enterprise') || text.includes('scale') || text.includes('dedicated')) return '/templates/tmpl_14.svg';
  if (text.includes('invoice') || text.includes('receipt') || text.includes('billing') || text.includes('payment')) return '/templates/tmpl_15.svg';
  if (text.includes('security') || text.includes('device') || text.includes('sign-in') || text.includes('login')) return '/templates/tmpl_16.svg';
  if (text.includes('nps') || text.includes('survey') || text.includes('rating') || text.includes('feedback')) return '/templates/tmpl_17.svg';
  if (text.includes('roadmap') || text.includes('interview') || text.includes('15-min') || text.includes('research')) return '/templates/tmpl_18.svg';
  if (text.includes('miss') || text.includes('win-back') || text.includes('inactivity') || text.includes('inactive')) return '/templates/tmpl_19.svg';
  if (text.includes('draft') || text.includes('unfinished') || text.includes('saved')) return '/templates/tmpl_20.svg';

  // 4. Category Fallback Mapping
  switch (category) {
    case 'onboarding':
      return '/templates/tmpl_01.svg';
    case 'product':
      return '/templates/tmpl_04.svg';
    case 'announcement':
      return '/templates/tmpl_07.svg';
    case 'newsletter':
      return '/templates/tmpl_10.svg';
    case 'promotional':
      return '/templates/tmpl_13.svg';
    case 'transactional':
      return '/templates/tmpl_15.svg';
    case 'feedback':
      return '/templates/tmpl_17.svg';
    case 'reengagement':
      return '/templates/tmpl_19.svg';
    default:
      return '/templates/tmpl_01.svg';
  }
}

export function TemplateThumbnail({ template, className = '', imgClassName = '' }) {
  const [imgSrc, setImgSrc] = useState(() => getTemplateImageSrc(template));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc('/templates/tmpl_01.svg');
    }
  };

  return (
    <div className={`relative w-full h-full bg-[var(--surface-secondary)] flex items-center justify-center overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={template?.title || 'Email Template'}
        className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 ${imgClassName}`}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}

export default TemplateThumbnail;
