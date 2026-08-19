/**
 * Upload Paper 
 * The important behaviour here is what the student does NOT type:
 *  - Course Code is filled from the selected course and is read-only.
 *  - Semester is filled from the course when the catalogue defines one.
 *  - Program and College come from the signed-in student's profile
 * The form only ever submits the course id, year, semester and paper type. The
 * server re-derives everything else, so a tampered request cannot file a paper
 * under a different course code, college or program.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Info, GraduationCap, Building2, Hash, CalendarDays } from 'lucide-react';
import { Field, SelectInput, AutoFilledField } from '../../components/FormField';
import CourseCombobox from '../../components/CourseCombobox';
import FileDropzone from '../../components/FileDropzone';
import { LoadingState, ErrorState } from '../../components/States';
import useCatalogOptions from '../../hooks/useCatalogOptions';
import { catalogApi, paperApi } from '../../services/ppms.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Kept in step with MAX_PDF_SIZE_MB on the server; the server is authoritative.
const MAX_PDF_SIZE_MB = Number(import.meta.env.VITE_MAX_PDF_SIZE_MB) || 10;

export default function UploadPaperPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { options, loading: loadingOptions } = useCatalogOptions();

  const [courses, setCourses] = useState([]);
  const [coursesError, setCoursesError] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [paperType, setPaperType] = useState('Midterm');
  const [courseId, setCourseId] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [semester, setSemester] = useState('');
  const [file, setFile] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load the course catalogue once - it drives the name -> code resolution.
  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getCourses()
      .then((response) => {
        if (!cancelled) setCourses(response.data);
      })
      .catch((apiError) => {
        if (!cancelled) setCoursesError(apiError.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingCourses(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === courseId) || null,
    [courses, courseId]
  );

  // A course that declares a semester locks the field (Figure 8 shows it greyed).
  const semesterIsAutoFilled = Boolean(selectedCourse?.semester);
  const effectiveSemester = semesterIsAutoFilled ? selectedCourse.semester : semester;

  const handleCourseChange = (course) => {
    setCourseId(course ? course.id : '');
    setFieldErrors((current) => ({ ...current, courseId: '' }));
    // Adopt the course's semester immediately so the field is never stale.
    if (course?.semester) setSemester(course.semester);
  };

  const validate = () => {
    const errors = {};
    if (!courseId) errors.courseId = 'Please select a valid course from the list.';
    if (!year) errors.year = 'Please select the examination year.';
    if (!effectiveSemester) errors.semester = 'Please select a semester.';
    if (!paperType) errors.paperType = 'Please select a paper type.';
    if (!file) errors.file = 'Please attach the past paper as a PDF file.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('year', year);
    formData.append('semester', effectiveSemester);
    formData.append('paperType', paperType);
    formData.append('file', file);

    setSubmitting(true);
    setProgress(0);
    try {
      const response = await paperApi.upload(formData, (event2) => {
        if (event2.total) setProgress(Math.round((event2.loaded * 100) / event2.total));
      });
      toast.success(response.message);
      navigate('/dashboard/upload-history');
    } catch (apiError) {
      setFormError(apiError.message);
      setFieldErrors(apiError.fieldErrors || {});
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  if (loadingOptions || loadingCourses) {
    return (
      <div className="card">
        <LoadingState label="Loading the course catalogue..." />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="card">
        <ErrorState title="Unable to load courses" message={coursesError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="upload-layout">
      <header className="page-header">
        <div>
          <h1 className="page-title">Upload Past Paper</h1>
          <p className="page-subtitle">Contribute an examination paper to the PPMS repository</p>
        </div>
      </header>

      <div className="alert alert-warning">
        <Info size={15} aria-hidden="true" />
        <span>Your uploaded paper will remain pending until approved by the administrator.</span>
      </div>

      {formError && (
        <div className="alert alert-danger" role="alert">
          <span>{formError}</span>
        </div>
      )}

      <form className="card" onSubmit={submit} noValidate>
        <div className="card-body stack gap-4">
          <Field id="paperType" label="Paper Type" required error={fieldErrors.paperType}>
            <SelectInput
              id="paperType"
              value={paperType}
              onChange={(event) => setPaperType(event.target.value)}
              error={fieldErrors.paperType}
            >
              {(options?.paperTypes || []).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </SelectInput>
          </Field>

          <div className="form-grid">
            <Field
              id="courseName"
              label="Course Name"
              required
              error={fieldErrors.courseId}
              hint="Type to search, or pick from the list. The course code fills in automatically."
            >
              <CourseCombobox
                id="courseName"
                courses={courses}
                value={courseId}
                onChange={handleCourseChange}
                error={fieldErrors.courseId}
                disabled={submitting}
              />
            </Field>

            <AutoFilledField
              id="courseCode"
              label="Course Code"
              value={selectedCourse?.courseCode || ''}
              placeholder="Select a course first"
              icon={Hash}
            />
          </div>

          <div className="form-grid">
            <Field id="year" label="Year" required error={fieldErrors.year}>
              <SelectInput
                id="year"
                icon={CalendarDays}
                value={year}
                onChange={(event) => setYear(event.target.value)}
                error={fieldErrors.year}
              >
                <option value="">Select year</option>
                {(options?.years || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectInput>
            </Field>

            {semesterIsAutoFilled ? (
              <AutoFilledField id="semester" label="Semester" value={selectedCourse.semester} />
            ) : (
              <Field
                id="semester"
                label="Semester"
                required
                error={fieldErrors.semester}
                hint="This course has no default semester, so please choose one."
              >
                <SelectInput
                  id="semester"
                  value={semester}
                  onChange={(event) => setSemester(event.target.value)}
                  error={fieldErrors.semester}
                >
                  <option value="">Select semester</option>
                  {(options?.semesters || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            )}
          </div>

          <div className="form-grid">
            <AutoFilledField id="program" label="Program" value={user?.programName} icon={GraduationCap} />
            <AutoFilledField id="college" label="College Name" value={user?.collegeName} icon={Building2} />
          </div>

          <FileDropzone
            file={file}
            onChange={(next) => {
              setFile(next);
              setFieldErrors((current) => ({ ...current, file: '' }));
            }}
            maxSizeMb={MAX_PDF_SIZE_MB}
            error={fieldErrors.file}
            disabled={submitting}
          />

          {submitting && progress > 0 && (
            <div>
              <div className="skeleton" style={{ height: 6, background: 'var(--grey-200)' }} aria-hidden="true">
                <div
                  style={{
                    width: progress + '%',
                    height: '100%',
                    background: 'var(--primary)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'width 120ms ease',
                  }}
                />
              </div>
              <p className="form-hint" role="status">
                Uploading... {progress}%
              </p>
            </div>
          )}
        </div>

        <div className="card-footer row-between wrap gap-3">
          <p className="text-xs" style={{ color: 'var(--warning-text)' }}>
            Your uploaded paper will remain pending until approved by the administrator.
          </p>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={15} />
                Submit for review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
