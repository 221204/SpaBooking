import { NoShopPrompt } from "@/components/shared/NoShopPrompt";
import { BookingManager } from "@/features/booking/components/BookingManager";
import {
  getBookingServices,
  getBookingStaff,
  getBookings,
} from "@/features/booking/actions";
import { createClient } from "@/lib/supabase/server";

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: shops } = user
    ? await supabase
        .from("shops")
        .select("id, name, slug")
        .eq("owner_id", user.id)
        .order("name")
    : { data: null };

  const [bookings, services, staff] = await Promise.all([
    getBookings(),
    getBookingServices(),
    getBookingStaff(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lịch hẹn</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý lịch hẹn, cập nhật trạng thái và thông tin khách hàng.
        </p>
      </div>

      {!shops?.length ? (
        <NoShopPrompt feature="lịch hẹn" />
      ) : (
        <BookingManager
          shops={shops}
          initialBookings={bookings}
          services={services}
          staff={staff}
        />
      )}
    </div>
  );
}
