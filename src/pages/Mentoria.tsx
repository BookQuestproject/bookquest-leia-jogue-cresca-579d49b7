import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Lock, Sparkles, Calendar, Clock, BookOpen, ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Session {
  id: string;
  session_date: string;
  session_time: string;
  status: string;
  notes: string | null;
}

const Mentoria = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, loading: profileLoading } = useProfile();
  const { toast } = useToast();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Fetch user sessions
  useEffect(() => {
    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  const fetchUserSessions = async () => {
    if (!user) return;
    
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: true });

      if (error) throw error;
      setUserSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Generate available time slots for selected date
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const generateTimeSlots = async (date: Date) => {
    const dayOfWeek = date.getDay();
    
    // Fetch available slots from database
    const { data: availableSlots } = await supabase
      .from('available_slots')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    // Check which slots are already booked
    const dateStr = format(date, 'yyyy-MM-dd');
    const { data: bookedSlots } = await supabase
      .from('mentorship_sessions')
      .select('session_time')
      .eq('session_date', dateStr)
      .eq('status', 'scheduled');

    const bookedTimes = bookedSlots?.map(s => s.session_time) || [];

    // Default time slots if none in database
    const defaultSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    const slots = availableSlots?.length 
      ? availableSlots.map(s => s.time_slot)
      : defaultSlots;

    setTimeSlots(
      slots.map(time => ({
        id: time,
        time,
        available: !bookedTimes.includes(time),
      }))
    );
  };

  const handleBookSession = async () => {
    if (!user || !selectedDate || !selectedSlot) return;

    setIsBooking(true);
    try {
      const { error } = await supabase
        .from('mentorship_sessions')
        .insert({
          user_id: user.id,
          session_date: format(selectedDate, 'yyyy-MM-dd'),
          session_time: selectedSlot,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: "Sessão agendada!",
        description: `Sua mentoria foi marcada para ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })} às ${selectedSlot}.`,
      });

      setSelectedDate(null);
      setSelectedSlot(null);
      fetchUserSessions();
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar a sessão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day offset for first day of month
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  const hasSessionOnDate = (date: Date) => {
    return userSessions.some(s => isSameDay(new Date(s.session_date), date));
  };

  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isPremium={isPremium}>
      <div className="py-8 max-w-4xl mx-auto">
        {/* Premium Banner */}
        {!isPremium && (
          <div className="glass-card rounded-2xl p-4 mb-6 bg-accent/5 border-accent/20 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-sm">Conteúdo Premium</p>
                  <p className="text-xs text-muted-foreground">Assine para agendar mentorias semanais</p>
                </div>
              </div>
              <Link to="/premium">
                <Button variant="premium" size="sm" className="gap-2">
                  <Crown className="w-4 h-4" />
                  Assinar - R$ 29,90/mês
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold mb-4">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Mentoria Literária
          </h1>
          <p className="text-muted-foreground">
            Agende sua sessão semanal para criar uma rotina de leitura personalizada de acordo com seu dia a dia.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className={`glass-card rounded-2xl p-6 ${!isPremium ? 'opacity-60 pointer-events-none' : ''}`}>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {monthDays.map(day => {
                  const isPast = isBefore(day, startOfDay(new Date()));
                  const hasSession = hasSessionOnDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => !isPast && setSelectedDate(day)}
                      disabled={isPast}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative
                        ${isPast ? 'text-muted-foreground/50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer text-primary'}
                        ${isToday(day) ? 'ring-2 ring-secondary' : ''}
                        ${isSelected ? 'bg-secondary text-secondary-foreground' : ''}
                        ${hasSession ? 'bg-accent/20' : ''}
                      `}
                    >
                      <span className="font-medium">{format(day, 'd')}</span>
                      {hasSession && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mt-6 pt-6 border-t border-border animate-fade-in">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Horários disponíveis - {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                  </h3>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => slot.available && setSelectedSlot(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-xl text-center transition-all text-sm font-medium
                          ${!slot.available ? 'bg-muted text-muted-foreground line-through cursor-not-allowed' : ''}
                          ${slot.available && selectedSlot !== slot.time ? 'bg-muted text-primary hover:bg-muted/80' : ''}
                          ${selectedSlot === slot.time ? 'bg-secondary text-secondary-foreground ring-2 ring-secondary' : ''}
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>

                  {selectedSlot && (
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full gap-2"
                      onClick={handleBookSession}
                      disabled={isBooking}
                    >
                      {isBooking ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      Confirmar agendamento às {selectedSlot}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - My Sessions */}
          <div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Minhas Sessões
              </h3>

              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : userSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma sessão agendada</p>
                  <p className="text-xs mt-1">Selecione uma data no calendário</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userSessions.slice(0, 5).map(session => {
                    const sessionDate = new Date(session.session_date);
                    const isPast = isBefore(sessionDate, startOfDay(new Date()));
                    
                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-xl ${isPast ? 'bg-muted/50' : 'bg-secondary'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-sm ${isPast ? 'text-muted-foreground' : ''}`}>
                            {format(sessionDate, "d 'de' MMMM", { locale: ptBR })}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'
                          }`}>
                            {session.session_time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isPast ? 'Concluída' : 'Agendada'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="glass-card rounded-2xl p-6 mt-4">
              <h4 className="font-bold text-sm mb-2">Como funciona?</h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Agende uma sessão semanal
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Criamos sua rotina de leitura personalizada
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Acompanhamento baseado no seu dia a dia
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Mentoria;
