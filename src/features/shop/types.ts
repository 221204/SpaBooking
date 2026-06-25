import type { Tables } from "@/types/database.types";

export type Shop = Tables<"shops">;

export type ShopActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialShopActionState: ShopActionState = {
  status: "idle",
  message: "",
};
