import { Website, Wallet } from '@/lib/types'
import { WebsiteCard } from '@/components/WebsiteCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Storefront, Tag } from '@phosphor-icons/react'

interface MarketplaceViewProps {
  websites: Website[]
  currentWallet: Wallet | null
  onBack: () => void
  onViewWebsite: (websiteId: string) => void
  onPurchase: (websiteId: string) => void
}

export function MarketplaceView({ websites, currentWallet, onBack, onViewWebsite, onPurchase }: MarketplaceViewProps) {
  const forSaleWebsites = (websites || []).filter(w => w.isListedForSale && w.ownerWallet !== currentWallet?.address)
  const allOtherWebsites = (websites || []).filter(w => !w.isListedForSale && w.ownerWallet !== currentWallet?.address)

  return (
    <div className="min-h-screen">
      <div className="border-b cosmic-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent via-secondary to-primary flex items-center justify-center">
              <Storefront size={32} weight="fill" className="text-background" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">Trade ownership of live websites</p>
            </div>
          </div>

          <Card className="cosmic-border bg-primary/20 backdrop-blur-sm p-6">
            <p className="text-sm text-muted-foreground mb-2">
              Every website is a token backed by working tools. Browse live websites with functional components, 
              and trade using Infinity (∞) as the settlement currency. More tools = more value.
            </p>
            {currentWallet && currentWallet.infinityBalance !== undefined && (
              <p className="text-sm font-semibold text-accent">
                Your Balance: {currentWallet.infinityBalance.toLocaleString()} ∞
              </p>
            )}
          </Card>
        </div>

        <Tabs defaultValue="for-sale" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="for-sale" className="gap-2">
              <Tag size={20} />
              For Sale ({forSaleWebsites.length})
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <Storefront size={20} />
              Browse All ({allOtherWebsites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="for-sale">
            {forSaleWebsites.length === 0 ? (
              <Card className="cosmic-border bg-card/80 backdrop-blur-sm p-12 text-center">
                <Tag size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No websites for sale</h3>
                <p className="text-muted-foreground mb-6">
                  Check back later or browse all websites
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forSaleWebsites.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    isOwned={false}
                    onView={() => onViewWebsite(website.id)}
                    onPurchase={() => onPurchase(website.id)}
                    showPurchase
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse">
            {allOtherWebsites.length === 0 ? (
              <Card className="cosmic-border bg-card/80 backdrop-blur-sm p-12 text-center">
                <Storefront size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No other websites yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to create and share a website
                </p>
                <Button onClick={onBack} className="cosmic-glow">
                  Create Your First Website
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allOtherWebsites.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    isOwned={false}
                    onView={() => onViewWebsite(website.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
