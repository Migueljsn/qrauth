import Link from "next/link";

const steps = [
  ["Escaneie seu produto", "Aponte a câmera para o QR Code da embalagem"],
  ["Encontre boa iluminação", "Fique em um local bem iluminado"],
  ["Ajuste a distância", "Aproxime e afaste devagar até o QR ficar nítido"],
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#4a3f8a] px-5 py-8 text-white">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <h1 className="mt-4 text-center text-3xl font-extrabold tracking-tight">QRAuth</h1>
        <ol className="space-y-5 rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
          {steps.map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5b4fa8] font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-bold">{t}</p>
                <p className="text-sm text-slate-500">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link href="/scan"
          className="rounded-2xl bg-gradient-to-r from-[#6b7fe0] to-[#7a5aa8] py-4 text-center text-lg font-bold shadow-lg active:scale-[.98]">
          Autenticar
        </Link>
      </div>
    </main>
  );
}
