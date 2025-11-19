import { useState } from "react";
import { useUiStore } from "../stores/useUiStore";
import Button from "./Button";

export default function UiOverlay() {
    const toasts = useUiStore((s: any) => s.toasts);
    const confirm = useUiStore((s: any) => s.confirm);
    const prompt = useUiStore((s: any) => s.prompt);
    const _remove = useUiStore((s: any) => s._removeToast);
    const set = useUiStore.setState;
    const [promptValue, setPromptValue] = useState("");

    return (
        <>
            {/* Toasts */}
            <div className="fixed right-4 top-20 z-50 flex flex-col gap-2">
                {toasts.map((t: any) => (
                    <div
                        key={t.id}
                        className={`px-3 py-2 rounded shadow ${
                            t.type === "error"
                                ? "bg-red-50 border border-red-200 text-red-700"
                                : t.type === "success"
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-white border"
                        } `}
                    >
                        {t.message}
                        <button
                            className="ml-3 text-xs text-slate-500"
                            onClick={() => _remove(t.id)}
                        >
                            Dismiss
                        </button>
                    </div>
                ))}
            </div>

            {/* Confirm modal */}
            {confirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded p-6 w-full max-w-md">
                        <div className="text-lg font-medium mb-4">
                            {confirm.message}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    set({ confirm: { open: false } });
                                    confirm.resolve?.(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    set({ confirm: { open: false } });
                                    confirm.resolve?.(true);
                                }}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prompt modal */}
            {prompt.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded p-6 w-full max-w-md">
                        <div className="text-lg font-medium mb-2">
                            {prompt.message}
                        </div>
                        <input
                            value={promptValue}
                            onChange={(e) => setPromptValue(e.target.value)}
                            className="w-full border rounded px-3 py-2 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    set({ prompt: { open: false } });
                                    prompt.resolve?.(null);
                                    setPromptValue("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    set({ prompt: { open: false } });
                                    prompt.resolve?.(promptValue || null);
                                    setPromptValue("");
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
