 "use client"
 
 import { useEffect, useState } from "react"
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
 
 export default function DocumentsPage() {
   const [docs, setDocs] = useState<Document[]>([])
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)
 
   const [documentType, setDocumentType] = useState<string>(types[0])
   const [fileName, setFileName] = useState<string>("")
   const [fileUrl, setFileUrl] = useState<string>("")
   const [fileSize, setFileSize] = useState<string>("")
   const [mimeType, setMimeType] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<"url" | "file">("url")
 
   useEffect(() => {
     const user = typeof window !== "undefined" ? localStorage.getItem("user") : null
     if (!user) {
       window.location.href = "/login"
       return
     }
     fetchDocs()
   }, [])
 
   const fetchDocs = async () => {
     setLoading(true)
     try {
       const res = await api.get("/documents")
       setDocs(res.data.data || [])
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
       await fetchDocs()
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
      await fetchDocs()
    } catch {
      toast.error("Upload failed")
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
          
         </CardContent>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle>My Documents</CardTitle>
         </CardHeader>
         <CardContent>
           {loading ? (
             <div>Loading...</div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
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
                 {docs.map((d) => (
                   <TableRow key={d.id}>
                     <TableCell>{d.documentType}</TableCell>
                     <TableCell>{d.fileName}</TableCell>
                     <TableCell>
                       <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-violet-600">Open</a>
                     </TableCell>
                     <TableCell>{d.fileSize}</TableCell>
                     <TableCell>{d.mimeType}</TableCell>
                     <TableCell>{d.status}</TableCell>
                     <TableCell>{new Date(d.uploadedAt).toLocaleString()}</TableCell>
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
