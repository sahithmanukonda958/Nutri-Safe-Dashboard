import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { StatusIndicator } from "@/components/status-indicator";
import { MetricCard } from "@/components/metric-card";
import { useGetSettings, useGetSensorHistory } from "@workspace/api-client-react";
import { Wind, Droplets, Thermometer, FlaskConical, Info, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

type Reading = {
  id: number;
  methane: number;
  ethanol: number;
  temperature: number;
  humidity: number;
  status: "fresh" | "warning" | "spoiled";
  deviceId: string | null;
  timestamp: string;
};

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export default function Dashboard() {
  const [latest, setLatest] = useState<Reading | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLatestLoading, setIsLatestLoading] = useState(true);

  const { data: settings } = useGetSettings();
  const { data: history, refetch: refetchHistory } = useGetSensorHistory({ hours: 2 });

  // Fetch initial latest reading
  useEffect(() => {
    fetch("/api/sensor/latest")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setLatest(data);
        setIsLatestLoading(false);
      })
      .catch(() => setIsLatestLoading(false));
  }, []);

  // Connect to Socket.IO and listen for new-reading events
  useEffect(() => {
    const s = getSocket();

    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));

    s.on("new-reading", (data: Reading) => {
      setLatest(data);
      refetchHistory();
    });

    if (s.connected) setIsConnected(true);

    return () => {
      s.off("new-reading");
      s.off("connect");
      s.off("disconnect");
    };
  }, [refetchHistory]);

  const getSafetyTips = (status?: string) => {
    switch (status) {
      case "spoiled":
        return {
          title: "Danger: Food Spoiled",
          tip: "Harmful gas levels detected. Do not consume. Please dispose of the contents immediately to prevent contamination of other foods.",
          type: "danger",
        };
      case "warning":
        return {
          title: "Warning: Approaching Spoilage",
          tip: "Gas levels are elevated. Check packaging for leaks. Consume immediately or transfer to a more secure container if appropriate.",
          type: "warning",
        };
      default:
        return {
          title: "Optimal Freshness",
          tip: "Environment is stable. Keep the container sealed to maintain current freshness levels. Store away from direct sunlight.",
          type: "safe",
        };
    }
  };

  const tips = getSafetyTips(latest?.status);

  const chartData =
    history
      ?.map((reading) => ({
        time: format(new Date(reading.timestamp), "HH:mm"),
        methane: reading.methane,
        ethanol: reading.ethanol,
        temp: reading.temperature,
        humidity: reading.humidity,
      }))
      .reverse() || [];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-10"
      >
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Overview</h1>
            <p className="text-muted-foreground mt-2">Real-time monitoring of your food storage environment.</p>
          </div>
          <div
            data-testid="status-connection"
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${
              isConnected
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-muted border-border text-muted-foreground"
            }`}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isConnected ? "Live — Simulator active" : "Connecting..."}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status & Tips Column */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-lg shadow-black/5 flex flex-col items-center justify-center min-h-[320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={latest?.status ?? "loading"}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center"
                >
                  <StatusIndicator status={latest?.status} isLoading={isLatestLoading} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              className={`rounded-3xl p-6 border ${
                tips.type === "danger"
                  ? "bg-destructive/10 border-destructive/20"
                  : tips.type === "warning"
                  ? "bg-warning/10 border-warning/20"
                  : "bg-primary/10 border-primary/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                {tips.type === "safe" ? (
                  <Info className="text-primary" />
                ) : (
                  <AlertCircle className={tips.type === "danger" ? "text-destructive" : "text-warning"} />
                )}
                <h3
                  className={`font-display font-bold text-lg ${
                    tips.type === "danger"
                      ? "text-destructive"
                      : tips.type === "warning"
                      ? "text-warning"
                      : "text-primary"
                  }`}
                >
                  {tips.title}
                </h3>
              </div>
              <p
                className={`leading-relaxed ${
                  tips.type === "danger"
                    ? "text-destructive/80"
                    : tips.type === "warning"
                    ? "text-warning/80"
                    : "text-primary/80"
                }`}
              >
                {tips.tip}
              </p>
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
                warning={!!(settings && latest && latest.methane >= settings.methaneWarning && latest.methane < settings.methaneSpoiled)}
                spoiled={!!(settings && latest && latest.methane >= settings.methaneSpoiled)}
                isLoading={isLatestLoading}
              />
              <MetricCard
                title="Ethanol Level"
                value={latest?.ethanol}
                unit="ppm"
                icon={FlaskConical}
                warning={!!(settings && latest && latest.ethanol >= settings.ethanolWarning && latest.ethanol < settings.ethanolSpoiled)}
                spoiled={!!(settings && latest && latest.ethanol >= settings.ethanolSpoiled)}
                isLoading={isLatestLoading}
              />
              <MetricCard
                title="Temperature"
                value={latest?.temperature}
                unit="°C"
                icon={Thermometer}
                warning={!!(settings && latest && latest.temperature >= settings.temperatureWarning && latest.temperature < settings.temperatureSpoiled)}
                spoiled={!!(settings && latest && latest.temperature >= settings.temperatureSpoiled)}
                isLoading={isLatestLoading}
              />
              <MetricCard
                title="Humidity"
                value={latest?.humidity}
                unit="%"
                icon={Droplets}
                warning={!!(settings && latest && latest.humidity >= settings.humidityWarning && latest.humidity < settings.humiditySpoiled)}
                spoiled={!!(settings && latest && latest.humidity >= settings.humiditySpoiled)}
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
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
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
                          <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
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
