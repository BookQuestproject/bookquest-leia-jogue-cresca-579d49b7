import { useState } from "react";
import { BookOpen, Star, Users, MessageSquare } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityTab from "@/components/espaco-literario/CommunityTab";
import ReviewsTab from "@/components/espaco-literario/ReviewsTab";
import ClubsTab from "@/components/espaco-literario/ClubsTab";

const EspacoLiterario = () => {
  const [activeTab, setActiveTab] = useState("comunidades");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div data-tutorial="espaco-header">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" />
            Espaço Literário
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte-se com outros leitores, avalie livros e participe de clubes de leitura.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md" data-tutorial="espaco-tabs">
            <TabsTrigger value="comunidades" className="gap-1.5 text-xs sm:text-sm" data-tutorial="espaco-comunidades">
              <MessageSquare className="w-4 h-4 hidden sm:block" />
              Comunidades
            </TabsTrigger>
            <TabsTrigger value="avaliacoes" className="gap-1.5 text-xs sm:text-sm" data-tutorial="espaco-avaliacoes">
              <Star className="w-4 h-4 hidden sm:block" />
              Avaliações
            </TabsTrigger>
            {/* Clubes tab temporarily disabled
            <TabsTrigger value="clubes" className="gap-1.5 text-xs sm:text-sm" data-tutorial="espaco-clubes">
              <Users className="w-4 h-4 hidden sm:block" />
              Clubes
            </TabsTrigger>
            */}
          </TabsList>

          <TabsContent value="comunidades" className="mt-5">
            <CommunityTab />
          </TabsContent>

          <TabsContent value="avaliacoes" className="mt-5">
            <ReviewsTab />
          </TabsContent>

          <TabsContent value="clubes" className="mt-5">
            <ClubsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EspacoLiterario;
