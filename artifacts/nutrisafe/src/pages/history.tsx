import { Layout } from "@/components/layout";
import { useGetSensorHistory } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Activity, Clock } from "lucide-react";

export default function History() {
  const { data: history, isLoading } = useGetSensorHistory({ hours: 24 });

  const chartData = history?.map(reading => ({
    time: format(new Date(reading.timestamp), 'HH:mm'),
    fullDate: format(new Date(reading.timestamp), 'MMM dd, HH:mm'),
    methane: reading.methane,
    ethanol: reading.ethanol,
    temperature: reading.temperature,
    humidity: reading.humidity
  })).reverse() || [];

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-10 h-full flex flex-col"
      >
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">History Trends</h1>
            <p className="text-muted-foreground mt-2">Analysis of sensor readings over the last 24 hours.</p>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-full font-medium text-sm border border-secondary">
            <Clock size={16} />
            Last 24 Hours
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <Activity className="w-12 h-12 text-primary animate-pulse mb-4" />
            <p className="text-muted-foreground font-medium">Loading history data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-3xl border border-border min-h-[400px]">
            <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium text-lg">No data available for the last 24 hours.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 flex-1">
            {/* Gas Levels Chart */}
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm flex flex-col h-[400px]">
              <h3 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                Gas Emissions
                <span className="text-sm font-sans font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">ppm</span>
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMethaneBig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEthanolBig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} minTickGap={30} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '8px' }}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" name="Methane" dataKey="methane" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorMethaneBig)" />
                    <Area type="monotone" name="Ethanol" dataKey="ethanol" stroke="hsl(var(--warning))" strokeWidth={3} fillOpacity={1} fill="url(#colorEthanolBig)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Environment Chart */}
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm flex flex-col h-[400px]">
              <h3 className="font-display font-bold text-xl text-foreground mb-6">Environment</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTempBig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHumidityBig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(215 80% 60%)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(215 80% 60%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} minTickGap={30} />
                    <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold', marginBottom: '8px' }}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area yAxisId="left" type="monotone" name="Temperature (°C)" dataKey="temperature" stroke="hsl(var(--destructive))" strokeWidth={3} fillOpacity={1} fill="url(#colorTempBig)" />
                    <Area yAxisId="right" type="monotone" name="Humidity (%)" dataKey="humidity" stroke="hsl(215 80% 60%)" strokeWidth={3} fillOpacity={1} fill="url(#colorHumidityBig)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
