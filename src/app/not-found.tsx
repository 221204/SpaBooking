import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Không tìm thấy trang</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Trang bạn truy cập không tồn tại hoặc cửa hàng đã bị xóa.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/" />}>Về trang chủ</Button>
        <Button variant="outline" render={<Link href="/dashboard" />}>
          Dashboard
        </Button>
      </div>
    </main>
  );
}
