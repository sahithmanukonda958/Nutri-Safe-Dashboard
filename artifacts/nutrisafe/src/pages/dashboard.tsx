import { Layout } from "@/components/layout";
import { StatusIndicator } from "@/components/status-indicator";
import { MetricCard } from "@/components/metric-card";
import { useGetLatestReading, useGetSettings, useGetSensorHistory } from "@workspace/api-client-react";
import { Wind, Droplets, Thermometer, FlaskConical, Info, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  // Poll every 5 seconds
  const { data: latest, isLoading: isLatestLoading } = useGetLatestReading({
    query: { refetchInterval: 5000 }
  });

  const { data: settings } = useGetSettings();
  
  // Get small amount of history for mini sparklines (last 2 hours)
  const { data: history } = useGetSensorHistory({ hours: 2 });

  // Safety tips based on status
  const getSafetyTips = (status?: string) => {
    switch(status) {
      case "spoiled":
        return {
          title: "Danger: Food Spoiled",
          tip: "Harmful gas levels detected. Do not consume. Please dispose of the contents immediately to prevent contamination of other foods.",
          type: "danger"
        };
      case "warning":
        return {
          title: "Warning: Approaching Spoilage",
          tip: "Gas levels are elevated. Check packaging for leaks. Consume immediately or transfer to a more secure container if appropriate.",
          type: "warning"
        };
      default:
        return {
          title: "Optimal Freshness",
          tip: "Environment is stable. Keep the container sealed to maintain current freshness levels. Store away from direct sunlight.",
          type: "safe"
        };
    }
  };

  const tips = getSafetyTips(latest?.status);

  // Format chart data
  const chartData = history?.map(reading => ({
    time: format(new Date(reading.timestamp), 'HH:mm'),
    methane: reading.methane,
    ethanol: reading.ethanol,
    temp: reading.temperature,
    humidity: reading.humidity
  })).reverse() || [];

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-10"
      >
        <header>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-2">Real-time monitoring of your food storage environment.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status & Tips Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-lg shadow-black/5 flex flex-col items-center justify-center min-h-[320px]">
              <StatusIndicator status={latest?.status} isLoading={isLatestLoading} />
            </div>

            <div className={`rounded-3xl p-6 border ${
              tips.type === 'danger' ? 'bg-destructive/10 border-destructive/20 text-destructive-foreground' :
              tips.type === 'warning' ? 'bg-warning/10 border-warning/20 text-warning-foreground' :
              'bg-primary/10 border-primary/20 text-primary-foreground'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {tips.type === 'safe' ? <Info className="text-primary" /> : <AlertCircle className={tips.type === 'danger' ? 'text-destructive' : 'text-warning'} />}
                <h3 className={`font-display font-bold text-lg ${
                  tips.type === 'danger' ? 'text-destructive' :
                  tips.type === 'warning' ? 'text-warning' :
                  'text-primary'
                }`}>{tips.title}</h3>
              </div>
              <p className={`leading-relaxed ${
                tips.type === 'danger' ? 'text-destructive/80' :
                tips.type === 'warning' ? 'text-warning/80' :
                'text-primary/80'
              }`}>{tips.tip}</p>
            </div>
          </div>

          {/* Metrics & Charts Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard 
                title="Methane Level" 
                value={latest?.methane} 
                unit="ppm" 
                icon={Wind}
                warning={settings && latest && latest.methane >= settings.methaneWarning && latest.methane < settings.methaneSpoiled}
                spoiled={settings && latest && latest.methane >= settings.methaneSpoiled}
                isLoading={isLatestLoading}
              />
              <MetricCard 
                title="Ethanol Level" 
                value={latest?.ethanol} 
                unit="ppm" 
                icon={FlaskConical}
                warning={settings && latest && latest.ethanol >= settings.ethanolWarning && latest.ethanol < settings.ethanolSpoiled}
                spoiled={settings && latest && latest.ethanol >= settings.ethanolSpoiled}
                isLoading={isLatestLoading}
              />
              <MetricCard 
                title="Temperature" 
                value={latest?.temperature} 
                unit="°C" 
                icon={Thermometer}
                warning={settings && latest && latest.temperature >= settings.temperatureWarning && latest.temperature < settings.temperatureSpoiled}
                spoiled={settings && latest && latest.temperature >= settings.temperatureSpoiled}
                isLoading={isLatestLoading}
              />
              <MetricCard 
                title="Humidity" 
                value={latest?.humidity} 
                unit="%" 
                icon={Droplets}
                warning={settings && latest && latest.humidity >= settings.humidityWarning && latest.humidity < settings.humiditySpoiled}
                spoiled={settings && latest && latest.humidity >= settings.humiditySpoiled}
                isLoading={isLatestLoading}
              />
            </div>

            {/* Quick Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
              <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col">
                <h3 className="font-medium text-foreground mb-4">Gas Levels (2h)</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMethane" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="methane" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorMethane)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm flex flex-col">
                <h3 className="font-medium text-foreground mb-4">Temperature (2h)</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="temp" stroke="hsl(var(--warning))" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
