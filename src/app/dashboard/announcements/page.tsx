'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Megaphone,
  Plus,
  Loader2,
  AlertCircle,
  Inbox,
  Trash2,
} from 'lucide-react'
import type { Announcement } from '@/types/communications'

type Priority = 'low' | 'normal' | 'high'

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [targetRoles, setTargetRoles] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/communications?resource=announcements', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setAnnouncements(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load announcements', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async () => {
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create_announcement',
          title,
          body,
          priority,
          target_roles: targetRoles,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreate(false)
        setTitle('')
        setBody('')
        setPriority('normal')
        setTargetRoles([])
        load()
      }
    } catch (error) {
      console.error('Failed to create announcement', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteAnnouncement = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch (error) {
      console.error('Failed to delete announcement', error)
    }
  }

  const canCreate = user?.role === 'admin' || user?.role === 'super_admin'

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return date.toLocaleDateString()
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              Announcements
            </h1>
            {canCreate && (
              <Button onClick={() => setShowCreate(!showCreate)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Announcement
              </Button>
            )}
          </div>

          {showCreate && (
            <Card className="mb-6">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your announcement..." className="min-h-[120px] resize-none" />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={submit} disabled={saving || !title.trim() || !body.trim()}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Publish
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No announcements yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <Card key={ann.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                          {ann.priority === 'high' && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">High</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{ann.body}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                          <span>By {ann.created_by_name || 'Admin'}</span>
                          <span>{formatTime(ann.created_at)}</span>
                        </div>
                      </div>
                      {canCreate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAnnouncement(ann.id)}
                          title="Delete announcement"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
