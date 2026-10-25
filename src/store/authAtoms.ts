import { User } from "@/services/auth.service";
import { atom } from "jotai";

export const userAtom = atom<User | null>(null);
export const tokenAtom = atom<string | null>(null);
export const isLoggingInAtom = atom(false);
export const isRegisteringAtom = atom(false);
export const authErrorAtom = atom<string | null>(null);
export const authLoadingAtom = atom(true);
