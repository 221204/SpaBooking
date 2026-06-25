import type { Tables } from "@/types/database.types";

export type Service = Tables<"services">;
export type ShopOption = Pick<Tables<"shops">, "id" | "name" | "slug">;

export type ServiceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialServiceActionState: ServiceActionState = {
  status: "idle",
  message: "",
};
