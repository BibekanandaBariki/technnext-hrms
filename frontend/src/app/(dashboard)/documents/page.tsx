"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Document = {
  id: string
  documentType: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  status: string
  uploadedAt: string
  comments?: string
  employee?: {
    firstName: string
    lastName: string
    employeeCode: string
  }
}

const types = [
  "PROFILE_PHOTO",
  "GOVERNMENT_ID",
  "TAX_ID",
  "RESUME",
  "BANK_PROOF",
  "EDUCATION",
  "EXPERIENCE",
  "OFFER_LETTER",
  "OTHER",
]

function DocumentsContent() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const [filterType, setFilterType] = useState<string | null>(null)

  const [documentType, setDocumentType] = useState<string>(types[0])
  const [fileName, setFileName] = useState<string>("")
  const [fileUrl, setFileUrl] = useState<string>("")
  const [fileSize, setFileSize] = useState<string>("")
  const [mimeType, setMimeType] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<"url" | "file">("url")

  useEffect(() => {
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null
    let tempRole = null
    if (!user || user === "undefined") {
      window.location.href = "/login"
      return
    }
    try {
      const u = (user && user !== "undefined") ? JSON.parse(user) : null
      tempRole = u?.role ?? null
      setRole(tempRole)
    } catch { }
    const t = searchParams.get("type")
    if (t) {
      setFilterType(t)
      setDocumentType(t)
    }
    fetchDocs(tempRole)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const fetchDocs = async (currentRole: string | null) => {
    setLoading(true)
    try {
      const endpoint = (currentRole === "ADMIN" || currentRole === "HR") ? "/documents/all" : "/documents"
      const res = await api.get(endpoint)
      setDocs(res.data.data || res.data || [])
    } catch {
      toast.error("Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    if (!fileName || !fileUrl || !fileSize || !mimeType) {
      toast.error("Fill all fields")
      return
    }
    setSaving(true)
    try {
      await api.post("/documents", {
        documentType,
        fileName,
        fileUrl,
        fileSize: Number(fileSize),
        mimeType,
      })
      toast.success("Document saved")
      setFileName("")
      setFileUrl("")
      setFileSize("")
      setMimeType("")
      await fetchDocs(role)
    } catch {
      toast.error("Failed to save document")
    } finally {
      setSaving(false)
    }
  }

  const uploadFile = async () => {
    if (!file) {
      toast.error("Choose a file")
      return
    }
    setSaving(true)
    try {
      const presign = await api.post("/documents/presign", {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
      })
      const { uploadUrl, fileUrl } = presign.data
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      })
      await api.post("/documents", {
        documentType,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      })
      toast.success("Uploaded and saved")
      setFile(null)
      await fetchDocs(role)
    } catch {
      toast.error("Upload failed")
    } finally {
      setSaving(false)
    }
  }

  const review = async (id: string, nextStatus: "APPROVED" | "REJECTED") => {
    const comments = window.prompt("Comments (optional)") || ""
    setSaving(true)
    try {
      await api.patch(`/documents/${id}/review`, {
        status: nextStatus,
        comments,
      })
      toast.success(`Marked ${nextStatus.toLowerCase()}`)
      await fetchDocs(role)
    } catch {
      toast.error("Failed to update status")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={mode === "url" ? "default" : "outline"} onClick={() => setMode("url")}>Via URL</Button>
            <Button variant={mode === "file" ? "default" : "outline"} onClick={() => setMode("file")}>Via File (S3)</Button>
          </div>
          {mode === "url" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File Name</Label>
                  <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="filename.pdf" />
                </div>
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>File Size (bytes)</Label>
                  <Input value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="12345" />
                </div>
                <div className="space-y-2">
                  <Label>Mime Type</Label>
                  <Input value={mimeType} onChange={(e) => setMimeType(e.target.value)} placeholder="application/pdf" />
                </div>
              </div>
              <Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          )}
          {mode === "file" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Choose File</Label>
                  <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <Button onClick={uploadFile} disabled={saving}>{saving ? "Uploading..." : "Upload"}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{(role === "ADMIN" || role === "HR") ? "All Documents" : "My Documents"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="space-y-2">
              <Label>Filter by Type</Label>
              <Select value={filterType || "ALL"} onValueChange={(v) => setFilterType(v === "ALL" ? null : v)}>
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ALL</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {(role === "ADMIN" || role === "HR") && <TableHead>Employee</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Mime</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filterType ? docs.filter(d => d.documentType === filterType) : docs).map((d) => (
                  <TableRow key={d.id}>
                    {(role === "ADMIN" || role === "HR") && (
                      <TableCell>
                        {d.employee ? `${d.employee.firstName} ${d.employee.lastName} (${d.employee.employeeCode})` : "Unknown"}
                      </TableCell>
                    )}
                    <TableCell>{d.documentType}</TableCell>
                    <TableCell>{d.fileName}</TableCell>
                    <TableCell>
                      <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-violet-600">Open</a>
                    </TableCell>
                    <TableCell>{d.fileSize}</TableCell>
                    <TableCell>{d.mimeType}</TableCell>
                    <TableCell>{d.status}</TableCell>
                    <TableCell>{new Date(d.uploadedAt).toLocaleString()}</TableCell>
                    {(role === "ADMIN" || role === "HR") && (
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => review(d.id, "APPROVED")} disabled={saving}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => review(d.id, "REJECTED")} disabled={saving}>Reject</Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentsContent />
    </Suspense>
  )
}
