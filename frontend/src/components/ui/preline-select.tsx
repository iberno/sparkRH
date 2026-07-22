import { useEffect, useRef, useId, forwardRef } from 'react';

declare global {
  interface Window {
    HSSelect?: {
      getInstance: (el: HTMLElement | string) => any;
      autoInit: () => void;
    };
  }
}

interface PrelineSelectOption {
  value: string;
  label: string;
}

interface PrelineSelectProps {
  label?: string;
  options: PrelineSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  hasSearch?: boolean;
  className?: string;
  name?: string;
}

const CHEVRON_SVG =
  '<svg class="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-spark-gray dark:text-spark-dark-text group-hover:text-spark-primary transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

const TOGGLE_CLASSES =
  'group py-2.5 px-4 ps-3 pe-10 relative block w-full border rounded-lg text-sm text-start ' +
  'focus:outline-none focus:ring-2 focus:ring-spark-primary focus:border-spark-primary ' +
  'disabled:opacity-50 disabled:pointer-events-none ' +
  'dark:bg-spark-dark-bg dark:text-spark-dark-text dark:border-spark-dark-border ' +
  'bg-gray-50 text-spark-dark border-gray-200';

const DROPDOWN_CLASSES =
  'absolute z-50 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg mt-2 ' +
  'dark:bg-spark-dark-surface dark:border-spark-dark-border';

const OPTION_CLASSES =
  'py-2 px-4 w-full text-sm text-start flex items-center gap-2 cursor-pointer ' +
  'hover:bg-gray-100 dark:hover:bg-spark-dark-bg dark:text-spark-dark-text text-spark-dark ' +
  'rounded-lg mx-1 my-0.5';

const OPTION_SELECTED_CLASSES =
  'hs-selected:bg-spark-primary/10 hs-selected:text-spark-primary hs-selected:font-medium';

const SEARCH_CLASSES =
  'block w-full text-sm border rounded-lg focus:border-spark-primary focus:ring-spark-primary ' +
  'dark:bg-spark-dark-bg dark:text-spark-dark-text dark:border-spark-dark-border ' +
  'bg-gray-50 text-spark-dark border-gray-200 py-2 px-3';

export const PrelineSelect = forwardRef<HTMLSelectElement, PrelineSelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder = 'Selecione...',
      error,
      disabled,
      hasSearch = false,
      className = '',
      name,
    },
    ref,
  ) => {
    const uid = useId();
    const selectId = `preline-select-${uid}`;
    const selectRef = useRef<HTMLSelectElement | null>(null);

    const hsSelectConfig = JSON.stringify({
      placeholder,
      toggleTag: `<button type="button">${CHEVRON_SVG}</button>`,
      toggleClasses: TOGGLE_CLASSES + (error ? ' border-red-500 dark:border-red-500/50' : ''),
      dropdownClasses: DROPDOWN_CLASSES,
      optionClasses: `${OPTION_CLASSES} ${OPTION_SELECTED_CLASSES}`,
      hasSearch,
      searchClasses: SEARCH_CLASSES,
      searchPlaceholder: 'Buscar...',
      optionAllowEmptyOption: true,
    });

    useEffect(() => {
      const el = selectRef.current;
      if (!el) return;

      let instance: any = null;
      let destroyed = false;

      const reinit = () => {
        if (destroyed) return;
        try {
          instance = window.HSSelect?.getInstance(el);
          if (instance) {
            instance.destroy();
            instance = null;
          }
        } catch { /* ignore */ }

        el.removeAttribute('data-hs-select');

        requestAnimationFrame(() => {
          if (destroyed) return;
          el.setAttribute('data-hs-select', hsSelectConfig);
          try {
            window.HSSelect?.autoInit();
            instance = window.HSSelect?.getInstance(el);
          } catch { /* ignore */ }
        });
      };

      const timer = setTimeout(reinit, 30);

      const handleChange = (e: Event) => {
        const target = e.target as HTMLSelectElement;
        onChange?.(target.value);
      };

      el.addEventListener('change', handleChange);

      return () => {
        destroyed = true;
        clearTimeout(timer);
        el.removeEventListener('change', handleChange);
        try {
          instance?.destroy?.();
        } catch { /* ignore */ }
      };
    }, [options, onChange]);

    const setRef = (el: HTMLSelectElement | null) => {
      selectRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    };

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={selectId}
            className="block mb-2 text-sm font-medium dark:text-spark-dark-text text-spark-dark"
          >
            {label}
          </label>
        )}
        <select
          ref={setRef}
          id={selectId}
          name={name}
          data-hs-select={hsSelectConfig}
          className="hidden"
          disabled={disabled}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

PrelineSelect.displayName = 'PrelineSelect';
