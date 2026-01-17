export type DataMode = "mock" | "real";

export type DataModeSource =
  | "env_data_mode_mock"
  | "env_data_mode_real"
  | "vercel_preview_default"
  | "default_real";

export type DataModeDecision = {
  mode: DataMode;
  source: DataModeSource;
};

const normalize = (value?: string | null) => value?.trim().toLowerCase();

export const getDataMode = (): DataModeDecision => {
  const explicit = normalize(process.env.NEXT_PUBLIC_DATA_MODE);
  if (explicit === "mock") {
    return { mode: "mock", source: "env_data_mode_mock" };
  }
  if (explicit === "real") {
    return { mode: "real", source: "env_data_mode_real" };
  }

  const vercelEnv =
    normalize(process.env.VERCEL_ENV) ??
    normalize(process.env.NEXT_PUBLIC_VERCEL_ENV);
  if (vercelEnv === "preview") {
    return { mode: "mock", source: "vercel_preview_default" };
  }

  return { mode: "real", source: "default_real" };
};
