import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type NoShopPromptProps = {
  feature: string;
};

export function NoShopPrompt({ feature }: NoShopPromptProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chưa có cửa hàng</CardTitle>
        <CardDescription>
          Bạn cần tạo cửa hàng trước khi quản lý {feature}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button render={<Link href="/shop" />}>Đi tới Cửa hàng</Button>
      </CardContent>
    </Card>
  );
}
