export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
