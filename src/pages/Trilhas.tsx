import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Star, Lock, CheckCircle, Trophy, Crown, Play } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

interface Trail {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  category: "geral" | "enem" | "vestibular";
  isPremium: boolean;
  color: string;
}

const trails: Trail[] = [
  { 
    id: "fantasia", 
    name: "Fantasia", 
    description: "Explore mundos mágicos e criaturas fantásticas",
    icon: "🧙‍♂️", 
    progress: 2, 
    total: 8, 
    category: "geral",
    isPremium: false,
    color: "from-purple-500 to-indigo-600"
  },
  { 
    id: "romance", 
    name: "Romance", 
    description: "Histórias de amor que tocam o coração",
    icon: "💕", 
    progress: 0, 
    total: 6, 
    category: "geral",
    isPremium: false,
    color: "from-pink-500 to-rose-600"
  },
  { 
    id: "misterio", 
    name: "Mistério", 
    description: "Enigmas e suspense para mentes curiosas",
    icon: "🔍", 
    progress: 0, 
    total: 7, 
    category: "geral",
    isPremium: false,
    color: "from-slate-500 to-zinc-700"
  },
  { 
    id: "classicos", 
    name: "Clássicos", 
    description: "Obras atemporais da literatura mundial",
    icon: "📚", 
    progress: 0, 
    total: 10, 
    category: "geral",
    isPremium: false,
    color: "from-amber-500 to-orange-600"
  },
  { 
    id: "ficcao-cientifica", 
    name: "Ficção Científica", 
    description: "Viagens espaciais e tecnologia do futuro",
    icon: "🚀", 
    progress: 0, 
    total: 6, 
    category: "geral",
    isPremium: false,
    color: "from-cyan-500 to-blue-600"
  },
  { 
    id: "enem-literatura", 
    name: "ENEM - Literatura", 
    description: "Obras frequentes no ENEM",
    icon: "📝", 
    progress: 0, 
    total: 12, 
    category: "enem",
    isPremium: true,
    color: "from-emerald-500 to-green-600"
  },
  { 
    id: "vestibular-fuvest", 
    name: "FUVEST 2025", 
    description: "Lista de leitura obrigatória FUVEST",
    icon: "🎓", 
    progress: 0, 
    total: 9, 
    category: "vestibular",
    isPremium: true,
    color: "from-blue-500 to-blue-700"
  },
  { 
    id: "vestibular-unicamp", 
    name: "UNICAMP 2025", 
    description: "Lista de leitura obrigatória UNICAMP",
    icon: "🏛️", 
    progress: 0, 
    total: 12, 
    category: "vestibular",
    isPremium: true,
    color: "from-red-500 to-red-700"
  },
];

const Trilhas = () => {
  const [selectedCategory, setSelectedCategory] = useState<"todas" | "geral" | "enem" | "vestibular">("todas");
  const isPremium = false; // Would come from user state

  const filteredTrails = trails.filter(trail => 
    selectedCategory === "todas" || trail.category === selectedCategory
  );

  const categories = [
    { id: "todas", label: "Todas" },
    { id: "geral", label: "Leitura Geral" },
    { id: "enem", label: "ENEM" },
    { id: "vestibular", label: "Vestibulares" },
  ];

  return (
    <Layout isPremium={isPremium}>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Trilhas Literárias
          </h1>
          <p className="text-muted-foreground">
            Escolha uma trilha e comece sua jornada de leitura
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id as any)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Trails Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrails.map((trail, index) => (
            <div 
              key={trail.id} 
              className={`glass-card rounded-2xl overflow-hidden card-hover animate-fade-in ${
                trail.isPremium && !isPremium ? "opacity-80" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header with gradient */}
              <div className={`h-24 bg-gradient-to-r ${trail.color} flex items-center justify-center relative`}>
                <span className="text-5xl">{trail.icon}</span>
                {trail.isPremium && !isPremium && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-xs font-bold">
                    <Crown className="w-3 h-3 text-accent" />
                    Premium
                  </div>
                )}
                {trail.progress > 0 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-xs font-bold">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    {trail.progress}/{trail.total}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{trail.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{trail.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-bold">{Math.round((trail.progress / trail.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(trail.progress / trail.total) * 100}%` }}
                    />
                  </div>
                </div>

                {trail.isPremium && !isPremium ? (
                  <Link to="/premium">
                    <Button variant="outline" className="w-full gap-2">
                      <Lock className="w-4 h-4" />
                      Desbloquear com Premium
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/trilhas/${trail.id}`}>
                    <Button variant={trail.progress > 0 ? "hero" : "default"} className="w-full gap-2">
                      {trail.progress > 0 ? (
                        <>
                          <Play className="w-4 h-4" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          Começar
                        </>
                      )}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Trilhas;
