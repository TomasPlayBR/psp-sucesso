import { useToast } from "@/hooks/use-toast";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  // Removemos a lógica do useToast para o build passar
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  );
}
