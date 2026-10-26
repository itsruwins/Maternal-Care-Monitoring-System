// Signed-in areas. Each area (staff, admin, mother) brings its own shell.
export default function DashboardLayout({ children }: LayoutProps<"/[lang]">) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
