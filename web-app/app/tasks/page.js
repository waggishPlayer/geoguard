'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import Card from '../../components/Card'
import { useRequireRole } from '../../hooks/useRoles'
import { tasksService } from '../../services/tasks'

const STATUS_FILTERS = ['all', 'pending', 'in_progress', 'completed']

export default function TasksPage() {
  const { hasAccess } = useRequireRole(['field_worker', 'site_admin', 'super_admin'])
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskDetail, setTaskDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusUpdate, setStatusUpdate] = useState('in_progress')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (hasAccess) {
      loadTasks()
    }
  }, [hasAccess, filter])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await tasksService.myTasks(filter === 'all' ? undefined : filter)
      setTasks(data)
      if (selectedTask) {
        fetchTaskDetail(selectedTask.id)
      }
    } catch (err) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskDetail = async (taskId) => {
    try {
      setDetailLoading(true)
      const detail = await tasksService.getById(taskId)
      setTaskDetail(detail)
    } catch (err) {
      setError(err.message || 'Unable to load task detail')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSelectTask = (task) => {
    setSelectedTask(task)
    fetchTaskDetail(task.id)
    setStatusUpdate(task.status === 'pending' ? 'in_progress' : task.status)
  }

  const handleStatusChange = async (e) => {
    e.preventDefault()
    if (!selectedTask) return
    try {
      await tasksService.updateStatus(selectedTask.id, {
        status: statusUpdate,
        comment: `Status updated to ${statusUpdate}`,
      })
      await loadTasks()
    } catch (err) {
      setError(err.message || 'Failed to update task')
    }
  }

  const handleAttachmentUpload = async (e) => {
    if (!selectedTask) return
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      await tasksService.uploadAttachment(selectedTask.id, file)
      await fetchTaskDetail(selectedTask.id)
    } catch (err) {
      setError(err.message || 'Failed to upload attachment')
    } finally {
      setUploading(false)
    }
  }

  if (!hasAccess) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
              <p className="text-gray-500 text-sm">
                Track assignments, upload proof, and stay updated even while offline.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    filter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'
                  }`}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Assigned Tasks" subtitle="Latest first">
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ) : tasks.length === 0 ? (
                  <p className="text-center text-gray-500 my-8">No tasks found</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {tasks.map((task) => (
                      <li key={task.id}>
                        <button
                          onClick={() => handleSelectTask(task)}
                          className={`w-full text-left px-3 py-4 hover:bg-gray-50 rounded-lg ${
                            selectedTask?.id === task.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">{task.title}</p>
                              <p className="text-xs text-gray-500">{task.description || 'No description'}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">
                            Assigned {new Date(task.created_at).toLocaleString()}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="Task Details" subtitle="Update status and upload proof">
                {!selectedTask ? (
                  <div className="text-center text-gray-500 py-10">
                    Select a task to see more information
                  </div>
                ) : detailLoading ? (
                  <div className="text-center text-gray-400 py-10">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Title</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedTask.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-gray-800">{selectedTask.description || 'N/A'}</p>
                    </div>

                    <form onSubmit={handleStatusChange} className="space-y-3">
                      <label className="block text-sm font-medium text-gray-600">
                        Update Status
                      </label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                      >
                        Save Status
                      </button>
                    </form>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Upload completion proof
                      </label>
                      <input
                        type="file"
                        onChange={handleAttachmentUpload}
                        disabled={uploading}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800 mb-2">Attachments</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {taskDetail?.attachments?.length === 0 && (
                          <p className="text-xs text-gray-500">No attachments yet</p>
                        )}
                        {taskDetail?.attachments?.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 text-sm underline block"
                          >
                            {attachment.file_url.split('/').pop()}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800 mb-2">Updates</p>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {taskDetail?.updates?.map((update) => (
                          <div key={update.id} className="text-xs bg-gray-100 rounded-lg px-3 py-2">
                            <p className="font-semibold">{update.status}</p>
                            <p>{update.comment}</p>
                            <p className="text-[10px] text-gray-500">
                              {new Date(update.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

