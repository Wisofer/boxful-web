import { Button } from "antd";
import type { ButtonProps } from "antd";
export function PrimaryButton({ size = "large", ...rest }: ButtonProps) {
  return <Button {...rest} type="primary" size={size} />;
}
