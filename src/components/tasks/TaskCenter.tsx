import React, { useState } from 'react';
import {
  ListTodo,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Ban,
  Plus,
  X,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  Calendar,
  Cpu,
  ArrowRight,
  TrendingUp,
  Trash2,
  Search,
} from 'lucide-react';
import { TaskItem, TaskType, TaskStatus, ActivityLogItem } from '../../types/index.js';

interface TaskCenterProps {
  tasks: TaskItem[];
  activities: ActivityLogItem[];
  onCreateTask: (params: {
    title: string;
    description?: string;
    type?: TaskType;
    schedule?: TaskItem['schedule'];
  }) => Promise<void>;
  onCancelTask: (taskId: string) => Promise<void>;
  onRetryTask: (taskId: string) => Promise<void>;
  onRunTask?: (taskId: string) => Promise<void>;
  onPauseTask?: (taskId: string) => Promise<void>;
  onClearActivities?: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const TaskCenter: React.FC<TaskCenterProps> = ({
  tasks,
  activities,
  onCreateTask,
  onCancelTask,
  onRetryTask,
  onRunTask,
  onPauseTask,
  onClearActivities,
  onRefresh,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('video_summary');
  const [isRecurring, setIsRecurring] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('all');
  const [activitySearch, setActivitySearch] = useState<string>('');

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const runningCount = tasks.filter((t) => t.status === 'running').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;

  const filteredTasks = tasks.filter((t) =>
    filterStatus === 'all'
      ? true
      : filterStatus === 'scheduled'
      ? Boolean(t.schedule?.recurring)
      : t.status === filterStatus
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    await onCreateTask({
      title: title.trim(),
      description: description.trim(),
      type: taskType,
      schedule: isRecurring ? { recurring: true, intervalMinutes } : null,
    });
    setTitle('');
    setDescription('');
    setIsRecurring(false);
    setIsCreateOpen(false);
    await onRefresh();
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'running':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1 animate-pulse">
            <Play className="w-3 h-3" />
            <span>Running</span>
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-[10px] uppercase font-semibold">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-blue-500/20 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
                Autonomous Task Engine
              </span>
              <span className="text-xs text-slate-400">Deterministic & Low Token Footprint</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tasks & Activity Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              VISTA manages scheduled summaries, preference synthesis, and video index jobs with bounded
              retries and user oversight.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
            <span className="text-xs text-slate-400 block">Total Tasks</span>
            <span className="text-xl font-bold text-white">{tasks.length}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
            <span className="text-xs text-slate-400 block">Completed</span>
            <span className="text-xl font-bold text-emerald-400">{completedCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
            <span className="text-xs text-slate-400 block">In Progress</span>
            <span className="text-xl font-bold text-cyan-400">{runningCount + pendingCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
            <span className="text-xs text-slate-400 block">Recoverable / Failed</span>
            <span className="text-xl font-bold text-rose-400">{failedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks List & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tasks */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <ListTodo className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Task Pipeline</span>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              {['all', 'pending', 'running', 'completed', 'failed', 'scheduled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    filterStatus === st
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Task Cards */}
          {filteredTasks.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 text-center text-slate-500 text-xs">
              No tasks found under current filter. Click "Create New Task" to start one!
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col space-y-3 hover:border-cyan-500/30 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{task.title}</span>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 uppercase font-semibold">
                      {task.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full flex items-center space-x-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          task.status === 'completed'
                            ? 'bg-emerald-500'
                            : task.status === 'failed'
                            ? 'bg-rose-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{task.progress}%</span>
                  </div>

                  {/* Footer metadata & actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-mono">
                        Created: {new Date(task.createdAt).toLocaleTimeString()} • Retries: {task.retries}/
                        {task.maxRetries}
                      </span>
                      {task.schedule?.recurring && (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-[10px] text-cyan-300 font-mono">
                          <Calendar className="w-2.5 h-2.5 text-cyan-400" />
                          <span>
                            Repeats every {task.schedule.intervalMinutes}m
                            {task.schedule.nextRun ? ` • Next: ${new Date(task.schedule.nextRun).toLocaleTimeString()}` : ''}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {task.result && (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                        >
                          View Result
                        </button>
                      )}

                      {task.status === 'pending' && onRunTask && (
                        <button
                          onClick={async () => {
                            await onRunTask(task.id);
                            await onRefresh();
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-semibold text-xs border border-emerald-500/40 transition-colors"
                          title="Execute Task Now"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run</span>
                        </button>
                      )}

                      {task.status === 'running' && onPauseTask && (
                        <button
                          onClick={async () => {
                            await onPauseTask(task.id);
                            await onRefresh();
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-semibold text-xs border border-amber-500/40 transition-colors"
                          title="Pause Task"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      )}

                      {(task.status === 'pending' || task.status === 'running') && (
                        <button
                          onClick={async () => {
                            await onCancelTask(task.id);
                            await onRefresh();
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs border border-rose-500/30"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      )}

                      {(task.status === 'failed' || task.status === 'cancelled') &&
                        task.retries < task.maxRetries && (
                          <button
                            onClick={async () => {
                              await onRetryTask(task.id);
                              await onRefresh();
                            }}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-semibold text-xs border border-cyan-500/40"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Activity Timeline ("What VISTA did and why") */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl h-fit">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Activity Timeline</h3>
            </div>
            {onClearActivities && activities.length > 0 && (
              <button
                onClick={async () => {
                  if (window.confirm('Clear all recorded activity audit logs?')) {
                    await onClearActivities();
                    await onRefresh();
                  }
                }}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[10px] font-semibold transition-all"
                title="Clear Audit Logs"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Clear Logs</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-snug">
            Chronological audit of companion actions, task executions, and decisions:
          </p>

          {/* Activity Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
            {[
              { id: 'all', label: 'All', count: activities.length },
              { id: 'task', label: 'Tasks', count: activities.filter((a) => a.category === 'task').length },
              { id: 'memory', label: 'Memory', count: activities.filter((a) => a.category === 'memory').length },
              { id: 'vision', label: 'Vision', count: activities.filter((a) => a.category === 'vision').length },
              { id: 'chat', label: 'Chat', count: activities.filter((a) => a.category === 'chat').length },
              { id: 'privacy', label: 'Privacy', count: activities.filter((a) => a.category === 'privacy').length },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActivityCategoryFilter(cat.id)}
                className={`flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-all ${
                  activityCategoryFilter === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[9px] px-1 rounded-full bg-slate-800 text-slate-300">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Activity Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Search audit actions, details..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all"
            />
            {activitySearch && (
              <button
                onClick={() => setActivitySearch('')}
                className="absolute right-2 p-0.5 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filtered Activity List */}
          {activities.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recorded activity yet.</p>
          ) : (
            (() => {
              const filtered = activities.filter((act) => {
                const matchCat =
                  activityCategoryFilter === 'all' || act.category === activityCategoryFilter;
                const matchSearch =
                  !activitySearch.trim() ||
                  act.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
                  act.details.toLowerCase().includes(activitySearch.toLowerCase());
                return matchCat && matchSearch;
              });

              if (filtered.length === 0) {
                return (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No activities match your current filter.
                  </p>
                );
              }

              return (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                  {filtered.map((act) => {
                    const badgeStyles: Record<string, string> = {
                      task: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                      memory: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                      vision: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                      chat: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                      privacy: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    };

                    return (
                      <div
                        key={act.id}
                        className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col space-y-1.5 text-xs transition-all hover:border-white/10"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white truncate max-w-[180px]">
                            {act.action}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                              badgeStyles[act.category] ||
                              'bg-slate-800 text-slate-300 border-white/10'
                            }`}
                          >
                            {act.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{act.details}</p>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(act.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <ListTodo className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Create New Task</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Generate Weekly Viewing Digest"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Goal</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Summarize watched scenes and update aesthetic preference clusters"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="video_summary">Video Viewing Summary</option>
                  <option value="preference_refresh">Preference & Taste Re-indexing</option>
                  <option value="scene_index">Scene Visual Indexing</option>
                  <option value="custom_agent">Custom Companion Routine</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Enable Recurring Schedule</span>
                  <span className="text-[10px] text-slate-400">Run periodically in background</span>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {isRecurring && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Interval (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(parseInt(e.target.value, 10) || 60)}
                    className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Result Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Task Result: {selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto max-h-60 scrollbar-thin">
              {JSON.stringify(selectedTask.result, null, 2)}
            </pre>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
