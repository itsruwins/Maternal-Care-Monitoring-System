import type { ComponentProps } from "react";
import { NativeSelect } from "@/components/ui/native-select";
import type { PurokOption } from "@/lib/puroks/types";

// The purok list as a select, with an empty "Choose your purok" first option.
export function PurokSelect({
  puroks,
  placeholder,
  ...props
}: { puroks: PurokOption[]; placeholder: string } & Omit<ComponentProps<typeof NativeSelect>, "children">) {
  return (
    <NativeSelect {...props}>
      <option value="">{placeholder}</option>
      {puroks.map((purok) => (
        <option key={purok.id} value={String(purok.id)}>
          {purok.name}
        </option>
      ))}
    </NativeSelect>
  );
}
