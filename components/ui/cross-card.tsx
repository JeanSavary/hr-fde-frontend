import * as React from "react";
import { cn } from "@/lib/utils";

function CrossCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "cross-card relative bg-white p-5",
        className,
      )}
      {...props}
    />
  );
}

export { CrossCard };
