"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import "./confirmation.css";

type Options = { message: string; confirmLabel?: string; title?: string };
type Ask = (options: string | Options, signal?: AbortSignal) => Promise<boolean>;
const ConfirmationContext = createContext<Ask | null>(null);

/** One pending decision at a time. Repeated requests cancel rather than replay actions. */
export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<Options | null>(null);
  const pending = useRef<((accepted: boolean) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const accept = useRef<HTMLButtonElement>(null);
  const invoker = useRef<HTMLElement | null>(null);
  const id = useId();
  const settle = useCallback((accepted: boolean) => {
    const resolve = pending.current;
    if (!resolve) return;
    pending.current = null;
    dialog.current?.close();
    setOptions(null);
    if (invoker.current?.isConnected) invoker.current.focus();
    resolve(accepted);
  }, []);
  const ask = useCallback<Ask>((input, signal) => {
    if (pending.current || signal?.aborted) return Promise.resolve(false);
    invoker.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return new Promise<boolean>((resolve) => {
      const abort = () => settle(false);
      pending.current = (accepted) => {
        signal?.removeEventListener("abort", abort);
        resolve(accepted);
      };
      signal?.addEventListener("abort", abort, { once: true });
      setOptions(typeof input === "string" ? { message: input } : input);
    });
  }, [settle]);
  useEffect(() => {
    if (!options) return;
    dialog.current?.showModal();
    cancel.current?.focus();
  }, [options]);
  useEffect(() => () => {
    pending.current?.(false);
    pending.current = null;
  }, []);
  return <ConfirmationContext.Provider value={ask}>
    {children}
    {options && <dialog ref={dialog} className="confirmation-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`} onCancel={event => { event.preventDefault(); settle(false); }} onKeyDown={event => {
      if (event.key !== "Tab") return;
      if (event.shiftKey && document.activeElement === cancel.current) { event.preventDefault(); accept.current?.focus(); }
      else if (!event.shiftKey && document.activeElement === accept.current) { event.preventDefault(); cancel.current?.focus(); }
    }}>
      <h2 id={`${id}-title`}>{options.title || "Xác nhận thao tác"}</h2>
      <p id={`${id}-message`}>{options.message}</p>
      <div className="confirmation-actions">
        <button ref={cancel} type="button" className="soft-button" onClick={() => settle(false)}>Hủy</button>
        <button ref={accept} type="button" className="primary-button" onClick={() => settle(true)}>{options.confirmLabel || "Tiếp tục"}</button>
      </div>
    </dialog>}
  </ConfirmationContext.Provider>;
}

export function useConfirmation() {
  const ask = useContext(ConfirmationContext);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const owner = new AbortController();
    controller.current = owner;
    return () => owner.abort();
  }, []);
  const confirm = useCallback((options: string | Options) => {
    return controller.current && ask ? ask(options, controller.current.signal) : Promise.resolve(false);
  }, [ask]);
  if (!ask) throw new Error("useConfirmation requires ConfirmationProvider");
  return confirm;
}
