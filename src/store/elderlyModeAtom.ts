import { atom } from "jotai";
import { appSettingsAtom, persistSettings } from "./settings.store";

export const elderlyModeAtom = atom(
  (get) => get(appSettingsAtom).isElderly,
  (get, set, val: boolean) => {
    const current = get(appSettingsAtom);
    const updated = { ...current, isElderly: val };
    set(appSettingsAtom, updated);
    persistSettings(updated);
  },
);
