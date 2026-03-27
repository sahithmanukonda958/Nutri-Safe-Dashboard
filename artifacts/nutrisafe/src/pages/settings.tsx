import { Layout } from "@/components/layout";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Save, AlertCircle, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type SettingsFormData = {
  methaneWarning: number;
  methaneSpoiled: number;
  ethanolWarning: number;
  ethanolSpoiled: number;
  temperatureWarning: number;
  temperatureSpoiled: number;
  humidityWarning: number;
  humiditySpoiled: number;
};

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateMutation = useUpdateSettings();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SettingsFormData>();

  useEffect(() => {
    if (settings) {
      reset({
        methaneWarning: settings.methaneWarning,
        methaneSpoiled: settings.methaneSpoiled,
        ethanolWarning: settings.ethanolWarning,
        ethanolSpoiled: settings.ethanolSpoiled,
        temperatureWarning: settings.temperatureWarning,
        temperatureSpoiled: settings.temperatureSpoiled,
        humidityWarning: settings.humidityWarning,
        humiditySpoiled: settings.humiditySpoiled,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({
            title: "Settings Saved",
            description: "Calibration thresholds updated successfully.",
          });
          reset(data); // Reset isDirty state
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error saving settings",
            description: error.message || "Please check your inputs and try again.",
          });
        }
      }
    );
  };

  const InputField = ({ label, name, type = "number", suffix }: { label: string, name: keyof SettingsFormData, type?: string, suffix: string }) => (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
      <div className="relative">
        <input
          type={type}
          step="any"
          {...register(name, { required: true, valueAsNumber: true })}
          className="w-full bg-background border-2 border-border/60 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 pr-12"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
          {suffix}
        </span>
      </div>
      {errors[name] && <span className="text-destructive text-xs mt-1 block">Required</span>}
    </div>
  );

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8 pb-10"
      >
        <header>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Calibration</h1>
          <p className="text-muted-foreground mt-2">Adjust sensor thresholds for spoilage detection algorithms.</p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
                <div className="p-2.5 bg-warning/10 rounded-xl text-warning">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">Threshold Settings</h2>
                  <p className="text-sm text-muted-foreground">Values exceeding "Warning" trigger amber status. Values exceeding "Spoiled" trigger red status.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* Methane Section */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-foreground border-l-4 border-primary pl-3">Methane (Gas)</h3>
                  <div className="space-y-4">
                    <InputField label="Warning Threshold" name="methaneWarning" suffix="ppm" />
                    <InputField label="Spoiled Threshold" name="methaneSpoiled" suffix="ppm" />
                  </div>
                </div>

                {/* Ethanol Section */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-foreground border-l-4 border-primary pl-3">Ethanol</h3>
                  <div className="space-y-4">
                    <InputField label="Warning Threshold" name="ethanolWarning" suffix="ppm" />
                    <InputField label="Spoiled Threshold" name="ethanolSpoiled" suffix="ppm" />
                  </div>
                </div>

                {/* Temperature Section */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-foreground border-l-4 border-primary pl-3">Temperature</h3>
                  <div className="space-y-4">
                    <InputField label="Warning Threshold" name="temperatureWarning" suffix="°C" />
                    <InputField label="Spoiled Threshold" name="temperatureSpoiled" suffix="°C" />
                  </div>
                </div>

                {/* Humidity Section */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-foreground border-l-4 border-primary pl-3">Humidity</h3>
                  <div className="space-y-4">
                    <InputField label="Warning Threshold" name="humidityWarning" suffix="%" />
                    <InputField label="Spoiled Threshold" name="humiditySpoiled" suffix="%" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!isDirty || updateMutation.isPending}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {updateMutation.isPending ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {updateMutation.isPending ? "Saving..." : "Save Calibration"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </Layout>
  );
}
