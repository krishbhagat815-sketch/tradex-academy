import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ChevronLeft,
  Save,
  PlusCircle,
  Trash2,
  Edit,
  PlayCircle,
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  Layers,
  DollarSign,
  ListPlus,
  HelpCircle,
  X,
  Video,
  Film,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Loader2,
  Paperclip,
  Download
} from 'lucide-react';

export const AdminCourseEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'details' | 'pricing' | 'outcomes' | 'curriculum'>('details');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Metadata categories and instructors
  const [categories, setCategories] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);

  // Course Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner');
  const [duration, setDuration] = useState('10 hours');
  const [language, setLanguage] = useState('English');
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);

  // Pricing & Media
  const [price, setPrice] = useState('99.99');
  const [discountPrice, setDiscountPrice] = useState('49.99');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

  // Dynamic Lists
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [targetAudience, setTargetAudience] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['Web Development']);

  // Curriculum Modules & Lessons
  const [curriculum, setCurriculum] = useState<any[]>([]);

  // Modals for adding module / lesson
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  // Modals for adding / editing lesson
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonMediaType, setLessonMediaType] = useState<'file' | 'url'>('file');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonMediaName, setLessonMediaName] = useState('');
  const [lessonMediaSize, setLessonMediaSize] = useState('');
  const [lessonDuration, setLessonDuration] = useState('12:00');
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [lessonResources, setLessonResources] = useState<any[]>([]);

  // Video upload states
  const [uploadingLessonVideo, setUploadingLessonVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const lessonVideoInputRef = useRef<HTMLInputElement>(null);

  // Course trailer upload state
  const [uploadingCourseTrailer, setUploadingCourseTrailer] = useState(false);
  const courseTrailerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [catRes, instRes] = await Promise.all([
          api.get('/categories'),
          api.get('/instructors')
        ]);

        if (catRes.success) setCategories(catRes.categories);
        if (instRes.success) setInstructors(instRes.instructors);

        if (isEditing) {
          const courseRes = await api.get(`/admin/courses/${id}`);
          if (courseRes.success && courseRes.course) {
            const c = courseRes.course;
            setTitle(c.title || '');
            setSlug(c.slug || '');
            setShortDescription(c.short_description || '');
            setDescription(c.description || '');
            setCategoryId(c.category_id || '');
            setInstructorId(c.instructor_id || '');
            setDifficultyLevel(c.difficulty_level || 'Beginner');
            setDuration(c.duration || '10 hours');
            setLanguage(c.language || 'English');
            setStatus(c.status || 'draft');
            setFeatured(Boolean(c.featured));
            setPopular(Boolean(c.popular));
            setPrice(String(c.price || '0'));
            setDiscountPrice(c.discount_price != null ? String(c.discount_price) : '');
            setThumbnail(c.thumbnail || '');
            setPreviewVideoUrl(c.preview_video_url || '');

            if (c.learning_outcomes && c.learning_outcomes.length > 0) setLearningOutcomes(c.learning_outcomes);
            if (c.requirements && c.requirements.length > 0) setRequirements(c.requirements);
            if (c.target_audience && c.target_audience.length > 0) setTargetAudience(c.target_audience);
            if (c.tags && c.tags.length > 0) setTags(c.tags);
            if (c.curriculum) setCurriculum(c.curriculum);
          }
        } else {
          if (catRes.categories?.[0]) setCategoryId(catRes.categories[0].id);
          if (instRes.instructors?.[0]) setInstructorId(instRes.instructors[0].id);
        }
      } catch (err) {
        console.error('Failed to load course details for editing:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [id, isEditing]);

  // File Upload Helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData);
      if (res.success && res.url) {
        setter(res.url);
      }
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    }
  };

  // Save Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Course title is required');
      return;
    }

    setSaving(true);
    setSaveSuccess(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      short_description: shortDescription.trim(),
      description: description.trim(),
      category_id: categoryId,
      instructor_id: instructorId,
      difficulty_level: difficultyLevel,
      duration: duration.trim(),
      language: language.trim(),
      status,
      featured: featured ? 1 : 0,
      popular: popular ? 1 : 0,
      price: Number(price || 0),
      discount_price: discountPrice ? Number(discountPrice) : null,
      thumbnail: thumbnail.trim(),
      preview_video_url: previewVideoUrl.trim(),
      learning_outcomes: learningOutcomes.filter(Boolean),
      requirements: requirements.filter(Boolean),
      target_audience: targetAudience.filter(Boolean),
      tags: tags.filter(Boolean)
    };

    try {
      if (isEditing) {
        const res = await api.put(`/admin/courses/${id}`, payload);
        if (res.success) {
          setSaveSuccess('Course changes saved successfully!');
          setTimeout(() => setSaveSuccess(null), 3000);
        }
      } else {
        const res = await api.post('/admin/courses', payload);
        if (res.success && res.courseId) {
          navigate(`/courses/${res.courseId}/edit`);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  // Add Module
  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim() || !id) return;

    try {
      const res = await api.post(`/admin/courses/${id}/modules`, {
        title: moduleTitle.trim(),
        description: moduleDesc.trim()
      });

      if (res.success && res.module) {
        setCurriculum(prev => [...prev, { ...res.module, lessons: [] }]);
        setModuleTitle('');
        setModuleDesc('');
        setShowAddModuleModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add module');
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await api.delete(`/admin/modules/${moduleId}`);
      setCurriculum(prev => prev.filter(m => m.id !== moduleId));
    } catch (err) {
      console.error(err);
    }
  };

  // Open Add Lesson Modal
  const openAddLessonModal = (moduleId: string) => {
    setEditingLessonId(null);
    setTargetModuleId(moduleId);
    setLessonTitle('');
    setLessonDesc('');
    setLessonMediaType('file');
    setLessonVideoUrl('');
    setLessonMediaName('');
    setLessonMediaSize('');
    setLessonDuration('12:00');
    setLessonIsPreview(false);
    setLessonResources([]);
    setUploadError(null);
    setShowLessonModal(true);
  };

  // Open Edit Lesson Modal
  const openEditLessonModal = (moduleId: string, lsn: any) => {
    setEditingLessonId(lsn.id);
    setTargetModuleId(moduleId);
    setLessonTitle(lsn.title || '');
    setLessonDesc(lsn.description || '');
    const isLocalFile = lsn.media_type === 'file' || (lsn.video_url && lsn.video_url.startsWith('/uploads/'));
    setLessonMediaType(isLocalFile ? 'file' : 'url');
    setLessonVideoUrl(lsn.video_url || '');
    setLessonMediaName(lsn.media_name || (isLocalFile ? lsn.video_url?.split('/').pop() : ''));
    setLessonMediaSize(lsn.media_size || '');
    setLessonDuration(lsn.video_duration || '12:00');
    setLessonIsPreview(Boolean(lsn.is_preview));
    setLessonResources(lsn.resources || []);
    setUploadError(null);
    setShowLessonModal(true);
  };

  // Upload Lesson Video Handler
  const handleLessonVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLessonVideo(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData);
      if (res.success && res.url) {
        setLessonVideoUrl(res.url);
        setLessonMediaType('file');
        setLessonMediaName(res.original_name || file.name);
        setLessonMediaSize(res.formatted_size || `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      } else {
        setUploadError(res.message || 'Video upload failed.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload video file.');
    } finally {
      setUploadingLessonVideo(false);
      if (lessonVideoInputRef.current) {
        lessonVideoInputRef.current.value = '';
      }
    }
  };

  // Upload Course Trailer Handler
  const handleCourseTrailerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCourseTrailer(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData);
      if (res.success && res.url) {
        setPreviewVideoUrl(res.url);
      } else {
        alert(res.message || 'Video upload failed');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload preview trailer');
    } finally {
      setUploadingCourseTrailer(false);
      if (courseTrailerInputRef.current) {
        courseTrailerInputRef.current.value = '';
      }
    }
  };

  // Save Lesson (Add or Edit)
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !targetModuleId) return;

    const finalVideoUrl = lessonVideoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    const payload = {
      title: lessonTitle.trim(),
      description: lessonDesc.trim(),
      video_url: finalVideoUrl,
      media_type: lessonMediaType,
      media_name: lessonMediaName || null,
      media_size: lessonMediaSize || null,
      video_duration: lessonDuration.trim() || '12:00',
      is_preview: lessonIsPreview ? 1 : 0,
      resources: lessonResources
    };

    try {
      if (editingLessonId) {
        const res = await api.put(`/admin/lessons/${editingLessonId}`, payload);
        if (res.success) {
          setCurriculum(prev =>
            prev.map(m =>
              m.id === targetModuleId
                ? {
                    ...m,
                    lessons: m.lessons.map((l: any) =>
                      l.id === editingLessonId
                        ? { ...l, ...payload, id: editingLessonId, module_id: targetModuleId }
                        : l
                    )
                  }
                : m
            )
          );
          setShowLessonModal(false);
        }
      } else {
        const res = await api.post(`/admin/modules/${targetModuleId}/lessons`, payload);
        if (res.success && res.lessonId) {
          const newLesson = {
            id: res.lessonId,
            module_id: targetModuleId,
            ...payload,
            quizzes: []
          };

          setCurriculum(prev =>
            prev.map(m =>
              m.id === targetModuleId
                ? { ...m, lessons: [...(m.lessons || []), newLesson] }
                : m
            )
          );
          setShowLessonModal(false);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save lesson');
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      setCurriculum(prev =>
        prev.map(m =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l: any) => l.id !== lessonId) }
            : m
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading course configuration...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
              {isEditing ? 'Editing Course' : 'New Curriculum Draft'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {title || 'Untitled Course Masterclass'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-brand-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {saveSuccess}
            </span>
          )}
          <button
            onClick={handleSaveCourse}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Course'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'details'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Basic Details</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'pricing'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Pricing & Media</span>
        </button>

        <button
          onClick={() => setActiveTab('outcomes')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'outcomes'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ListPlus className="w-4 h-4" />
          <span>Outcomes & Audience</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'curriculum'
              ? 'bg-brand-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Curriculum Builder ({curriculum.length} modules)</span>
        </button>
      </div>

      {/* Tab 1: Basic Details */}
      {activeTab === 'details' && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Data Analytics & BI Masterclass"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Assigned Lead Instructor
              </label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white font-medium"
              >
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.title})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Short Pitch / Subtitle
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Catchy 1-2 sentence overview for course cards and banners"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Detailed Description (Supports Markdown)
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive curriculum breakdown, practical drills, deliverables, and projects..."
              className="w-full p-4 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="24.5 hours"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white font-bold"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft (Private)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing & Media */}
      {activeTab === 'pricing' && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Regular Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Discounted / Sale Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Leave blank for regular price"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white"
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Course Thumbnail Image
            </label>
            <div className="flex gap-4 items-center">
              <img
                src={thumbnail}
                alt="Preview"
                className="w-28 h-18 rounded-xl object-cover border border-slate-750 bg-black flex-shrink-0"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://image-url..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Local Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setThumbnail)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Preview Video */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Official Trailer / Preview Video (URL or Upload)
              </label>
              <div>
                <input
                  ref={courseTrailerInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleCourseTrailerUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => courseTrailerInputRef.current?.click()}
                  disabled={uploadingCourseTrailer}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-brand-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingCourseTrailer ? 'Uploading...' : 'Upload Video File'}</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={previewVideoUrl}
              onChange={(e) => setPreviewVideoUrl(e.target.value)}
              placeholder="https://video-url.mp4 or /uploads/..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white font-mono"
            />
            {previewVideoUrl && (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-52 border border-slate-800">
                <video
                  key={previewVideoUrl}
                  src={previewVideoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Outcomes & Audience */}
      {activeTab === 'outcomes' && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-8 max-w-4xl">
          {/* Learning Outcomes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-400">
                What You'll Learn (Outcomes)
              </label>
              <button
                type="button"
                onClick={() => setLearningOutcomes(prev => [...prev, ''])}
                className="text-xs text-brand-400 font-semibold hover:underline"
              >
                + Add Item
              </button>
            </div>
            {learningOutcomes.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...learningOutcomes];
                    next[idx] = e.target.value;
                    setLearningOutcomes(next);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setLearningOutcomes(prev => prev.filter((_, i) => i !== idx))}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Prerequisites & Requirements
              </label>
              <button
                type="button"
                onClick={() => setRequirements(prev => [...prev, ''])}
                className="text-xs text-cyan-400 font-semibold hover:underline"
              >
                + Add Item
              </button>
            </div>
            {requirements.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...requirements];
                    next[idx] = e.target.value;
                    setRequirements(next);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setRequirements(prev => prev.filter((_, i) => i !== idx))}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Curriculum Builder */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6 max-w-4xl">
          {!isEditing ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-sm text-slate-300">
                Please click <strong>"Save Course"</strong> above to initialize the course before adding curriculum modules and lessons.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Course Modules & Lessons</h3>
                  <p className="text-xs text-slate-400">Build interactive lectures, video streams, resources, and quizzes</p>
                </div>
                <button
                  onClick={() => setShowAddModuleModal(true)}
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Module</span>
                </button>
              </div>

              {/* Modules List */}
              <div className="space-y-4">
                {curriculum.map((mod) => (
                  <div key={mod.id} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                    <div className="p-4 bg-slate-850 flex items-center justify-between border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                        {mod.description && <p className="text-xs text-slate-400">{mod.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openAddLessonModal(mod.id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add Lesson</span>
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons list under this module */}
                    <div className="divide-y divide-slate-800/60 p-2">
                      {mod.lessons?.map((lsn: any) => (
                        <div key={lsn.id} className="p-3 flex items-center justify-between hover:bg-slate-850/50 rounded-xl transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <PlayCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-white truncate">{lsn.title}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>{lsn.video_duration || '12:00'}</span>
                                <span>•</span>
                                {lsn.media_type === 'file' || (lsn.video_url && lsn.video_url.startsWith('/uploads/')) ? (
                                  <span className="text-teal-400 font-semibold flex items-center gap-0.5">
                                    <Film className="w-2.5 h-2.5" /> Uploaded File
                                  </span>
                                ) : (
                                  <span className="text-sky-400 font-semibold flex items-center gap-0.5">
                                    <LinkIcon className="w-2.5 h-2.5" /> URL Stream
                                  </span>
                                )}
                                <span>•</span>
                                {lsn.is_preview ? (
                                  <span className="text-amber-400 font-bold">PREVIEWABLE</span>
                                ) : (
                                  <span className="text-slate-500">PAID ACCESS</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditLessonModal(mod.id, lsn)}
                              className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit Lesson & Video"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(mod.id, lsn.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!mod.lessons || mod.lessons.length === 0) && (
                        <p className="text-xs text-slate-500 italic p-3">No lessons created yet in this module.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleAddModule} className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Curriculum Module</h3>
              <button type="button" onClick={() => setShowAddModuleModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Module Title *</label>
              <input
                type="text"
                required
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Module 1: Foundational Architecture"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
              <input
                type="text"
                value={moduleDesc}
                onChange={(e) => setModuleDesc(e.target.value)}
                placeholder="What this module covers"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModuleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
              >
                Create Module
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleSaveLesson}
            className="w-full max-w-xl p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-750 space-y-5 shadow-2xl my-8 animate-in fade-in duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload your own video media file or enter a video stream URL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Field 1: Lesson Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Lesson Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. 1.1 Transformer Architecture Explained"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Field 2: Media Source Selector (Upload File vs Stream URL) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-300">
                Lesson Video Source <span className="text-rose-400">*</span>
              </label>

              {/* Source Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLessonMediaType('file')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    lessonMediaType === 'file'
                      ? 'bg-brand-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Media File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLessonMediaType('url')}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    lessonMediaType === 'url'
                      ? 'bg-brand-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Video Stream URL</span>
                </button>
              </div>

              {/* Option A: Upload Media File */}
              {lessonMediaType === 'file' && (
                <div className="space-y-3">
                  <input
                    ref={lessonVideoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*,audio/*"
                    onChange={handleLessonVideoUpload}
                    className="hidden"
                  />

                  {uploadingLessonVideo ? (
                    <div className="p-8 rounded-xl border border-dashed border-brand-500/50 bg-brand-500/5 flex flex-col items-center justify-center text-center space-y-2">
                      <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                      <p className="text-xs font-bold text-white">Uploading video file to server...</p>
                      <p className="text-[11px] text-slate-400">Please wait while your media is securely processed.</p>
                    </div>
                  ) : lessonVideoUrl && (lessonVideoUrl.startsWith('/uploads/') || lessonMediaType === 'file') ? (
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                            <Film className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white truncate max-w-xs">
                                {lessonMediaName || lessonVideoUrl.split('/').pop()}
                              </p>
                              {lessonMediaSize && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono flex-shrink-0">
                                  {lessonMediaSize}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Video ready for students
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => lessonVideoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Replace File</span>
                        </button>
                      </div>

                      {/* Video Player Preview */}
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 border border-slate-800">
                        <video
                          key={lessonVideoUrl}
                          src={lessonVideoUrl}
                          controls
                          className="w-full h-full object-contain"
                          onLoadedMetadata={(e) => {
                            const dur = (e.target as HTMLVideoElement).duration;
                            if (dur && !isNaN(dur) && (!lessonDuration || lessonDuration === '12:00')) {
                              const mins = Math.floor(dur / 60);
                              const secs = Math.floor(dur % 60);
                              setLessonDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => lessonVideoInputRef.current?.click()}
                      className="p-6 rounded-xl border-2 border-dashed border-slate-750 hover:border-brand-500/60 bg-slate-950/60 hover:bg-slate-950 cursor-pointer flex flex-col items-center justify-center text-center space-y-2 transition-all group"
                    >
                      <div className="p-3 rounded-full bg-slate-850 group-hover:bg-brand-500/10 text-slate-400 group-hover:text-brand-400 transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                          Click to browse or drop your video file here
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supports MP4, WebM, MOV, MKV, MP3 (Up to 1 GB)
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                    </p>
                  )}
                </div>
              )}

              {/* Option B: Video Stream URL */}
              {lessonMediaType === 'url' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/... or https://youtube.com/..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Supports: Direct MP4, YouTube, Vimeo, Cloud Storage streams</span>
                    <button
                      type="button"
                      onClick={() => setLessonVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                      className="text-brand-400 hover:underline font-semibold"
                    >
                      Paste Sample MP4
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Field 3: Duration & Free Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Lesson Duration
                </label>
                <input
                  type="text"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  placeholder="14:30"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:pt-6">
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={lessonIsPreview}
                    onChange={(e) => setLessonIsPreview(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-slate-750"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Allow Free Preview</span>
                    <span className="text-[10px] text-slate-400 block">Students can sample without purchasing</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingLessonVideo}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {uploadingLessonVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>{editingLessonId ? 'Save Changes' : 'Add Lesson'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
