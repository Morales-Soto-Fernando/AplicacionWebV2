export class UpdateOrderStatusDto {
  status!: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}