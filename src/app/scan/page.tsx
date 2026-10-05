"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { extractCode } from "@/lib/qr";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    let stop = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        setError("Não foi possível acessar a câmera. Permita o acesso nas configurações do navegador.");
        return;
      }
      trackRef.current = stream.getVideoTracks()[0];
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      const tick = () => {
        if (stop) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hit = jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
          const code = hit ? extractCode(hit.data) : null;
          if (code) {
            stop = true;
            stream?.getTracks().forEach((t) => t.stop());
            router.push(`/v/${code}`);
            return;
          }
        }
        raf = requestAnimationFrame(tick);
      };
      tick();
    }
    start();
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [router]);

  async function toggleTorch() {
    const track = trackRef.current;
    try {
      await track?.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch { /* dispositivo sem lanterna */ }
  }

  return (
    <main className="min-h-dvh bg-[#3b3270] px-5 py-6 text-white">
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-center text-2xl font-extrabold">QRAuth</h1>
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-black">
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-[18%] rounded-2xl border-4 border-emerald-400/80" />
          <p className="absolute inset-x-0 top-[48%] text-center text-sm font-bold text-emerald-300 drop-shadow">
            Enquadre o QR Code
          </p>
          <button onClick={toggleTorch} aria-label="Lanterna"
            className="absolute bottom-3 right-3 h-11 w-11 rounded-full bg-white/20 text-xl">
            {torch ? "🔦" : "💡"}
          </button>
        </div>
        {error
          ? <p className="rounded-xl bg-red-500/20 p-3 text-sm">{error}</p>
          : <p className="text-center text-sm text-white/80">Aproxime ou afaste devagar até o QR ficar nítido</p>}
      </div>
    </main>
  );
}
