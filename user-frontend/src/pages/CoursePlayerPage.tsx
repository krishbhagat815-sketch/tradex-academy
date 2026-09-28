import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Download,
  FileText,
  Award,
  Sparkles,
  BookOpen,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Check,
  Menu,
  X
} from 'lucide-react';
import { UniversalVideoPlayer } from '../components/common/UniversalVideoPlayer';

export const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tab under video: 'overview' | 'resources' | 'quiz' | 'notes'
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'quiz' | 'notes'>('overview');

  // Notes state
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedMsg, setNoteSavedMsg] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Completion modal state
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/learn/${courseId}`);
      return;
    }

    async function loadPlayerData() {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${courseId}/learn`);
        if (res.success) {
          setCourse(res.course);
          setCurriculum(res.curriculum);
          setCertificate(res.certificate);

          const completed = new Set<string>(res.completed_lesson_ids || []);
          setCompletedLessonIds(completed);
          setProgressPercent(Math.round(Number(res.enrollment?.progress_percent || 0)));

          // Find initial lesson (either last_lesson_id or first lesson)
          let targetLesson: any = null;
          const allLessons: any[] = [];
          res.curriculum.forEach((m: any) => {
            m.lessons.forEach((l: any) => allLessons.push(l));
          });

          if (res.enrollment?.last_lesson_id) {
            targetLesson = allLessons.find(l => l.id === res.enrollment.last_lesson_id);
          }
          if (!targetLesson && allLessons.length > 0) {
            targetLesson = allLessons[0];
          }

          if (targetLesson) {
            setCurrentLesson(targetLesson);
            setNoteContent(targetLesson.note || '');
          }
        } else {
          alert(res.message || 'Access denied');
          navigate(`/course/${courseId}`);
        }
      } catch (err: any) {
        console.error('Player load error:', err);
        alert(err.message || 'Failed to load course player');
        navigate(`/course/${courseId}`);
      } finally {
        setLoading(false);
      }
    }

    loadPlayerData();
  }, [courseId, user, navigate]);

  // When changing lesson, reset quiz & note
  const handleSelectLesson = (lesson: any) => {
    setCurrentLesson(lesson);
    setNoteContent(lesson.note || '');
    setQuizAnswers({});
    setQuizSubmitted(false);

    // scroll video into view on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Toggle mark completed
  const handleToggleComplete = async () => {
    if (!currentLesson) return;

    const isCurrentlyCompleted = completedLessonIds.has(currentLesson.id);
    const newCompleted = !isCurrentlyCompleted;

    try {
      const res = await api.post('/student/progress', {
        courseId,
        lessonId: currentLesson.id,
        completed: newCompleted
      });

      if (res.success) {
        const nextSet = new Set(completedLessonIds);
        if (newCompleted) {
          nextSet.add(currentLesson.id);
        } else {
          nextSet.delete(currentLesson.id);
        }
        setCompletedLessonIds(nextSet);
        setProgressPercent(res.progress_percent);

        if (res.certificate) {
          setCertificate(res.certificate);
        }

        if (res.is_completed && !isCurrentlyCompleted) {
          try {
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });
          } catch {}
          setShowCelebrationModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  // Save student note
  const handleSaveNote = async () => {
    if (!currentLesson) return;
    setSavingNote(true);
    try {
      await api.post('/student/notes', {
        courseId,
        lessonId: currentLesson.id,
        content: noteContent
      });
      setNoteSavedMsg(true);
      setTimeout(() => setNoteSavedMsg(false), 2000);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Flattened lessons list for prev/next
  const allLessons: any[] = [];
  curriculum.forEach(m => {
    m.lessons.forEach((l: any) => allLessons.push(l));
  });

  const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Learning Environment...</p>
        </div>
      </div>
    );
  }

  const isCurrentLessonCompleted = currentLesson ? completedLessonIds.has(currentLesson.id) : false;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-200">
      {/* Top Learning Navigation Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
              {course?.title}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              Lesson: {currentLesson?.title}
            </p>
          </div>
        </div>

        {/* Center/Right Progress and Controls */}
        <div className="flex items-center gap-4">
          {/* Progress Bar Widget */}
          <div className="hidden md:flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Progress</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-white font-mono">{progressPercent}%</span>
          </div>

          {/* Mark Complete Toggle Button */}
          <button
            onClick={handleToggleComplete}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isCurrentLessonCompleted
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40 hover:bg-brand-500/30'
                : 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-md shadow-brand-500/20'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isCurrentLessonCompleted ? 'Completed' : 'Mark Completed'}</span>
          </button>

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Toggle Curriculum Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Player & Tab Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Video Container */}
          <div className="w-full bg-black aspect-video max-h-[70vh] flex items-center justify-center relative shadow-2xl">
            <UniversalVideoPlayer
              key={currentLesson?.id}
              url={currentLesson?.video_url}
            />
          </div>

          {/* Next / Previous Bar */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <button
              onClick={() => prevLesson && handleSelectLesson(prevLesson)}
              disabled={!prevLesson}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Lesson</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Lesson {currentIndex + 1} of {allLessons.length}
            </span>

            <button
              onClick={() => nextLesson && handleSelectLesson(nextLesson)}
              disabled={!nextLesson}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lesson Details & Interactive Tabs */}
          <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white">{currentLesson?.title}</h1>
              <p className="text-xs text-slate-400 mt-1">Duration: {currentLesson?.video_duration}</p>
            </div>

            {/* Tab navigation buttons */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 pb-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'text-brand-400 border-b-2 border-brand-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('resources')}
                className={`flex items-center gap-1.5 pb-2 transition-colors ${
                  activeTab === 'resources'
                    ? 'text-brand-400 border-b-2 border-brand-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Downloads ({currentLesson?.resources?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-1.5 pb-2 transition-colors ${
                  activeTab === 'quiz'
                    ? 'text-brand-400 border-b-2 border-brand-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Quiz ({currentLesson?.quizzes?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 pb-2 transition-colors ${
                  activeTab === 'notes'
                    ? 'text-brand-400 border-b-2 border-brand-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Notes</span>
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>{currentLesson?.description || 'No specific description provided for this lesson.'}</p>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Key Takeaways</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                    <li>Pay attention to architectural trade-offs discussed in the lecture</li>
                    <li>Refer to downloadable companion files for production snippets</li>
                    <li>Complete the interactive quiz to validate your understanding</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Downloads & Resources */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                {currentLesson?.resources && currentLesson.resources.length > 0 ? (
                  currentLesson.resources.map((res: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-brand-400" />
                        <div>
                          <h5 className="text-sm font-bold text-white">{res.name}</h5>
                          <span className="text-xs text-slate-400 font-mono">{res.size || 'Attachment'}</span>
                        </div>
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 font-semibold text-xs flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No supplementary files attached to this specific lesson.</p>
                )}
              </div>
            )}

            {/* Tab 3: Interactive Quiz */}
            {activeTab === 'quiz' && (
              <div className="space-y-6">
                {currentLesson?.quizzes && currentLesson.quizzes.length > 0 ? (
                  currentLesson.quizzes.map((q: any, qIdx: number) => {
                    const selected = quizAnswers[qIdx];
                    const isCorrect = quizSubmitted && selected === q.correct_index;
                    return (
                      <div key={qIdx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <h4 className="text-base font-bold text-white">
                          Question {qIdx + 1}: {q.question}
                        </h4>
                        <div className="space-y-2">
                          {q.options?.map((opt: string, optIdx: number) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!quizSubmitted) {
                                  setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                }
                              }}
                              className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                                selected === optIdx
                                  ? 'border-brand-500 bg-brand-500/10 text-white'
                                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-850'
                              } ${
                                quizSubmitted && optIdx === q.correct_index
                                  ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold'
                                  : ''
                              } ${
                                quizSubmitted && selected === optIdx && optIdx !== q.correct_index
                                  ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                  : ''
                              }`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correct_index && (
                                <Check className="w-4 h-4 text-emerald-400" />
                              )}
                            </button>
                          ))}
                        </div>

                        {quizSubmitted && q.explanation && (
                          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                            <span className="font-bold text-brand-400">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 italic">No quiz questions for this lesson. Proceed with your learning!</p>
                )}

                {currentLesson?.quizzes && currentLesson.quizzes.length > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Submit Quiz Answers
                    </button>
                    {quizSubmitted && (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry Quiz</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Student Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Personal notes for this lesson:</span>
                  {noteSavedMsg && (
                    <span className="text-xs text-brand-400 font-bold animate-in fade-in">Note saved!</span>
                  )}
                </div>
                <textarea
                  rows={6}
                  placeholder="Jot down formulas, code notes, ideas, and lecture insights here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-750 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                >
                  {savingNote ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Modules Sidebar */}
        <div
          className={`w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300 absolute md:static right-0 top-0 bottom-0 z-20 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full md:hidden'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-400" />
              Course Curriculum
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {completedLessonIds.size} / {allLessons.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {curriculum.map((m: any, mIdx: number) => (
              <div key={m.id} className="py-2">
                <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {m.title}
                </div>
                <div className="space-y-0.5">
                  {m.lessons?.map((lsn: any) => {
                    const isSelected = lsn.id === currentLesson?.id;
                    const isDone = completedLessonIds.has(lsn.id);
                    return (
                      <button
                        key={lsn.id}
                        onClick={() => handleSelectLesson(lsn)}
                        className={`w-full px-4 py-3 text-left text-xs transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-brand-500/10 text-brand-300 border-l-4 border-brand-500 font-bold'
                            : 'hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-brand-400 fill-brand-400/20" />
                          ) : (
                            <PlayCircle className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 leading-snug">{lsn.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{lsn.video_duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Certificate footer status if unlocked */}
          {certificate && (
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <Link
                to="/dashboard?tab=certificates"
                className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>Certificate Unlocked! View</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Course Completion Celebration Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-brand-500/50 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-brand-500/10">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">100% Completed</span>
            <h3 className="text-2xl font-extrabold text-white mt-1">Outstanding Achievement!</h3>
            <p className="mt-2 text-sm text-slate-300">
              You have completed every module and practical drill in <span className="font-bold text-white">{course?.title}</span>.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Your official Certificate of Completion has been generated with a verifiable cryptographic ID.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/dashboard?tab=certificates"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs"
              >
                View & Download Certificate
              </Link>
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Continue Reviewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
