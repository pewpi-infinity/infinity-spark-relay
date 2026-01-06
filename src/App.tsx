import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Website, Wallet, ViewMode, Token, Page, Transaction } from '@/lib/types'
import { WorldArchetype } from '@/lib/worldTypes'
import { 
  generateWebsiteId, 
  generateTokenId, 
  generateWalletAddress, 
  calculateWebsiteValue,
  generateWorldContent,
  generatePageContent,
  generateTransactionId,
  generateWebsiteContent
} from '@/lib/generators'
import { CosmicBackground } from '@/components/CosmicBackground'
import { EntryView } from '@/components/views/EntryView'
import { InfinityHubView } from '@/components/views/InfinityHubView'
import { WebsiteView } from '@/components/views/WebsiteView'
import { WalletView } from '@/components/views/WalletView'
import { MarketplaceView } from '@/components/views/MarketplaceView'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

function App() {
  const [websites, setWebsites] = useKV<Website[]>('infinity-websites', [])
  const [wallet, setWallet] = useKV<Wallet | null>('infinity-wallet', null)
  const [transactions, setTransactions] = useKV<Transaction[]>('infinity-transactions', [])
  
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isAddingPage, setIsAddingPage] = useState(false)

  useEffect(() => {
    if (wallet && (wallet.infinityBalance === undefined || wallet.infinityBalance === null)) {
      setWallet((current) => {
        if (!current) return null
        return {
          ...current,
          infinityBalance: 10000
        }
      })
    }
  }, [])

  const selectedWebsite = websites?.find(w => w.id === selectedWebsiteId)
  const isWebsiteOwned = selectedWebsite && wallet && selectedWebsite.ownerWallet === wallet.address

  const ensureWallet = (): Wallet => {
    if (wallet) {
      if (wallet.infinityBalance === undefined || wallet.infinityBalance === null) {
        const updatedWallet = {
          ...wallet,
          infinityBalance: 10000
        }
        setWallet(updatedWallet)
        return updatedWallet
      }
      return wallet
    }

    const newWallet: Wallet = {
      address: generateWalletAddress(),
      balance: 0,
      tokens: [],
      createdAt: Date.now(),
      infinityBalance: 10000
    }
    
    setWallet(newWallet)
    toast.success('Wallet created automatically!')
    return newWallet
  }

  const handleSearchCreate = async (query: string) => {
    setIsCreating(true)
    
    try {
      const currentWallet = ensureWallet()
      
      const { title, description, content, tools } = await generateWebsiteContent(query, currentWallet.address)
      
      const websiteId = generateWebsiteId()
      const tokenId = generateTokenId()
      
      const newWebsite: Website = {
        id: websiteId,
        tokenId,
        title,
        description,
        query: query,
        content,
        url: `https://infinity.spark/${websiteId}`,
        ownerWallet: currentWallet.address,
        value: 1000,
        createdAt: Date.now(),
        lastModified: Date.now(),
        pages: [],
        tools,
        theme: 'cosmic',
        collaborators: [{
          wallet: currentWallet.address,
          role: 'owner',
          addedAt: Date.now(),
          addedBy: currentWallet.address
        }],
        isListedForSale: false,
        uniquenessScore: 1.0,
        activeBuildTime: 0
      }
      
      newWebsite.value = calculateWebsiteValue(newWebsite)

      const newToken: Token = {
        id: tokenId,
        websiteId,
        websiteUrl: newWebsite.url,
        ownerWallet: currentWallet.address,
        value: newWebsite.value,
        createdAt: Date.now(),
        metadata: {
          title,
          description,
          query: query,
          toolCount: tools.length
        }
      }

      setWebsites((current) => [...(current || []), newWebsite])
      
      setWallet((currentWallet) => {
        if (!currentWallet) return null
        return {
          ...currentWallet,
          balance: currentWallet.balance + newWebsite.value,
          tokens: [...currentWallet.tokens, newToken]
        }
      })

      toast.success(`${title} created with ${tools.length} tools!`)
      
      setSelectedWebsiteId(websiteId)
      setViewMode('website')
    } catch (error) {
      console.error('Error creating website:', error)
      toast.error('Failed to create website. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateWorld = async (archetype: WorldArchetype, rarityMultiplier: number, slotCombination: string) => {
    setIsCreating(true)
    
    try {
      const currentWallet = ensureWallet()
      
      const { title, description, content, tools } = await generateWorldContent(archetype, currentWallet.address, slotCombination)
      
      const websiteId = generateWebsiteId()
      const tokenId = generateTokenId()
      
      const newWebsite: Website = {
        id: websiteId,
        tokenId,
        title,
        description,
        query: `World: ${archetype}`,
        content,
        url: `https://infinity.spark/${websiteId}`,
        ownerWallet: currentWallet.address,
        value: 1000,
        createdAt: Date.now(),
        lastModified: Date.now(),
        pages: [],
        tools,
        theme: 'cosmic',
        collaborators: [{
          wallet: currentWallet.address,
          role: 'owner',
          addedAt: Date.now(),
          addedBy: currentWallet.address
        }],
        isListedForSale: false,
        worldArchetype: archetype,
        rarityMultiplier,
        slotCombination,
        uniquenessScore: 1.0,
        activeBuildTime: 0
      }
      
      newWebsite.value = calculateWebsiteValue(newWebsite)

      const newToken: Token = {
        id: tokenId,
        websiteId,
        websiteUrl: newWebsite.url,
        ownerWallet: currentWallet.address,
        value: newWebsite.value,
        createdAt: Date.now(),
        metadata: {
          title,
          description,
          query: `World: ${archetype}`,
          toolCount: tools.length,
          worldArchetype: archetype,
          rarityMultiplier,
          uniquenessScore: 1.0
        }
      }

      setWebsites((current) => [...(current || []), newWebsite])
      
      setWallet((currentWallet) => {
        if (!currentWallet) return null
        return {
          ...currentWallet,
          balance: currentWallet.balance + newWebsite.value,
          tokens: [...currentWallet.tokens, newToken]
        }
      })

      toast.success(`${title} created with ${tools.length} tools!`)
      
      setSelectedWebsiteId(websiteId)
      setViewMode('website')
    } catch (error) {
      console.error('Error creating website:', error)
      toast.error('Failed to create website. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleAddPage = async (query: string) => {
    if (!selectedWebsite || !isWebsiteOwned) return
    
    setIsAddingPage(true)
    
    try {
      const { title, content, tools } = await generatePageContent(selectedWebsite.title, query, wallet?.address || 'unknown')
      
      const newPage: Page = {
        id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        content,
        tools,
        createdAt: Date.now(),
        author: wallet?.address || 'unknown'
      }

      setWebsites((current) =>
        (current || []).map((site) => {
          if (site.id === selectedWebsite.id) {
            const updatedSite = {
              ...site,
              pages: [...(site.pages || []), newPage],
              lastModified: Date.now()
            }
            updatedSite.value = calculateWebsiteValue(updatedSite)
            return updatedSite
          }
          return site
        })
      )

      const toolValue = (newPage.tools || []).reduce((sum, tool) => sum + 100, 0)

      setWallet((currentWallet) => {
        if (!currentWallet) return null
        return {
          ...currentWallet,
          balance: currentWallet.balance + 100 + toolValue,
          tokens: (currentWallet.tokens || []).map(token => {
            if (token.websiteId === selectedWebsite.id) {
              return {
                ...token,
                value: token.value + 100 + toolValue,
                metadata: {
                  ...token.metadata,
                  toolCount: (token.metadata.toolCount || 0) + (newPage.tools?.length || 0)
                }
              }
            }
            return token
          })
        }
      })

      toast.success(`Page "${title}" added with ${newPage.tools?.length || 0} tool(s)!`)
    } catch (error) {
      console.error('Error adding page:', error)
      toast.error('Failed to add page. Please try again.')
    } finally {
      setIsAddingPage(false)
    }
  }

  const handleListForSale = (websiteId: string, price: number) => {
    if (!wallet) return

    setWebsites((current) =>
      (current || []).map((site) => {
        if (site.id === websiteId && site.ownerWallet === wallet.address) {
          return {
            ...site,
            isListedForSale: true,
            salePrice: price
          }
        }
        return site
      })
    )

    const transaction: Transaction = {
      id: generateTransactionId(),
      type: 'listing',
      websiteId,
      from: wallet.address,
      to: '',
      amount: price,
      timestamp: Date.now()
    }

    setTransactions((current) => [...(current || []), transaction])
    toast.success('Website listed for sale!')
  }

  const handleUnlistFromSale = (websiteId: string) => {
    if (!wallet) return

    setWebsites((current) =>
      (current || []).map((site) => {
        if (site.id === websiteId && site.ownerWallet === wallet.address) {
          return {
            ...site,
            isListedForSale: false,
            salePrice: undefined
          }
        }
        return site
      })
    )

    const transaction: Transaction = {
      id: generateTransactionId(),
      type: 'delisting',
      websiteId,
      from: wallet.address,
      to: '',
      amount: 0,
      timestamp: Date.now()
    }

    setTransactions((current) => [...(current || []), transaction])
    toast.success('Website unlisted from marketplace')
  }

  const handlePurchaseWebsite = (websiteId: string) => {
    if (!wallet) return

    const website = websites?.find(w => w.id === websiteId)
    if (!website || !website.isListedForSale || !website.salePrice) {
      toast.error('Website not available for purchase')
      return
    }

    if (wallet.infinityBalance < website.salePrice) {
      toast.error('Insufficient Infinity (∞) balance')
      return
    }

    const sellerWallet = website.ownerWallet
    const price = website.salePrice

    setWallet((currentWallet) => {
      if (!currentWallet) return null
      return {
        ...currentWallet,
        infinityBalance: currentWallet.infinityBalance - price,
        balance: currentWallet.balance + website.value,
        tokens: [
          ...(currentWallet.tokens || []),
          {
            id: website.tokenId,
            websiteId: website.id,
            websiteUrl: website.url,
            ownerWallet: currentWallet.address,
            value: website.value,
            createdAt: website.createdAt,
            metadata: {
              title: website.title,
              description: website.description,
              query: website.query
            }
          }
        ]
      }
    })

    setWebsites((current) =>
      (current || []).map((site) => {
        if (site.id === websiteId) {
          return {
            ...site,
            ownerWallet: wallet.address,
            isListedForSale: false,
            salePrice: undefined,
            collaborators: [
              {
                wallet: wallet.address,
                role: 'owner',
                addedAt: Date.now(),
                addedBy: wallet.address
              },
              ...(site.collaborators || []).filter(c => c.role !== 'owner')
            ]
          }
        }
        return site
      })
    )

    const transaction: Transaction = {
      id: generateTransactionId(),
      type: 'purchase',
      websiteId,
      from: wallet.address,
      to: sellerWallet,
      amount: price,
      timestamp: Date.now()
    }

    setTransactions((current) => [...(current || []), transaction])
    toast.success(`Website purchased for ${price} ∞!`)
  }

  const handleAddCollaborator = (websiteId: string, collaboratorWallet: string, role: 'editor' | 'viewer') => {
    if (!wallet) return

    const website = websites?.find(w => w.id === websiteId)
    if (!website || website.ownerWallet !== wallet.address) {
      toast.error('Only the owner can add collaborators')
      return
    }

    const existing = (website.collaborators || []).find(c => c.wallet === collaboratorWallet)
    if (existing) {
      toast.error('User is already a collaborator')
      return
    }

    setWebsites((current) =>
      (current || []).map((site) => {
        if (site.id === websiteId && site.ownerWallet === wallet.address) {
          return {
            ...site,
            collaborators: [
              ...(site.collaborators || []),
              {
                wallet: collaboratorWallet,
                role,
                addedAt: Date.now(),
                addedBy: wallet.address
              }
            ]
          }
        }
        return site
      })
    )

    toast.success(`Collaborator added as ${role}`)
  }

  const handleRemoveCollaborator = (websiteId: string, collaboratorWallet: string) => {
    if (!wallet) return

    setWebsites((current) =>
      (current || []).map((site) => {
        if (site.id === websiteId && site.ownerWallet === wallet.address) {
          return {
            ...site,
            collaborators: (site.collaborators || []).filter(c => c.wallet !== collaboratorWallet || c.role === 'owner')
          }
        }
        return site
      })
    )

    toast.success('Collaborator removed')
  }

  const handleViewWebsite = (websiteId: string) => {
    setSelectedWebsiteId(websiteId)
    setViewMode('website')
  }

  const handleBackToEntry = () => {
    setViewMode('home')
    setSelectedWebsiteId(null)
  }

  const handleEnterHub = () => {
    setViewMode('builder')
  }

  return (
    <div className="min-h-screen relative">
      <CosmicBackground />
      <Toaster position="top-right" />
      
      {viewMode === 'home' && (
        <EntryView
          onSearch={handleSearchCreate}
          onEnterInfinity={handleEnterHub}
          isSearching={isCreating}
        />
      )}

      {viewMode === 'builder' && (
        <InfinityHubView
          websites={websites || []}
          wallet={wallet || null}
          onBack={handleBackToEntry}
          onViewWebsite={handleViewWebsite}
          onCreateWithSlot={handleCreateWorld}
          isCreating={isCreating}
        />
      )}

      {viewMode === 'website' && selectedWebsite && (
        <WebsiteView
          website={selectedWebsite}
          isOwned={!!isWebsiteOwned}
          onBack={handleBackToEntry}
          onAddPage={handleAddPage}
          isAddingPage={isAddingPage}
          onListForSale={handleListForSale}
          onUnlistFromSale={handleUnlistFromSale}
          onAddCollaborator={handleAddCollaborator}
          onRemoveCollaborator={handleRemoveCollaborator}
        />
      )}

      {viewMode === 'wallet' && wallet && (
        <WalletView
          wallet={wallet}
          onBack={handleBackToEntry}
          onViewWebsite={handleViewWebsite}
        />
      )}

      {viewMode === 'marketplace' && (
        <MarketplaceView
          websites={websites || []}
          currentWallet={wallet || null}
          onBack={handleBackToEntry}
          onViewWebsite={handleViewWebsite}
          onPurchase={handlePurchaseWebsite}
        />
      )}
    </div>
  )
}

export default App