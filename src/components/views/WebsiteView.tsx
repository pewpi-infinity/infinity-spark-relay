import { Website, Page, Collaborator } from '@/lib/types'
import { InfinitySearch } from '@/components/InfinitySearch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatValue, formatWalletAddress, formatDate } from '@/lib/generators'
import { ArrowLeft, Crown, Eye, EyeSlash, Plus, Tag, Users, UserPlus, X, Wrench } from '@phosphor-icons/react'
import { useState } from 'react'
import { marked } from 'marked'
import { toast } from 'sonner'
import { ToolRenderer } from '@/components/tools/ToolRenderer'

interface WebsiteViewProps {
  website: Website
  isOwned: boolean
  onBack: () => void
  onAddPage: (query: string) => void
  isAddingPage: boolean
  onListForSale?: (websiteId: string, price: number) => void
  onUnlistFromSale?: (websiteId: string) => void
  onAddCollaborator?: (websiteId: string, wallet: string, role: 'editor' | 'viewer') => void
  onRemoveCollaborator?: (websiteId: string, wallet: string) => void
}

export function WebsiteView({ 
  website, 
  isOwned, 
  onBack, 
  onAddPage, 
  isAddingPage,
  onListForSale,
  onUnlistFromSale,
  onAddCollaborator,
  onRemoveCollaborator
}: WebsiteViewProps) {
  const [builderVisible, setBuilderVisible] = useState(isOwned)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [salePrice, setSalePrice] = useState<string>(website.salePrice?.toString() || '')
  const [showListDialog, setShowListDialog] = useState(false)
  const [showCollabDialog, setShowCollabDialog] = useState(false)
  const [collabWallet, setCollabWallet] = useState('')
  const [collabRole, setCollabRole] = useState<'editor' | 'viewer'>('editor')

  const displayContent = selectedPage ? selectedPage.content : website.content
  const displayTools = selectedPage ? selectedPage.tools : website.tools

  const handleListForSale = () => {
    const price = parseFloat(salePrice)
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price')
      return
    }
    onListForSale?.(website.id, price)
    setShowListDialog(false)
  }

  const handleAddCollaborator = () => {
    if (!collabWallet.trim()) {
      toast.error('Please enter a wallet address')
      return
    }
    onAddCollaborator?.(website.id, collabWallet.trim(), collabRole)
    setCollabWallet('')
    setShowCollabDialog(false)
  }

  return (
    <div className="min-h-screen">
      <div className="border-b cosmic-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {isOwned && (
              <>
                {website.isListedForSale ? (
                  <Button
                    variant="outline"
                    onClick={() => onUnlistFromSale?.(website.id)}
                    className="gap-2 border-accent/50 text-accent"
                  >
                    <Tag size={20} />
                    Unlist from Sale
                  </Button>
                ) : (
                  <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2"
                      >
                        <Tag size={20} />
                        List for Sale
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="cosmic-border bg-card">
                      <DialogHeader>
                        <DialogTitle>List Website for Sale</DialogTitle>
                        <DialogDescription>
                          Set a price in Infinity (∞) for your website
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Input
                            id="sale-price"
                            type="number"
                            placeholder="Enter price in ∞"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            className="cosmic-border"
                          />
                        </div>
                        <Button onClick={handleListForSale} className="w-full cosmic-glow">
                          List for Sale
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Dialog open={showCollabDialog} onOpenChange={setShowCollabDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2"
                    >
                      <UserPlus size={20} />
                      Add Collaborator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="cosmic-border bg-card">
                    <DialogHeader>
                      <DialogTitle>Add Collaborator</DialogTitle>
                      <DialogDescription>
                        Grant access to another user to edit or view this website
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Input
                          id="collab-wallet"
                          placeholder="Enter wallet address"
                          value={collabWallet}
                          onChange={(e) => setCollabWallet(e.target.value)}
                          className="cosmic-border"
                        />
                      </div>
                      <div>
                        <Select value={collabRole} onValueChange={(value: 'editor' | 'viewer') => setCollabRole(value)}>
                          <SelectTrigger className="cosmic-border">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor (can add pages)</SelectItem>
                            <SelectItem value="viewer">Viewer (read-only)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddCollaborator} className="w-full cosmic-glow">
                        Add Collaborator
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => setBuilderVisible(!builderVisible)}
                  className="gap-2"
                >
                  {builderVisible ? (
                    <>
                      <EyeSlash size={20} />
                      Hide Builder
                    </>
                  ) : (
                    <>
                      <Eye size={20} />
                      Show Builder
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {website.title}
                </h1>
                {isOwned && (
                  <Crown weight="fill" className="text-accent" size={28} />
                )}
              </div>
              <p className="text-xl text-muted-foreground">
                {website.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="font-mono">
              Token: {website.tokenId}
            </Badge>
            <Badge variant="outline" className="text-accent border-accent/50 text-base px-4 py-1">
              {formatValue(website.value)}
            </Badge>
            {website.isListedForSale && website.salePrice !== undefined && (
              <Badge className="bg-accent text-accent-foreground text-base px-4 py-1">
                For Sale: {website.salePrice.toLocaleString()} ∞
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Owner</div>
              <div className="font-mono">{formatWalletAddress(website.ownerWallet)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Created</div>
              <div>{formatDate(website.createdAt)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Pages</div>
              <div>{website.pages?.length || 0}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Functional Tools</div>
              <div className="font-semibold text-secondary">{displayTools?.length || 0}</div>
            </div>
          </div>

          {(website.collaborators?.length || 0) > 1 && (
            <Card className="cosmic-border bg-secondary/20 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={20} className="text-accent" />
                <h3 className="font-semibold">Collaborators ({(website.collaborators?.length || 1) - 1})</h3>
              </div>
              <div className="space-y-2">
                {(website.collaborators || [])
                  .filter(c => c.role !== 'owner')
                  .map((collab) => (
                    <div key={collab.wallet} className="flex items-center justify-between text-sm bg-card/50 rounded p-2">
                      <div>
                        <span className="font-mono">{formatWalletAddress(collab.wallet)}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{collab.role}</Badge>
                      </div>
                      {isOwned && onRemoveCollaborator && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveCollaborator(website.id, collab.wallet)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>

        <Separator className="my-12" />

        {(website.pages?.length || 0) > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Pages</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPage === null ? 'default' : 'outline'}
                onClick={() => setSelectedPage(null)}
              >
                Home
              </Button>
              {(website.pages || []).map((page) => (
                <Button
                  key={page.id}
                  variant={selectedPage?.id === page.id ? 'default' : 'outline'}
                  onClick={() => setSelectedPage(page)}
                >
                  {page.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {(displayTools?.length || 0) > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Wrench size={24} className="text-accent" />
              <h3 className="text-lg font-semibold">Functional Tools ({displayTools?.length || 0})</h3>
            </div>
            <div className="space-y-6">
              {(displayTools || []).map((tool) => (
                <ToolRenderer key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        )}

        <Card className="cosmic-border bg-card/80 backdrop-blur-sm p-8 mb-12">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: marked(displayContent) }}
          />
        </Card>

        {builderVisible && isOwned && (
          <Card className="cosmic-border cosmic-glow bg-secondary/20 backdrop-blur-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Plus size={24} className="text-accent" />
              <h3 className="text-2xl font-bold">Page Builder</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Add new pages to expand your website. Each search creates a new page with research-backed content.
            </p>
            <InfinitySearch
              onSearch={onAddPage}
              isLoading={isAddingPage}
              placeholder="What page would you like to add?"
              size="default"
            />
          </Card>
        )}
      </div>
    </div>
  )
}
