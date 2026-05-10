"use client";
import { Typography } from "antd";
type FieldErrorProps = {
  id: string;
  message: string;
};
export function FieldError({ id, message }: FieldErrorProps) {
  return (
    <Typography.Text
      id={id}
      type="danger"
      className="mt-1 block text-[13px]"
      role="alert"
    >
      {message}
    </Typography.Text>
  );
}
