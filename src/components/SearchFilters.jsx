/**
 * Search header, keyword box and filter panel
 * A blue icon tile with the "Search Past Papers" title, a wide keyword input
 * with a Clear affordance, then the seven filter controls in a grid with a
 * Reset Filters action. The dropdown contents come from /api/catalog/options,
 * so adding a college or program never requires a code change here.
 */
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Field, TextInput, SelectInput } from './FormField';

export const EMPTY_FILTERS = {
  q: '',
  courseName: '',
  courseCode: '',
  semester: '',
  year: '',
  paperType: '',
  program: '',
  college: '',
};

export default function SearchFilters({ filters, onChange, onReset, options, subtitle }) {
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="card">
      <div className="card-body">
        <div className="search-head">
          <span className="search-mark" aria-hidden="true">
            <Search size={20} />
          </span>
          <div>
            <h1 className="search-title">Search Past Papers</h1>
            <p className="search-sub">
              {subtitle || 'Quaid-i-Azam University Islamabad & Affiliated Colleges Past Examination Repository'}
            </p>
          </div>
        </div>

        <div className="search-bar">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            className="search-input"
            value={filters.q}
            onChange={set('q')}
            placeholder="Search by course name, course code, college or program..."
            aria-label="Search past papers"
          />
          {filters.q && (
            <button type="button" className="search-clear" onClick={() => onChange({ ...filters, q: '' })}>
              Clear
            </button>
          )}
        </div>

        <div className="filter-panel">
          <div className="filter-panel-head">
            <span className="filter-panel-title">
              <Filter size={14} aria-hidden="true" />
              Filter Criteria:
            </span>
            <button type="button" className="btn btn-link text-sm" onClick={onReset} disabled={!hasFilters}>
              <RotateCcw size={13} />
              Reset Filters
            </button>
          </div>

          <div className="filter-grid">
            <Field id="filter-courseName" label="Course Name">
              <TextInput
                id="filter-courseName"
                value={filters.courseName}
                onChange={set('courseName')}
                placeholder="e.g. Operating Systems"
              />
            </Field>

            <Field id="filter-courseCode" label="Course Code">
              <TextInput
                id="filter-courseCode"
                value={filters.courseCode}
                onChange={set('courseCode')}
                placeholder="e.g. CS-223"
              />
            </Field>

            <Field id="filter-semester" label="Semester">
              <SelectInput id="filter-semester" value={filters.semester} onChange={set('semester')}>
                <option value="">All Semesters</option>
                {(options?.semesters || []).map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field id="filter-year" label="Year">
              <SelectInput id="filter-year" value={filters.year} onChange={set('year')}>
                <option value="">All Years</option>
                {(options?.years || []).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field id="filter-paperType" label="Paper Type">
              <SelectInput id="filter-paperType" value={filters.paperType} onChange={set('paperType')}>
                <option value="">All Types</option>
                {(options?.paperTypes || []).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>

          <div className="filter-grid filter-grid-wide">
            <Field id="filter-program" label="Degree Program">
              <SelectInput id="filter-program" value={filters.program} onChange={set('program')}>
                <option value="">All Degree Programs</option>
                {(options?.programs || []).map((program) => (
                  <option key={program.id} value={program.name}>
                    {program.name}
                    {program.code ? ' (' + program.code + ')' : ''}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field id="filter-college" label="College Name">
              <SelectInput id="filter-college" value={filters.college} onChange={set('college')}>
                <option value="">All Affiliated Colleges</option>
                {(options?.colleges || []).map((college) => (
                  <option key={college.id} value={college.name}>
                    {college.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
