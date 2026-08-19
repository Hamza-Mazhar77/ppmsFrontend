
import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

export default function CourseCombobox({
  id = 'courseName',
  courses,
  value,          // selected course id
  onChange,       // (course|null) => void
  error,
  disabled,
  placeholder = 'Search or select a course...',
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(
    () => courses.find((course) => course.id === value) || null,
    [courses, value]
  );

  // Keep the visible text in step with the selection made elsewhere (or reset).
  useEffect(() => {
    if (!open) setQuery(selected ? selected.courseName : '');
  }, [selected, open]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter(
      (course) =>
        course.courseName.toLowerCase().includes(term) ||
        course.courseCode.toLowerCase().includes(term)
    );
  }, [courses, query]);

  // Close when focus or a click leaves the component.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const node = listRef.current.children[highlighted];
    node?.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  const select = (course) => {
    onChange(course);
    setQuery(course.courseName);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlighted((current) => {
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        if (next < 0) return Math.max(0, filtered.length - 1);
        if (next >= filtered.length) return 0;
        return next;
      });
      return;
    }
    if (event.key === 'Enter' && open) {
      event.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleBlurCommit = () => {
    // Typing a name that exactly matches a course selects it; anything else
    // clears the selection so an invalid course can never be submitted.
    const term = query.trim().toLowerCase();
    if (!term) {
      onChange(null);
      return;
    }
    const exact = courses.find(
      (course) => course.courseName.toLowerCase() === term || course.courseCode.toLowerCase() === term
    );
    if (exact) {
      select(exact);
    } else if (!selected) {
      onChange(null);
    } else {
      setQuery(selected.courseName);
    }
  };

  return (
    <div className="combobox" ref={containerRef}>
      <div className="input-wrap has-icon">
        <BookOpen size={15} aria-hidden="true" />
        <input
          id={id}
          type="text"
          className={'form-control ' + (error ? 'is-invalid' : '')}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={id + '-listbox'}
          aria-autocomplete="list"
          aria-invalid={error ? 'true' : undefined}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlighted(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => window.setTimeout(handleBlurCommit, 120)}
          style={{ paddingRight: 30 }}
        />
        <ChevronDown
          size={15}
          aria-hidden="true"
          style={{ position: 'absolute', right: 10, left: 'auto', color: 'var(--text-subtle)' }}
        />
      </div>

      {open && (
        <ul className="combobox-list" id={id + '-listbox'} role="listbox" ref={listRef}>
          {filtered.length === 0 && (
            <li className="combobox-empty">No course matches that search.</li>
          )}
          {filtered.map((course, index) => (
            <li key={course.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                className="combobox-option"
                onMouseEnter={() => setHighlighted(index)}
                onMouseDown={(event) => event.preventDefault()} // keep focus for onBlur ordering
                onClick={() => select(course)}
              >
                <span>{course.courseName}</span>
                <span className="code">{course.courseCode}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
