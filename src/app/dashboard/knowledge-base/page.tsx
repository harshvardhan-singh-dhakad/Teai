
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, Trash2, Eye } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

type Document = {
  name: string
  size: string
  date: string
  status: "Active" | "Processing"
}

const initialDocuments: Document[] = [
  { name: "product_spec_v1.pdf", size: "2.5 MB", date: "2023-10-26", status: "Active" },
  { name: "api_documentation.docx", size: "1.2 MB", date: "2023-10-25", status: "Active" },
  { name: "faq_list.pdf", size: "800 KB", date: "2023-10-24", status: "Processing" },
]

export default function KnowledgeBasePage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFilesToUpload(Array.from(event.target.files))
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files) {
      setFilesToUpload(Array.from(event.dataTransfer.files))
    }
  }

  const handleUpload = () => {
    if (filesToUpload.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          
          const newDocuments = filesToUpload.map(file => ({
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            date: new Date().toISOString().split('T')[0],
            status: "Active" as const
          }));

          setDocuments(prev => [...prev, ...newDocuments])
          setFilesToUpload([])
          
          toast({
            title: "Upload Successful",
            description: `${filesToUpload.length} document(s) have been added to the knowledge base.`,
          })
          
          return 100
        }
        return prev + 20
      })
    }, 500)
  }

  const handleDelete = (docName: string) => {
    setDocuments(prev => prev.filter(doc => doc.name !== docName));
    toast({
        title: "Document Deleted",
        description: `"${docName}" has been removed from the knowledge base.`
    })
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Knowledge Base</CardTitle>
          <CardDescription>
            Manage the knowledge sources for your agents.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription>
                Upload PDF or DOCX files to be used by your agents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Drag & drop files here, or click to browse
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
              </div>

              {filesToUpload.length > 0 && (
                <div className="space-y-2">
                    <p className="font-medium text-sm">Selected files:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {filesToUpload.map((file, i) => <li key={i}>{file.name}</li>)}
                    </ul>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2 pt-2">
                    <Label htmlFor="upload-progress">Uploading...</Label>
                    <Progress id="upload-progress" value={uploadProgress} />
                </div>
              )}

              <Button className="w-full" onClick={handleUpload} disabled={isUploading || filesToUpload.length === 0}>
                {isUploading ? "Uploading..." : "Upload Documents"}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.name}
                      </TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={doc.status === "Active" ? "outline" : "secondary"}
                          className={doc.status === 'Active' ? 'text-green-400 border-green-400' : ''}
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(doc.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
