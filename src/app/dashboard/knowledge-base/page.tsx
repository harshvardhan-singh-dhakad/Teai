
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { UploadCloud, FileText, Trash2, Globe, LoaderCircle } from "lucide-react"
import type { Document } from "@/types"
import { trainFromWebsiteAction } from "@/app/actions"
import { cn } from "@/lib/utils"


export default function KnowledgeBasePage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([
      { id: 'doc1', name: 'Product_Features.pdf', type: 'file', source: 'Product_Features.pdf', size: '2.1 MB', status: 'Active', createdAt: new Date().toISOString() },
      { id: 'doc2', name: 'Pricing Plans', type: 'website', source: 'https://example.com/pricing', size: 'N/A', status: 'Active', createdAt: new Date().toISOString() },
  ])
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isTraining, setIsTraining] = useState(false)


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
      toast({ title: "No files selected", description: "Please select files to upload.", variant: "destructive" })
      return
    }

    const newDocuments: Document[] = filesToUpload.map(file => ({
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: 'file',
        source: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: "Active",
        createdAt: new Date().toISOString()
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
    setFilesToUpload([])
    toast({ title: "Upload Successful", description: `${filesToUpload.length} document(s) have been added.` })
  }

  const handleFetchAndTrain = async () => {
    if(!websiteUrl) {
        toast({ title: "URL is empty", description: "Please enter a website URL to fetch.", variant: "destructive" })
        return
    }
    setIsTraining(true);
     try {
        const { title, charCount } = await trainFromWebsiteAction({ url: websiteUrl });
        
        const newDocument: Document = {
            id: `doc-${Date.now()}`,
            name: title,
            type: 'website',
            source: websiteUrl,
            size: `${(charCount / 1024).toFixed(2)} KB`,
            status: "Active",
            createdAt: new Date().toISOString()
        }

        setDocuments(prev => [newDocument, ...prev]);
        setWebsiteUrl("");
        toast({ title: "Training Complete", description: `Website "${title}" has been added to the knowledge base.` });

    } catch (error) {
        toast({ title: "Scraping Failed", description: `Could not fetch data from ${websiteUrl}. Please check the URL.`, variant: "destructive" })
    } finally {
        setIsTraining(false);
    }
  }

  const handleDelete = (docId: string) => {
    const docToDelete = documents.find(doc => doc.id === docId);
    setDocuments(documents.filter(doc => doc.id !== docId))
     toast({ title: "Source Deleted", description: `"${docToDelete?.name}" has been removed from the knowledge base.` })
  }


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Knowledge Base</CardTitle>
          <CardDescription>
            Manage the knowledge sources for your agents. Upload documents or import from a website.
          </CardDescription>
        </CardHeader>
      </Card>

       <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
             <Tabs defaultValue="file-upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file-upload">Upload File</TabsTrigger>
                    <TabsTrigger value="website-import">From Website</TabsTrigger>
                </TabsList>
                <TabsContent value="file-upload">
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Upload Documents</CardTitle>
                        <CardDescription>Upload PDF, DOCX, or TXT files.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div
                          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('file-upload-input')?.click()}
                        >
                          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-center text-muted-foreground text-sm">
                            Drag & drop, or click to browse
                          </p>
                          <input
                            id="file-upload-input"
                            type="file"
                            className="hidden"
                            multiple
                            accept=".pdf,.docx,.txt"
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
                        <Button className="w-full" onClick={handleUpload} disabled={filesToUpload.length === 0}>
                          Upload Documents
                        </Button>
                      </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="website-import">
                    <Card className="mt-4">
                        <CardHeader>
                           <CardTitle className="text-lg">Import from Website</CardTitle>
                           <CardDescription>Enter a URL to fetch and train the agent on its content.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="website-url">Website URL</label>
                                <Input 
                                    id="website-url"
                                    placeholder="https://example.com"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    disabled={isTraining}
                                />
                            </div>
                            <Button className="w-full" onClick={handleFetchAndTrain} disabled={isTraining}>
                                {isTraining && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isTraining ? "Training..." : "Fetch & Train"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
             </Tabs>
          </div>
          <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Knowledge Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium flex items-center gap-2 truncate">
                            {doc.type === 'file' ? <FileText className="h-4 w-4 text-muted-foreground" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                            <span className="truncate">{doc.name}</span>
                          </TableCell>
                           <TableCell>{doc.type === 'file' ? 'File' : 'Website'}</TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell>
                            <Badge
                              variant={doc.status === "Active" ? "outline" : "secondary"}
                              className={cn(
                                  doc.status === 'Active' ? 'text-green-400 border-green-400' : '',
                                  doc.status === 'Training' ? 'text-amber-400 border-amber-400' : '',
                                )}
                            >
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(doc.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {documents.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No knowledge sources added yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>
    </div>
  )
}
