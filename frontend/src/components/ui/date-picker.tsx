import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale/pt-BR';
import { format, parse, isValid } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

const INPUT_CLASSES =
  'py-2.5 px-4 ps-10 pe-10 block w-full border rounded-lg text-sm transition-colors ' +
  'focus:border-spark-primary focus:ring-2 focus:ring-spark-primary focus:outline-none ' +
  'disabled:opacity-50 disabled:pointer-events-none ' +
  'dark:bg-spark-dark-bg dark:text-spark-dark-text dark:border-spark-dark-border ' +
  'bg-gray-50 text-spark-dark border-gray-200';

const CALENDAR_CLASSES = {
  root: 'p-3',
  months: 'flex flex-col sm:flex-row gap-2',
  month_caption: 'flex items-center justify-between mb-2',
  caption_label: 'text-sm font-medium dark:text-spark-dark-text text-spark-dark',
  nav: 'flex items-center gap-1',
  button_previous:
    'size-7 flex items-center justify-center rounded-lg ' +
    'dark:text-spark-dark-text dark:hover:bg-spark-dark-surface text-spark-gray hover:bg-gray-100 ' +
    'transition-colors',
  button_next:
    'size-7 flex items-center justify-center rounded-lg ' +
    'dark:text-spark-dark-text dark:hover:bg-spark-dark-surface text-spark-gray hover:bg-gray-100 ' +
    'transition-colors',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday:
    'w-9 h-9 flex items-center justify-center text-xs font-medium ' +
    'dark:text-spark-dark-text/60 text-spark-gray',
  week: 'flex w-full',
  day:
    'w-9 h-9 flex items-center justify-center text-sm rounded-lg ' +
    'hover:bg-spark-primary/10 hover:text-spark-primary transition-colors cursor-pointer ' +
    'dark:text-spark-dark-text',
  selected:
    'bg-spark-primary text-white hover:bg-spark-primary-hover hover:text-white',
  today:
    'font-bold dark:text-spark-primary text-spark-primary',
  outside: 'opacity-40 pointer-events-none',
  disabled: 'opacity-30 pointer-events-none',
  range_middle:
    'bg-spark-primary/10 dark:text-spark-dark-text text-spark-dark',
};

function CalendarIcon() {
  return (
    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 size-4 dark:text-spark-dark-text/50 text-spark-gray pointer-events-none" />
  );
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  error,
  disabled,
  className = '',
  min,
  max,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const displayDate = parsedDate && isValid(parsedDate) ? format(parsedDate, 'dd/MM/yyyy') : '';

  const minDate = min ? parse(min, 'yyyy-MM-dd', new Date()) : undefined;
  const maxDate = max ? parse(max, 'yyyy-MM-dd', new Date()) : undefined;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(format(date, 'yyyy-MM-dd'));
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-medium dark:text-spark-dark-text text-spark-dark">
          {label}
        </label>
      )}
      <div className="relative">
        <CalendarIcon />
        <input
          type="text"
          readOnly
          value={displayDate}
          placeholder={placeholder}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`${INPUT_CLASSES} ${error ? 'border-red-500 dark:border-red-500/50' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-spark-dark-surface dark:border-spark-dark-border">
          <DayPicker
            mode="single"
            selected={parsedDate && isValid(parsedDate) ? parsedDate : undefined}
            onSelect={handleSelect}
            locale={ptBR}
            startMonth={minDate}
            endMonth={maxDate}
            classNames={CALENDAR_CLASSES}
            components={{
              Chevron: ({ orientation }) => {
                const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
                return <Icon className="size-4" />;
              },
            }}
          />
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
